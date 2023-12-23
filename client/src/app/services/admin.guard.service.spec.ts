import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AdminGuard } from './admin.guard.service';
import { PasswordService } from './password.service';
import SpyObj = jasmine.SpyObj;

describe('AdminGuard', () => {
    let service: AdminGuard;
    let routerServiceSpy: SpyObj<Router>;
    let passwordServiceSpy: SpyObj<PasswordService>;
    const setupLoginState = (returnValue: boolean) => {
        passwordServiceSpy.getLoginState.and.returnValue(returnValue);
    };
    beforeEach(() => {
        routerServiceSpy = jasmine.createSpyObj('Router', ['navigate']);
        passwordServiceSpy = jasmine.createSpyObj('PasswordService', ['getLoginState']);

        TestBed.configureTestingModule({
            providers: [
                { provide: Router, useValue: routerServiceSpy },
                { provide: PasswordService, useValue: passwordServiceSpy },
            ],
        });

        service = TestBed.inject(AdminGuard);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    it('should return true', () => {
        setupLoginState(true);
        const result = service.canActivateFunc();
        expect(result).toBeTruthy();
    });
    it(' getLoginState should have been called ', () => {
        setupLoginState(true);
        service.canActivateFunc();
        expect(passwordServiceSpy.getLoginState).toHaveBeenCalled();
    });
    it('should return false', () => {
        setupLoginState(false);
        const result = service.canActivateFunc();
        expect(result).toBeFalsy();
    });
});
