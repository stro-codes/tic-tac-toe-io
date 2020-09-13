const express = require("express")
const app = express()

const http = require("http")
const server = http.Server(app)

const socket = require("socket.io")
const io = module.exports.io = socket(server)

//const wrtc = require("wrtc")
//const Peer = require("simple-peer")

const PORT = process.env.PORT || 8000

const users = {}

io.on('connection', socket => {

    if (!users[socket.id]) {
        console.log('connection', socket.id)
        users[socket.id] = socket.id
    }
    
    io.sockets.emit("allUsers", users)

    socket.on('disconnect', () => {
        console.log(`${ socket.id } has disconnected`)
        delete users[socket.id]
    })

    socket.on('connectSuccess', (bool) => {
        // outline
        // console.log(`${ bool } socket connection with id ${ socket.id }`)
    })

})

server.listen(PORT, () => console.log('server is running on port ' + PORT))