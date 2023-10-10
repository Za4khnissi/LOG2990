import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/definitions';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})

// communication serveur client
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    getGames(): Observable<Game[]> {
        return this.http.get<Game[]>(`${this.baseUrl}/game/all`).pipe(catchError(this.handleError<Game[]>('getGames')));
    }

    getGameById(id: string): Observable<Game> {
        return this.http.get<Game>(`${this.baseUrl}/game/${id}`).pipe(catchError(this.handleError<Game>(`getGameById id=${id}`)));
    }

    addGame(message: Game): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/game/send`, message, { observe: 'response', responseType: 'text' });
    }

    editGame(message: Game): Observable<HttpResponse<string>> {
        return this.http.put(`${this.baseUrl}/game/${message.id}`, message, { observe: 'response', responseType: 'text' });
    }

    deleteGame(id: string): Observable<Game> {
        return this.http.delete<Game>(`${this.baseUrl}/game/${id}`).pipe(catchError(this.handleError<Game>('deleteGame')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
