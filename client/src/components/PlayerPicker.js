import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import Button from '@material-ui/core/Button';
import MuiDownshift from 'mui-downshift';
import styled from 'styled-components';
import { debounce } from 'lodash';
import { loader } from 'graphql.macro';

const PLAYER_BY_NAME_QUERY = loader('../graphql/PlayerByNameQuery.graphql');

const ButtonWrapper = styled.div`
  margin-top: ${props => props.theme.spacing}px;
  margin-bottom: ${props => props.theme.spacing}px;
`;

class PlayerPicker extends Component {
  state = {
    players: [],
    player: null,
    playerInput: '',
    playerLoading: false,
  };

  componentDidMount() {
    this.debouncedFetch = debounce(this.fetchPlayers, 200);
  }

  handleChange = selectedItem => {
    this.setState({ player: selectedItem });
  };

  handleInputChange = inputValue => {
    this.setState({ playerInput: inputValue });
    this.debouncedFetch(inputValue.toLowerCase());
  };

  fetchPlayers = async query => {
    const { client } = this.props;

    this.setState({ playerLoading: true });

    const { data } = await client.query({
      query: PLAYER_BY_NAME_QUERY,
      variables: { query },
    });

    const players = data.playersByName.map(player => ({
      ...player,
      value: player.id,
      label:
        `${player.rating} - ${player.position} - ` +
        `${player.name} (${player.firstName} ${player.lastName})`,
    }));
    this.setState({ players, playerLoading: false });
  };

  onSubmit = event => {
    event.preventDefault();

    // Disable submitting nothing.
    if (!this.state.player) {
      return;
    }

    this.props.onPick(this.state.player);
    this.setState({ player: null, playerInput: '' });
  };

  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <MuiDownshift
          items={this.state.players}
          onChange={this.handleChange}
          selectedItem={this.state.player}
          onInputValueChange={this.handleInputChange}
          inputValue={this.state.playerInput}
          loading={this.state.playerLoading}
          getInputProps={() => ({ label: 'Player name' })}
        />
        <ButtonWrapper>
          <Button variant="raised" color="primary" type="submit">
            Select
          </Button>
        </ButtonWrapper>
      </form>
    );
  }
}

export default withApollo(PlayerPicker);
