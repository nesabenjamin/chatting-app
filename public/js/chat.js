const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('#message')
const $messageFormButton = document.querySelector('#submit')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $linkTemplate = document.querySelector('#link-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const $links = document.querySelector('#links')

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix:true})

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()

    //disable button
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) =>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }else{
            console.log('The message was delivered')
        }
    })
})


const autoscroll = ()=>{
    //New message element
    const $newMessage = $messages.lastElementChild
    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMesssageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMesssageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight
    console.log(visibleHeight)

    //Height of message container
    const containerHeight = $messages.scrollHeight
    console.log(containerHeight)

    //How far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    console.log($messages.scrollTop)

    if( containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('iomessage',(message)=>{
    const html = Mustache.render($messageTemplate, {
        username:message.username,
        message:message.text,
        createdAt: moment( message.createdAt ).format('hh:mm:ss a') 
    })
    
    $messages.insertAdjacentHTML('beforeEnd', html)
    autoscroll()
})




socket.on('locationMessage',(message)=>{

    const html = Mustache.render($linkTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment( message.createdAt ).format('hh:mm:ss a') 
    })
    
    $messages.insertAdjacentHTML('beforeEnd', html)

    autoscroll()
    //console.log(message)
})


$sendLocationButton.addEventListener( 'click', ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browse')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition( (position)=>{
        socket.emit('sendLocation', {
            "latitude":position.coords.latitude,
            "longitude":position.coords.longitude
        }, (error)=>{
            if(error){
                return console.log(error)
            }else{

                $sendLocationButton.removeAttribute('disabled')
                console.log('Location was shared')
            }
        })
    })
})

socket.emit('join', {username, room}, (error) =>{
    if( error ){
        alert(error)
        location.href = '/'
    }
})

socket.on('roomData', ({room, users})=>{
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    })
   
    document.querySelector('#sidebar').innerHTML = html
})