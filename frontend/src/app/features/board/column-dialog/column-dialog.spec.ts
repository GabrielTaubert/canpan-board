import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnDialog } from './column-dialog';

describe('ColumnDialog', () => {
  let component: ColumnDialog;
  let fixture: ComponentFixture<ColumnDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColumnDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
