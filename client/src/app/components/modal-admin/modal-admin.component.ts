import { Component, EventEmitter, Output } from '@angular/core';
import { PasswordService } from '@app/services/password.service';

@Component({
    selector: 'app-modal-admin',
    templateUrl: './modal-admin.component.html',
    styleUrls: ['./modal-admin.component.scss'],
})
export class ModalAdminComponent {

    constructor(private passwordService: PasswordService) {};

    @Output() loginEvent = new EventEmitter<string>();
    @Output() closeModalRequest = new EventEmitter<void>();

    password: string;
    isPasswordWrong: boolean = false;
    showModal: boolean = false;

    async onSubmit() {
        this.passwordService.validate(this.password).then(isValid => {
        if (!isValid) {
            this.isPasswordWrong = true;
        } else {
            this.isPasswordWrong = false;
            this.closeModalRequest.emit();
        }
        });
    }   

}