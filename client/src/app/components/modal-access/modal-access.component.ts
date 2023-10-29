import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MatchHandlerService } from '@app/services/match-handler.service';
import { SocketClientService } from '@app/services/socket.client.service';

@Component({
    selector: 'app-modal-access',
    templateUrl: './modal-access.component.html',
    styleUrls: ['./modal-access.component.scss'],
})
export class ModalAccesComponent {
    // @Output() loginEvent = new EventEmitter<string>();
    @Output() closeModalRequest = new EventEmitter<void>();
    message: string = '';

    password: string = '';
    accesPass: boolean = true;
    nameuser: string = '';

    constructor(
        private matchHandler: MatchHandlerService,
        private router: Router,
        private socketService: SocketClientService,
    ) {}

    onSubmitAcces() {
        this.matchHandler.checkCode(this.password).subscribe((response) => {
            if (response.status) {
                this.accesPass = false;
            } else {
                this.message = response.text ? response.text : 'Erreur de connexion';
            }
        });
    }

    onSubmitUser() {
        this.matchHandler.joinMatch(this.nameuser).subscribe((response) => {
            if (response.status) {
                this.closeModalRequest.emit();
                this.socketService.joinWaitingRoom(this.password, this.nameuser);
                this.router.navigate(['/waiting-room']);
            } else {
                this.message = response.body ? response.body : 'Erreur de connexion';
            }
        });
    }
}
