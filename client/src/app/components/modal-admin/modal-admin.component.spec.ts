import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAdminComponent } from './modal-admin.component';

describe('ModalAdminComponent', () => {
  let component: ModalAdminComponent;
  let fixture: ComponentFixture<ModalAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalAdminComponent]
    });
    fixture = TestBed.createComponent(ModalAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
