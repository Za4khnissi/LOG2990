interface Choice {
    text: string;
    isCorrect: boolean;
}
interface CorrectChoiceData extends Choice {
    correctChoices: Choice[];
    message: [];
    isCorrect: boolean;
}

interface AnswerEventData {
    accessCode: string;
    answerIndex: number;
}

type Question = QCMQuestion | QRLQuestion;

interface BaseQuestion {
    type: 'QCM' | 'QRL';
    text: string;
    points: number;
}

interface QCMQuestion extends BaseQuestion {
    type: 'QCM';
    choices?: Choice[];
}

interface QRLQuestion extends BaseQuestion {
    type: 'QRL';
}

interface DialogData {
    message: string;
    duration: number;
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
    FINISHED,
    LOCKED,
}

enum MatchPlayer {
    QUIT,
    NO_TOUCH,
    SELECT,
    FINISHED,
}

enum TimerState {
    RUNNING,
    PAUSED,
    PANIC,
}

interface Player {
    clientId: string;
    username: string;
    score: number;
    bonusCount: number;
    status: MatchPlayer;
    lockedRoom: boolean;
}

interface MatchInfo {
    id: string;
    gameId: string;
    players: Player[];
    blackList: string[];
    currentQuestionIndex: number;
    beginDate: Date;
    status: MatchStatus;
}

interface PlayerResult {
    score: number;
    isCorrect: boolean;
    hasBonus: boolean;
    correctChoices: number[];
}

interface QrlAnswer {
    username: string;
    answer: string;
    grade: number;
}

interface Submission {
    state: boolean;
    msg: string;
}

interface TimeInfo {
    remainingTime: number;
    initialTime: number;
}

interface MatchApiResponse<T> {
    status: boolean;
    body: T;
}

interface ChatMessage {
    text: string;
    sender: string;
    timestamp: string;
    senderId: string;
}

interface Classification {
    classificationType: string;
    classificationChoice: boolean;
}

interface MatchConcluded {
    gameName: string;
    initialPlayerCount: number;
    bestScore: number;
    beginDate: Date;
}

interface FormattedDate {
    hour?: '2-digit';
    minute?: '2-digit';
    second?: '2-digit';
}

export {
    AnswerEventData,
    BaseQuestion,
    ChatMessage,
    Choice,
    Classification,
    CorrectChoiceData,
    DialogData,
    FormattedDate,
    Game,
    MatchApiResponse,
    MatchConcluded,
    MatchInfo,
    MatchPlayer,
    MatchStatus,
    Player,
    PlayerResult,
    QCMQuestion,
    QRLQuestion,
    QrlAnswer,
    Question,
    Submission,
    TimeInfo,
    TimerState,
};
