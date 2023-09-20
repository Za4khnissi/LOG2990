import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PasswordService {
    private readonly authEndpoint = 'http://localhost:4200/api/password/validate';

    constructor(private http: HttpClient) {}

    async validate(password: string): Promise<boolean> {
        try {
            const response = lastValueFrom(this.http.post<{ success: boolean }>(this.authEndpoint, { password }));
            return (await response)?.success ?? false;
        } catch (error) {
            return false;
        }
    }
}
