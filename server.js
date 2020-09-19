const express = require("express")
const app = express()

const http = require("http")
const server = http.Server(app)

const socket = require("socket.io")
const io = module.exports.io = socket(server)

const PORT = process.env.PORT || 8000

const users = {}

io.on('connection', socket => {

    if (!users[socket.id]) {
        console.log('connection', socket.id)
        users[socket.id] = socket.id
    }
    
    io.sockets.emit("allUsers", users)

    io.sockets.emit("allRooms", io.sockets.adapter.rooms)

    socket.on('disconnect', () => {
        console.log(`${ socket.id } has disconnected and left rooms ${ socket.rooms }`)
        delete users[socket.id]
    })

    socket.on('joinRoom', (room) => {
        const numClientsPerRoom = Object.keys(io.in(room).clients().sockets).length
        console.log('prejoin', numClientsPerRoom)

        if(numClientsPerRoom < 3) {
            socket.join(room)
            console.log(`# of clients in room ${ room } is ${numClientsPerRoom}`)
        }

        if(numClientsPerRoom == 2) {
            socket.to(room).emit('gameStart')
        }
    })

    socket.on('sendMessage', (room, message) => {
        socket.to(room).emit('getMessage', message)
    })

    socket.on('sendState', (room, state) => {
        console.log('state', state)
        socket.to(room).emit('getState', state)
    })
})

server.listen(PORT, () => console.log('server is running on port ' + PORT))