import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordService {
    private readonly ADMIN_PASSWORD = '202';

    validatePassword(password: string) : boolean {
        return password === this.ADMIN_PASSWORD;
    }
}
