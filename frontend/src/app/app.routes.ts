import { Routes } from '@angular/router';
import { HomeComponent } from './features/auth/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ProfileComponent } from './features/auth/profile/profile.component';
import { authGuard } from './core/guards/auth-guard';
import { MainLayout } from './core/layout/main-layout/main-layout';

export const routes: Routes = [
  //unprotected routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  //routes protected by authGuard
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'projects', pathMatch: 'full' },
      {
        path: 'projects',
        loadChildren: () =>
          import('./features/projects/projects-module').then((m) => m.ProjectsModule),
      },
      {
        path: 'project/:id/board',
        loadChildren: () => import('./features/board/board-module').then((m) => m.BoardModule),
      },
      {
        path: 'project/:id/members',
        loadChildren: () =>
          import('./features/members/members-module').then((m) => m.MembersModule),
      },
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
