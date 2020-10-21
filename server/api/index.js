const router = require('express').Router()
module.exports = router

//anything that tries /api/users do below from the users folder
router.use('/users', require('./users'))

//otherwise send a 404
router.use((req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})
