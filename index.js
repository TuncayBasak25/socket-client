"use strict";
var Socket;
(function (Socket) {
    function create(url) {
        const webSocket = new WebSocket(url);
        const data = new Map();
        const socket = {
            methods: {},
            do: (method) => webSocket.send(JSON.stringify({ method })),
            set: (key, value) => {
                data.set(key, value);
                webSocket.send(JSON.stringify({ set: { key, value } }));
            },
            get: (key) => data.get(key)
        };
        webSocket.onmessage = (event) => handleMessage(socket, data, event.data);
        return socket;
    }
    Socket.create = create;
    function handleMessage(socket, data, message) {
        const { method, set } = JSON.parse(message);
        set && data.set(set.key, set.value);
        method && socket.methods[method](socket);
    }
})(Socket || (Socket = {}));
