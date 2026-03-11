import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KanbanBoard } from './kanban-board';
import { ActivatedRoute, provideRouter } from '@angular/router';

describe('KanbanBoard', () => {
  let component: KanbanBoard;
  let fixture: ComponentFixture<KanbanBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanbanBoard],
      providers: [
        provideRouter([]), // Stellt sicher, dass Router-Services vorhanden sind
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: new Map() }
            }
          }
        ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KanbanBoard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
