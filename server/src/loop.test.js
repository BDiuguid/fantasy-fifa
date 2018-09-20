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

test('boom', async () => {
  const prismaMock = { mutation: { updateLeague: jest.fn() } };
  getPrisma.mockReturnValue(prismaMock);
  const playerId = 9000;
  const bidAmount = 10;
  league = _setBid(league, user0, bidAmount, playerId);
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
