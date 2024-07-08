import io from 'socket.io-client';

const prod = true;

let socket;
if (!socket) {
  prod ?
    socket = io('https://vvt-api.currlybraces.com') :
    socket = io('http://localhost:5001');
}

export default socket;