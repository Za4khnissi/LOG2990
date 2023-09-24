import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PasswordService {
    private readonly authEndpoint = 'http://localhost:4200/api/password/validate';
    private isLoggedIn = false;

    constructor(private http: HttpClient) {
        // to not go the go the main page when reloading the admin page
        this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    }

    async validate(password: string): Promise<boolean> {
        try {
            const response = await lastValueFrom(this.http.post<{ success: boolean }>(this.authEndpoint, { password }));
            if (response?.success) {
                this.setLoginState(true);
            }
            return response?.success ?? false;
        } catch (error) {
            return false;
        }
    }

    setLoginState(state: boolean): void {
        localStorage.setItem('isLoggedIn', String(state));
        this.isLoggedIn = state;
    }

    getLoginState(): boolean {
        return this.isLoggedIn;
    }
}
