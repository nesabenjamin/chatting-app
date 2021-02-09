const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {  addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)


const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, "../public")

app.use( express.static(publicDirectoryPath) )

io.on('connection', (socket)=>{

   
    socket.on('join', ( obj, callback ) =>{
        const  {error, user} = addUser( { id: socket.id, ...obj})
        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('iomessage',generateMessage('Admin', 'Welcome'))
        socket.broadcast.to(user.room).emit('iomessage', generateMessage( 'Admin', `${user.username} has joined`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users:getUsersInRoom(user.room)
        })

        callback()
    
       
    })

    socket.on('sendMessage', (msg, callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()
        if( filter.isProfane(msg) ){
            return callback('Profanity is not allowed!')
        }

        
        io.to(user.room).emit('iomessage',  generateMessage(user.username, msg) )
        
       
        callback('Delivered')
    })

    socket.on('sendLocation', (geolocation, callback)=>{
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, geolocation.latitude, geolocation.longitude) )
        
        
        callback()
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('iomessage',generateMessage('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })
})

server.listen( port,()=> {
    console.log('Server listens at Port ' + port)
})