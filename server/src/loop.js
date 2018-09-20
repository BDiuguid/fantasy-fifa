const { shuffle, range } = require('lodash');
const { duration } = require('./utils');
const { getPrisma } = require('./prisma');

const loopSelection = `
  {
    id
    status
    nominationClock,
    nominationTime
    bidClock
    bidTime
    playerUpForBid
    teamSize
    userTurnOrder
    userTurnIndex
    highestBid {
      value
      user {
        id
        name
      }
    }
    members {
      id
    }
    teams {
      id
      money
      owner {
        id
      }
      players {
        id
      }
      paidAmounts
    }
  }`;

async function startLoop(leagueId) {
  console.log(`Starting Loop!`);
  const prisma = getPrisma();

  let league = await prisma.query.league(
    { where: { id: leagueId } },
    `{
      id
      members { id }
      nominationTime
    }`
  );

  try {
    league = await prisma.mutation.updateLeague(
      {
        where: { id: leagueId },
        data: {
          userTurnOrder: { set: shuffle(range(league.members.length)) },
          nominationClock: league.nominationTime,
        },
      },
      loopSelection
    );
  } catch (e) {
    console.log(e);
  }

  startNominationLoop(league);
}

async function startNominationLoop(leagueParam) {
  console.log(`Starting Nomination!`);
  const prisma = getPrisma();
  let league = leagueParam;

  while (isInNominationPhase(league)) {
    await duration({ seconds: 1 });
    league = await decrementNominationClock(league.id);
    console.log(`NominationClock: ${league.nominationClock}`);

    if (shouldSkipNominator(league)) {
      await skipNominator(league);
    }

    league = await prisma.query.league(
      { where: { id: league.id } },
      loopSelection
    );
  }

  console.log(`Leaving Nomination Phase!`);
  console.log(`Starting Bid Phase!`);

  while (isInBidPhase(league)) {
    await duration({ seconds: 1 });
    league = await decrementBidClock(league.id);
    console.log(`BidClock: ${league.bidClock}`);
  }

  league = await processBid(league);

  if (league.status !== 'ENDED') {
    startNominationLoop(league);
  }
}

function isInNominationPhase(league) {
  return (
    league.status === 'IN_PROGRESS' &&
    league.nominationClock > -1 &&
    league.highestBid === null
  );
}

function shouldSkipNominator(league) {
  return (
    league.status === 'IN_PROGRESS' &&
    league.nominationClock <= 0 &&
    league.highestBid === null
  );
}

async function decrementNominationClock(leagueId) {
  const prisma = getPrisma();
  const league = await prisma.query.league(
    { where: { id: leagueId } },
    `{
      id
      nominationClock
    }`
  );
  return prisma.mutation.updateLeague(
    {
      where: { id: league.id },
      data: { nominationClock: league.nominationClock - 1 },
    },
    loopSelection
  );
}

async function skipNominator(league) {
  const prisma = getPrisma();
  return prisma.mutation.updateLeague(
    {
      where: { id: league.id },
      data: {
        nominationClock: league.nominationTime,
        userTurnIndex: (league.userTurnIndex + 1) % league.userTurnOrder.length,
      },
    },
    loopSelection
  );
}

function isInBidPhase(league) {
  return league.status === 'IN_PROGRESS' && league.bidClock > -1;
}

async function decrementBidClock(leagueId) {
  const prisma = getPrisma();
  const league = await prisma.query.league(
    { where: { id: leagueId } },
    `{
      id
      bidClock
    }`
  );
  return prisma.mutation.updateLeague(
    {
      where: { id: league.id },
      data: { bidClock: league.bidClock - 1 },
    },
    loopSelection
  );
}

async function processBid(league) {
  console.log(`Processing Bid.`);
  const prisma = getPrisma();

  let winningIndex;
  const teams = league.teams.map((team, index) => {
    if (team.owner.id === league.highestBid.user.id) {
      winningIndex = index;
      team.money -= league.highestBid.value;
      team.players.push({ id: league.playerUpForBid });
      team.paidAmounts.push(league.highestBid.value);
    }
    return team;
  });

  let userTurnOrder = [...league.userTurnOrder];
  if (teams[winningIndex].players.length === league.teamSize) {
    const winningUserId = teams[winningIndex].owner.id;
    const winningUserTurnIndex = getIndexOfTurnOrderFromId(
      winningUserId,
      league
    );
    console.log(`winningUserId: ${winningUserId}`);
    console.log(`winningUserTurnIndex: ${winningUserTurnIndex}`);
    console.log(`old userTurnOrder: ${userTurnOrder}`);

    userTurnOrder = userTurnOrder.filter(i => i !== winningUserTurnIndex);
    console.log(`new userTurnOrder: ${userTurnOrder}`);
    console.log(`old userTurnIndex: ${league.userTurnIndex}`);

    if (
      league.userTurnIndex < winningUserTurnIndex &&
      userTurnOrder.length > 0
    ) {
      league.userTurnIndex = (league.userTurnIndex + 1) % userTurnOrder.length;
    } else if (
      league.userTurnIndex === league.userTurnOrder.length - 1 ||
      userTurnOrder.length === 0
    ) {
      league.userTurnIndex = 0;
    }
  } else {
    league.userTurnIndex =
      (league.userTurnIndex + 1) % league.userTurnOrder.length;
  }

  console.log(`next userTurnIndex: ${league.userTurnIndex}`);

  const data = {
    teams: {
      update: teams.map(team => ({
        where: { id: team.id },
        data: {
          money: team.money,
          paidAmounts: { set: team.paidAmounts },
          players: { connect: team.players.map(p => ({ id: p.id })) },
        },
      })),
    },
    highestBid: { delete: true },
    playerUpForBid: null,
    nominationClock: league.nominationTime,
    bidClock: league.bidTime,
    userTurnOrder: { set: userTurnOrder },
    userTurnIndex: league.userTurnIndex,
    status: userTurnOrder.length === 0 ? 'ENDED' : 'IN_PROGRESS',
  };

  console.log(data);
  return prisma.mutation.updateLeague(
    {
      where: { id: league.id },
      data,
    },
    loopSelection
  );
}

function getIndexOfTurnOrderFromId(userId, league) {
  let memberIndex = -1;
  league.members.forEach((member, i) => {
    if (member.id === userId) {
      memberIndex = i;
    }
  });
  console.log(`memberIndex: ${memberIndex}`);
  return memberIndex;
}

module.exports = {
  startLoop,
  processBid,
};
