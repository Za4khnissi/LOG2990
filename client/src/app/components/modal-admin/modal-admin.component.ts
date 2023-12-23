import { Component, EventEmitter, NgZone, Output } from '@angular/core';
import { Router } from '@angular/router';
import { PasswordService } from '@app/services/password.service';

@Component({
    selector: 'app-modal-admin',
    templateUrl: './modal-admin.component.html',
    styleUrls: ['./modal-admin.component.scss'],
})
export class ModalAdminComponent {
    @Output() loginEvent = new EventEmitter<string>();

    password: string;
    isPasswordWrong: boolean = false;
    showModal: boolean = false;

    constructor(
        private passwordService: PasswordService,
        private router: Router,
        private zone: NgZone,
    ) {}

    async onSubmit() {
        this.passwordService.validate(this.password).then((isValid) => {
            if (isValid) {
                this.isPasswordWrong = false;
                this.zone.run(() => {
                    this.router.navigate(['/admin']);
                });
            } else {
                this.isPasswordWrong = true;
            }
        });
    }
}
