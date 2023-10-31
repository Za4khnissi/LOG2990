import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

// import { PasswordService } from '@app/services/password.service';

import { MatchHandlerService } from '@app/services/match-handler.service';

@Component({
    selector: 'app-modal-access',
    templateUrl: './modal-access.component.html',
    styleUrls: ['./modal-access.component.scss'],
})
export class modalAccesComponent {
    //@Output() loginEvent = new EventEmitter<string>();
    @Output() closeModalRequest = new EventEmitter<void>();
    message: string = '';
    nameuser = '';
    mess: string = '';
    password: string = '';
    accesPass: boolean=true;

    constructor(private matchHandler: MatchHandlerService,
        private router: Router) {}

    onSubmitAcces() {
        this.matchHandler.checkCode(this.password).subscribe((response) => {
            if (response.status) {
                this.accesPass=false;
                // this.closeModalRequest.emit();
                //this.loginEvent.emit(this.password);
            } else {
                this.message = response.text ? response.text : 'Erreur de connexion';
            }
        });
    }

    onSubmitUser() {
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
