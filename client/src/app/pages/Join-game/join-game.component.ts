import { Component } from '@angular/core';

@Component({
    selector: 'app-join-game',
    templateUrl: './join-game.component.html',
    styleUrls: ['./join-game.component.scss'],
})
export class joinGamecomponent /*implements OnDestroy, OnInit*/ {
    // roomMessages: string[] = [];
    // nameuser = '';
    // word = '';
    // id = '3';
    // message = '';
    // title: string;
    // valid: boolean;
    // showModal: boolean = true;
    // constructor(
    //     public gameLogicService: GameLogicService,
    //     public organiser: organizer,
    //     readonly communicationService: CommunicationService,
    //     public socketService: SocketClientService,
    // ) {}
    // get socketId() {
    //     return this.socketService.socket.id ? this.socketService.socket.id : '';
    // }
    // ngOnInit() {
    //     console.log('this.organiser.recuparateGame()');
    //     // this.title=this.organiser.recuparateGame();
    //     console.log('fseqzdZQVDSFSVDFQZDFVDS3' + this.roomMessages);
    //     this.connect();
    //     this.joinRoom();
    //     this.sendToRoom();
    // }
    // ngOnDestroy() {
    //     this.socketService.disconnect();
    // }
    // connect() {
    //     if (!this.socketService.isSocketAlive()) {
    //         console.log('ukugjy');
    //         this.socketService.connect();
    //         this.configureBaseSocketFeatures();
    //     }
    // }
    // joinRoom() {
    //     this.socketService.send('joinRoom', this.organiser.new.gameId);
    // }
    // sendToRoom() {
    //     this.socketService.send('roomMessage', this.organiser.new);
    // }
}
