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
interface Player {
    username: string;
    isOrganizer: boolean;
}

enum MatchStatus {
    WAITING,
    IN_PROGRESS,
    FINISHED,
    LOCKED,
}

interface Match {
    id: string;
    gameId: string;
    players: Player[];
    blackList: string[];
    currentQuestionIndex: number;
    beginDate: Date;
    status: MatchStatus;
    isLocked?: boolean;
}

interface Submission {
    state: boolean;
    msg: string;
}

export { Choice, Game, Match, Player, Question, Submission };
