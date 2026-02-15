import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberDialog } from './member-dialog';

describe('MemberDialog', () => {
  let component: MemberDialog;
  let fixture: ComponentFixture<MemberDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
