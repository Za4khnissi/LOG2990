import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ModalAdminComponent } from './modal-admin.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PasswordService } from '@app/services/password.service';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';

describe('ModalAdminComponent', () => {
    let component: ModalAdminComponent;
    let fixture: ComponentFixture<ModalAdminComponent>;
    let passwordServiceStub: jasmine.SpyObj<PasswordService>;

    beforeEach(() => {
        passwordServiceStub = jasmine.createSpyObj('PasswordService', ['validate']);

        TestBed.configureTestingModule({
            declarations: [ModalAdminComponent, AdminPageComponent],
            imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([{ path: 'admin', component: AdminPageComponent }])],
            providers: [{ provide: PasswordService, useValue: passwordServiceStub }],
        });
        fixture = TestBed.createComponent(ModalAdminComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set isPasswordWrong to false and emit events on valid Password', waitForAsync(() => {
        component.password = 'password';
        passwordServiceStub.validate.and.returnValue(Promise.resolve(true));

        component.onSubmit();

        fixture.whenStable().then(() => {
            expect(component.isPasswordWrong).toBeFalse();
            expect(passwordServiceStub.validate).toHaveBeenCalledWith('password');
        });
    }));

    it('should set isPasswordWrong to true on invalid Password', waitForAsync(() => {
        component.password = 'password';
        passwordServiceStub.validate.and.returnValue(Promise.resolve(false));

        component.onSubmit();

        fixture.whenStable().then(() => {
            expect(component.isPasswordWrong).toBeTrue();
            expect(passwordServiceStub.validate).toHaveBeenCalledWith('password');
        });
    }));
});
