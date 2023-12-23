import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { MatchHandlerService } from '@app/services/match-handler.service';
import { SocketClientService } from '@app/services/socket.client.service';
import { IMPOSSIBLE_INDEX } from '@common/constants';
import { AnswerEventData, Question } from '@common/definitions';
import { MatchEvents } from '@common/socket.events';

@Component({
    selector: 'app-question-display',
    templateUrl: './question-display.component.html',
    styleUrls: ['./question-display.component.scss'],
})
export class QuestionDisplayComponent implements OnDestroy, OnChanges {
    @Input() currentQuestion: Question;
    @Input() timeLeft: number;
    @Input() isTest: boolean;
    @Input() isChatFocused: boolean;
    @Output() answersSubmitted = new EventEmitter<number[] | string>();

    selectedAnswerIndexes: number[] = [];
    qrlAnswer: string = '';
    isSubmitted = false;
    timer: ReturnType<typeof setTimeout>;

    constructor(
        private readonly socketService: SocketClientService,
        readonly matchHandler: MatchHandlerService,
    ) {}

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (this.isChatFocused || this.isSubmitted || this.currentQuestion.type === 'QRL') {
            return;
        }
        const numberPressed = parseInt(event.key, 10);
        if (this.currentQuestion.choices && numberPressed >= 1 && numberPressed <= this.currentQuestion.choices.length) {
            this.toggleChoice(numberPressed - 1);
        }

        if (event.key === 'Enter') {
            this.submitAnswers();
        }
    }

    preventKeyDownEnter(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    onInputChange(): void {
        if (!this.isSubmitted) this.socketService.send(MatchEvents.NewInteraction, { accessCode: this.matchHandler.accessCode });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.timeLeft && changes.timeLeft.currentValue !== changes.timeLeft.previousValue) {
            this.checkAnswers();
        }

        if (changes.currentQuestion && changes.currentQuestion.currentValue !== changes.currentQuestion.previousValue) {
            this.isSubmitted = false;
            this.selectedAnswerIndexes = [];
            this.qrlAnswer = '';
        }
    }

    ngOnDestroy(): void {
        clearInterval(this.timer);
    }

    checkAnswers() {
        if (this.timeLeft === 0 && !this.isSubmitted) this.submitAnswers();
    }

    validateAnswers() {
        this.isSubmitted = true;
    }

    submitAnswers() {
        this.validateAnswers();
        if (this.currentQuestion.type === 'QCM') this.answersSubmitted.emit(this.selectedAnswerIndexes);
        else this.answersSubmitted.emit(this.qrlAnswer);
    }

    toggleChoice(index: number) {
        const idx = this.selectedAnswerIndexes.indexOf(index);
        const eventData: AnswerEventData = { accessCode: this.matchHandler.accessCode, answerIndex: index };
        if (idx > IMPOSSIBLE_INDEX) {
            this.selectedAnswerIndexes.splice(idx, 1);
            this.socketService.send(MatchEvents.UnselectAnswer, eventData);
        } else {
            this.selectedAnswerIndexes.push(index);
            this.socketService.send(MatchEvents.SelectAnswer, eventData);
        }
    }

    isSelected(index: number): boolean {
        return this.selectedAnswerIndexes.includes(index);
    }
}
