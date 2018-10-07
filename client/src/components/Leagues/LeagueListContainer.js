import React, { Fragment } from 'react';
import LeagueItem from './LeagueItem';
import { Query } from 'react-apollo';
import { loader } from 'graphql.macro';

const LEAGUES_QUERY = loader('../../graphql/LeaguesQuery.graphql');

const leagues = () => (
  <Query query={LEAGUES_QUERY}>
    {({ loading, data }) =>
      loading ? (
        <div>loading</div>
      ) : (
        <Fragment>
          {data && data.leagues ? (
            data.leagues.map(league => (
              <LeagueItem key={league.id} league={league} />
            ))
          ) : (
            <div>No leagues</div>
          )}
        </Fragment>
      )
    }
  </Query>
);

export default leagues;
