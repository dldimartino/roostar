import React from 'react'

import {Navbar} from './components'

//Front end routes that we can navigate to
//changes url but is react, not going to a new "page" since this is a SPA
//made to look identical though
import Routes from './routes'

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes />
    </div>
  )
}

export default App
