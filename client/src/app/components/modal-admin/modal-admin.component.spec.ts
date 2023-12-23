import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { PasswordService } from '@app/services/password.service';
import { ModalAdminComponent } from './modal-admin.component';

describe('ModalAdminComponent', () => {
    let component: ModalAdminComponent;
    let fixture: ComponentFixture<ModalAdminComponent>;
    let passwordServiceStub: jasmine.SpyObj<PasswordService>;

    beforeEach(() => {
        passwordServiceStub = jasmine.createSpyObj('PasswordService', ['validate']);

        TestBed.configureTestingModule({
            declarations: [ModalAdminComponent, AdminPageComponent],
            imports: [
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([{ path: 'admin', component: AdminPageComponent }]),
                FormsModule,
                MatFormFieldModule,
                MatInputModule,
                BrowserAnimationsModule,
            ],
            providers: [{ provide: PasswordService, useValue: passwordServiceStub }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
        passwordServiceStub.validate.and.returnValue(Promise.resolve(false));

        component.onSubmit();

        fixture.whenStable().then(() => {
            expect(component.isPasswordWrong).toBeTruthy();
            expect(passwordServiceStub.validate).toHaveBeenCalledWith('password');
        });
    }));

    it('should set isPasswordWrong to true on invalid Password', waitForAsync(() => {
        component.password = 'password';
        passwordServiceStub.validate.and.returnValue(Promise.resolve(true));
        component.onSubmit();

        fixture.whenStable().then(() => {
            expect(component.isPasswordWrong).toBeFalsy(); // Passwordwrong pas utilisés
            expect(passwordServiceStub.validate).toHaveBeenCalledWith('password');
        });
    }));
});
