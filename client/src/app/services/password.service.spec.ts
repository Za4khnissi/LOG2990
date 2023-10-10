import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';

import { PasswordService } from './password.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

class LocalStorageMock {
    private storage: { [key: string]: string } = {};

    getItem(key: string): string | null {
        return this.storage[key] || null;
    }

    setItem(key: string, value: string): void {
        this.storage[key] = value;
    }
}

describe('PasswordService', () => {
    let service: PasswordService;
    let httpTestingController: HttpTestingController;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [PasswordService, { provide: LocalStorageMock, useClass: LocalStorageMock }],
        });

        service = TestBed.inject(PasswordService);
        httpTestingController = TestBed.inject(HttpTestingController);
    }));

    afterEach(() => {
        httpTestingController.verify();
        service.setLoginState(false);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set logged in state to false', () => {
        service.setLoginState(false);
        expect(service.isLoggedIn).toBe(false);
    });

    it('should set logged in state to true', () => {
        service.setLoginState(true);
        expect(service.isLoggedIn).toBe(true);
    });

    it('should get the value of isLoggedIn as true when localStorage returns true', () => {
        TestBed.inject(LocalStorageMock).setItem('isLoggedIn', 'true');
        service.setLoginState(true);
        expect(service.getLoginState()).toBe(true);
    });

    it('should get the value of isLoggedIn as false when localStorage returns false', () => {
        TestBed.inject(LocalStorageMock).setItem('isLoggedIn', 'false');
        service.setLoginState(false);
        expect(service.getLoginState()).toBe(false);
    });

    it('should return true when authentication succeeded', fakeAsync(() => {
        const password = 'justARegularPassword';
        let result: boolean | undefined;

        service.validate(password).then((res) => {
            result = res;
        });

        const requirement = httpTestingController.expectOne('http://localhost:3000/api/password/validate');
        requirement.flush({ success: true });

        tick();

        expect(result).toBe(true);
        expect(service.isLoggedIn).toBe(true);
    }));

    it('should return false when authentication failed', fakeAsync(() => {
        const password = 'justARegularPassword';
        let result: boolean | undefined;

        service.validate(password).then((res) => {
            result = res;
        });

        const requirement = httpTestingController.expectOne('http://localhost:3000/api/password/validate');
        requirement.flush({ status: 404, statusText: 'Not Found' });

        tick();

        expect(result).toBe(false);
        expect(service.isLoggedIn).toBe(false);
    }));

    it('should return false when authentication failed with an error', fakeAsync(() => {
        const password = 'justARegularPassword';
        let result: boolean | undefined;

        service
            .validate(password)
            .then((res) => {
                result = res;
            })
            .catch(() => {
                result = false;
            });

        const requirement = httpTestingController.expectOne('http://localhost:3000/api/password/validate');
        requirement.flush(null, { status: 404, statusText: 'Not Found' });

        tick();

        expect(result).toBe(false);
        expect(service.isLoggedIn).toBe(false);
    }));
});
