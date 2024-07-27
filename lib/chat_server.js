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