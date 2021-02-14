import io from 'socket.io-client';

export default class WebSocketClient {
    constructor(url, receiveDataCallback = () => {}) {
        this.socket = io(url, {
            transports: ['websocket']
        });
        this.socket.on('client', data => {
            this.receiveData(data)
        });
        this.socket.on('connect_error', (error) => {
            console.log(error)
        });
        this.receiveDataCallback = receiveDataCallback;
    }

    sendData(data) {
        this.socket.emit('server', JSON.stringify(data));
    }

    receiveData(data) {
        try{
            const parse_data = JSON.parse(data);
            this.receiveDataCallback && typeof this.receiveDataCallback === 'function' && this.receiveDataCallback(parse_data);
        }catch(e){
            if(e.message === 'Unexpected token d in JSON at position 0') {
                throw new Error('cannot covert string to object');
            }
            console.error(e);
        }
    }

    connect() {
        this.socket.open();
    }

    disconnect() {
        this.socket.close();
    }

}