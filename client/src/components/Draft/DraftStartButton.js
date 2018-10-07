import React from 'react';
import Button from '@material-ui/core/Button';
import ContentCopy from '@material-ui/icons/ContentCopy';
import { compose, withHandlers } from 'recompose';
import { range } from 'lodash';
import { graphql } from 'react-apollo';
import { loader } from 'graphql.macro';
import UserQuery from '../UserQuery';

const START_DRAFT_MUTATION = loader('../../graphql/StartDraftMutation.graphql');

const copy = league => {
  let csvBuilder = '';
  const TeamOwnerNames = league.teams.map(team => team.owner.name).join('\t\t');
  csvBuilder += TeamOwnerNames;
  csvBuilder += '\n';
  const columnTitles = range(league.teams.length)
    .map(() => 'Player\t$')
    .join('\t');
  csvBuilder += columnTitles;
  csvBuilder += '\n';

  for (let i = 0; i < league.teamSize; i++) {
    const row = [];
    league.teams.forEach(team => {
      row.push(team.players[i].name);
      row.push(team.paidAmounts[i]);
    });
    csvBuilder += row.join('\t');
    csvBuilder += '\n';
  }

  navigator.clipboard.writeText(csvBuilder);
};

const DraftStartButton = ({ league, startDraft }) => (
  <UserQuery>
    {({ user }) =>
      user && user.id === league.creator.id ? (
        league.status === 'IDLE' ? (
          <Button
            size="large"
            variant="raised"
            color="primary"
            onClick={startDraft}
          >
            Start Draft
          </Button>
        ) : league.status === 'ENDED' ? (
          <Button variant="fab" color="secondary" onClick={() => copy(league)}>
            <ContentCopy />
          </Button>
        ) : null
      ) : league.status === 'ENDED' ? (
        <Button variant="fab" color="secondary" onClick={() => copy(league)}>
          <ContentCopy />
        </Button>
      ) : null
    }
  </UserQuery>
);

const enhanced = compose(
  graphql(START_DRAFT_MUTATION, { name: 'startDraftMutation' }),
  withHandlers({
    startDraft: ({ league, startDraftMutation }) => () =>
      startDraftMutation({ variables: { leagueId: league.id } }),
  })
)(DraftStartButton);

export default enhanced;
