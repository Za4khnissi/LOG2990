import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class PasswordService {
    // to not go the main page when reloading the admin page
    isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    private readonly authEndpoint = `${environment.serverUrl}/password/validate`;

    constructor(private http: HttpClient) {}

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
