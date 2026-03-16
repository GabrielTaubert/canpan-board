import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BoardRoutingModule } from './board-routing-module';
import { KanbanBoard } from './kanban-board/kanban-board';


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    BoardRoutingModule,
    KanbanBoard,
  ]
})
export class BoardModule { }
