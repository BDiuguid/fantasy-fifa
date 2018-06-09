import { createMuiTheme } from '@material-ui/core/styles';

const theme = {
  color: {
    primary: '#455A64',
    primaryDark: '#1C313A',
    primaryLight: '#718792',
    primaryText: '#FFFFFF',
    secondary: '#29B6F6',
    secondaryLight: '#73E8FF',
    secondaryDark: '#0086C3',
    secondaryText: '#000000',
    fifaDarkGreen: '#24AE24',
    fifaLightGreen: '#90C039',
    fifaYellow: '#F2B600',
    fifaOrange: '#D47C00',
    fifaRed: '#BF3030',
  },
};

const muiTheme = createMuiTheme({
  palette: {
    primary: {
      light: theme.color.primaryLight,
      main: theme.color.primary,
      dark: theme.color.primaryDark,
      contrastText: theme.color.primaryText,
    },
    secondary: {
      light: theme.color.secondaryLight,
      main: theme.color.secondary,
      dark: theme.color.secondaryDark,
      contrastText: theme.color.secondaryText,
    },
  },
});

export { theme, muiTheme };
