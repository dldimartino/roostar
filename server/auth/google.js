const passport = require('passport')
const router = require('express').Router()

//to create google strategy, constructor comes from librar. Non google oauth need theirs pulled in
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const {User} = require('../db/models')
module.exports = router

// pt4
// if someone wants to login using google.
// set up a strategy, tell passport our secret password to speak with google and swap info
// user has proven to google who they are, google bounces the user to us and tells our server
// that they're ok. We have to check using the token that google gives the client to prove it.
// passport on our server talks to google, gives google the token, google says yes I gave them that token
/**
 * For OAuth keys and other secrets, your Node process will search
 * process.env to find environment variables. On your production server,
 * you will be able to set these environment variables with the appropriate
 * values. In development, a good practice is to keep a separate file with
 * these secrets that you only share with your team - it should NOT be tracked
 * by git! In this case, you may use a file called `secrets.js`, which will
 * set these environment variables like so: or can be in the process.ENV environment
 *
 * can do pretty much the same process for github linkedin etc.
 * process.env.GOOGLE_CLIENT_ID = 'your google client id'
 * process.env.GOOGLE_CLIENT_SECRET = 'your google client secret'
 * process.env.GOOGLE_CALLBACK = '/your/google/callback'
 */

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.log('Google client ID / secret not found. Skipping Google OAuth.')
} else {
  const googleConfig = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK
  }

  const strategy = new GoogleStrategy(
    googleConfig,
    // this is what gets called if google confirms the client is a valid google user.
    // google gives us info in the profile parameter about the user.
    (token, refreshToken, profile, done) => {
      const googleId = profile.id
      const email = profile.emails[0].value
      const imgUrl = profile.photos[0].value
      const firstName = profile.name.givenName
      const lastName = profile.name.familyName
      const fullName = profile.displayName

      // use the profile info that comes back from google to find in our database.
      // if they exist in our database with userid that is the google userid, if they 
      // exist, we give it to passport (.then{user}done callback), passport creates req.user and
      // sets the session etc if we can't find one in our database thats matching, we create one in our database using
      // the name and email that came over from google.
      User.findOrCreate({
        where: {googleId},
        defaults: {email, imgUrl, firstName, lastName, fullName}
      })
        .then(([user]) => done(null, user))
        .catch(done)
    }
  )

  passport.use(strategy)

  router.get(
    '/',
    passport.authenticate('google', {scope: ['email', 'profile']})
  )

  //if google oauth succeeds or fails, passes it to passport redirect to the correct route/page.
  router.get(
    '/callback',
    passport.authenticate('google', {
      successRedirect: '/home',
      failureRedirect: '/login'
    })
  )
}
