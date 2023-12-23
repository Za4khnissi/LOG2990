import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game, MatchConcluded, MatchInfo } from '@common/definitions';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})

// communication server client
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    getGames(): Observable<Game[]> {
        return this.http.get<Game[]>(`${this.baseUrl}/games`).pipe(catchError(this.handleError<Game[]>('getGames')));
    }

    getGameById(id: string): Observable<Game> {
        return this.http.get<Game>(`${this.baseUrl}/games/${id}`).pipe(catchError(this.handleError<Game>(`getGameById id=${id}`)));
    }

    addGame(message: Game): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/games/send`, message, { observe: 'response', responseType: 'text' });
    }

    editGame(message: Game): Observable<HttpResponse<string>> {
        return this.http.put(`${this.baseUrl}/games/${message.id}`, message, { observe: 'response', responseType: 'text' });
    }

    deleteGame(id: string): Observable<Game> {
        return this.http.delete<Game>(`${this.baseUrl}/games/${id}`).pipe(catchError(this.handleError<Game>('deleteGame')));
    }

    createMatch(gameId: string): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/match/create`, { gameId }, { observe: 'response', responseType: 'text' });
    }
    checkCode(code: string): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/match/check/code`, { code }, { observe: 'response', responseType: 'text' });
    }

    checkUsername(code: string, username: string): Observable<HttpResponse<MatchInfo>> {
        return this.http.post<MatchInfo>(`${this.baseUrl}/match/check/username`, { code, username }, { observe: 'response' });
    }

    getHistory(): Observable<MatchConcluded[]> {
        return this.http.get<MatchConcluded[]>(`${this.baseUrl}/match/history`).pipe(catchError(this.handleError<MatchConcluded[]>('getHistory')));
    }

    resetHistory(): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/match/history`, { observe: 'response', responseType: 'text' });
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
