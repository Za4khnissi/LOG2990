import { Component, EventEmitter, Output } from '@angular/core';

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

    password: string = '';

    constructor(private matchHandler: MatchHandlerService) {}

    onSubmit() {
        this.matchHandler.checkCode(this.password).subscribe((response) => {
            if (response.status) {
                this.closeModalRequest.emit();
                //this.loginEvent.emit(this.password);
            } else {
                this.message = response.text ? response.text : 'Erreur de connexion';
            }
        });
    }
}
