import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { SocketClientService } from '@app/services/socket.client.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class MatchHandlerService {
    accessCode: string;
    username: string;

    constructor(
        private readonly socketService: SocketClientService,
        private readonly communicationService: CommunicationService,
    ) {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkCode(code: string): Observable<any> {
        return this.communicationService.checkCode(code).pipe(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            map((response: any) => {
                if (response.status === 200) {
                    this.accessCode = code;
                    return { text: response.body, status: true };
                } else {
                    return { text: response.body, status: false };
                }
            }),
            catchError((error) => {
                console.log(error);
                return of({ status: false, text: error.error });
            }),
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    joinMatch(username: string): Observable<any> {
        return this.communicationService.joinMatch(this.accessCode, username).pipe(
            map((response) => {
                if (response.status === 200) {
                    this.username = username;

                    this.socketService.connect();

                    this.socketService.on('connect', () => {
                        const accessCode = this.accessCode;

                        this.socketService.send('GameJoined', { accessCode, username });
                    });

                    return { body: response.body, status: true };
                } else {
                    return { body: response.body, status: false };
                }
            }),
            catchError((error) => {
                return of({ status: false, body: error.error });
            }),
        );
    }
}
