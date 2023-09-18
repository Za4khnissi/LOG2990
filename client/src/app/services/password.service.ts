import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class PasswordService {
    private readonly AUTH_ENDPOINT = '/api/passwordController/validate';

    constructor(private router: Router, private http: HttpClient) {}

    async validate(password: string): Promise<boolean> {
        try {
            const response = await this.http.post<{ success: boolean }>(this.AUTH_ENDPOINT, { password }).toPromise();
            if (response && response.success) {
                this.router.navigate(['/admin-page']);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error during authentication:', error);
            return false;
        }
    }
}