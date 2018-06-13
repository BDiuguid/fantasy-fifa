import React, { Fragment } from 'react';
import styled from 'styled-components';
import { compose, withHandlers } from 'recompose';
import { withRouter } from 'react-router-dom';
import { withApollo } from 'react-apollo';
import UserQuery from './UserQuery';
import Link from './styles/Link';
import { AUTH_TOKEN } from '../constants';

const AppBar = styled.div`
  background-color: ${props => props.theme.color.primaryDark};
  color: ${props => props.theme.color.primaryText};
  height: ${props => props.theme.spacing * 6}px;
  padding: ${props => props.theme.spacing / 2}px
    ${props => props.theme.spacing * 2}px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Menu = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-size: 16px;
`;

const Name = styled.p`
  color: ${props => props.theme.color.secondary};
  padding: 0 ${props => props.theme.spacing / 2}px;
`;

const Header = ({ onLogout }) => (
  <AppBar>
    <Link to="/">FIFA Fantasy</Link>
    <Menu>
      <UserQuery network={true}>
        {({ user }) => (
          <Fragment>
            {user && <Name>{user.name}</Name>}
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/search">Search</Link>
            {user ? (
              <Link to="/" onClick={onLogout}>
                Logout
              </Link>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </Fragment>
        )}
      </UserQuery>
    </Menu>
  </AppBar>
);

export default compose(
  withApollo,
  withRouter,
  withHandlers({
    onLogout: ({ client, history }) => () => {
      localStorage.removeItem(AUTH_TOKEN);
      client.resetStore();
      history.push(`/`);
    },
  })
)(Header);
