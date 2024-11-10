function parseJson(data: string) {
    try {
        return JSON.parse(data);
    }
    catch (error) {
        return null;
    }
}

type Method = "action" | "get" | "set";

class Socket {
    private readonly webSocket: WebSocket;

    readonly actions: {[key: string]: (socket: Socket, body: any) => void} = {};
    readonly data: Map<number | string, any> = new Map();

    constructor(url: string) {
        this.webSocket = new WebSocket(url);

        this.webSocket.onmessage = eventMessage => this.handleMessage(eventMessage.data);
    }

    private handleMessage(message: string) {
        const data = parseJson(message);

        if (!data) {
            return console.log("Unvalid JSON from server");
        }
        const { action, get, set, error } = data;

        if (error) {
            console.log(error);
            alert("Server error!");
        }
        if (action && typeof action.action == "string" && this.actions[action.action]) {
            this.actions[action.action](this, action.body);
        }
        if (typeof get == "string" || typeof get == "number") {
            const value = this.data.get(get);
            if (value != undefined) {
                this.sendSet(get, value);
            }
        }
        if (set && typeof (set.key == "string" || typeof set.key == "number")) {
            this.data.set(set.key, set.value);
        }
    }

    private send(method: Method, body: any) {
        const data: any = {};
        data[method] = body;
        this.webSocket.send(JSON.stringify(data));
    }

    sendAction(action: string, body: any = {}) {
        this.send("action", { action, body })
    }

    sendSet(key: number | string, value: any) {
        const set: any = {};
        set[key] = value;
        this.send("set", set);
    }

    sendGet(key: number | string) {
        this.send("get", key);
    }

}