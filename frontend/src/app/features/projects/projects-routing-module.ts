import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectOverview } from './project-overview/project-overview';

const routes: Routes = [
  { path: '', component: ProjectOverview }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }
