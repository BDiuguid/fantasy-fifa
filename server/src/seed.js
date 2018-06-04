const fetch = require('node-fetch');
const { groupBy } = require('lodash');
const { duration, asyncForEach } = require('./utils');
const { getPrisma } = require('./prisma');

const url =
  'https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=';

// An example request object is commented out at the bottom of this file.
async function fetchData(url, params) {
  return fetch(`${url}${JSON.stringify(params)}`).then(res => res.json());
}

async function savePlayer(player) {
  const prisma = getPrisma();

  return prisma.mutation.createPlayer(
    {
      data: player,
    },
    `{ id }`
  );
}

async function importPlayerData() {
  try {
    const players = await getAllPlayers();
    const mappedPlayers = players.map(fifaPlayerToGraphQLPlayer);
    await asyncForEach(mappedPlayers, async (player, i) => {
      console.log(`Seeding player ${i} of ${mappedPlayers.length}`);
      logPlayer(player);
      await duration({ milliseconds: 200 });
      await savePlayer(mappedPlayers[i]);
    });

    console.log(`FINISHED SAVING PLAYERS!`);
  } catch (e) {
    console.error(e);
  }
}

async function getAllPlayers() {
  const params = {
    page: 1,
    quality: 'bronze,silver,gold,rare_bronze,rare_silver,rare_gold',
    position: 'LF,CF,RF,ST,LW,LM,CDM,CM,CAM,RM,RW,LWB,LB,CB,RB,RWB,GK',
    ovr: '77:99',
  };

  const players = [];

  try {
    let data;
    const first = await fetchData(url, params);

    players.push(...first.items);

    for (let i = 2; i <= first.totalPages; i++) {
      console.log(`Requesting page ${i} of ${first.totalPages}`);
      params.page = i;
      data = await fetchData(url, params);
      players.push(...data.items);
    }

    const dedupedPlayers = dedupePlayers(players);
    return dedupedPlayers;
  } catch (e) {
    console.error(e);
  }
}

function logPlayer(player) {
  console.log(`
  ${player.fifaId}
  ${player.rating}
  ${player.fifaBaseId}
  ${player.firstName}
  ${player.lastName}
  ${player.name}
  ${player.commonName}`);
}

function dedupePlayers(players) {
  const groupedPlayers = groupBy(players, 'baseId');
  const duplicates = [];
  const nonDuplicates = [];
  Object.keys(groupedPlayers).forEach(key => {
    if (groupedPlayers[key].length > 1) {
      duplicates.push(groupedPlayers[key]);
    } else {
      nonDuplicates.push(groupedPlayers[key][0]);
    }
  });
  const originalNonDuplicateLength = nonDuplicates.length;
  console.log(`Original nonDuplicates.length: ${nonDuplicates.length}`);
  console.log(`duplicates.length: ${duplicates.length}`);

  duplicates.forEach(dup => {
    if (dup.length > 2) {
      console.log(`More than 2 for baseId: ${dup[0].baseId}`);
    }
    let maxId = -1;
    let maxIndex = -1;
    for (let i = 0; i < dup.length; i++) {
      const dupId = Number(dup[i].id);
      if (dupId > maxId) {
        maxId = dupId;
        maxIndex = i;
      }
    }
    nonDuplicates.push(dup[maxIndex]);
  });

  console.log(`final nonDuplicates.length: ${nonDuplicates.length}`);

  if (nonDuplicates.length !== duplicates.length + originalNonDuplicateLength) {
    throw new Error('Failed to dedupe');
  }
  return nonDuplicates;
}

function fifaPlayerToGraphQLPlayer(fifaPlayer) {
  return {
    fifaBaseId: fifaPlayer.baseId,
    fifaId: fifaPlayer.id,
    commonName: fifaPlayer.commonName,
    firstName: fifaPlayer.firstName,
    headshotImgUrl: fifaPlayer.headshotImgUrl,
    lastName: fifaPlayer.lastName,
    league: {
      create: {
        fifaId: fifaPlayer.league.id,
        abbrName: fifaPlayer.league.abbrName,
        imgUrl: fifaPlayer.league.imgUrl,
        name: fifaPlayer.league.name,
      },
    },
    nation: {
      create: {
        fifaId: fifaPlayer.nation.id,
        largeImgUrl: fifaPlayer.nation.imageUrls.large,
        abbrName: fifaPlayer.nation.abbrName,
        name: fifaPlayer.nation.name,
      },
    },
    club: {
      create: {
        fifaId: fifaPlayer.club.id,
        abbrName: fifaPlayer.club.abbrName,
        darkLargeImgUrl: fifaPlayer.club.imageUrls.dark.large,
        normalLargeImgUrl: fifaPlayer.club.imageUrls.normal.large,
        name: fifaPlayer.club.name,
      },
    },
    position: fifaPlayer.position,
    composure: fifaPlayer.composure,
    height: fifaPlayer.height,
    weight: fifaPlayer.weight,
    birthdate: fifaPlayer.birthdate,
    age: fifaPlayer.age,
    acceleration: fifaPlayer.acceleration,
    aggression: fifaPlayer.aggression,
    agility: fifaPlayer.agility,
    balance: fifaPlayer.balance,
    ballcontrol: fifaPlayer.ballcontrol,
    foot: fifaPlayer.foot.toUpperCase(),
    skillMoves: fifaPlayer.skillMoves,
    crossing: fifaPlayer.crossing,
    curve: fifaPlayer.curve,
    dribbling: fifaPlayer.dribbling,
    finishing: fifaPlayer.finishing,
    freekickaccuracy: fifaPlayer.freekickaccuracy,
    gkdiving: fifaPlayer.gkdiving,
    gkhandling: fifaPlayer.gkhandling,
    gkkicking: fifaPlayer.gkkicking,
    gkpositioning: fifaPlayer.gkpositioning,
    gkreflexes: fifaPlayer.gkreflexes,
    headingaccuracy: fifaPlayer.headingaccuracy,
    interceptions: fifaPlayer.interceptions,
    jumping: fifaPlayer.jumping,
    longpassing: fifaPlayer.longpassing,
    longshots: fifaPlayer.longshots,
    marking: fifaPlayer.marking,
    penalties: fifaPlayer.penalties,
    positioning: fifaPlayer.positioning,
    potential: fifaPlayer.potential,
    reactions: fifaPlayer.reactions,
    shortpassing: fifaPlayer.shortpassing,
    shotpower: fifaPlayer.shotpower,
    slidingtackle: fifaPlayer.slidingtackle,
    sprintspeed: fifaPlayer.sprintspeed,
    standingtackle: fifaPlayer.standingtackle,
    stamina: fifaPlayer.stamina,
    strength: fifaPlayer.strength,
    vision: fifaPlayer.vision,
    volleys: fifaPlayer.volleys,
    weakFoot: fifaPlayer.weakFoot,
    traits: { set: fifaPlayer.traits },
    specialities: { set: fifaPlayer.specialities },
    atkWorkRate: fifaPlayer.atkWorkRate.toUpperCase(),
    defWorkRate: fifaPlayer.defWorkRate.toUpperCase(),
    attributes: {
      create: fifaPlayer.attributes.map(att => ({
        name: att.name.split('.')[2],
        value: att.value,
      })),
    },
    name: fifaPlayer.name,
    quality: fifaPlayer.quality,
    color: fifaPlayer.color,
    isGK: fifaPlayer.isGK,
    rating: fifaPlayer.rating,
  };
}

module.exports = {
  importPlayerData,
  getAllPlayers,
};

// const ExampleRequest = {
//   page: 1,
//   totalPages: 1,
//   totalResults: 1,
//   type: 'FUTPlayerItemList',
//   count: 1,
//   items: [
//     {
//       commonName: '',
//       firstName: 'Luis',
//       headshotImgUrl:
//         'https://fifa17.content.easports.com/fifa/fltOnlineAssets/B1BA185F-AD7C-4128-8A64-746DE4EC5A82/2018/fut/items/images/players/html5/134x134/176580.png',
//       lastName: 'Su\u00e1rez',
//       league: {
//         abbrName: 'ESP 1',
//         id: 53,
//         imgUrl: null,
//         name: 'LaLiga Santander',
//       },
//       nation: {
//         imageUrls: {
//           small:
//             'https://fifa17.content.easports.com/fifa/fltOnlineAssets/B1BA185F-AD7C-4128-8A64-746DE4EC5A82/2018/fut/items/images/flags/html5/24x14/60.png',
//           medium:
//             'https://fifa17.content.easports.com/fifa/fltOnlineAssets/B1BA185F-AD7C-4128-8A64-746DE4EC5A82/2018/fut/items/images/flags/html5/30x19/60.png',
//           large:
//             'https://fifa17.content.easports.com/fifa/fltOnlineAssets/B1BA185F-AD7C-4128-8A64-746DE4EC5A82/2018/fut/items/images/flags/html5/40x25/60.png',
//         },
//         abbrName: 'Uruguay',
//         id: 60,
//         imgUrl: null,
//         name: 'Uruguay',
//       },
//       club: {
//         imageUrls: {
//           dark: {
//             small:
//               'https://fifa17.content.easports.com/fifa/fltOnlineAssets/B1BA185F-AD7C-4128-8A64-746DE4EC5A82/2018/fut/items/images/clubbadges/html5/dark/24x24/l241.png',
//             medium:
//               'https://fifa17.content.easports.com/fifa/fltOnlineAssets/B1BA185F-AD7C-4128-8A64-746DE4EC5A82/2018/fut/items/images/clubbadges/html5/dark/27x27/l241.png',
//             large:
//               'https://fifa17.content.easports.com/fifa/fltOnlineAssets/B1BA185F-AD7C-4128-8A64-746DE4EC5A82/2018/fut/items/images/clubbadges/html5/dark/34x34/l241.png',
//           },
//           normal: {
//             small:
//               'https://fifa17.content.easports.com/fifa/fltOnlineAssets/B1BA185F-AD7C-4128-8A64-746DE4EC5A82/2018/fut/items/images/clubbadges/html5/normal/24x24/l241.png',
//             medium:
//               'https://fifa17.content.easports.com/fifa/fltOnlineAssets/B1BA185F-AD7C-4128-8A64-746DE4EC5A82/2018/fut/items/images/clubbadges/html5/normal/27x27/l241.png',
//             large:
//               'https://fifa17.content.easports.com/fifa/fltOnlineAssets/B1BA185F-AD7C-4128-8A64-746DE4EC5A82/2018/fut/items/images/clubbadges/html5/normal/34x34/l241.png',
//           },
//         },
//         abbrName: 'Barcelona',
//         id: 241,
//         imgUrl: null,
//         name: 'FC Barcelona',
//       },
//       headshot: {
//         largeImgUrl:
//           'https://fifa17.content.easports.com/fifa/fltOnlineAssets/B1BA185F-AD7C-4128-8A64-746DE4EC5A82/2018/fut/items/images/players/html5/134x134/176580.png',
//         medImgUrl:
//           'https://fifa17.content.easports.com/fifa/fltOnlineAssets/B1BA185F-AD7C-4128-8A64-746DE4EC5A82/2018/fut/items/images/players/html5/105x105/176580.png',
//         smallImgUrl:
//           'https://fifa17.content.easports.com/fifa/fltOnlineAssets/B1BA185F-AD7C-4128-8A64-746DE4EC5A82/2018/fut/items/images/players/html5/40x40/176580.png',
//       },
//       specialImages: { largeTOTWImgUrl: null, medTOTWImgUrl: null },
//       position: 'ST',
//       composure: 83,
//       playStyle: 'Basic',
//       playStyleId: null,
//       height: 182,
//       weight: 86,
//       birthdate: '1987-01-24',
//       age: 31,
//       acceleration: 88,
//       aggression: 78,
//       agility: 86,
//       balance: 60,
//       ballcontrol: 91,
//       foot: 'Right',
//       skillMoves: 4,
//       crossing: 77,
//       curve: 86,
//       dribbling: 86,
//       finishing: 94,
//       freekickaccuracy: 84,
//       gkdiving: 27,
//       gkhandling: 25,
//       gkkicking: 31,
//       gkpositioning: 33,
//       gkreflexes: 37,
//       headingaccuracy: 77,
//       interceptions: 41,
//       jumping: 69,
//       longpassing: 64,
//       longshots: 86,
//       marking: 30,
//       penalties: 85,
//       positioning: 92,
//       potential: 92,
//       reactions: 93,
//       shortpassing: 83,
//       shotpower: 87,
//       slidingtackle: 38,
//       sprintspeed: 77,
//       standingtackle: 45,
//       stamina: 89,
//       strength: 80,
//       vision: 84,
//       volleys: 88,
//       weakFoot: 4,
//       traits: ['Tries To Beat Defensive Line', 'Technical Dribbler'],
//       specialities: [
//         'Dribbler',
//         'Acrobat',
//         'Clinical Finisher',
//         'Complete Forward',
//         'Poacher',
//       ],
//       atkWorkRate: 'High',
//       defWorkRate: 'Medium',
//       playerType: 'rare',
//       attributes: [
//         { name: 'fut.attribute.PAC', value: 82, chemistryBonus: [0] },
//         { name: 'fut.attribute.SHO', value: 90, chemistryBonus: [0] },
//         { name: 'fut.attribute.PAS', value: 79, chemistryBonus: [0] },
//         { name: 'fut.attribute.DRI', value: 86, chemistryBonus: [0] },
//         { name: 'fut.attribute.DEF', value: 42, chemistryBonus: [0] },
//         { name: 'fut.attribute.PHY', value: 81, chemistryBonus: [0] },
//       ],
//       name: 'Su\u00e1rez',
//       quality: 'gold',
//       color: 'rare_gold',
//       isGK: false,
//       positionFull: 'Striker',
//       isSpecialType: false,
//       contracts: null,
//       fitness: null,
//       rawAttributeChemistryBonus: null,
//       isLoan: null,
//       squadPosition: null,
//       iconAttributes: null,
//       itemType: 'player',
//       discardValue: null,
//       id: '176580',
//       modelName: 'FUTPlayerItem',
//       baseId: 176580,
//       rating: 92,
//     },
//   ],
// };
