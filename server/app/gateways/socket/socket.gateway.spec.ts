/* eslint-disable */
import { MatchConcludedEntity } from '@app/schemas/match-concluded.schema';
import { ErrorHandlerService } from '@app/services/error-handler/error-handler.service';
import { FileSystemManager } from '@app/services/file-system-manager/file-system-manager.service';
import { GameManager } from '@app/services/game-manager/game-manager.service';
import { MatchLogicService } from '@app/services/match-logic/match-logic.service';
import { MatchManagerService } from '@app/services/match-manager/match-manager.service';
import { Game, MatchInfo, MatchStatus, TimerState } from '@common/definitions';
import { Logger } from '@nestjs/common/services';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { lastValueFrom, of } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { SocketGateway } from './socket.gateway';

describe('SocketGateway', () => {
    let gateway: SocketGateway;
    let logger: Logger;
    let matchManager: MatchManagerService;
    let server: Server;
    let client: Socket;
    const accessCode = '123';
    const answerIndex = 1;
    const message = 'test message';
    const username = 'testUser';
    const matchInfoMock: MatchInfo = {
        id: 'mockId',
        gameId: 'mockGameId',
        players: [],
        blackList: [],
        currentQuestionIndex: 0,
        beginDate: new Date(),
        status: MatchStatus.WAITING,
    };

    const gameMock: Game = {
        id: '',
        title: '',
        duration: 0,
        questions: [],
        lastModification: '',
    };
    const matchLogicService = new MatchLogicService(matchInfoMock, gameMock);

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                { provide: getModelToken('MatchEntity'), useValue: {} },
                {
                    provide: getModelToken(MatchConcludedEntity.name),
                    useValue: Model,
                },
                SocketGateway,
                Logger,
                MatchManagerService,
                GameManager,
                FileSystemManager,
                ErrorHandlerService,
                MatchLogicService,
            ],
        }).compile();

        gateway = module.get<SocketGateway>(SocketGateway);
        logger = module.get<Logger>(Logger);
        matchManager = module.get<MatchManagerService>(MatchManagerService);
        server = new Server();
        gateway.server = server;

        client = {
            id: '123',
        } as Socket;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    describe('handleGameJoined', () => {
        it('should call the match manager with the correct arguments', () => {
            jest.spyOn(matchLogicService, 'handleGameJoined').mockImplementation(jest.fn());
            matchManager.matches[accessCode] = matchLogicService;
            const handleGameJoinedSpy = jest.spyOn(matchManager.matches[accessCode], 'handleGameJoined');
            gateway.handleGameJoined(client, { accessCode, username });
            expect(handleGameJoinedSpy).toHaveBeenCalled();
        });
    });

    describe('handleRoomMessage', () => {
        it('should call the match manager with the correct arguments', () => {
            jest.spyOn(matchLogicService, 'handleRoomMessage').mockImplementation(jest.fn());
            matchManager.matches[accessCode] = matchLogicService;
            const handleRoomMessageSpy = jest.spyOn(matchManager.matches[accessCode], 'handleRoomMessage');
            gateway.handleRoomMessage(client, { accessCode, message });
            expect(handleRoomMessageSpy).toHaveBeenCalledWith(client, message);
        });
    });

    describe('handleStartGame', () => {
        it('should call the match manager with the correct arguments', () => {
            jest.spyOn(matchLogicService, 'handleStartGame').mockImplementation(jest.fn());
            matchManager.matches[accessCode] = matchLogicService;
            const handleStartGameSpy = jest.spyOn(matchManager.matches[accessCode], 'handleStartGame');
            gateway.handleStartGame(client, accessCode);
            expect(handleStartGameSpy).toHaveBeenCalledWith(client);
        });
    });

    describe('handleLeaveGame', () => {
        it('should call the match manager with the correct arguments', () => {
            jest.spyOn(matchLogicService, 'handleQuitGame').mockImplementation(jest.fn());
            matchManager.matches[accessCode] = matchLogicService;
            const handleQuitGameSpy = jest.spyOn(matchManager.matches[accessCode], 'handleQuitGame');
            gateway.handleLeaveGame(client, accessCode);
            expect(handleQuitGameSpy).toHaveBeenCalledWith(client);
        });
    });

    describe('handleSubmitAnswers', () => {
        it('should call the match manager with the correct arguments', () => {
            const selectedAnswerIndexes = [0, 1, 2];
            jest.spyOn(matchLogicService, 'handleSubmitAnswers').mockImplementation(jest.fn());
            matchManager.matches[accessCode] = matchLogicService;
            const handleSubmitAnswersSpy = jest.spyOn(matchManager.matches[accessCode], 'handleSubmitAnswers');
            gateway.handleSubmitAnswers(client, { accessCode, answer: selectedAnswerIndexes });
            expect(handleSubmitAnswersSpy).toHaveBeenCalledWith(client, selectedAnswerIndexes);
        });
    });

    describe('handleShowResults', () => {
        it('should call the match manager with the correct arguments', () => {
            const mockMatchManager = {
                ...matchManager,
                saveMatchinDB: jest.fn(),
                matches: {
                    ...matchManager.matches,
                    [accessCode]: matchLogicService,
                },
            };

            const saveMatchinDBSpy = jest.spyOn(mockMatchManager, 'saveMatchinDB');

            (gateway as any).matchManager = mockMatchManager as any;

            jest.spyOn(matchLogicService, 'handleShowResults').mockImplementation(jest.fn());
            const handleShowResultsSpy = jest.spyOn(mockMatchManager.matches[accessCode], 'handleShowResults');

            gateway.handleShowResults(client, accessCode);

            expect(handleShowResultsSpy).toHaveBeenCalled();

            expect(saveMatchinDBSpy).toHaveBeenCalled();
        });
    });

    describe('handleNextQuestion', () => {
        it('should call the match manager ', () => {
            jest.spyOn(matchLogicService, 'handleNextQuestion').mockImplementation(jest.fn());
            matchManager.matches[accessCode] = matchLogicService;
            const handleNextQuestionSpy = jest.spyOn(matchManager.matches[accessCode], 'handleNextQuestion');
            gateway.handleNextQuestion(client, accessCode);
            expect(handleNextQuestionSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('handleCreateWaitingRoom', () => {
        it('should call the match manager with the correct arguments', async () => {
            const gameId = '123';
            jest.spyOn(matchLogicService, 'handleMatchCreated').mockImplementation(jest.fn());
            matchManager.matches[accessCode] = matchLogicService;
            const createMatchSpy = jest.spyOn(matchManager, 'createMatch').mockReturnValue(lastValueFrom(of(accessCode)));
            // matchLogicService.server = server;
            gateway.handleCreateWaitingRoom(client, gameId);
            expect(createMatchSpy).toHaveBeenCalledWith(gameId);
        });
    });

    describe('handleLockRoom', () => {
        it('should call the match manager with the correct arguments', () => {
            jest.spyOn(matchLogicService, 'handleLockRoom').mockImplementation(jest.fn());
            matchManager.matches[accessCode] = matchLogicService;
            const handleLockRoomSpy = jest.spyOn(matchManager.matches[accessCode], 'handleLockRoom');
            gateway.handleLockRoom(client, accessCode);
            expect(handleLockRoomSpy).toHaveBeenCalledWith(client);
        });
    });

    describe('handleUnlockRoom', () => {
        it('should call the match manager with the correct arguments', () => {
            jest.spyOn(matchLogicService, 'handleUnlockRoom').mockImplementation(jest.fn());
            matchManager.matches[accessCode] = matchLogicService;
            const handleUnlockRoomSpy = jest.spyOn(matchManager.matches[accessCode], 'handleUnlockRoom');
            gateway.handleUnlockRoom(client, accessCode);
            expect(handleUnlockRoomSpy).toHaveBeenCalledWith(client);
        });
    });

    describe('handleRemoveUser', () => {
        it('should call the match manager with the correct arguments', () => {
            jest.spyOn(matchLogicService, 'handleRemovePlayer').mockImplementation(jest.fn());
            matchManager.matches[accessCode] = matchLogicService;
            const handleRemovePlayerSpy = jest.spyOn(matchManager.matches[accessCode], 'handleRemovePlayer');
            gateway.handleRemoveUser(client, { accessCode, username });
            expect(handleRemovePlayerSpy).toHaveBeenCalledWith(client, username);
        });
    });

    describe('handleSelectAnswer', () => {
        it('should call the match manager with the correct arguments', () => {
            jest.spyOn(matchLogicService, 'handleSelectAnswer').mockImplementation(jest.fn());
            matchManager.matches[accessCode] = matchLogicService;
            const handleSelectAnswerSpy = jest.spyOn(matchManager.matches[accessCode], 'handleSelectAnswer');
            gateway.handleSelectAnswer(client, { accessCode, answerIndex });
            expect(handleSelectAnswerSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('handleUnselectAnswer', () => {
        it('should call the match manager with the correct arguments', () => {
            jest.spyOn(matchLogicService, 'handleUnselectAnswer').mockImplementation(jest.fn());
            matchManager.matches[accessCode] = matchLogicService;
            const handleUnselectAnswerSpy = jest.spyOn(matchManager.matches[accessCode], 'handleUnselectAnswer');
            gateway.handleUnselectAnswer(client, { accessCode, answerIndex });
            expect(handleUnselectAnswerSpy).toHaveBeenCalledWith(answerIndex);
        });
    });

    describe('afterInit', () => {
        it('should log a message', () => {
            const loggerSpy = jest.spyOn(logger, 'log');
            gateway.afterInit(server);
            expect(loggerSpy).toHaveBeenCalledWith('Initialisation du serveur [object Object] !');
        });
    });

    describe('handleConnection', () => {
        it('should log a message', () => {
            const loggerSpy = jest.spyOn(logger, 'log');
            gateway.handleConnection(client);
            expect(loggerSpy).toHaveBeenCalledWith(`Connexion par l'utilisateur avec id : ${client.id} `);
        });
    });

    describe('handleDisconnect', () => {
        it('should call handleQuitGame on all matches ', () => {
            jest.spyOn(matchLogicService, 'handleQuitGame').mockReturnValue(true);
            matchManager.matches[accessCode] = matchLogicService;
            const handleQuitGameSpy1 = jest.spyOn(matchManager.matches[accessCode], 'handleQuitGame');
            gateway.handleDisconnect(client);
            expect(handleQuitGameSpy1).toHaveBeenCalledWith(client);
        });
        it('should not call handleQuitGame on all matches and break if the client was in a match', () => {
            jest.spyOn(matchLogicService, 'handleQuitGame').mockReturnValue(false);
            matchManager.matches[accessCode] = matchLogicService;
            const handleQuitGameSpy = jest.spyOn(matchManager.matches[accessCode], 'handleQuitGame');
            expect(handleQuitGameSpy).not.toHaveBeenCalled();
        });
    });

    describe('handleChangeTimerState', () => {
        it('should call handleChangeTimerState with correct arguments', () => {
            const timerState: TimerState = TimerState.PAUSED;
            jest.spyOn(matchLogicService, 'handleChangeTimerState').mockImplementation(jest.fn());
            matchManager.matches[accessCode] = matchLogicService;
            const handleChangeTimerStateSpy = jest.spyOn(matchManager.matches[accessCode], 'handleChangeTimerState');
            gateway.handleChangeTimerState(client, { accessCode, timerState });
            expect(handleChangeTimerStateSpy).toHaveBeenCalledWith(client, timerState);
        });
    });

    describe('handleChangeClassement', () => {
        it('should call handleChangeClassement with correct arguments', () => {
            const classification = 'someValue';
            const choice = true;
            jest.spyOn(matchLogicService, 'handleChangeClassification').mockImplementation(jest.fn());
            matchManager.matches[accessCode] = matchLogicService;
            const handleChangeClassementSpy = jest.spyOn(matchManager.matches[accessCode], 'handleChangeClassification');
            gateway.handleChangeClassification(client, { accessCode, classification, choice });
            expect(handleChangeClassementSpy).toHaveBeenCalledWith(classification, choice);
        });
    });

    describe('handleGradingFinished', () => {
        it('should call handleGradingFinished with correct arguments', () => {
            const qRLAnswers = {};
            jest.spyOn(matchLogicService, 'handleGradingFinished').mockImplementation(jest.fn());
            matchManager.matches[accessCode] = matchLogicService;
            const handleGradingFinishedSpy = jest.spyOn(matchManager.matches[accessCode], 'handleGradingFinished');
            gateway.handleGradingFinished(client, { accessCode, qRLAnswers });
            expect(handleGradingFinishedSpy).toHaveBeenCalledWith(qRLAnswers);
        });
    });

    describe('handleNewInteraction', () => {
        it('should call handleInteract with correct arguments', () => {
            jest.spyOn(matchLogicService, 'handleInteract').mockImplementation(jest.fn());
            matchManager.matches[accessCode] = matchLogicService;
            const handleInteractSpy = jest.spyOn(matchManager.matches[accessCode], 'handleInteract');
            gateway.handleNewInteraction(client, { accessCode });
            expect(handleInteractSpy).toHaveBeenCalledWith(client);
        });
    });

    describe('handleToggleChatLock', () => {
        it('should call the match manager with the correct arguments', () => {
            const mockUsername = 'testUsername';
            const mockData = { accessCode, username: mockUsername };
            jest.spyOn(matchLogicService, 'handleToggleChatLock').mockImplementation(jest.fn());

            matchManager.matches[accessCode] = matchLogicService;

            gateway.handleToggleChatLock(client, mockData);

            // Assert
            expect(matchLogicService.handleToggleChatLock).toHaveBeenCalledWith(client, mockUsername);
        });
    });

    describe('getMatch', () => {
        it('should throw an error if the match is not found', () => {
            expect(() => {
                (gateway as any).getMatch('7845454');
            }).toThrow('Match not found');
        });
    });
});
