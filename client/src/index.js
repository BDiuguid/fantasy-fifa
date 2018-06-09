import React from 'react';
import { render } from 'react-dom';
import './styles/index.css';
import { ApolloProvider } from 'react-apollo';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { ThemeProvider } from 'styled-components';
import getClient from './client';
import registerServiceWorker from './registerServiceWorker';

import Routes from './routes';

import { ToastProvider } from './components/Toast';
import { theme, muiTheme } from './theme';

const client = getClient();

render(
  <ApolloProvider client={client}>
    <ThemeProvider theme={theme}>
      <MuiThemeProvider theme={muiTheme}>
        <ToastProvider>
          <Routes />
        </ToastProvider>
      </MuiThemeProvider>
    </ThemeProvider>
  </ApolloProvider>,
  document.getElementById('root')
);

registerServiceWorker();
