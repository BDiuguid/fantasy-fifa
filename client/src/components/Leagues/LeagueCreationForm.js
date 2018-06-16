import React from 'react';
import styled from 'styled-components';
import { graphql } from 'react-apollo';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { compose, withState, withHandlers } from 'recompose';
import CREATE_LEAGUE_MUTATION from '../../graphql/CreateLeagueMutation.graphql';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;
`;

const Form = ({
  done,
  onSubmit,
  name,
  onChangeName,
  maxSize,
  onChangeMaxSize,
  teamSize,
  onChangeTeamSize,
  startingMoney,
  onChangeStartingMoney,
  nominationTime,
  onChangeNominationTime,
  bidTime,
  onChangeBidTime,
}) => (
  <form onSubmit={onSubmit} style={{ height: '80%' }}>
    <Container>
      <TextField
        label="League Name"
        value={name}
        onChange={onChangeName}
        placeholder="e.g., Romeo Rumble"
        inputProps={{ maxLength: '30' }}
      />
      <TextField
        label="Max League Size"
        type="number"
        value={maxSize}
        onChange={onChangeMaxSize}
        inputProps={{
          min: '2',
          max: '128',
          step: '1',
        }}
      />
      <TextField
        label="Max Team Size"
        type="number"
        value={teamSize}
        onChange={onChangeTeamSize}
        inputProps={{
          min: '1',
          max: '100',
          step: '1',
        }}
      />
      <TextField
        label="Starting Auction Money"
        type="number"
        value={startingMoney}
        onChange={onChangeStartingMoney}
        inputProps={{
          min: '1',
          step: '1',
        }}
      />
      <TextField
        label="Time Between Nomination"
        type="number"
        value={nominationTime}
        onChange={onChangeNominationTime}
        inputProps={{
          min: '5',
          step: '1',
        }}
      />
      <TextField
        label="Bid Time"
        type="number"
        value={bidTime}
        onChange={onChangeBidTime}
        inputProps={{
          min: '5',
          step: '1',
        }}
      />
      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
      <Button variant="contained" onClick={done}>
        Close
      </Button>
      {/* <button type="submit" className="btn btn-primary">
      Submit
    </button>
    <button type="button" className="btn btn-default" onClick={done}>
      Close
    </button> */}
    </Container>
  </form>
);

const onSubmit = ({
  done,
  name,
  maxSize,
  teamSize,
  startingMoney,
  nominationTime,
  bidTime,
  createLeagueMutation,
}) => async event => {
  event.preventDefault();

  await createLeagueMutation({
    variables: {
      name,
      maxSize,
      teamSize,
      startingMoney,
      nominationTime,
      bidTime,
    },
  });

  done();
};

const enhance = compose(
  withState('name', 'changeName', ''),
  withState('maxSize', 'changeMaxSize', 4),
  withState('teamSize', 'changeTeamSize', 18),
  withState('startingMoney', 'changeStartingMoney', 100),
  withState('nominationTime', 'changeNominationTime', 15),
  withState('bidTime', 'changeBidTime', 10),
  graphql(CREATE_LEAGUE_MUTATION, { name: 'createLeagueMutation' }),
  withHandlers({
    onSubmit,
    onChangeName: ({ changeName }) => e => changeName(e.target.value),
    // TODO: check if it's necessary to parseInt.
    onChangeMaxSize: ({ changeMaxSize }) => e =>
      changeMaxSize(parseInt(e.target.value, 10)),
    onChangeTeamSize: ({ changeTeamSize }) => e =>
      changeTeamSize(parseInt(e.target.value, 10)),
    onChangeStartingMoney: ({ changeStartingMoney }) => e =>
      changeStartingMoney(parseInt(e.target.value, 10)),
    onChangeNominationTime: ({ changeNominationTime }) => e =>
      changeNominationTime(parseInt(e.target.value, 10)),
    onChangeBidTime: ({ changeBidTime }) => e =>
      changeBidTime(parseInt(e.target.value, 10)),
  })
);

export default enhance(Form);
