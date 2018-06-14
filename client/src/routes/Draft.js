import React, { Component } from 'react';
import { Query } from 'react-apollo';
import styled from 'styled-components';
import DraftStartButton from '../components/Draft/DraftStartButton';
import DraftCurrentBid from '../components/Draft/DraftCurrentBid';
import DraftPlayerPicker from '../components/Draft/DraftPlayerPicker';
import DraftTeamList from '../components/Draft/DraftTeamList';
import LEAGUE_SUBSCRIPTION from '../graphql/LeagueSubscription.graphql';
import LEAGUE_QUERY from '../graphql/LeagueQuery.graphql';

const leagueStatusText = status => {
  switch (status) {
    case 'IDLE':
      return 'Awaiting league creator to start.';
    case 'IN_PROGRESS':
      return '';
    case 'PAUSED':
      return 'Draft has been paused.';
    case 'ENDED':
      return 'Draft Done! We did it!';
    default:
      return '';
  }
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

class DraftPage extends Component {
  componentDidMount() {
    this.props.subscribeToLeague();
  }

  render() {
    const { loading, data } = this.props;
    return !loading && data && data.league ? (
      <div>
        <Container>
          <p>{leagueStatusText(data.league.status)}</p>
          <DraftStartButton league={data.league} />
        </Container>
        <DraftCurrentBid league={data.league} />
        <DraftPlayerPicker league={data.league} />
        <DraftTeamList league={data.league} />
      </div>
    ) : null;
  }
}

const Draft = ({ match }) => (
  <Query query={LEAGUE_QUERY} variables={{ id: match.params.leagueId }}>
    {({ subscribeToMore, ...result }) => {
      return (
        <DraftPage
          {...result}
          subscribeToLeague={() =>
            subscribeToMore({
              document: LEAGUE_SUBSCRIPTION,
              variables: { id: match.params.leagueId },
            })
          }
        />
      );
    }}
  </Query>
);

export default Draft;
