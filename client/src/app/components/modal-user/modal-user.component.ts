import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MatchHandlerService } from '@app/services/match-handler.service';

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
    ) {}

    onSubmit() {
        this.matchHandler.joinMatch(this.nameuser).subscribe((response) => {
            if (response.status) {
                //const match = JSON.parse(response.body);
                this.closeModalRequest.emit();
                this.router.navigate([`/game/3/play`]);
            } else {
                this.mess = response.body ? response.body : 'Erreur de connexion';
            }
        });
    }
}
