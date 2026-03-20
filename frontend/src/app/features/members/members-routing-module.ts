import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MemberList } from './member-list/member-list';

const routes: Routes = [
  { path: '', component: MemberList }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MembersRoutingModule { }
