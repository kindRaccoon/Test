import socketio from 'socket.io';
var io;
const guestNumber = {};
const nickNames = {};
const namesUsed = [];
const currentRoom = {};

export const listenServer = (server) => {
    io = socketio.listen(server);
    io.set('log level', 1);
    io.sockets.on('connection', (socket) => {
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
        joinRoom(socket, 'Lobby');
        handleMessageBroadcasting(socket, nickNames);
        handleNameChangeAttempts(socket, nickNames, namesUsed);
        handleRoomJoining(socket);
        socket.on('rooms', () => {
            socket.emit('rooms', io.sockets.manager.rooms)
        });
        handleClientDisconnection(socket, nickNames, namesUsed);
    });
}


const assignGuestName = (socket, guestNumber, nickNames, namesUsed) => {
    const name = 'Guest' + guestNumber;
    nickNames[socket.id] = name;
    socket.emit('nameResult', {
        success: true,
        name: name
    });
    namesUsed.push(name);
    return guestNumber + 1;
};


//join Room Funtion
const joinRoom = (socket, room) => {
    socket.join(room);
    currentRoom[socket.id] = room;
    socket.emit('joinResult', { room: room });
    socket.broadcast.to(room).emit('message', {
        text: nickNames[socket.id] + 'has joined' + room + '.'
    });

    const usersInRoom = io.sockets.clients(room);

    if (usersInRoom.length > 1) {
        const usersInRoomSummary = 'Users currently in' + room + ':';
        for (var index in usersInRoom) {
            var userSockedId = usersInRoom[index].id;
            if (userSockedId !== socket.id) {
                if (index > 0) {
                    usersInRoomSummary += ',';
                }
                usersInRoomSummary += nickNames[userSockedId]
            }
        }
        usersInRoomSummary += '.';
        socket.emit('message', { text: usersInRoomSummary });
    }

}

