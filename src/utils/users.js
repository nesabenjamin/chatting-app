const users = []

// addUser remove user getuser getUsesInRoom

const addUser = ({id, username, room}) =>{
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if( !username || !room ){
        return {
            error: 'username and room are required!'
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username
    if(existingUser){
        return {
            error:'Username taken'
        }
    }

    //Store user
    const user = {
        id,username, room
    }
    users.push(user)
    return {user}
}

const removeUser = (id) =>{
    const index = users.findIndex((user)=>{
        return user.id === id
    })
    console.log(index)
    if(index !== -1){
        let removedUsers =  users.splice(index, 1)[0]
        return removedUsers
    }
}




const getUser = (id) =>{
    return users.find( (user)=> user.id === id )
}

const getUsersInRoom = (room) =>{
    room.trim().toLowerCase()
    return users.filter( (user)=> user.room === room )
    
}



module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}