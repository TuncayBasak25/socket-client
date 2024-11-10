"use strict";
function parseJson(data) {
    try {
        return JSON.parse(data);
    }
    catch (error) {
        return null;
    }
}
class Socket {
    constructor(url) {
        this.actions = {};
        this.data = new Map();
        this.webSocket = new WebSocket(url);
        this.webSocket.onmessage = eventMessage => this.handleMessage(eventMessage.data);
    }
    handleMessage(message) {
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
    send(method, body) {
        const data = {};
        data[method] = body;
        this.webSocket.send(JSON.stringify(data));
    }
    sendAction(action, body = {}) {
        this.send("action", { action, body });
    }
    sendSet(key, value) {
        const set = {};
        set[key] = value;
        this.send("set", set);
    }
    sendGet(key) {
        this.send("get", key);
    }
}
