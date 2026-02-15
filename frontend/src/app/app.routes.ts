import { Routes } from '@angular/router';

export const routes: Routes = [
    {path: '', redirectTo: 'projects', pathMatch: 'full'},
    {
        path: 'auth',
        loadChildren: () =>
            import('./features/auth/auth-module').then(m => m.AuthModule)
    },
    {
        path: 'projects',
        loadChildren: () =>
            import('./features/projects/projects-module').then(m => m.ProjectsModule)
    },
    {
        path: 'board',
        loadChildren: () =>
            import('./features/board/board-module').then(m => m.BoardModule)
    },
    {
        path: 'dashboard',
        loadChildren: () =>
            import('./features/dashboard/dashboard-module').then(m => m.DashboardModule)
    },
    {
        path: 'members',
        loadChildren: () =>
            import('./features/members/members-module').then(m => m.MembersModule)
    }
];
