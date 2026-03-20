import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MemberDialog } from './member-dialog';

describe('MemberDialog', () => {
  let component: MemberDialog;
  let fixture: ComponentFixture<MemberDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberDialog],
      providers: [
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
