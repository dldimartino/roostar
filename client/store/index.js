//every redux app has to use createStore at some point
//combineReducers is a way to split up the logic of state updates into individual reducer
//functions and fuse them together with combineReducers.
//applyMiddleware every time an action is dispatched, take the action and do a side effect before passing on
import {createStore, combineReducers, applyMiddleware} from 'redux'
import {createLogger} from 'redux-logger'

// thunkMiddleware allows us to do side effects like network/database calls etc.
import thunkMiddleware from 'redux-thunk'
import {composeWithDevTools} from 'redux-devtools-extension'
import user from './user'

//reducer === starting point, we will add other reducers here as we build them
const reducer = combineReducers({user})
const middleware = composeWithDevTools(
  applyMiddleware(thunkMiddleware, createLogger({collapsed: true}))
)

//takes primary reducer but can also receive middleware, to start we are adding thunks and logger
const store = createStore(reducer, middleware)

export default store
export * from './user'
