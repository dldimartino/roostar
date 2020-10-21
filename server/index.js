//in this index.js, this is our application

const path = require('path')
const express = require('express')

//morgan middleware is for logging
const morgan = require('morgan')

//compression makes whatever sent back in the body to be g-zipped (smaller&faster)
const compression = require('compression')

//store information about whoever is currently using the express app
//each client will have a separate session
const session = require('express-session')

const passport = require('passport')

//clients sessions (above) will be linked using connect-session-sequelize
//and store our sessions in the database
const SequelizeStore = require('connect-session-sequelize')(session.Store)
const db = require('./db')

//creating a new session store that knows about our sequelize database and is
//connected to express session and tied together by library code
const sessionStore = new SequelizeStore({db})

//if there is an environment port (heroku/dynos) we use that otherwise default locally to 1080
const PORT = process.env.PORT || 1080

//create express app (will be configured with .get .use etc)
const app = express()

const socketio = require('socket.io')

//exporting express app (for testing)
module.exports = app

// This is a global Mocha hook, used for resource cleanup.
// Otherwise, Mocha v4+ never quits after tests.
if (process.env.NODE_ENV === 'test') {
  after('close the session store', () => sessionStore.stopExpiringSessions())
}

/**
 * In your development environment, you can keep all of your
 * app's secret API keys in a file called `secrets.js`, in your project
 * root. This file is included in the .gitignore - it will NOT be tracked
 * or show up on Github. On your production server, you can add these
 * keys as environment variables, so that they can still be read by the
 * Node process on process.env
 */
if (process.env.NODE_ENV !== 'production') require('../secrets')

// passport registration. We could store sessions in cookies, but we don't want to because it
// can make the cookie too large or can leak information storing too much information if hacked. To limit
// the amount of personal identification information, we create a unique user identifier for their
// session (using their user.id). Passport is an Oauth library that asks us a bunch of questions.
// How do you want to identify the users and what info do you want to restore each time.
// Serialize means to take memory structure and store as a string, deserialize reverts it back to
// an object. Almost like encryption. If someone is logged in, passport takes their info and puts it
// on req.user
passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.models.user.findByPk(id)
    done(null, user)
  } catch (err) {
    done(err)
  }
})

const createApp = () => {
  // logging middleware shows what types of requests (get, put, etc.) and what they are making
  app.use(morgan('dev'))

  // body parsing middleware to parse the body of http requests
  app.use(express.json())
  app.use(express.urlencoded({extended: true}))

  // compression middleware gzips/compresses http body data to make it smaller and faster
  app.use(compression())

  // session middleware with passport keeps track of each individual client
  // each client we can keep track of requests they made and who they are etc.
  // on our req objects for http calls there will be a new object called req.session
  // unique for each user and we can treat them as individuals
  app.use(
    session({
      // should change the default secret and put it in secrets.js file
      secret: process.env.SESSION_SECRET || 'my best friend is Cody',
      store: sessionStore,
      resave: false,
      saveUninitialized: false
    })
  )
  app.use(passport.initialize())
  app.use(passport.session())

  // auth and api routes. anything that starts with one of these, bump them into our router that
  // we define in the /auth or /api folder
  app.use('/auth', require('./auth'))
  app.use('/api', require('./api'))

  // static file-serving middleware
  // all the files in this folder ('public') are static, which allows node to do less processing
  // (identifies static content), anything thats in public, automatically has a route to it
  // thats why favicon doesn't need a route when grabbed.
  app.use(express.static(path.join(__dirname, '..', 'public')))

  // any remaining requests with an extension (.js, .css, etc.) send 404
  app.use((req, res, next) => {
    if (path.extname(req.path).length) {
      const err = new Error('Not found')
      err.status = 404
      next(err)
    } else {
      next()
    }
  })

  // sends index.html
  // send client to the homepage if they try to go to a frontend route that the backend doesn't recognize
  app.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public/index.html'))
  })

  // error handling endware
  app.use((err, req, res, next) => {
    console.error(err)
    console.error(err.stack)
    res.status(err.status || 500).send(err.message || 'Internal server error.')
  })
}

const startListening = () => {
  // start listening (and create a 'server' object representing our server)
  // takes our app and assignes it to a port
  const server = app.listen(PORT, () =>
    console.log(`----------->>>>>> Mixing it up on port ${PORT}`)
  )

  // set up our socket control center
  // pulling in the socket.io library. see socket folder index.js for details
  const io = socketio(server)
  require('./socket')(io)
}

// takes database connection and runs sync on it.
// Need to sync database and associations so queries can be made.
const syncDb = () => db.sync()

async function bootApp() {
  await sessionStore.sync()
  await syncDb()
  await createApp()
  await startListening()
}
// This evaluates as true when this file is run directly from the command line,
// i.e. when we say 'node server/index.js' (or 'nodemon server/index.js', or 'nodemon server', etc)
// It will evaluate false when this module is required by another module - for example,
// if we wanted to require our app in a test spec
if (require.main === module) {
  bootApp()
} else {
  // still calls createApp just not listening with syncdb or session store but has object
  // (for testing purposes)
  createApp()
}
