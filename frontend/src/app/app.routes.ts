import { Routes } from '@angular/router';
import { HomeComponent } from './auth/home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { authGuard } from './core/guards/auth-guard';
import { MainLayout } from './core/layout/main-layout/main-layout';

export const routes: Routes = [
  //unprotected routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
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
        path: 'project/:id/dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard-module').then((m) => m.DashboardModule),
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
    ],
  },

  { path: '**', redirectTo: 'projects' },
];
