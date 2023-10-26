import { Logger } from '@nestjs/common/services/logger.service';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  

    public room: string = "server";
    id=0;
    @WebSocketServer() private server: Server;
    private logger: Logger = new Logger('ChatGateway');
    listname:string[]=["YO"];

  

  @WebSocketServer() wss: Server;


  afterInit(server: Server) {
    this.logger.log('Initialized');
  }

  handleDisconnect(client: Socket) {
    console.log(this.listname)
    console.log(this.room)
    this.logger.log(`Client Disconnected: ${client.id}`);


  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client Connected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: string): Promise<void> {
    // const newMessage = await this.messagesService.createMessage(payload);
    // this.wss.emit('receiveMessage', newMessage);
  }

  @SubscribeMessage('joinRoom')
  joinRoom(socket: Socket, room: string) {
    this.room=room;
    socket.join(room);
}

@SubscribeMessage('roomMessage')
 RoomMessage(socket: Socket, message: any) {
    if (socket.rooms.has(this.room)) {
      this.listname=message.players;
      console.log(message.players)
        this.server.to(this.room).emit("roomMessage", this.listname);
    }
   
}

@SubscribeMessage('validate')
validate(socket: Socket,word: string) {
  const isValid = this.listname.includes(word)  && word.length>0;
  socket.emit('wordValidated', isValid);
}
  
}
