//entry point for everything to be compiled in webpack

import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import {Router} from 'react-router-dom'
import history from './history'
import store from './store'
import App from './app'

// establishes socket connection
import './socket'

//provider provides a store like a global variable. ReactRedux.Connect MapStatetoProps and MapDispatchToProps allows
//us to grab and change only what we need.
//This is our app entry point into the webpack bundle.
//Take app and stick it into the Dom where id# 'app' is (index.html)
//router is from react-router-dom. needs a history. history in browser. requiring history module history.js
//can create a browser history or a memory history. While testing we run all test code in Node so creates a "memory history"
//instead of a browser history so it can run in node.
//Redux global context in Provider, React Router that interacts with history, App which is vanilla react
ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <App />
    </Router>
  </Provider>,
  document.getElementById('app')
)
