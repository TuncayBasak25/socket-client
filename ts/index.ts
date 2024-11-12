interface Socket {
    methods: { [key: string]: (socket: Socket) => void};
    do(method: string): void;
    set(key: number | string, value: any): void;
    get<T = any>(key: number | string): T;
}

namespace Socket {
    export function create(url: string) {
        const webSocket = new WebSocket(url);
        const data = new Map<number | string, any>();
    
        const socket = {
            methods: {},
            do: (method: string) => webSocket.send(JSON.stringify({ method })),
            set: (key: number | string, value: any) => {
                data.set(key, value);
                webSocket.send(JSON.stringify({ set: {key, value} }));
            },
            get: <T = any>(key: number | string) => data.get(key) as T
        };

        webSocket.onmessage = (event) => handleMessage(socket, data, event.data);

        return socket;
    }

    function handleMessage(socket: Socket, data: Map<number | string, any>, message: string) {
        const { method, set } = JSON.parse(message);

        set && data.set(set.key, set.value);       
        method && socket.methods[method](socket);
    }
}
