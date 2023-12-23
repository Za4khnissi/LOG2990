import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MatchHandlerService } from '@app/services/match-handler.service';
import { SocketClientService } from '@app/services/socket.client.service';
import { LIMIT_USERNAME_CHARACTERS } from '@common/constants';
import { MatchApiResponse } from '@common/definitions';
import { of } from 'rxjs';
import { ModalAccesComponent } from './modal-access.component';

class SocketClientServiceMock extends SocketClientService {
    override connect() {
        // nothing
    }
}

describe('ModalAccesComponent', () => {
    let component: ModalAccesComponent;
    let fixture: ComponentFixture<ModalAccesComponent>;
    let matchHandlerServiceStub: jasmine.SpyObj<MatchHandlerService>;
    let socketServiceMock: SocketClientServiceMock;

    beforeEach(() => {
        matchHandlerServiceStub = jasmine.createSpyObj('MatchHandlerService', ['checkCode', 'checkUsername']);
        socketServiceMock = new SocketClientServiceMock();

        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule.withRoutes([{ path: 'waiting-room', component: ModalAccesComponent }]),
                HttpClientModule,
                FormsModule,
                MatFormFieldModule,
                MatInputModule,
                BrowserAnimationsModule,
            ],
            declarations: [ModalAccesComponent],
            providers: [
                { provide: MatchHandlerService, useValue: matchHandlerServiceStub },
                { provide: SocketClientService, useValue: socketServiceMock },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ModalAccesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call checkcode during submitAcces', waitForAsync(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        matchHandlerServiceStub.checkCode.and.returnValue(of({ body: 'party trouvée', status: true } as any as MatchApiResponse<string>));
        component.onSubmitAccess();
        expect(matchHandlerServiceStub.checkCode).toHaveBeenCalled();
    }));

    it('should send when validating the correct code in onSubmitAcces', waitForAsync(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        matchHandlerServiceStub.checkCode.and.returnValue(of({ body: 'party trouvée', status: true } as any as MatchApiResponse<string>));
        component.onSubmitAccess();
        expect(component.isAccessPassInvalid).toBeFalse();
    }));

    it('should send when validating the incorrect code in onSubmitAcces', waitForAsync(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        matchHandlerServiceStub.checkCode.and.returnValue(of({ body: 'Partie non trouvée', status: false } as any as MatchApiResponse<string>));
        component.onSubmitAccess();
        expect(component.isAccessPassInvalid).toBeTrue();
        expect(component.accessCodeMessage).toEqual('Partie non trouvée');
    }));

    it('should send when validating the incorrect username in onSubmitUser', waitForAsync(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        matchHandlerServiceStub.checkUsername.and.returnValue(of({ body: null, status: false } as any as MatchApiResponse<string>));
        component.onSubmitUser();
        expect(component.accessCodeMessage).toEqual('');
    }));

    it('should throw a connection error when validating a null code', waitForAsync(() => {
        matchHandlerServiceStub.checkCode.and.returnValue(of({ body: '', status: false }));
        component.onSubmitAccess();
        expect(component.accessCodeMessage).toEqual('Erreur de connexion');
    }));

    describe('limitUserNameLength', () => {
        it('should limit the userName length to LIMIT_USERNAME_CHARACTERS', () => {
            component.nameUser = 'a'.repeat(LIMIT_USERNAME_CHARACTERS);
            component.validateUsernameLength();
            expect(component.nameUser.length).toEqual(LIMIT_USERNAME_CHARACTERS);
        });

        it('should not print a message if the length of username >= LIMIT_USERNAME_CHARACTERS', () => {
            component.nameUser = 'a'.repeat(LIMIT_USERNAME_CHARACTERS);
            component.validateUsernameLength();
            expect(component.usernameCheckMessage).toEqual('La limite de 30 caractères est atteinte');
        });

        it('should not print a message if the length of username < LIMIT_USERNAME_CHARACTERS', () => {
            component.nameUser = 'a'.repeat(LIMIT_USERNAME_CHARACTERS - 1);
            component.validateUsernameLength();
            expect(component.usernameCheckMessage).toEqual('');
        });

        it('should set messageTooLong to true if the message is too long', () => {
            component.nameUser = 'a'.repeat(LIMIT_USERNAME_CHARACTERS);
            component.validateUsernameLength();
            expect(component.isUserNameTooLong).toBeTrue();
        });

        it('should set messageTooLong to false if the message is not too long', () => {
            component.nameUser = 'a'.repeat(LIMIT_USERNAME_CHARACTERS - 1);
            component.validateUsernameLength();
            expect(component.isUserNameTooLong).toBeFalse();
        });
    });

    describe('onSubmitUser', () => {
        it('should set usernameCheckMessage to "Le nom d\'utilisateur ne peut pas être vide" when nameUser is empty', waitForAsync(() => {
            component.nameUser = '';
            component.onSubmitUser();
            expect(component.usernameCheckMessage).toEqual("Le nom d'utilisateur ne peut pas être vide");
        }));
        it('should set usernameCheckMessage to "Le nom d\'utilisateur ne peut pas être vide" when nameUser is only spaces', waitForAsync(() => {
            component.nameUser = '   ';
            component.onSubmitUser();
            expect(component.usernameCheckMessage).toEqual("Le nom d'utilisateur ne peut pas être vide");
        }));
        it('should set usernameCheckMessage to "Le nom d\'utilisateur ne peut pas être vide" when nameUser is only tabs', waitForAsync(() => {
            component.nameUser = '\t\t\t';
            component.onSubmitUser();
            expect(component.usernameCheckMessage).toEqual("Le nom d'utilisateur ne peut pas être vide");
        }));
        it('should put usernameCheckMessage to "" when nameUser is not empty', waitForAsync(() => {
            component.nameUser = 'utilisateurValide';
            matchHandlerServiceStub.checkUsername.and.returnValue(of({ body: '', status: true }));
            component.onSubmitUser();
            expect(component.usernameCheckMessage).toEqual('');
            expect(matchHandlerServiceStub.checkUsername).toHaveBeenCalledWith('utilisateurValide');
        }));
        it('should put usernameCheckMessage to "Body.response" if verification fail with a body', () => {
            component.nameUser = 'utilisateurValide';
            matchHandlerServiceStub.checkUsername.and.returnValue(of({ status: false, body: 'body' }));
            component.onSubmitUser();
            expect(component.usernameCheckMessage).toBe('body');
        });
        it('should put usernameCheckMessage to "Erreur de connexion" if verification fail without a body', () => {
            component.nameUser = 'utilisateurValide';
            matchHandlerServiceStub.checkUsername.and.returnValue(of({ status: false, body: '' } as MatchApiResponse<string>));
            component.onSubmitUser();
            expect(component.usernameCheckMessage).toBe('Erreur de connexion');
        });
    });
    describe('onSubmitAccess', () => {
        it('should put accessCodeMessage to "" when game is created and in waiting room', waitForAsync(() => {
            component.accessCode = '2233';
            matchHandlerServiceStub.checkCode.and.returnValue(of({ body: '', status: true }));
            component.onSubmitAccess();
            expect(component.accessCodeMessage).toEqual('');
            expect(matchHandlerServiceStub.checkCode).toHaveBeenCalledWith('2233');
            expect(component.isAccessPassInvalid).toEqual(false);
        }));
        it('should put accessCodeMessage to "Body.response" if verification fail with a body', () => {
            component.accessCode = '2233';
            matchHandlerServiceStub.checkCode.and.returnValue(of({ status: false, body: 'body' }));
            component.onSubmitAccess();
            expect(component.accessCodeMessage).toBe('body');
            expect(component.isAccessPassInvalid).toEqual(true);
        });
        it('should put accessCodeMessage to "Erreur de connexion" if verification fail without a body', () => {
            component.accessCode = '2233';
            matchHandlerServiceStub.checkCode.and.returnValue(of({ status: false, body: '' } as MatchApiResponse<string>));
            component.onSubmitAccess();
            expect(component.accessCodeMessage).toBe('Erreur de connexion');
            expect(component.isAccessPassInvalid).toEqual(true);
        });
    });
});
