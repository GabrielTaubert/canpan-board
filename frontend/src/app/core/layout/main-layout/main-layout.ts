import { Component } from '@angular/core';
import { Header } from "../../../shared/components/header/header";
import { BoardRoutingModule } from "../../../features/board/board-routing-module";
import { NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [Header, BoardRoutingModule, NgIf, RouterModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {

  showHeader = true;

  constructor(private router: Router) {
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event : any) => {
      this.showHeader = !event.urlAfterRedirects.startsWith('/auth');
    })
  }
}
