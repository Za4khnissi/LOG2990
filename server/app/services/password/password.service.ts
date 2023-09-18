import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordService {
    private readonly ADMIN_PASSWORD = "zakarya";

    validatePassword(password: string) : boolean {
        return password === this.ADMIN_PASSWORD;
    }
}
