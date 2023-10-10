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

export { Choice, Game, Question };
