import { PasswordService } from '@app/services/password/password.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('passwordController')
export class PasswordController {
    constructor(private passwordService : PasswordService) {};

    @Post('validate')
    validate(@Body('password') password : string): {success: boolean} {
        const isValid = this.passwordService.validatePassword(password);
        return {success: isValid};
    }
}
