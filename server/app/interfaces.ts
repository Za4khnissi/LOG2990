interface Choice {
    name: string;
    state: boolean;
}

interface Question {
    name: string;
    nPoints: number;
    choices: Choice[];
}

interface Game {
    // id: à discuter
    name: string;
    description: string;
    time: number;
    questions: Question[];
}

export { Choice, Game, Question };
