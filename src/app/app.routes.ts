import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // ── Auth ─────────────────────────────────────────────
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'auth/signup',
    loadComponent: () =>
      import('./features/auth/pages/signup/signup.component').then((m) => m.SignupComponent),
  },

  // ── Protected Shell ──────────────────────────────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/layout/shell.component')
        .then(m => m.ShellComponent),
    children: [

   // ✅ Empty route handled by guard logic
      {
        path: '',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./core/redirects/role-redirect.component')
            .then(m => m.RoleRedirectComponent)
      },
      

      // ── Student ─────────────────────────────
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/student/pages/dashboard/dashboard.component')
            .then(m => m.StudentDashboardComponent),
      },
      {
        path: 'logbook',
        loadComponent: () =>
          import('./features/student/pages/logbook/logbook.component')
            .then(m => m.LogbookComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/student/pages/profile/profile.component')
            .then(m => m.ProfileComponent),
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./features/student/pages/documents/documents.component')
            .then(m => m.DocumentsComponent),
      },

      // ── Coordinator ─────────────────────────
      {
        path: 'coordinator-dashboard',
        canActivate: [roleGuard('coordinator')],
        loadComponent: () =>
          import('./features/coordinator/pages/coordinator-dashboard/coordinator-dashboard.component')
            .then(m => m.CoordinatorDashboardComponent),
      },
      {
        path: 'students',
        canActivate: [roleGuard('coordinator')],
        loadComponent: () =>
          import('./features/coordinator/pages/students/students.component')
            .then(m => m.StudentsComponent),
      },
      {
        path: 'lecturers',
        canActivate: [roleGuard('coordinator')],
        loadComponent: () =>
          import('./features/coordinator/pages/lecturers/lecturers.component')
            .then(m => m.LecturersComponent),
      },
      {
        path: 'companies',
        canActivate: [roleGuard('coordinator')],
        loadComponent: () =>
          import('./features/coordinator/pages/companies/companies.component')
            .then(m => m.CompaniesComponent),
      },
    ],
  },

  // ── 404 ────────────────────────────────────
  {
    path: '404',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component')
        .then(m => m.NotFoundComponent),
  },
  {
    path: '**',
    redirectTo: '404',
  },
];