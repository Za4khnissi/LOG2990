import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { MatchHandlerService } from '@app/services/match-handler.service';
import { LIMIT_USERNAME_CHARACTERS } from '@common/constants';
import { MatchApiResponse } from '@common/definitions';

@Component({
    selector: 'app-modal-access',
    templateUrl: './modal-access.component.html',
    styleUrls: ['./modal-access.component.scss'],
})
export class ModalAccesComponent {
    accessCodeMessage: string = '';
    nameUser = '';
    usernameCheckMessage: string = '';
    isUserNameTooLong: boolean = false;
    accessCode: string = '';
    isAccessPassInvalid: boolean = true;
    limitUsernameCharacters = LIMIT_USERNAME_CHARACTERS;
    errorMessage: string = 'La limite de 30 caractères est atteinte';
    errorEmptyMessage = "Le nom d'utilisateur ne peut pas être vide";

    constructor(
        private matchHandler: MatchHandlerService,
        private router: Router,
        private zone: NgZone,
    ) {}

    onSubmitAccess() {
        this.matchHandler.checkCode(this.accessCode).subscribe((response: MatchApiResponse<string>) => {
            if (response.status) {
                this.isAccessPassInvalid = false;
            } else {
                this.accessCodeMessage = response.body ? response.body : 'Erreur de connexion';
            }
        });
    }

    onSubmitUser() {
        if (this.nameUser.trim() !== '') {
            this.matchHandler.checkUsername(this.nameUser).subscribe((response: MatchApiResponse<string>) => {
                if (response.status) {
                    this.zone.run(() => {
                        this.router.navigate(['/waiting-room']);
                    });
                } else {
                    this.usernameCheckMessage = response.body ? response.body : 'Erreur de connexion';
                }
            });
        } else this.usernameCheckMessage = this.errorEmptyMessage;
    }

    validateUsernameLength() {
        this.isUserNameTooLong = this.nameUser.length >= LIMIT_USERNAME_CHARACTERS;
        this.usernameCheckMessage = this.isUserNameTooLong ? this.errorMessage : '';
    }
}
