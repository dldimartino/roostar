//exporting a function that is given an io instance, a version of socket thats married to a server
// whenever its given a new connection run another function that represents the new socket connection
// or client.
// Socket.io has a front end and a back end part
// can also use Firebase or Firestore for real time socket apps. Firebase uses sockets.
module.exports = io => {
  io.on('connection', socket => {
    console.log(`A socket connection to the server has been made: ${socket.id}`)

    socket.on('disconnect', () => {
      console.log(`Connection ${socket.id} has left the building`)
    })
  })
}
