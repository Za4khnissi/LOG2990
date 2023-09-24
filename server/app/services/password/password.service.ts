import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordService {
    private readonly adminPassword = 'zakarya';

    validatePassword(password: string): boolean {
        return password === this.adminPassword;
    }
}
