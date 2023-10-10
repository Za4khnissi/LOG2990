export interface GameCommon {
    id: string;
    name: string;
    description: string;
    time: number;
    questions: Question[];
    lastModification: string;
    visible?: boolean;
}

export interface Question {
    name: string;
    nPoints: number;
    choices: Choice[];
}

interface Choice {
    name: string;
    state: boolean;
}
