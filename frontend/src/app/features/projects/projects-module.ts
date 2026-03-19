import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectsRoutingModule } from './projects-routing-module';
import { ProjectOverview } from './project-overview/project-overview';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    ProjectOverview
  ]
})
export class ProjectsModule { }
