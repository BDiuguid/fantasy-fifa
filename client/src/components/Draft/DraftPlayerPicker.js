import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import { loader } from 'graphql.macro';
import { ToastConsumer } from '../Toast';
import UserQuery from '../UserQuery';
import PlayerPicker from '../PlayerPicker';

const NOMINATE_PLAYER_MUTATION = loader(
  '../../graphql/NominatePlayerMutation.graphql'
);

class DraftPicker extends Component {
  onPick = async player => {
    const { client, league, toast } = this.props;

    try {
      await client.mutate({
        mutation: NOMINATE_PLAYER_MUTATION,
        variables: { leagueId: league.id, playerId: player.id },
      });
    } catch (err) {
      err.graphQLErrors.forEach(e => toast(e.message));
    }
  };

  render() {
    const { league } = this.props;
    return (
      <UserQuery>
        {({ user }) => {
          return league.status === 'IN_PROGRESS' &&
            (user &&
              league.userTurnOrder &&
              league.userTurnOrder.length > 0 &&
              user.id ===
                league.members[league.userTurnOrder[league.userTurnIndex]]
                  .id) &&
            !league.playerUpForBid ? (
            <PlayerPicker onPick={this.onPick} />
          ) : null;
        }}
      </UserQuery>
    );
  }
}

const ToastPicker = ({ ...rest }) => (
  <ToastConsumer>
    {({ toast }) => <DraftPicker toast={toast} {...rest} />}
  </ToastConsumer>
);

export default withApollo(ToastPicker);
