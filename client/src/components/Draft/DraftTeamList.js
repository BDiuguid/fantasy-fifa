import React from 'react';
import styled from 'styled-components';

const Flex = styled.div`
  display: flex;
`;

const Container = styled.div`
  padding: ${props => props.theme.spacing}px;
  width: 200px;
  line-height: 1.5;
`;

const SpaceBetween = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Name = styled.div`
  font-size: 17px;
  font-weight: bold;
  margin-bottom: ${props => props.theme.spacing / 4}px;
`;

const Team = ({ member, team, teamSize }) => (
  <Container>
    <Name>{member.name}</Name>
    <SpaceBetween>
      <div>
        <strong>
          {team.players.length}/{teamSize}
        </strong>
      </div>
      <div>
        <strong>${team.money}</strong>
      </div>
    </SpaceBetween>
    {team.players.map((player, i) => (
      <SpaceBetween key={player.id}>
        <div>
          {i + 1}) {player.name}
        </div>
        <div>${team.paidAmounts[i]}</div>
      </SpaceBetween>
    ))}
  </Container>
);

const teamByOwner = (ownerId, teams) =>
  teams.filter(t => t.owner.id === ownerId)[0];

const DraftTeamList = ({ league }) => (
  <Flex>
    {league.members.map(member => (
      <Team
        key={member.id}
        member={member}
        team={teamByOwner(member.id, league.teams)}
        teamSize={league.teamSize}
      />
    ))}
  </Flex>
);

export default DraftTeamList;
