interface Choice {
    text: string;
    isCorrect: boolean;
}

interface Question {
    type?: 'QCM' | 'QRL';
    text: string;
    points: number;
    choices: Choice[];
}

interface Game {
    id: string;
    title: string;
    description?: string;
    duration: number;
    questions: Question[];
    lastModification: string;
    visible?: boolean;
}

interface Submission {
    state: boolean;
    msg: string;
}

export { Choice, Game, Question, Submission };
