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

interface Player {
    username: string;
    isOrganizer: boolean;
}

export { Choice, Game, Match, MatchStatus, Player, Question };
