import React from 'react';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { compose, withState, withHandlers } from 'recompose';
import { Redirect } from 'react-router';
import { withApollo, graphql } from 'react-apollo';
import { loader } from 'graphql.macro';
import UserQuery from '../components/UserQuery';
import { AUTH_TOKEN } from '../constants';

const SIGNUP_MUTATION = loader('../graphql/SignupMutation.graphql');
const LOGIN_MUTATION = loader('../graphql/LoginMutation.graphql');

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 50%;
  width: 30%;
  justify-content: space-around;
`;

const Login = ({
  name,
  onChangeName,
  password,
  onChangePassword,
  onLogin,
  onSignup,
}) => {
  return localStorage.getItem(AUTH_TOKEN) ? (
    <UserQuery network={true}>{() => <Redirect to="/" />}</UserQuery>
  ) : (
    <Container>
      <TextField label="Username" value={name} onChange={onChangeName} />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={onChangePassword}
      />
      <Button
        size="large"
        variant="contained"
        color="primary"
        onClick={onLogin}
      >
        Login
      </Button>
      <Button
        size="large"
        variant="contained"
        color="primary"
        onClick={onSignup}
      >
        Sign Up
      </Button>
    </Container>
  );
};

const enhanced = compose(
  withApollo,
  graphql(SIGNUP_MUTATION, { name: 'signupMutation' }),
  graphql(LOGIN_MUTATION, { name: 'loginMutation' }),
  withState('name', 'changeName', ''),
  withState('password', 'changePassword', ''),
  withHandlers({
    onChangeName: ({ changeName }) => e => changeName(e.target.value),
    onChangePassword: ({ changePassword }) => e =>
      changePassword(e.target.value),
    onLogin: ({
      name,
      password,
      changeName,
      changePassword,
      loginMutation,
    }) => async () => {
      const result = await loginMutation({
        variables: {
          name,
          password,
        },
      });
      localStorage.setItem(AUTH_TOKEN, result.data.login.token);
      changeName('');
      changePassword('');
    },
    onSignup: ({
      name,
      password,
      changeName,
      changePassword,
      signupMutation,
    }) => async () => {
      const result = await signupMutation({
        variables: {
          name,
          password,
        },
      });
      localStorage.setItem(AUTH_TOKEN, result.data.signup.token);
      changeName('');
      changePassword('');
    },
  })
)(Login);

export default enhanced;
