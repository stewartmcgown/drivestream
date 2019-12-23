import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const render = (Component: React.FC) => ReactDOM.render(
    (<BrowserRouter>
        <Component /></BrowserRouter>),
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

render(App);

if ((module as any).hot) {
    (module as any).hot.accept('./App', () => {
      const NextApp = require('./App').default;
      render(NextApp);
    });
  }