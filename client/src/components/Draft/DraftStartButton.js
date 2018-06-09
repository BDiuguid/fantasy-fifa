import React from 'react';
import Button from '@material-ui/core/Button';
import { compose, withHandlers } from 'recompose';
import { graphql } from 'react-apollo';
import UserQuery from '../UserQuery';
import START_DRAFT_MUTATION from '../../graphql/StartDraftMutation.graphql';

const DraftStartButton = ({ league, startDraft }) => (
  <UserQuery>
    {({ user }) =>
      user && user.id === league.creator.id && league.status === 'IDLE' ? (
        <Button
          size="large"
          variant="raised"
          color="primary"
          onClick={startDraft}
        >
          Start Draft
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
