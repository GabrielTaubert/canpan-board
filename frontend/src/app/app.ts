import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { filter } from 'rxjs/operators';
import { NgIf } from "@angular/common";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');

  showHeader = true;

  constructor(private router: Router) {
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event : any) => {
      this.showHeader = !event.urlAfterRedirects.startsWith('/auth');
    })
  }
}
