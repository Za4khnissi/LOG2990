import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';


@Injectable({
    providedIn: 'root',
})
export class PasswordService {
    private readonly AUTH_ENDPOINT = '/api/password/validate';

    constructor(private http: HttpClient) {}

    async validate(password: string): Promise<boolean> {
        try {
            const response = await lastValueFrom(this.http.post<{ success: boolean }>(this.AUTH_ENDPOINT, { password }));
            return response?.success ?? false;
        } catch (error) {
            console.error('Error during authentication:', error);
            return false;
        }
    }
}