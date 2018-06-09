import React from 'react';
import Button from '@material-ui/core/Button';
import { compose, withHandlers } from 'recompose';
import { graphql } from 'react-apollo';
import Player from '../Player';
import UserQuery from '../UserQuery';
import BID_ON_PLAYER_MUTATION from '../../graphql/BidOnPlayerMutation.graphql';

const userIsInDraft = (league, user) =>
  user && league.members.find(m => m.id === user.id);

const BidButton = ({ league, user, handleBid }) => {
  if (!userIsInDraft(league, user)) {
    return null;
  }

  if (league.highestBid.user.id === user.id) {
    return (
      <Button variant="raised" color="secondary" disabled>
        You are highest bidder
      </Button>
    );
  }

  const team = league.teams.find(team => team.owner.id === user.id);
  if (team.players.length === league.teamSize) {
    return (
      <Button variant="raised" color="secondary" disabled>
        Your Team is Full
      </Button>
    );
  }

  const playersRemaining = league.teamSize - team.players.length;
  const maxBidAmount = team.money - playersRemaining + 1;

  if (league.highestBid.value >= maxBidAmount) {
    return (
      <Button variant="raised" block disabled>
        Above your max bid
      </Button>
    );
  }

  if (league.playerUpForBid) {
    return (
      <Button variant="raised" color="primary" onClick={handleBid}>
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
        <div>
          <h2>
            {league.highestBid ? league.bidClock : league.nominationClock}
          </h2>
          <Player id={league.playerUpForBid} />
          {league.highestBid && (
            <React.Fragment>
              <h4>
                for {league.highestBid.value} by {league.highestBid.user.name}
              </h4>
              <EnhancedBidButton league={league} user={user} />
            </React.Fragment>
          )}
        </div>
      )}
    </UserQuery>
  ) : null;

export default DraftCurrentBid;
