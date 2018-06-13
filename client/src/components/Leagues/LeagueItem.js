import React from 'react';
import Link from '../styles/Link';
import { compose, withHandlers } from 'recompose';
import { graphql } from 'react-apollo';
import styled from 'styled-components';
import LeagueJoinButton from './LeagueJoinButton';
import UserQuery from '../UserQuery';
import JOIN_LEAGUE_MUTATION from '../../graphql/JoinLeagueMutation.graphql';

const LeagueRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing}px 0;
`;

const getStatusText = status => {
  switch (status) {
    case 'IDLE':
      return 'Ready to start';
    case 'IN_PROGRESS':
      return 'Already started';
    case 'ENDED':
      return 'Draft has ended';
    case 'PAUSED':
      return 'Draft is paused';
    default:
      return '';
  }
};

const LeagueItem = ({ league, joinLeague }) => (
  <UserQuery>
    {({ user }) => {
      return (
        <LeagueRow>
          <Link to={`/draft/${league.id}`} color={'secondary'}>
            {league.name}
          </Link>
          <p>
            {league.members.length}
            /
            {league.maxSize} Spots
          </p>
          <p>{getStatusText(league.status)}</p>
          <LeagueJoinButton
            isAlreadyInLeague={
              user && league.members.find(m => m.id === user.id)
            }
            isFull={league.members.length === league.maxSize}
            isLoggedIn={user}
            handleClick={joinLeague}
          />
        </LeagueRow>
      );
    }}
  </UserQuery>
);

const enhanced = compose(
  graphql(JOIN_LEAGUE_MUTATION, { name: 'joinLeagueMutation' }),
  withHandlers({
    joinLeague: ({ league, joinLeagueMutation }) => () =>
      joinLeagueMutation({ variables: { id: league.id } }),
  })
)(LeagueItem);

export default enhanced;
