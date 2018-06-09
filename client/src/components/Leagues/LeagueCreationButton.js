import React from 'react';
import Button from '@material-ui/core/Button';
import ReactModal from 'react-modal';
import { compose, withState, withHandlers } from 'recompose';
import UserQuery from '../UserQuery';
import LeagueCreationForm from './LeagueCreationForm';

// TODO: Replace these default styles with better ones.
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  content: {
    position: 'absolute',
    top: '40px',
    left: '40px',
    right: '40px',
    bottom: '40px',
    border: '1px solid #ccc',
    background: '#fff',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '4px',
    outline: 'none',
    padding: '20px',
  },
};

const LeagueCreationButton = ({ show, toggleShow }) => (
  <UserQuery>
    {({ user }) =>
      user ? (
        <div>
          <Button
            variant="raised"
            color="primary"
            size="large"
            onClick={toggleShow}
          >
            Create League
          </Button>

          <ReactModal
            isOpen={show}
            contentLabel="League Creation Modal"
            style={modalStyles}
            appElement={document.getElementById('root')}
            onRequestClose={toggleShow}
          >
            <h1>Create League</h1>
            <LeagueCreationForm done={toggleShow} />
          </ReactModal>
        </div>
      ) : (
        <Button size="large" disabled>
          Login to Create
        </Button>
      )
    }
  </UserQuery>
);

const enhanced = compose(
  withState('show', 'changeShow', false),
  withHandlers({
    toggleShow: ({ show, changeShow }) => () => changeShow(!show),
  })
)(LeagueCreationButton);

export default enhanced;
