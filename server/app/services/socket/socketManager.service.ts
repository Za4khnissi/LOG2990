import * as http from 'http';
import * as io from 'socket.io';


export class SocketManager {

    private sio: io.Server;
    public room: string = "server"
    listname:string[]=["YO"];

  
    id=0;
    constructor(server: http.Server) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ["GET", "POST"] } });
    }

    public handleSockets(): void {
        this.sio.on('connection', (socket) => {

            console.log(`Connexion par l'utilisateur avec id : ${socket.id}`)
            // message initial
            socket.emit("hello", "Hello World!");

            socket.on('validate', (word: string) => {


                const isValid = this.listname.includes(word) && word.length>0;
                socket.emit('wordValidated', isValid);
            });
          

          

            socket.on('joinRoom', (room: string) => {
                this.room=room;
                socket.join(room);
               
            });

            socket.on('roomMessage', (message: any) => {
                // Seulement un membre de la salle peut envoyer un message aux autres
            if (socket.rooms.has(this.room)) {
                this.listname=message.players;
                this.sio.to(this.room).emit("roomMessage", this.listname);
            }
                
            });


            socket.on("disconnect", (reason) => {
                console.log(`Deconnexion par l'utilisateur avec id : ${socket.id}`);
                console.log(`Raison de deconnexion : ${reason}`)
            });


        });

        setInterval(() => {
            this.emitTime();
        }, 1000);
    }

    private emitTime() {
        this.sio.sockets.emit('clock', new Date().toLocaleTimeString());
    }
}