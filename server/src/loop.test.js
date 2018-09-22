jest.mock('./prisma');

const { getPrisma } = require('./prisma');

const { processBid } = require('./loop');

const createUser = id => ({
  id,
  name: `User${id}`,
});

const createTeam = (id, ownerId) => ({
  id,
  money: 100,
  owner: { id: ownerId },
  players: [],
  paidAmounts: [],
});

const createLeague = (id, members, teams) => ({
  id,
  status: 'IN_PROGRESS',
  nominationClock: 0,
  nominationTime: 15,
  bidClock: 0,
  bidTime: 10,
  playerUpForBid: null,
  teamSize: 3,
  userTurnOrder: [0, 1, 2],
  userTurnIndex: 0,
  highestBid: null,
  members,
  teams,
});

const _setBid = (league, user, value, playerId) => {
  league.playerUpForBid = playerId;
  league.highestBid = {
    user,
    value,
  };
  return league;
};

let league;
let user0;
let user1;
let user2;
let team0;
let team1;
let team2;

beforeEach(() => {
  user0 = createUser(0);
  user1 = createUser(1);
  user2 = createUser(2);
  team0 = createTeam(10, user0.id);
  team1 = createTeam(11, user1.id);
  team2 = createTeam(12, user2.id);
  league = createLeague(100, [user0, user1, user2], [team0, team1, team2]);
});

test('processBid non full userTurnOrder from beginning', async () => {
  const prismaMock = { mutation: { updateLeague: jest.fn() } };
  getPrisma.mockReturnValue(prismaMock);
  const playerId = 9000;
  const bidAmount = 10;
  league = _setBid(league, user0, bidAmount, playerId);
  league.userTurnIndex = 0;
  const expectedMoney0 = team0.money - bidAmount;
  const expectedData = {
    teams: {
      update: [
        {
          where: { id: team0.id },
          data: {
            money: expectedMoney0,
            paidAmounts: { set: [bidAmount] },
            players: { connect: [{ id: playerId }] },
          },
        },
        {
          where: { id: team1.id },
          data: {
            money: team1.money,
            paidAmounts: { set: [] },
            players: { connect: [] },
          },
        },
        {
          where: { id: team2.id },
          data: {
            money: team2.money,
            paidAmounts: { set: [] },
            players: { connect: [] },
          },
        },
      ],
    },
    highestBid: { delete: true },
    playerUpForBid: null,
    nominationClock: league.nominationTime,
    bidClock: league.bidTime,
    userTurnOrder: { set: [0, 1, 2] },
    userTurnIndex: 1,
    status: 'IN_PROGRESS',
  };

  await processBid(league);

  expect(prismaMock.mutation.updateLeague.mock.calls[0][0]).toEqual({
    where: { id: league.id },
    data: expectedData,
  });
});

test('processBid non full userTurnOrder from middle', async () => {
  const prismaMock = { mutation: { updateLeague: jest.fn() } };
  getPrisma.mockReturnValue(prismaMock);
  const playerId = 9000;
  const bidAmount = 10;
  league = _setBid(league, user0, bidAmount, playerId);
  league.userTurnIndex = 1;
  const expectedMoney0 = team0.money - bidAmount;
  const expectedData = {
    teams: {
      update: [
        {
          where: { id: team0.id },
          data: {
            money: expectedMoney0,
            paidAmounts: { set: [bidAmount] },
            players: { connect: [{ id: playerId }] },
          },
        },
        {
          where: { id: team1.id },
          data: {
            money: team1.money,
            paidAmounts: { set: [] },
            players: { connect: [] },
          },
        },
        {
          where: { id: team2.id },
          data: {
            money: team2.money,
            paidAmounts: { set: [] },
            players: { connect: [] },
          },
        },
      ],
    },
    highestBid: { delete: true },
    playerUpForBid: null,
    nominationClock: league.nominationTime,
    bidClock: league.bidTime,
    userTurnOrder: { set: [0, 1, 2] },
    userTurnIndex: 2,
    status: 'IN_PROGRESS',
  };

  await processBid(league);

  expect(prismaMock.mutation.updateLeague.mock.calls[0][0]).toEqual({
    where: { id: league.id },
    data: expectedData,
  });
});

test('processBid non full userTurnOrder from end', async () => {
  const prismaMock = { mutation: { updateLeague: jest.fn() } };
  getPrisma.mockReturnValue(prismaMock);
  const playerId = 9000;
  const bidAmount = 10;
  league = _setBid(league, user0, bidAmount, playerId);
  league.userTurnIndex = 2;
  const expectedMoney0 = team0.money - bidAmount;
  const expectedData = {
    teams: {
      update: [
        {
          where: { id: team0.id },
          data: {
            money: expectedMoney0,
            paidAmounts: { set: [bidAmount] },
            players: { connect: [{ id: playerId }] },
          },
        },
        {
          where: { id: team1.id },
          data: {
            money: team1.money,
            paidAmounts: { set: [] },
            players: { connect: [] },
          },
        },
        {
          where: { id: team2.id },
          data: {
            money: team2.money,
            paidAmounts: { set: [] },
            players: { connect: [] },
          },
        },
      ],
    },
    highestBid: { delete: true },
    playerUpForBid: null,
    nominationClock: league.nominationTime,
    bidClock: league.bidTime,
    userTurnOrder: { set: [0, 1, 2] },
    userTurnIndex: 0,
    status: 'IN_PROGRESS',
  };

  await processBid(league);

  expect(prismaMock.mutation.updateLeague.mock.calls[0][0]).toEqual({
    where: { id: league.id },
    data: expectedData,
  });
});

test('processBid draft end condition', async () => {
  const prismaMock = { mutation: { updateLeague: jest.fn() } };
  getPrisma.mockReturnValue(prismaMock);
  const playerId = 9000;
  const bidAmount = 10;
  league = _setBid(league, user1, bidAmount, playerId);
  league.userTurnIndex = 0;
  league.userTurnOrder = [1];
  team0.money = 70;
  team0.players = [{ id: 4000 }, { id: 4001 }, { id: 4002 }];
  team0.paidAmounts = [10, 10, 10];
  team1.money = 60;
  team1.players = [{ id: 7000 }, { id: 8000 }];
  team1.paidAmounts = [20, 20];
  team2.money = 10;
  team2.players = [{ id: 5000 }, { id: 5001 }, { id: 5002 }];
  team2.paidAmounts = [30, 30, 30];
  const expectedMoney1 = team1.money - bidAmount;
  const expectedData = {
    teams: {
      update: [
        {
          where: { id: team0.id },
          data: {
            money: team0.money,
            paidAmounts: { set: team0.paidAmounts },
            players: { connect: team0.players },
          },
        },
        {
          where: { id: team1.id },
          data: {
            money: expectedMoney1,
            paidAmounts: { set: [20, 20, 10] },
            players: { connect: [{ id: 7000 }, { id: 8000 }, { id: 9000 }] },
          },
        },
        {
          where: { id: team2.id },
          data: {
            money: team2.money,
            paidAmounts: { set: team2.paidAmounts },
            players: { connect: team2.players },
          },
        },
      ],
    },
    highestBid: { delete: true },
    playerUpForBid: null,
    nominationClock: league.nominationTime,
    bidClock: league.bidTime,
    userTurnOrder: { set: [] },
    userTurnIndex: 0,
    status: 'ENDED',
  };

  await processBid(league);

  expect(prismaMock.mutation.updateLeague.mock.calls[0][0]).toEqual({
    where: { id: league.id },
    data: expectedData,
  });
});

test('processBid removedIndex = currentUserIndex', async () => {
  const prismaMock = { mutation: { updateLeague: jest.fn() } };
  getPrisma.mockReturnValue(prismaMock);
  const playerId = 9000;
  const bidAmount = 10;
  league = _setBid(league, user0, bidAmount, playerId);
  league.userTurnIndex = 0;
  league.userTurnOrder = [0, 1, 2];
  team0.money = 80;
  team0.players = [{ id: 3000 }, { id: 3001 }];
  team0.paidAmounts = [10, 10];
  team1.money = 60;
  team1.players = [{ id: 4000 }, { id: 4001 }];
  team1.paidAmounts = [20, 20];
  team2.money = 40;
  team2.players = [{ id: 5000 }, { id: 5001 }];
  team2.paidAmounts = [30, 30];
  const expectedMoney0 = team0.money - bidAmount;
  const expectedData = {
    teams: {
      update: [
        {
          where: { id: team0.id },
          data: {
            money: expectedMoney0,
            paidAmounts: { set: [10, 10, 10] },
            players: { connect: [{ id: 3000 }, { id: 3001 }, { id: 9000 }] },
          },
        },
        {
          where: { id: team1.id },
          data: {
            money: team1.money,
            paidAmounts: { set: team1.paidAmounts },
            players: { connect: team1.players },
          },
        },
        {
          where: { id: team2.id },
          data: {
            money: team2.money,
            paidAmounts: { set: team2.paidAmounts },
            players: { connect: team2.players },
          },
        },
      ],
    },
    highestBid: { delete: true },
    playerUpForBid: null,
    nominationClock: league.nominationTime,
    bidClock: league.bidTime,
    userTurnOrder: { set: [1, 2] },
    userTurnIndex: 0,
    status: 'IN_PROGRESS',
  };

  await processBid(league);

  expect(prismaMock.mutation.updateLeague.mock.calls[0][0]).toEqual({
    where: { id: league.id },
    data: expectedData,
  });
});

test('processBid removedIndex = currentUserIndex and is end', async () => {
  const prismaMock = { mutation: { updateLeague: jest.fn() } };
  getPrisma.mockReturnValue(prismaMock);
  const playerId = 9000;
  const bidAmount = 10;
  league = _setBid(league, user2, bidAmount, playerId);
  league.userTurnIndex = 2;
  league.userTurnOrder = [0, 1, 2];
  team0.money = 80;
  team0.players = [{ id: 3000 }, { id: 3001 }];
  team0.paidAmounts = [10, 10];
  team1.money = 60;
  team1.players = [{ id: 4000 }, { id: 4001 }];
  team1.paidAmounts = [20, 20];
  team2.money = 40;
  team2.players = [{ id: 5000 }, { id: 5001 }];
  team2.paidAmounts = [30, 30];
  const expectedMoney2 = team2.money - bidAmount;
  const expectedData = {
    teams: {
      update: [
        {
          where: { id: team0.id },
          data: {
            money: team0.money,
            paidAmounts: { set: team0.paidAmounts },
            players: { connect: team0.players },
          },
        },
        {
          where: { id: team1.id },
          data: {
            money: team1.money,
            paidAmounts: { set: team1.paidAmounts },
            players: { connect: team1.players },
          },
        },
        {
          where: { id: team2.id },
          data: {
            money: expectedMoney2,
            paidAmounts: { set: [30, 30, 10] },
            players: { connect: [{ id: 5000 }, { id: 5001 }, { id: 9000 }] },
          },
        },
      ],
    },
    highestBid: { delete: true },
    playerUpForBid: null,
    nominationClock: league.nominationTime,
    bidClock: league.bidTime,
    userTurnOrder: { set: [0, 1] },
    userTurnIndex: 0,
    status: 'IN_PROGRESS',
  };

  await processBid(league);

  expect(prismaMock.mutation.updateLeague.mock.calls[0][0]).toEqual({
    where: { id: league.id },
    data: expectedData,
  });
});

test('processBid removedIndex < currentUserIndex', async () => {
  const prismaMock = { mutation: { updateLeague: jest.fn() } };
  getPrisma.mockReturnValue(prismaMock);
  const playerId = 9000;
  const bidAmount = 10;
  league = _setBid(league, user0, bidAmount, playerId);
  league.userTurnIndex = 1;
  league.userTurnOrder = [0, 1, 2];
  team0.money = 80;
  team0.players = [{ id: 3000 }, { id: 3001 }];
  team0.paidAmounts = [10, 10];
  team1.money = 60;
  team1.players = [{ id: 4000 }, { id: 4001 }];
  team1.paidAmounts = [20, 20];
  team2.money = 40;
  team2.players = [{ id: 5000 }, { id: 5001 }];
  team2.paidAmounts = [30, 30];
  const expectedMoney0 = team0.money - bidAmount;
  const expectedData = {
    teams: {
      update: [
        {
          where: { id: team0.id },
          data: {
            money: expectedMoney0,
            paidAmounts: { set: [10, 10, 10] },
            players: { connect: [{ id: 3000 }, { id: 3001 }, { id: 9000 }] },
          },
        },
        {
          where: { id: team1.id },
          data: {
            money: team1.money,
            paidAmounts: { set: team1.paidAmounts },
            players: { connect: team1.players },
          },
        },
        {
          where: { id: team2.id },
          data: {
            money: team2.money,
            paidAmounts: { set: team2.paidAmounts },
            players: { connect: team2.players },
          },
        },
      ],
    },
    highestBid: { delete: true },
    playerUpForBid: null,
    nominationClock: league.nominationTime,
    bidClock: league.bidTime,
    userTurnOrder: { set: [1, 2] },
    userTurnIndex: 1,
    status: 'IN_PROGRESS',
  };

  await processBid(league);

  expect(prismaMock.mutation.updateLeague.mock.calls[0][0]).toEqual({
    where: { id: league.id },
    data: expectedData,
  });
});

test('processBid removedIndex > currentUserIndex', async () => {
  const prismaMock = { mutation: { updateLeague: jest.fn() } };
  getPrisma.mockReturnValue(prismaMock);
  const playerId = 9000;
  const bidAmount = 10;
  league = _setBid(league, user1, bidAmount, playerId);
  league.userTurnIndex = 0;
  league.userTurnOrder = [0, 1, 2];
  team0.money = 80;
  team0.players = [{ id: 3000 }, { id: 3001 }];
  team0.paidAmounts = [10, 10];
  team1.money = 60;
  team1.players = [{ id: 4000 }, { id: 4001 }];
  team1.paidAmounts = [20, 20];
  team2.money = 40;
  team2.players = [{ id: 5000 }, { id: 5001 }];
  team2.paidAmounts = [30, 30];
  const expectedMoney1 = team1.money - bidAmount;
  const expectedData = {
    teams: {
      update: [
        {
          where: { id: team0.id },
          data: {
            money: team0.money,
            paidAmounts: { set: team0.paidAmounts },
            players: { connect: team0.players },
          },
        },
        {
          where: { id: team1.id },
          data: {
            money: expectedMoney1,
            paidAmounts: { set: [20, 20, 10] },
            players: { connect: [{ id: 4000 }, { id: 4001 }, { id: 9000 }] },
          },
        },
        {
          where: { id: team2.id },
          data: {
            money: team2.money,
            paidAmounts: { set: team2.paidAmounts },
            players: { connect: team2.players },
          },
        },
      ],
    },
    highestBid: { delete: true },
    playerUpForBid: null,
    nominationClock: league.nominationTime,
    bidClock: league.bidTime,
    userTurnOrder: { set: [0, 2] },
    userTurnIndex: 1,
    status: 'IN_PROGRESS',
  };

  await processBid(league);

  expect(prismaMock.mutation.updateLeague.mock.calls[0][0]).toEqual({
    where: { id: league.id },
    data: expectedData,
  });
});
