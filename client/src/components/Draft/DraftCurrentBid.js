import React from 'react';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import { compose, withHandlers } from 'recompose';
import { graphql } from 'react-apollo';
import { loader } from 'graphql.macro';
import Player from '../Player';
import UserQuery from '../UserQuery';

const BID_ON_PLAYER_MUTATION = loader(
  '../../graphql/BidOnPlayerMutation.graphql'
);

const userIsInDraft = (league, user) =>
  user && league.members.find(m => m.id === user.id);

const Clock = styled.div`
  border-radius: 50%;
  width: 64px;
  height: 64px;
  background-color: ${props => props.theme.color.primary};
  color: ${props => props.theme.color.primaryText};
  font-size: 28px;
  line-height: 64px;
  text-align: center;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing * 2}px 0;
  margin-bottom: ${props => props.theme.spacing * 4}px;
`;

const CurrentBidText = styled.div`
  font-size: 24px;
`;

const SecondaryText = styled.span`
  color: ${props => props.theme.color.secondary};
  font-weight: 500;
`;

const BidButton = ({ league, user, handleBid }) => {
  if (!userIsInDraft(league, user)) {
    return null;
  }

  if (league.highestBid.user.id === user.id) {
    return (
      <Button variant="raised" color="secondary" disabled mini={true}>
        highest bidder
      </Button>
    );
  }

  const team = league.teams.find(team => team.owner.id === user.id);
  if (team.players.length === league.teamSize) {
    return (
      <Button variant="raised" color="secondary" disabled mini={true}>
        Team is Full
      </Button>
    );
  }

  const playersRemaining = league.teamSize - team.players.length;
  const maxBidAmount = team.money - playersRemaining + 1;

  if (league.highestBid.value >= maxBidAmount) {
    return (
      <Button variant="raised" block disabled mini={true}>
        Above max bid
      </Button>
    );
  }

  if (league.playerUpForBid) {
    return (
      <Button
        variant="raised"
        color="secondary"
        mini={true}
        onClick={handleBid}
      >
        Bid {league.highestBid.value + 1}
      </Button>
    );
  }

  return null;
};

const EnhancedBidButton = compose(
  graphql(BID_ON_PLAYER_MUTATION, { name: 'bidMutation' }),
  withHandlers({
    handleBid: ({ league, bidMutation }) => () =>
      bidMutation({
        variables: {
          leagueId: league.id,
          amount: league.highestBid.value + 1,
        },
      }),
  })
)(BidButton);

const DraftCurrentBid = ({ league }) =>
  league.status === 'IN_PROGRESS' ? (
    <UserQuery>
      {({ user }) => (
        <React.Fragment>
          <Row>
            <Clock>
              {league.highestBid ? league.bidClock : league.nominationClock}
            </Clock>
            {league.highestBid && (
              <React.Fragment>
                <EnhancedBidButton league={league} user={user} />
                <CurrentBidText>
                  Bid: <SecondaryText>{league.highestBid.value}</SecondaryText>{' '}
                  by{' '}
                  <SecondaryText>{league.highestBid.user.name}</SecondaryText>
                </CurrentBidText>
              </React.Fragment>
            )}
          </Row>
          <Player id={league.playerUpForBid} />
        </React.Fragment>
      )}
    </UserQuery>
  ) : null;

export default DraftCurrentBid;
