import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MatchHandlerService } from '@app/services/match-handler.service';
import { SocketClientService } from '@app/services/socket.client.service';

@Component({
    selector: 'app-modal-user',
    templateUrl: './modal-user.component.html',
    styleUrls: ['./modal-user.component.scss'],
})
export class ModalUserComponent {
    @Output() loginEvent = new EventEmitter<string>();
    @Output() closeModalRequest = new EventEmitter<void>();
    nameuser = '';
    mess: string = '';

    constructor(
        private matchHandler: MatchHandlerService,
        private router: Router,
        private socketService: SocketClientService,
    ) {}

    onSubmit() {
        this.matchHandler.joinMatch(this.nameuser).subscribe((response) => {
            if (response.status) {
                this.closeModalRequest.emit();
                this.socketService.joinWaitingRoom(this.matchHandler.accessCode, this.nameuser);
                this.router.navigate(['/waiting-room']);
            } else {
                this.mess = response.body ? response.body : 'Erreur de connexion';
            }
        });
    }
}
