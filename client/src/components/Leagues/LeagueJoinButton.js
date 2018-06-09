import React from 'react';
import Button from '@material-ui/core/Button';

const LeagueJoinButton = ({
  isAlreadyInLeague,
  isFull,
  isLoggedIn,
  handleClick,
}) => {
  if (isAlreadyInLeague) {
    return (
      <Button variant="raised" color="primary" disabled>
        Joined!
      </Button>
    );
  } else if (isFull) {
    return (
      <Button variant="raised" disabled>
        Already Full
      </Button>
    );
  } else if (isLoggedIn) {
    return (
      <Button variant="raised" color="primary" onClick={handleClick}>
        Join League
      </Button>
    );
  } else {
    return (
      <Button variant="raised" disabled>
        Log In First
      </Button>
    );
  }
};

export default LeagueJoinButton;
