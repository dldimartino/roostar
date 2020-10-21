import axios from 'axios'
import history from '../history'

/**
 * ACTION TYPES
 */
const GET_USER = 'GET_USER'
const REMOVE_USER = 'REMOVE_USER'

/**
 * INITIAL STATE
 */
const defaultUser = {}

/**
 * ACTION CREATORS
 */
const getUser = user => ({type: GET_USER, user})
const removeUser = () => ({type: REMOVE_USER})

/**
 * THUNK CREATORS
 * dispatch to redux but get intercepted by thunk middleware
 */

//thunk middleware passes in dispatch as a parameter, asynchronous call that gets user info
//then is dispatched to the store
export const me = () => async dispatch => {
  try {
    const res = await axios.get('/auth/me')
    dispatch(getUser(res.data || defaultUser))
  } catch (err) {
    console.error(err)
  }
}

export const auth = (email, password, method) => async dispatch => {
  let res
  //first trycatch is for authentication. if it fails, user state is an object
  //with an error property and next trycatch won't be attempted.
  try {
    res = await axios.post(`/auth/${method}`, {email, password})
  } catch (authError) {
    return dispatch(getUser({error: authError}))
  }
  //if first try succeeds, proceed to update redux.
  //since this is an async function you need to catch your error
  //or will receive ("unhandled promise rejection warning")
  try {
    dispatch(getUser(res.data))
    history.push('/home')
  } catch (dispatchOrHistoryErr) {
    console.error(dispatchOrHistoryErr)
  }
}

// logout thunk says please log me out, if successful calls removeuser
// function and wipes out in redux state
export const logout = () => async dispatch => {
  try {
    await axios.post('/auth/logout')
    dispatch(removeUser())
    //history.push navigates our react app to a different page.
    history.push('/login')
  } catch (err) {
    console.error(err)
  }
}

/**
 * REDUCER
 */
//reducer takes 2 things and fuses into 1
//redux-reducers take state and action and return a new state
//switch case based on the action type, return the state it should be.
//switch statement. more common in C++ and C
export default function(state = defaultUser, action) {
  switch (action.type) {
    case GET_USER:
      return action.user
    case REMOVE_USER:
      return defaultUser
    default:
      return state
  }
}
