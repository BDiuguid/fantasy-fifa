import React, { Component, createContext } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const ToastContext = createContext('toast');

class ToastProvider extends Component {
  state = {
    open: false,
    text: '',
  };

  toast = text => {
    this.setState({ open: true, text });
  };

  // eslint-disable-next-line
  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({ open: false, text: '' });
  };

  render() {
    return (
      <ToastContext.Provider value={{ toast: this.toast }}>
        {this.props.children}
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={this.state.open}
          autoHideDuration={5000}
          onClose={this.handleClose}
          SnackbarContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{this.state.text}</span>}
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={this.handleClose}
            >
              <CloseIcon />
            </IconButton>,
          ]}
        />
      </ToastContext.Provider>
    );
  }
}
const ToastConsumer = ToastContext.Consumer;

export { ToastProvider, ToastConsumer };
