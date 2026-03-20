import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MembersRoutingModule } from './members-routing-module';
import { MemberList } from './member-list/member-list';
import { MemberDialog } from './member-dialog/member-dialog';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MembersRoutingModule,
    MemberList,
    MemberDialog,
  ]
})
export class MembersModule { }
