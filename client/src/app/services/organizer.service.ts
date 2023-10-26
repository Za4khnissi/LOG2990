// import { Injectable } from '@angular/core';
// import { Game, Join } from '@app/interfaces/definitions';
// import { CommunicationService } from '@app/services/communication.service';

// @Injectable({
//     providedIn: 'root',
// })
// export class organizer {
//     join: Join[] =[{id: "3", passwordOrganisator: "game"},{id: "731", passwordOrganisator: "gameS"} ];
//     message:string="";
//     id: string| undefined;
//     game: Game;

//     constructor(private readonly communicationService: CommunicationService) {

//     }

//     isPasswordValid(password: string): [string, boolean ] {
//         let pass=this.join.find(({ passwordOrganisator }) => passwordOrganisator === password)?.passwordOrganisator;
//         this.id=  this.join.find(({ passwordOrganisator }) => passwordOrganisator === password)?.id;
//         // if(this.id)
//         // this.communicationService.getGameById(this.id).subscribe((e) => {
//         //     this.game = e;
//         // });

//             if (!pass) return ['mot de passe inexistant', false];
//             else if (pass === '') return ['Mettez un mot de passe valable', false];
//             // else if(this.id) return [this.game.title, true];
//             else return ['Correct', true];

//     }

//     recuparateGame(): string {
//         if(this.id)
//         this.communicationService.getGameById(this.id).subscribe((e) => {
//             this.game = e;
//         });

//         return this.game.title;

//     }

//     // recuparateid(): string {
//     //     if(this.id)
//     //     this.communicationService.getGameById(this.id).subscribe((e) => {
//     //         this.game = e;
//     //     });

//     //     return this.game.title;

//     // }

// }

import { Injectable } from '@angular/core';
import { Game, Join } from '@app/interfaces/definitions';
import { CommunicationService } from '@app/services/communication.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class organizer {
    join: Join[] = [
        {
            id: '6',
            gameId: '3',
            players: ['moha'],
            blackList: ['jean paiement'],
            currentQuestionIndex: 0,
        },
        {
            id: '3',
            gameId: '1013',
            players: [],
            blackList: [],
            currentQuestionIndex: 0,
        },
    ];

    new: Join = {
        id: '',
        gameId: '',
        players: [],
        blackList: [],
        currentQuestionIndex: 0,
    };

    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    id: string | undefined;
    game: Game;
    response: string;
    Ras: string = '';
    name: String[];
    messa: number;

    constructor(private readonly communicationService: CommunicationService) {
        // this.Init();
    }

    isPasswordValid(password: string): [string, boolean] {
        //  this.communicationService.checkCode(password).subscribe({ next: (response) => {
        //     const responseString = `${response.status}`;
        //     this.response=responseString;
        // }}),

        //  console.log("dddddddddd"+this.Ras)
        const match = this.join.find(({ id: id }) => id === this.Ras);
        this.Ras = password;
        //  console.log("res"+this.response)
        if (password == match?.id) return ['Correct', true];
        else return ['Mettez un mot de passe valable', false];
    }

    isNameValid(name: string): [string, boolean] {
        const match = this.join.find(({ id: id }) => id === this.Ras);

        if (!match) {
            return ['la partie nexiste pas', false];
        }

        if (match.players.includes(name.toLowerCase())) {
            return ['utilisateur existe déjà', false];
        }

        if (match.blackList.includes(name)) {
            return ['utilisateur est banni', false];
        }

        //  this.matchModel.findOneAndUpdate({ id: code }, { $push: { players: username } }).exec();
        else {
            if (!match.players.includes(name)) match.players.push(name);
            this.new = match;
            console.log(match.players);
            return ['good', true];
        }
    }

    recuparateGame(): string {
        this.communicationService.getGameById(this.new.gameId).subscribe((e) => {
            this.game = e;
        });

        console.log(this.game.title);
        return this.game.title;
    }
}
