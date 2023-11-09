const io=require("socket.io")(8000,{
    cors:"*"
})

var users={}
io.on("connection",socket=>{
    socket.on("user-joined",name=>{
        users[socket.id]=name
        console.log(users)
        socket.broadcast.emit("new-user-joined",name)
    })
    socket.on("send",message=>{
        socket.broadcast.emit("receive",{name:users[socket.id],message:message})
    })
    socket.on("disconnect",()=>{
        socket.broadcast.emit("user-left",users[socket.id])
        delete users[socket.id]
    })
})