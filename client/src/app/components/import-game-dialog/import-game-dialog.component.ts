import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Game, Submission } from '@app/interfaces/definitions';
import { GameCreationService } from '@app/services/game-creation.service';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import quizSchema from './quiz-schema.json';

const ajv = new Ajv();
addFormats(ajv);

@Component({
    selector: 'app-import-game-dialog',
    templateUrl: './import-game-dialog.component.html',
    styleUrls: ['./import-game-dialog.component.scss'],
})
export class ImportGameDialogComponent {
    importedGame: Game;
    errorMessage: string = '';

    constructor(
        private dialogRef: MatDialogRef<ImportGameDialogComponent>,
        private gameCreationService: GameCreationService,
    ) {}

    // found here: https://stackoverflow.com/questions/512528/set-cursor-position-in-html-textbox
    // https://towardsdatascience.com/how-to-validate-your-json-using-json-schema-f55f4b162dce
    onFileSelected(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        const selectedFile = inputElement.files?.[0];

        if (selectedFile) {
            const fileReader = new FileReader();
            fileReader.onload = () => {
                try {
                    const parsedData = JSON.parse(fileReader.result as string);

                    const validate = ajv.compile(quizSchema);
                    const valid = validate(parsedData);

                    if (!valid) {
                        this.errorMessage = 'Invalid quiz format';
                        return;
                    }

                    this.importedGame = this.convertToGame(parsedData);
                } catch (error) {
                    this.errorMessage = 'Invalid JSON file';
                }
            };
            fileReader.readAsText(selectedFile);
        } else {
            this.errorMessage = 'Aucun fichier sélectionné';
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    convertToGame(parsedData: any): Game {
        const game: Game = {
            id: parsedData.id,
            title: parsedData.title,
            description: parsedData.description || '',
            duration: parsedData.duration,
            questions: parsedData.questions,
            lastModification: parsedData.lastModification,
            visible: false,
        };

        return game;
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onImport(): void {
        if (!this.importedGame) {
            this.errorMessage = 'Aucun jeu importé';
            return;
        }

        this.gameCreationService.checkAll(this.importedGame).subscribe((submission: Submission) => {
            if (!submission.state) {
                this.errorMessage = submission.msg;
                return;
            }
            this.dialogRef.close(this.importedGame);
        });
    }
}
