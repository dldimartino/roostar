const Sequelize = require('sequelize')
const pkg = require('../../package.json')

const databaseName = pkg.name + (process.env.NODE_ENV === 'test' ? '-test' : '')
//is something testing? if so, use the testing database.

const db = new Sequelize(
  process.env.DATABASE_URL || `postgres://localhost:5432/${databaseName}`,
    //if there is a database in the current environment place please use that
  //otherwise assume the database is on our local machine and use localhost
  {
    logging: false
  }
)
module.exports = db

// This is a global Mocha hook used for resource cleanup.
// Otherwise, Mocha v4+ does not exit after tests.
if (process.env.NODE_ENV === 'test') {
  after('close database connection', () => db.close())
    //if were in testing mode after tests are run, close the connection
  // after is a global mocha hook after no async running then close.
}
