import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

//pull in link component (looks like anchor tags) when clicked on, javascript sends to component
import {Link} from 'react-router-dom'

//logout function creator
import {logout} from '../store'

//handleClick and isLoggedIn comes from Connect and mapStateToProps and mapDispatchToProps
//destructuring props here. (Functional component "give me a handleClick and isLogged in and
//I'll spit out some DOM")
//What is Connect? mapStateToProps = get data from Redux. define what things are being pulled from Redux and put into props, mapDispatchToProps = put data in Redux
//dispatch is a function that sends things to Redux. Define some functions that can dispatch to the store.
//connect function wraps mapDispatch and mapState around the react component. Export default connected version.
// /home is not an express route, it is a react router route. (Which react component to show for a given path)
const Navbar = ({handleClick, isLoggedIn}) => (
  <div>
    <h1>BOILERMAKER</h1>
    <nav>
      {isLoggedIn ? (
        <div>
          {/* The navbar will show these links after you log in */}
          <Link to="/home">Home</Link>
          <a href="#" onClick={handleClick}>
            Logout
          </a>
        </div>
      ) : (
        <div>
          {/* The navbar will show these links before you log in */}
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </div>
      )}
    </nav>
    <hr />
  </div>
)

/**
 * CONTAINER
 */

 //checking Redux store to see if it has a state.user.id propert (hack to see if there is a user or not)
 //creating a property called isLoggedIn based on Redux state to be used in the React component. 
const mapState = state => {
  return {
    //doublebang converts truthy/falsy to boolean true or false.
    isLoggedIn: !!state.user.id
  }
}

const mapDispatch = dispatch => {
  return {
    handleClick() {
      dispatch(logout())
    }
  }
}

export default connect(mapState, mapDispatch)(Navbar)

/**
 * PROP TYPES
 */
Navbar.propTypes = {
  handleClick: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired
}
