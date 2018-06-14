import React from 'react';
import styled from 'styled-components';
import { Query } from 'react-apollo';
import PLAYER_QUERY from '../graphql/PlayerQuery.graphql';

const getSkillColor = (skillValue, themeColor) => {
  if (skillValue > 80) return themeColor.fifaDarkGreen;
  if (skillValue > 70) return themeColor.fifaLightGreen;
  if (skillValue > 60) return themeColor.fifaYellow;
  if (skillValue > 50) return themeColor.fifaOrange;
  if (skillValue > 0) return themeColor.fifaRed;
  return '';
};

const getAttributeValue = (attributes, name) =>
  attributes.find(attr => attr.name === name).value;

const ColoredSkill = styled.span`
  color: ${props => getSkillColor(props.value, props.theme.color)};
`;

const Skill = ({ value }) => <ColoredSkill value={value}>{value}</ColoredSkill>;

const ListTitle = styled.div`
  font-size: 17px;
  font-weight: 500;
  margin-bottom: ${props => props.theme.spacing / 2}px;
  display: flex;
  justify-content: space-between;
`;

const SpaceBetween = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ListItem = styled.div`
  display: flex;
  justify-content: space-between;
  border-top-width: 1px;
  border-top-style: solid;
  border-top-color: ${props => props.theme.color.primaryLight};
  line-height: 1.5;
`;

const Core = styled.div`
  display: flex;
  flex-direction: column;
  width: 100px;
  line-height: 1.5;
`;

const TraitAndSp = styled.div`
  font-size: 12px;
`;

const TraitAndSpContainer = styled.div`
  line-height: 1.5;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 146px 1fr 1.1fr 1fr;
  grid-template-rows: repeat(2, auto);
  grid-gap: ${props => props.theme.spacing * 2}px
    ${props => props.theme.spacing * 2}px;
`;

const Overall = styled.div`
  grid-area: 1 / 1;
`;

const Characteristics = styled.div`
  grid-area: 2 / 1;
`;

const Traits = styled.div`
  grid-area: 1 / 2;
`;

const Specialities = styled.div`
  grid-area: 2 / 2;
`;

const Shooting = styled.div`
  grid-area: 1 / 3;
`;

const Goalkeeping = styled.div`
  grid-area: 1 / 3;
`;

const Pace = styled.div`
  grid-area: 2 / 3;
`;

const Passing = styled.div`
  grid-area: 1 / 4;
`;

const Misc = styled.div`
  grid-row: 1 / span 2;
  grid-column: 4;
`;

const Physcality = styled.div`
  grid-area: 2 / 4;
`;

const Dribbling = styled.div`
  grid-area: 1 / 5;
`;

const Defending = styled.div`
  grid-area: 2 / 5;
`;

const Bold = styled.span`
  font-weight: 500;
`;

const Small = styled.span`
  font-size: 12px;
`;

const NonKeeper = ({ player }) => (
  <GridContainer>
    <Overall>
      <div>
        <Bold>{player.name}</Bold>{' '}
        <Small>
          ({player.firstName} {player.lastName})
        </Small>
      </div>
      <SpaceBetween>
        <img
          src={player.headshotImgUrl}
          alt="Player headshot"
          width="120"
          height="120"
        />
        <Core>
          <SpaceBetween>
            <div>Overall</div>
            <Bold>
              <Skill value={player.rating} />
            </Bold>
          </SpaceBetween>
          <SpaceBetween>
            <div>Position</div>
            <div>{player.position}</div>
          </SpaceBetween>
          <SpaceBetween>
            <div>Age</div>
            <div>{player.age}</div>
          </SpaceBetween>
          <SpaceBetween>
            <div>Height</div>
            <div>{player.height}</div>
          </SpaceBetween>
          <SpaceBetween>
            <div>Weight</div>
            <div>{player.weight}</div>
          </SpaceBetween>
        </Core>
      </SpaceBetween>
    </Overall>
    <Characteristics>
      <ListTitle>CHARACTERISTICS</ListTitle>
      <ListItem>
        <div>FOOT</div>
        <div>{player.foot}</div>
      </ListItem>
      <ListItem>
        <div>ATTACK WORKRATE</div>
        <div>{player.atkWorkRate}</div>
      </ListItem>
      <ListItem>
        <div>DEFENSIVE WORKRATE</div>
        <div>{player.defWorkRate}</div>
      </ListItem>
      <ListItem>
        <div>WEAK FOOT</div>
        <div>
          <Bold>{player.weakFoot}</Bold>
        </div>
      </ListItem>
      <ListItem>
        <div>SKILL MOVES</div>
        <div>
          <Bold>{player.skillMoves}</Bold>
        </div>
      </ListItem>
    </Characteristics>
    <Traits>
      <TraitAndSpContainer>
        <ListTitle>TRAITS</ListTitle>
        {player.traits.map(trait => (
          <TraitAndSp key={trait}>{trait}</TraitAndSp>
        ))}
      </TraitAndSpContainer>
    </Traits>
    <Specialities>
      <TraitAndSpContainer>
        <ListTitle>SPECIALTIES</ListTitle>
        {player.specialities.map(specialty => (
          <TraitAndSp key={specialty}>{specialty}</TraitAndSp>
        ))}
      </TraitAndSpContainer>
    </Specialities>
    <Shooting>
      <ListTitle>
        <div>SHOOTING</div>
        <Skill value={getAttributeValue(player.attributes, 'SHO')} />
      </ListTitle>
      <ListItem>
        <div>POSITIONING</div>
        <Skill value={player.positioning} />
      </ListItem>
      <ListItem>
        <div>FINISHING</div>
        <Skill value={player.finishing} />
      </ListItem>
      <ListItem>
        <div>SHOT POWER</div>
        <Skill value={player.shotpower} />
      </ListItem>
      <ListItem>
        <div>LONG SHOTS</div>
        <Skill value={player.longshots} />
      </ListItem>
      <ListItem>
        <div>VOLLEYS</div>
        <Skill value={player.volleys} />
      </ListItem>
      <ListItem>
        <div>PENALTIES</div>
        <Skill value={player.penalties} />
      </ListItem>
    </Shooting>
    <Pace>
      <ListTitle>
        <div>PACE</div>
        <Skill value={getAttributeValue(player.attributes, 'PAC')} />
      </ListTitle>
      <ListItem>
        <div>ACCELERATION</div>
        <Skill value={player.acceleration} />
      </ListItem>
      <ListItem>
        <div>SPRINT SPEED</div>
        <Skill value={player.sprintspeed} />
      </ListItem>
    </Pace>
    <Passing>
      <ListTitle>
        <div>PASSING</div>
        <Skill value={getAttributeValue(player.attributes, 'PAS')} />
      </ListTitle>
      <ListItem>
        <div>VISION</div>
        <Skill value={player.vision} />
      </ListItem>
      <ListItem>
        <div>CROSSING</div>
        <Skill value={player.crossing} />
      </ListItem>
      <ListItem>
        <div>FREE KICK ACCURACY</div>
        <Skill value={player.freekickaccuracy} />
      </ListItem>
      <ListItem>
        <div>SHORT PASSING</div>
        <Skill value={player.shortpassing} />
      </ListItem>
      <ListItem>
        <div>LONG PASSING</div>
        <Skill value={player.longpassing} />
      </ListItem>
      <ListItem>
        <div>CURVE</div>
        <Skill value={player.curve} />
      </ListItem>
    </Passing>
    <Physcality>
      <ListTitle>
        <div>PHYSICALITY</div>
        <Skill value={getAttributeValue(player.attributes, 'PHY')} />
      </ListTitle>
      <ListItem>
        <div>JUMPING</div>
        <Skill value={player.jumping} />
      </ListItem>
      <ListItem>
        <div>STAMINA</div>
        <Skill value={player.stamina} />
      </ListItem>
      <ListItem>
        <div>STRENGTH</div>
        <Skill value={player.strength} />
      </ListItem>
      <ListItem>
        <div>AGGRESSION</div>
        <Skill value={player.aggression} />
      </ListItem>
    </Physcality>
    <Dribbling>
      <ListTitle>
        <div>DRIBBLING</div>
        <Skill value={getAttributeValue(player.attributes, 'DRI')} />
      </ListTitle>
      <ListItem>
        <div>AGILITY</div>
        <Skill value={player.agility} />
      </ListItem>
      <ListItem>
        <div>BALANCE</div>
        <Skill value={player.balance} />
      </ListItem>
      <ListItem>
        <div>REACTIONS</div>
        <Skill value={player.reactions} />
      </ListItem>
      <ListItem>
        <div>BALL CONTROL</div>
        <Skill value={player.ballcontrol} />
      </ListItem>
      <ListItem>
        <div>DRIBBLING</div>
        <Skill value={player.dribbling} />
      </ListItem>
      <ListItem>
        <div>COMPOSURE</div>
        <Skill value={player.composure} />
      </ListItem>
    </Dribbling>
    <Defending>
      <ListTitle>
        <div>DEFENDING</div>
        <Skill value={getAttributeValue(player.attributes, 'DEF')} />
      </ListTitle>
      <ListItem>
        <div>INTERCEPTIONS</div>
        <Skill value={player.interceptions} />
      </ListItem>
      <ListItem>
        <div>HEADING ACCURACY</div>
        <Skill value={player.headingaccuracy} />
      </ListItem>
      <ListItem>
        <div>MARKING</div>
        <Skill value={player.marking} />
      </ListItem>
      <ListItem>
        <div>STANDING TACKLE</div>
        <Skill value={player.standingtackle} />
      </ListItem>
      <ListItem>
        <div>SLIDING TACKLE</div>
        <Skill value={player.slidingtackle} />
      </ListItem>
    </Defending>
  </GridContainer>
);

const Goalkeeper = ({ player }) => (
  <GridContainer>
    <Overall>
      <div>
        <Bold>{player.name}</Bold>{' '}
        <Small>
          ({player.firstName} {player.lastName})
        </Small>
      </div>
      <SpaceBetween>
        <img
          src={player.headshotImgUrl}
          alt="Player headshot"
          width="120"
          height="120"
        />
        <Core>
          <SpaceBetween>
            <div>Overall</div>
            <Bold>
              <Skill value={player.rating} />
            </Bold>
          </SpaceBetween>
          <SpaceBetween>
            <div>Position</div>
            <div>{player.position}</div>
          </SpaceBetween>
          <SpaceBetween>
            <div>Age</div>
            <div>{player.age}</div>
          </SpaceBetween>
          <SpaceBetween>
            <div>Height</div>
            <div>{player.height}</div>
          </SpaceBetween>
          <SpaceBetween>
            <div>Weight</div>
            <div>{player.weight}</div>
          </SpaceBetween>
        </Core>
      </SpaceBetween>
    </Overall>
    <Characteristics>
      <ListTitle>CHARACTERISTICS</ListTitle>
      <ListItem>
        <div>FOOT</div>
        <div>{player.foot}</div>
      </ListItem>
      <ListItem>
        <div>ATTACK WORKRATE</div>
        <div>{player.atkWorkRate}</div>
      </ListItem>
      <ListItem>
        <div>DEFENSIVE WORKRATE</div>
        <div>{player.defWorkRate}</div>
      </ListItem>
      <ListItem>
        <div>WEAK FOOT</div>
        <div>
          <Bold>{player.weakFoot}</Bold>
        </div>
      </ListItem>
      <ListItem>
        <div>SKILL MOVES</div>
        <div>
          <Bold>{player.skillMoves}</Bold>
        </div>
      </ListItem>
    </Characteristics>
    <Traits>
      <TraitAndSpContainer>
        <ListTitle>TRAITS</ListTitle>
        {player.traits.map(trait => (
          <TraitAndSp key={trait}>{trait}</TraitAndSp>
        ))}
      </TraitAndSpContainer>
    </Traits>
    <Specialities>
      <TraitAndSpContainer>
        <ListTitle>SPECIALTIES</ListTitle>
        {player.specialities.map(specialty => (
          <TraitAndSp key={specialty}>{specialty}</TraitAndSp>
        ))}
      </TraitAndSpContainer>
    </Specialities>
    <Goalkeeping>
      <ListTitle>
        <div>GOALKEEPING</div>
      </ListTitle>
      <ListItem>
        <div>GK DIVING</div>
        <Skill value={player.gkdiving} />
      </ListItem>
      <ListItem>
        <div>GK HANDLING</div>
        <Skill value={player.gkhandling} />
      </ListItem>
      <ListItem>
        <div>GK KICKING</div>
        <Skill value={player.gkkicking} />
      </ListItem>
      <ListItem>
        <div>GK POSITIONING</div>
        <Skill value={player.gkpositioning} />
      </ListItem>
      <ListItem>
        <div>GK REFLEXES</div>
        <Skill value={player.gkreflexes} />
      </ListItem>
    </Goalkeeping>
    <Pace>
      <ListTitle>
        <div>SPEED</div>
      </ListTitle>
      <ListItem>
        <div>ACCELERATION</div>
        <Skill value={player.acceleration} />
      </ListItem>
      <ListItem>
        <div>SPRINT SPEED</div>
        <Skill value={player.sprintspeed} />
      </ListItem>
    </Pace>
    <Misc>
      <ListTitle>
        <div>MISC</div>
      </ListTitle>
      <ListItem>
        <div>REACTIONS</div>
        <Skill value={player.reactions} />
      </ListItem>
      <ListItem>
        <div>AGILITY</div>
        <Skill value={player.agility} />
      </ListItem>
      <ListItem>
        <div>JUMPING</div>
        <Skill value={player.jumping} />
      </ListItem>
      <ListItem>
        <div>STRENGTH</div>
        <Skill value={player.strength} />
      </ListItem>
      <ListItem>
        <div>STAMINA</div>
        <Skill value={player.stamina} />
      </ListItem>
      <ListItem>
        <div>VISION</div>
        <Skill value={player.vision} />
      </ListItem>
      <ListItem>
        <div>COMPOSURE</div>
        <Skill value={player.composure} />
      </ListItem>
      <ListItem>
        <div>SHORT PASSING</div>
        <Skill value={player.shortpassing} />
      </ListItem>
      <ListItem>
        <div>LONG PASSING</div>
        <Skill value={player.longpassing} />
      </ListItem>
    </Misc>
  </GridContainer>
);

const Player = ({ id }) =>
  id ? (
    <Query query={PLAYER_QUERY} variables={{ id }}>
      {({ loading, error, data }) => {
        if ((loading && !data.player) || error) {
          return null;
        }
        const { player } = data;

        return player.isGK ? (
          <Goalkeeper player={player} />
        ) : (
          <NonKeeper player={player} />
        );
      }}
    </Query>
  ) : null;

export default Player;
