export interface Choice {
    name: string;
    state: boolean;
}

export interface Question {
    name: string;
    nPoints: number;
    choices: Choice[];
}

export interface Game {
    // id: à discuter
    name: string;
    description: string;
    time: number;
    questions: Question[];
}
