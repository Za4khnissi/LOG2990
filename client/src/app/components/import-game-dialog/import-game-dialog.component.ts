import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GameCreationService } from '@app/services/game-creation.service';
import { Game, Submission } from '@common/definitions';
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
    isSuccessful: boolean = false;

    constructor(
        private dialogRef: MatDialogRef<ImportGameDialogComponent>,
        private gameCreationService: GameCreationService,
    ) {}

    // found here: https://stackoverflow.com/questions/512528/set-cursor-position-in-html-textbox
    // https://towardsdatascience.com/how-to-validate-your-json-using-json-schema-f55f4b162dce
    async onFileSelected(event: Event): Promise<void> {
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
                        this.errorMessage = 'Format de quiz invalide';
                        this.isSuccessful = false;
                        return;
                    }

                    this.importedGame = this.convertToGame(parsedData);
                    this.errorMessage = "Pret pour l'importation";
                    this.isSuccessful = true;
                } catch (error) {
                    this.errorMessage = 'Fichier invalide, veuillez selectionner un fichier JSON';
                    this.isSuccessful = false;
                }
            };
            fileReader.readAsText(selectedFile);
        } else {
            this.errorMessage = 'Aucun fichier sélectionné';
            this.isSuccessful = false;
        }
    }

    /* L'utilisation de console.log(typeof parsedData) nous retourne le type général object 
       et non pas un type spécifique que l'on pourrait utiliser pour le typage de la variable parsedData
    */
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
            this.isSuccessful = false;
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
