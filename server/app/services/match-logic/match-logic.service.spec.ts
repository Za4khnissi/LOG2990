/* eslint-disable */

import { Game, MatchPlayer, MatchStatus, Player, Question, TimerState } from '@common/definitions';
import { MatchEvents } from '@common/socket.events';
import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { MatchLogicService } from './match-logic.service';

const emitMock = jest.fn();

const toMock = jest.fn().mockImplementation(() => ({ emit: emitMock }));

const serverMock: Partial<Server> = {
    to: toMock as any,
};

const clientMock: Partial<Socket> = {
    id: 'client_id',
    rooms: new Set(),
    join: jest.fn(),
    emit: jest.fn() as any,
};

const matchInfoMock = {
    id: '0000',
    players: [],
    gameId: '1',
    blackList: [],
    currentQuestionIndex: 0,
    beginDate: new Date(),
    status: MatchStatus.WAITING,
};

const dummyPlayer: Player = {
    clientId: 'client_id',
    username: 'player',
    score: 0,
    bonusCount: 0,
    status: MatchPlayer.NO_TOUCH,
    lockedRoom: false,
};

const dummyPlayer2: Player = {
    clientId: 'client_id2',
    username: 'player',
    score: 0,
    bonusCount: 0,
    status: MatchPlayer.NO_TOUCH,
    lockedRoom: false,
};

const dummyQuestions: Question[] = [
    {
        type: 'QCM',
        text: 'question1',
        points: 10,
        choices: [
            { text: 'choice1', isCorrect: true },
            { text: 'choice2', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        text: 'question2',
        points: 10,
        choices: [
            { text: 'choice3', isCorrect: true },
            { text: 'choice4', isCorrect: false },
        ],
    },
    {
        type: 'QRL',
        text: 'question3',
        points: 10,
    },
];

const dummmyGame: Game = {
    id: '1',
    title: 'game1',
    description: 'game1',
    questions: dummyQuestions,
    duration: 10,
    lastModification: '',
};

const joinRoomMock = jest.fn();
const emitToRoomMock = jest.fn();
const isOrganizerMock = jest.fn();
const emitQuestionCountdownMock = jest.fn();
const findPlayerByIdMock = jest.fn().mockReturnValue(dummyPlayer);
const isAnswerCorrectMock = jest.fn();
const checkAndSendResultsMock = jest.fn();

describe('MatchLogicService', () => {
    let service: MatchLogicService;

    beforeEach(async () => {
        jest.useFakeTimers();
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [MatchLogicService],
        }).compile();

        service = module.get<MatchLogicService>(MatchLogicService);

        (service as any).server = serverMock as any;
        service.matchInfo = matchInfoMock;
        (service as any).isOrganizer = isOrganizerMock;
        (service as any).emitQuestionCountdown = emitQuestionCountdownMock;
        (service as any).findPlayerById = findPlayerByIdMock;
        (service as any).isAnswerCorrect = isAnswerCorrectMock;
        (service as any).checkAndSendResults = checkAndSendResultsMock;

        (service as any).game = dummmyGame;
        jest.spyOn(service as any, 'joinRoom').mockImplementation(joinRoomMock);
        jest.spyOn(service as any, 'emitToRoom').mockImplementation(emitToRoomMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('handleMatchCreated', () => {
        it('should set the server and organizer client ID and join the room', () => {
            service.handleMatchCreated(serverMock as any, clientMock as Socket);
            expect((service as any).server).toEqual(serverMock);
            expect((service as any).organizer.clientId).toBe(clientMock.id);
            expect(joinRoomMock).toHaveBeenCalledWith(clientMock, matchInfoMock.id);
        });
    });

    describe('handleGameJoined', () => {
        it('should add a new player to the match and emit updatePlayers event', () => {
            const username = 'new_player';
            service.handleGameJoined(clientMock as Socket, username);
            expect(joinRoomMock).toHaveBeenCalledWith(clientMock, matchInfoMock.id);
            expect(matchInfoMock.players).toContainEqual(expect.objectContaining({ username }));
            expect(emitToRoomMock).toHaveBeenCalledWith('updatePlayers', matchInfoMock.players);
        });
    });

    describe('handleRoomMessage', () => {
        it('should emit a room message if the client is in the room', () => {
            const message = 'Hello!';
            clientMock.rooms.add(matchInfoMock.id);
            service.matchInfo.players = [{ clientId: clientMock.id, username: 'test_player', score: 0, bonusCount: 0 } as any];
            service.handleRoomMessage(clientMock as Socket, message);
            expect(emitToRoomMock).toHaveBeenCalledWith('roomMessage', `test_player : ${message} `);
        });
    });

    it('handleStartGame should emit GameStarted and trigger emitQuestionCountdown', () => {
        isOrganizerMock.mockReturnValue(true);
        service.handleStartGame(clientMock as Socket);
        expect(emitToRoomMock).toHaveBeenCalledWith(MatchEvents.GameStarted, {});
        jest.runAllTimers();
        expect(emitQuestionCountdownMock).toHaveBeenCalledTimes(1);
    });

    it('handleStartGame should not emit GameStarted if client is not the organizer', () => {
        isOrganizerMock.mockReturnValue(false);
        service.handleStartGame(clientMock as Socket);
        expect(emitToRoomMock).not.toHaveBeenCalledWith(MatchEvents.GameStarted, {});
    });

    it('handleSelectAnswer should emit answerSelected to the organizer', () => {
        const selectedAnswerIndex = 0;
        (service as any).questionsHistogramData = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ];
        service.handleSelectAnswer(clientMock as Socket, selectedAnswerIndex);
        expect(serverMock.to).toHaveBeenCalledWith((service as any).organizer.clientId);
        expect(emitMock).toHaveBeenCalledWith('answerSelected', selectedAnswerIndex);
    });

    it('handleUnselectAnswer should emit answerUnselected to the organizer', () => {
        const selectedAnswerIndex = 0;
        (service as any).questionsHistogramData = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ];
        service.handleUnselectAnswer(selectedAnswerIndex);
        expect(serverMock.to).toHaveBeenCalledWith((service as any).organizer.clientId);
        expect(emitMock).toHaveBeenCalledWith('answerUnselected', selectedAnswerIndex);
    });

    it('handleSubmitAnswers should update player score and send results', () => {
        const player = { clientId: clientMock.id, score: 0 };
        findPlayerByIdMock.mockReturnValue(player);
        isAnswerCorrectMock.mockReturnValue(true);

        (service as any).matchInfo.currentQuestionIndex = 2;
        service.handleSubmitAnswers(clientMock as Socket, "");

        (service as any).matchInfo.currentQuestionIndex = 0;
        service.handleSubmitAnswers(clientMock as Socket, [0]);

        expect(player.score).not.toBe(0);
        expect(checkAndSendResultsMock).toHaveBeenCalledTimes(1);
    });

    it('handleSubmitAnswers update player status if timer!=null', () => {
        (service as any).timer = 10;
        const player = { clientId: clientMock.id, score: 0, status: MatchPlayer.NO_TOUCH };
        findPlayerByIdMock.mockReturnValue(player);
        isAnswerCorrectMock.mockReturnValue(true);

        service.handleSubmitAnswers(clientMock as Socket, [0]);

        expect(player.status).toBe(MatchPlayer.FINISHED);
    });

    it('handleSubmitAnswers should not update player score if player does not exist', () => {
        findPlayerByIdMock.mockReturnValue(null);
        service.handleSubmitAnswers(clientMock as Socket, [0]);

        expect(checkAndSendResultsMock).not.toHaveBeenCalled();
    });

    it('sendResults should emit PlayerResult to each player', () => {
        const playerResult = { score: 10, isCorrect: true, hasBonus: false, correctChoices: [0] };
        (service as any).playersResults = { clientId: playerResult };
        service.sendResults();

        expect(serverMock.to).toHaveBeenCalledWith('clientId');
        expect(emitMock).toHaveBeenCalledWith(MatchEvents.PlayerResult, playerResult);
    });

    it('handleNextQuestion should emit NextQuestion and trigger emitQuestionCountdown', () => {
        isOrganizerMock.mockReturnValue(true);
        service.handleNextQuestion(clientMock as Socket);
        expect(emitToRoomMock).toHaveBeenCalledWith(MatchEvents.NextQuestion, service.matchInfo.currentQuestionIndex);
        jest.runAllTimers();
        expect(emitQuestionCountdownMock).toHaveBeenCalledTimes(1);
    });

    it('handleNextQuestion should not emit NextQuestion if client is not the organizer', () => {
        isOrganizerMock.mockReturnValue(false);
        service.handleNextQuestion(clientMock as Socket);
        expect(emitToRoomMock).not.toHaveBeenCalledWith(MatchEvents.NextQuestion, service.matchInfo.currentQuestionIndex);
    });

    it('should emit OrganizerLeft if client is the organizer', () => {
        (service as any).isOrganizer = jest.fn().mockReturnValue(true);

        const client = { id: 'organizer_id' } as Socket;
        const result = service.handleQuitGame(client);

        expect(emitToRoomMock).toHaveBeenCalledWith(MatchEvents.OrganizerLeft, {});
        expect(result).toBe(true);
    });

    it('should remove player and return false if client is not the organizer', () => {
        (service as any).isOrganizer = jest.fn().mockReturnValue(false);
        (service as any).removePlayer = jest.fn().mockReturnValue(true);

        const client = { id: 'player_id' } as Socket;
        const result = service.handleQuitGame(client);

        expect((service as any).removePlayer).toHaveBeenCalledWith(client.id);
        expect(result).toBe(true);
    });

    it('should lock the room if client is the organizer', () => {
        (service as any).isOrganizer = jest.fn().mockReturnValue(true);

        const client = { id: 'organizer_id' } as Socket;
        service.toggleRoomLock(client, true);

        expect(service.matchInfo.status).toBe(MatchStatus.LOCKED);
        expect(emitToRoomMock).toHaveBeenCalledWith('RoomLocked', {});
    });

    it('should unlock the room if client is the organizer', () => {
        (service as any).isOrganizer = jest.fn().mockReturnValue(true);
        (service as any).previousRoomStatus = MatchStatus.WAITING;

        const client = { id: 'organizer_id' } as Socket;
        service.toggleRoomLock(client, false);

        expect(service.matchInfo.status).toBe(MatchStatus.WAITING);
        expect(emitToRoomMock).toHaveBeenCalledWith('RoomUnlocked', {});
    });

    it('should not lock the room if client is not the organizer', () => {
        (service as any).isOrganizer = jest.fn().mockReturnValue(false);

        const client = { id: 'player_id' } as Socket;
        const initialStatus = service.matchInfo.status;
        service.toggleRoomLock(client, true);

        expect(service.matchInfo.status).toBe(initialStatus);
        expect(emitToRoomMock).not.toHaveBeenCalled();
    });

    it('should call toggleRoomLock with true on handleLockRoom', () => {
        service.toggleRoomLock = jest.fn();

        const client = { id: 'organizer_id' } as Socket;
        service.handleLockRoom(client);

        expect(service.toggleRoomLock).toHaveBeenCalledWith(client, true);
    });

    it('should call toggleRoomLock with false on handleUnlockRoom', () => {
        service.toggleRoomLock = jest.fn();

        const client = { id: 'organizer_id' } as Socket;
        service.handleUnlockRoom(client);

        expect(service.toggleRoomLock).toHaveBeenCalledWith(client, false);
    });

    it('should remove player if client is the organizer and player exists', () => {
        const organizerClient = { id: 'organizer_id' } as Socket;
        const usernameToRemove = 'playerUsername';
        const playerToRemove = { clientId: 'player_client_id', username: usernameToRemove };

        (service as any).isOrganizer = jest.fn().mockReturnValue(true);
        (service as any).findPlayerByUsername = jest.fn().mockReturnValue(playerToRemove);
        (service as any).removePlayer = jest.fn().mockReturnValue(true);

        const result = service.handleRemovePlayer(organizerClient, usernameToRemove);

        expect((service as any).isOrganizer).toHaveBeenCalledWith(organizerClient);
        expect((service as any).findPlayerByUsername).toHaveBeenCalledWith(usernameToRemove);
        expect((service as any).removePlayer).toHaveBeenCalledWith(playerToRemove.clientId, true);
        expect(result).toBe(true);
    });

    it('should not remove player if client is not the organizer', () => {
        const client = { id: 'player_id' } as Socket;
        const usernameToRemove = 'playerUsername';

        (service as any).isOrganizer = jest.fn().mockReturnValue(false);
        (service as any).removePlayer = jest.fn();

        service.handleRemovePlayer(client, usernameToRemove);

        expect((service as any).isOrganizer).toHaveBeenCalledWith(client);
        expect((service as any).removePlayer).not.toHaveBeenCalled();
    });

    it('should not remove player if player does not exist', () => {
        const organizerClient = { id: 'organizer_id' } as Socket;
        const usernameToRemove = 'nonexistentUsername';

        (service as any).isOrganizer = jest.fn().mockReturnValue(true);
        (service as any).findPlayerByUsername = jest.fn().mockReturnValue(null);

        const result = service.handleRemovePlayer(organizerClient, usernameToRemove);

        expect((service as any).findPlayerByUsername).toHaveBeenCalledWith(usernameToRemove);
        expect(result).toBe(false);
    });

    it('should emit final results and set match status to finished', () => {
        const player1 = { clientId: 'client1', username: 'Alice', score: 5, bonusCount: 0 } as any;
        const player2 = { clientId: 'client2', username: 'Bob', score: 10, bonusCount: 0 } as any;
        service.matchInfo = {
            ...service.matchInfo,
            players: [player1, player2],
            id: 'match_id',
        };
        (service as any).server = { to: jest.fn(() => ({ emit: jest.fn() })) } as any;

        service.handleShowResults();

        expect(emitToRoomMock).toHaveBeenCalledWith(MatchEvents.FinalResults, [player1, player2]);
        expect(service.matchInfo.status).toBe(MatchStatus.FINISHED);
    });

    it('handleQRLAnswer should record answer and initialize player result', () => {
        const checkAndStartGradingQRLMock = jest.fn();
        (service as any).checkAndStartGradingQRL = checkAndStartGradingQRLMock;

        const selectedAnswer = 'testAnswer';
        service.handleQRLAnswer(dummyPlayer, selectedAnswer);
        expect((service as any).qRLAnswers[dummyPlayer.clientId]).toEqual({
            username: dummyPlayer.username,
            answer: selectedAnswer,
            grade: 0,
        });

        expect((service as any).playersResults[dummyPlayer.clientId]).toEqual({
            score: dummyPlayer.score,
            isCorrect: false,
            hasBonus: false,
            correctChoices: [],
        });

        expect(checkAndStartGradingQRLMock).toHaveBeenCalled();
    });

    it('handleGradingFinished should process graded answers and update player scores', () => {
        service.matchInfo.currentQuestionIndex = 0;

        const sendResultsMock = jest.fn();
        service.sendResults = sendResultsMock;

        let qRLAnswers = {
            [dummyPlayer2.clientId]: { grade: 0, answer: 'testAnswer' },
        };

        (service as any).findPlayerById = jest.fn().mockReturnValue({ ...dummyPlayer2 });

        (service as any).playersResults[dummyPlayer2.clientId] = { ...dummyPlayer2 };
        (service as any).game = dummmyGame;
        service.matchInfo = matchInfoMock;
        (service as any).questionsHistogramData = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ];

        service.handleGradingFinished(qRLAnswers as any);

        qRLAnswers = {
            [dummyPlayer2.clientId]: { grade: 50, answer: 'testAnswer' },
        };
        service.handleGradingFinished(qRLAnswers as any);

        qRLAnswers = {
            [dummyPlayer2.clientId]: { grade: 100, answer: 'testAnswer' },
        };

        (service as any).playersResults[dummyPlayer2.clientId] = dummyPlayer2;
        (service as any).findPlayerById = jest.fn().mockReturnValue(dummyPlayer2);
        service.handleGradingFinished(qRLAnswers as any);

        const points = dummmyGame.questions[matchInfoMock.currentQuestionIndex].points;
        expect(dummyPlayer2.score).toBe((100 / 100) * points);

        expect((service as any).questionsHistogramData[matchInfoMock.currentQuestionIndex][2]).toBe(1);

        expect(sendResultsMock).toHaveBeenCalled();
    });

    it('should set timerDecreaseFactor to 1 and emit RUNNING state', () => {
        isOrganizerMock.mockReturnValue(true);

        service.handleChangeTimerState(clientMock as Socket, TimerState.RUNNING);

        expect((service as any).timerDecreaseFactor).toBe(1);
        expect(emitToRoomMock).toHaveBeenCalledWith(MatchEvents.NewTimerState, TimerState.RUNNING);
    });

    it('should set timerDecreaseFactor to 0 and emit PAUSED state', () => {
        isOrganizerMock.mockReturnValue(true);

        service.handleChangeTimerState(clientMock as Socket, TimerState.PAUSED);

        expect((service as any).timerDecreaseFactor).toBe(0);
        expect(emitToRoomMock).toHaveBeenCalledWith(MatchEvents.NewTimerState, TimerState.PAUSED);
    });

    it('should not change timerDecreaseFactor if client is not the organizer', () => {
        isOrganizerMock.mockReturnValue(false);

        service.handleChangeTimerState(clientMock as Socket, TimerState.PAUSED);

        expect((service as any).timerDecreaseFactor).toBe(1);
        expect(emitToRoomMock).not.toHaveBeenCalled();
    });

    it('should set timerDecreaseFactor to 4 and emit PANIC state', () => {
        isOrganizerMock.mockReturnValue(true);

        service.handleChangeTimerState(clientMock as Socket, TimerState.PANIC);

        expect((service as any).timerDecreaseFactor).toBe(4);
        expect(emitToRoomMock).toHaveBeenCalledWith(MatchEvents.NewTimerState, TimerState.PANIC);
    });

    it('should update player status and emit stateColorChange if player exists', () => {
        findPlayerByIdMock.mockReturnValue(dummyPlayer);

        service.handleInteract(clientMock as Socket);

        expect(dummyPlayer.status).toBe(MatchPlayer.SELECT);
        expect(serverMock.to).toHaveBeenCalledWith((service as any).organizer.clientId);
        expect(emitMock).toHaveBeenCalledWith(MatchEvents.stateColorChange, dummyPlayer);
    });

    it('should not do anything if no player found', () => {
        findPlayerByIdMock.mockReturnValue(undefined);

        service.handleInteract(clientMock as Socket);

        expect(serverMock.to).not.toHaveBeenCalled();
        expect(emitMock).not.toHaveBeenCalled();
    });

    it('should emit correct interactions count', () => {
        (service as any).lastTimestamps = {
            client1: Date.now() - 1000,
            client2: Date.now() - 6000,
        };

        service.sendQRLInteractions();

        expect(emitToRoomMock).toHaveBeenCalledWith(MatchEvents.QRLInteractionData, 1);
    });

    it('should not emit events if not all players have answered', () => {
        (service as any).qRLAnswers = {};

        (service as any).checkAndStartGradingQRL();

        expect(serverMock.to).not.toHaveBeenCalled();
        expect(emitToRoomMock).not.toHaveBeenCalledWith(MatchEvents.GradingStarted, {});
    });

    it('should emit qRLAnswersToGrade and GradingStarted when all players have answered and there are answers', () => {
        service.matchInfo.players = [dummyPlayer];
        ((service as any).qRLAnswers[dummyPlayer.clientId] = { answer: 'answer1', grade: 0, username: 'username1' }),
            (service as any).checkAndStartGradingQRL();

        expect(serverMock.to).toHaveBeenCalledTimes(1);
        expect(emitToRoomMock).toHaveBeenCalledWith(MatchEvents.GradingStarted, {});
    });

    it('should call toggleRoomLockChat with the correct arguments', () => {
        const username = 'test_username';
        jest.spyOn(service, 'toggleRoomLockChat').mockImplementation(() => {});
        service.handleToggleChatLock(clientMock as Socket, username);
        expect(service.toggleRoomLockChat).toHaveBeenCalledWith(clientMock, username);
    });

    it('should toggle the lockedRoom property of a player', () => {
        const username = dummyPlayer.username;
        service.matchInfo.players = [dummyPlayer];
        const initialLockState = dummyPlayer.lockedRoom;

        service.toggleRoomLockChat(clientMock as Socket, username);

        expect(dummyPlayer.lockedRoom).not.toBe(initialLockState);
        expect(serverMock.to).toHaveBeenCalledWith(dummyPlayer.clientId);
    });

    it('should set both classificationType and toggle choiceClassement', () => {
        service.classification = { classificationType: '', classificationChoice: true };
        const newClassement = 'newType';
        const initialChoice = service.classification.classificationChoice;
        service.handleChangeClassification(newClassement, initialChoice);

        expect(service.classification.classificationType).toBe(newClassement);
        expect(service.classification.classificationChoice).toBe(!initialChoice);
        expect(emitToRoomMock).toHaveBeenCalledWith(MatchEvents.classificationChange, service.classification);
    });
});

describe('MatchLogicService', () => {
    let service: MatchLogicService;

    beforeEach(async () => {
        jest.useFakeTimers();

        const module: TestingModule = await Test.createTestingModule({
            providers: [MatchLogicService],
        }).compile();

        service = module.get<MatchLogicService>(MatchLogicService);

        (service as any).server = serverMock as any;
        service.matchInfo = matchInfoMock;

        (service as any).game = dummmyGame;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('emitQuestionCountdown should emit events and check results when countdown finishes', () => {
        jest.spyOn(service as any, 'joinRoom').mockImplementation(joinRoomMock);
        jest.spyOn(service as any, 'emitToRoom').mockImplementation(emitToRoomMock);

        (service as any).game = { ...dummmyGame };
        service.matchInfo.currentQuestionIndex = 0;
        (service as any).checkAndSendResults = jest.fn();

        service.emitQuestionCountdown();

        jest.runAllTimers();

        expect(emitToRoomMock).toHaveBeenCalledWith(MatchEvents.QuestionCountdown, expect.any(Object));

        expect((service as any).checkAndSendResults).toHaveBeenCalled();
    });

    it('joinRoom should make the client join the specified room', () => {
        const client = { join: jest.fn() } as unknown as Socket;
        const room = 'room_id';

        service['joinRoom'](client, room);

        expect(client.join).toHaveBeenCalledWith(room);
    });

    it('removePlayer should remove the player and emit playerRemoved', () => {
        jest.spyOn(service as any, 'joinRoom').mockImplementation(joinRoomMock);
        jest.spyOn(service as any, 'emitToRoom').mockImplementation(emitToRoomMock);

        const clientIdToRemove = 'client_id';
        const clientIdToRemove2 = 'client_id2';
        service.matchInfo.players = [{ clientId: clientIdToRemove, username: 'player', score: 0, bonusCount: 0 } as any, { clientId: clientIdToRemove2, username: 'player', score: 0, bonusCount: 0 } as any];

        service.matchInfo.currentQuestionIndex = 2;
        service['removePlayer'](clientIdToRemove2);

        service.matchInfo.currentQuestionIndex = 0;
        const result = service['removePlayer'](clientIdToRemove);

        expect(result).toBe(true);
        expect(emitToRoomMock).toHaveBeenCalledWith('playerRemoved', 'player');
    });

    it('removePlayer should remove the player, add to blacklist, and emit playerRemoved and updateBlackList', () => {
        (service as any).server = serverMock as any;

        jest.spyOn(service as any, 'joinRoom').mockImplementation(joinRoomMock);
        jest.spyOn(service as any, 'emitToRoom').mockImplementation(emitToRoomMock);

        const clientIdToRemove = 'client_id';
        const usernameToRemove = 'player';
        service.matchInfo.players = [{ clientId: clientIdToRemove, username: usernameToRemove, score: 0, bonusCount: 0 } as any];
        service.matchInfo.blackList = [];

        const result = (service as any).removePlayer(clientIdToRemove, true);

        expect(result).toBe(true);

        expect(emitToRoomMock).toHaveBeenCalledWith('playerRemoved', usernameToRemove);

        expect(emitToRoomMock).toHaveBeenCalledWith('updateBlackList', [usernameToRemove]);

        expect(emitMock).toHaveBeenCalledWith('kickedOut', {});

        expect(service.matchInfo.blackList).toContain(usernameToRemove);

        expect(service.matchInfo.players.find((p) => p.clientId === clientIdToRemove)).toBeUndefined();
    });

    it('removePlayer should not do anything if the player does not exist', () => {
        service.matchInfo.players = [{ clientId: 'existing_client_id', username: 'existing_player', score: 0, bonusCount: 0 } as any];

        const clientIdToRemove = 'nonexistent_client_id';

        const result = service['removePlayer'](clientIdToRemove);

        expect(result).toBe(false);

        expect(emitToRoomMock).not.toHaveBeenCalledWith('playerRemoved', expect.any(String));

        expect(service.matchInfo.blackList).not.toContain('nonexistent_player');
        expect(emitToRoomMock).not.toHaveBeenCalledWith('updateBlackList', expect.any(Array));

        expect(serverMock.to).not.toHaveBeenCalledWith(clientIdToRemove);
        expect(emitMock).not.toHaveBeenCalledWith('kickedOut', {});
    });

    it('should call server to emit an event to a room', () => {
        (service as any).server = serverMock as any;

        const room = matchInfoMock.id;
        const event = 'testEvent';
        const payload = { data: 'testData' };

        service['emitToRoom'](event, payload);

        expect(toMock).toHaveBeenCalledWith(room);

        expect(emitMock).toHaveBeenCalledWith(event, payload);
    });

    it('removePlayer should remove the player and emit playerRemoved', () => {
        jest.spyOn(service as any, 'joinRoom').mockImplementation(joinRoomMock);
        jest.spyOn(service as any, 'emitToRoom').mockImplementation(emitToRoomMock);

        const clientIdToRemove = 'client_id';
        service.matchInfo.players = [{ clientId: clientIdToRemove, username: 'player', score: 0, bonusCount: 0 } as any];

        const result = service['removePlayer'](clientIdToRemove);

        expect(result).toBe(true);
        expect(emitToRoomMock).toHaveBeenCalledWith('playerRemoved', 'player');
    });

    it('checkAndSendResults should send results if all players have answered', () => {
        (service as any).playersResults = {
            clienttId: {
                score: 10,
                isCorrect: true,
                hasBonus: false,
                correctChoices: [0],
            },
        };
        service.matchInfo.players = [{ clientId: 'clienttId', username: 'player', score: 0, bonusCount: 0 } as any];
        service.sendResults = jest.fn();

        service['checkAndSendResults']();

        expect(service.sendResults).toHaveBeenCalled();
    });

    it('isAnswerCorrect should return true if selected answers are correct', () => {
        (service as any).correctAnswerIndexes = [0, 2];
        const selectedAnswerIndexes = [0, 2];

        const result = service['isAnswerCorrect'](selectedAnswerIndexes);

        expect(result).toBe(true);
    });

    it('should identify the organizer correctly', () => {
        jest.spyOn(service as any, 'emitToRoom').mockImplementation(emitToRoomMock);
        const client = { id: 'organizer_id' } as Socket;
        (service as any).organizer = { clientId: 'organizer_id' };

        const result = service.handleQuitGame(client);

        expect(result).toBe(true);
    });

    it('isOrganizer should return true if the client is the organizer', () => {
        const organizerClient = { id: 'organizer_id' };
        (service as any).organizer = { clientId: 'organizer_id' };

        const result = service['isOrganizer'](organizerClient as Socket);

        expect(result).toBe(true);
    });

    it('isOrganizer should return false if the client is not the organizer', () => {
        const client = { id: 'player_id' };
        (service as any).organizer = { clientId: 'organizer_id' };

        const result = service['isOrganizer'](client as Socket);

        expect(result).toBe(false);
    });

    it('findPlayerById should return the player with the given clientId', () => {
        const clientIdToFind = 'client_id';
        service.matchInfo.players = [{ clientId: clientIdToFind, username: 'player', score: 0, bonusCount: 0 } as any];

        const result = service['findPlayerById'](clientIdToFind);

        expect(result).toEqual({ clientId: clientIdToFind, username: 'player', score: 0, bonusCount: 0 } as any);
    });

    it('findPlayerByUsername should return the player with the given username', () => {
        const usernameToFind = 'player';
        service.matchInfo.players = [{ clientId: 'red', username: usernameToFind, score: 0, bonusCount: 0 } as any];

        const result = service['findPlayerByUsername'](usernameToFind);
        expect(result).toEqual({ clientId: 'red', username: usernameToFind, score: 0, bonusCount: 0 } as any);
    });
});
