const crypto = require('crypto')
const Sequelize = require('sequelize')
const db = require('../db')

//sequelize define method takes 3 parameters. name (pluralized), object of
//database fields/columns, optional options to customize behaviors of table like hooks or getters.
const User = db.define('user', {
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    // Making `.password` act like a func hides it when serializing to JSON.
    // This is a hack to get around Sequelize's lack of a "private" option.
    // When json stringifying, it skips functions. By making password a function
    // that returns a string, it is not included in the JSON, but can always be found
    // by calling the .password function.
    get() {
      return () => this.getDataValue('password')
    }
  },
  salt: {
    type: Sequelize.STRING,
    // Making `.salt` act like a function hides it when serializing to JSON.
    // This is a hack to get around Sequelize's lack of a "private" option.
    // get methods here are a 'hack', not great
    get() {
      return () => this.getDataValue('salt')
    }
  },
  googleId: {
    type: Sequelize.STRING
  }
})

module.exports = User

/**
 * instanceMethods can be added to the prototype
 */
User.prototype.correctPassword = function(candidatePwd) {
  return User.encryptPassword(candidatePwd, this.salt()) === this.password()
}

/**
 * classMethods can be added
 */
User.generateSalt = function() {
  return crypto.randomBytes(16).toString('base64')
}

//10:32 pt4
User.encryptPassword = function(plainText, salt) {
  return crypto
    .createHash('RSA-SHA256')
    .update(plainText)
    .update(salt)
    .digest('hex')
}

/**
 * hooks (sequelize specific)
 */
const setSaltAndPassword = user => {
  //user.changed is a sequelize method. If the field we passed in is different than previous model's info
  //then run this function. (changes/updates user password)
  if (user.changed('password')) {
    user.salt = User.generateSalt()
    user.password = User.encryptPassword(user.password(), user.salt())
  }
}
//before any rows are created, run this function
//salt/salting makes a password into jibberish for security and also
//allows two users to have the same password but not log into eachother's accounts
User.beforeCreate(setSaltAndPassword)
User.beforeUpdate(setSaltAndPassword)
User.beforeBulkCreate(users => {
  users.forEach(setSaltAndPassword)
})
