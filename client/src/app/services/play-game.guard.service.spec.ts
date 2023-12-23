import { TestBed, inject } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';

import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayGameGuardService } from './play-game.guard.service';
// import SpyObj = jasmine.SpyObj;

describe('PlayGameGuardService', () => {
    let service: PlayGameGuardService;
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HttpClientModule, RouterTestingModule] });
        service = TestBed.inject(PlayGameGuardService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should canActivate correct ', () => {
        service['matchHandlerService'].username = 'yo';
        service['matchHandlerService'].accessCode = '4321';
        expect(service.canActivate()).toBeTruthy();
    });

    it('should canActivate correct ', inject([Router], (mockRouter: Router) => {
        service['matchHandlerService'].username = '';
        service['matchHandlerService'].accessCode = '';
        const navigateSpy = spyOn(mockRouter, 'navigate').and.stub();
        expect(service.canActivate()).toBeFalsy();
        expect(navigateSpy).toHaveBeenCalledWith(['/home']);
    }));
});
