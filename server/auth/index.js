const router = require('express').Router()
const User = require('../db/models/user')
module.exports = router


//local. we have a user and password in our database (not borrowing info from google login tokens)
//login attempt below. Don't give too much information ("that username exists but password was wrong")
router.post('/login', async (req, res, next) => {
  //make sure there is a try/catch on async/await. Since the session is saved in the database,
  //it is asynchronous
  try {
    const user = await User.findOne({where: {email: req.body.email}})
    if (!user) {
      console.log('No such user found:', req.body.email)
      res.status(401).send('Wrong username and/or password')
    } else if (!user.correctPassword(req.body.password)) {
      console.log('Incorrect password for user:', req.body.email)
      res.status(401).send('Wrong username and/or password')
    } else {
      //passport.initialize adds method to request object called .login this is a
      //way to manually set req.user in a way passport understands
      req.login(user, err => (err ? next(err) : res.json(user)))
    }
  } catch (err) {
    next(err)
  }
})

router.post('/signup', async (req, res, next) => {
  try {
    const user = await User.create(req.body)
    req.login(user, err => (err ? next(err) : res.json(user)))
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(401).send('User already exists')
    } else {
      next(err)
    }
  }
})

router.post('/logout', (req, res) => {
  //req.logout is passport method. Given to req by passport initialize.
  //Removes user from session and deletes req.user for us.
  req.logout()
  //req.session.destroy is an express session method (not passport) forget
  //that client is connected to us, if the client connects to us again, assume it is a new client.
  req.session.destroy()
  //go to homepage (since just logged out)
  res.redirect('/')
})

// who is currently logged in? Front end has amnesia. If you refresh in the browser, it forgets what was going on and
// starts from scratch. get/me asks server who is currently logged in. Can use to see if the user is logged in or not.
router.get('/me', (req, res) => {
  res.json(req.user)
})


router.use('/google', require('./google'))
