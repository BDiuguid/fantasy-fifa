import React from 'react';
import { render } from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { MuiThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import getClient from './client';
import registerServiceWorker from './registerServiceWorker';

import Routes from './routes';

import { ToastProvider } from './components/Toast';
import { theme, muiTheme } from './theme';

const client = getClient();

const GlobalStyle = createGlobalStyle`
  html,
  body,
  #root {
    height: 100%;
  }

  body {
    font-family: 'Roboto', sans-serif;
  }

  /* Remove scroll on the body when react-modal is open */
  .ReactModal__Body--open {
    overflow: hidden;
  }
`;

render(
  <ApolloProvider client={client}>
    <ThemeProvider theme={theme}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        <GlobalStyle />
        <ToastProvider>
          <Routes />
        </ToastProvider>
      </MuiThemeProvider>
    </ThemeProvider>
  </ApolloProvider>,
  document.getElementById('root')
);

registerServiceWorker();
