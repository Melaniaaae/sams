import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { GlobalSpinnerComponent } from '../global-spinner/global-spinner.component';

interface NavItem { label: string; route: string; icon: string; }

const STUDENT_NAV: NavItem[] = [
  { label: 'Dashboard',      route: '/dashboard',  icon: 'grid'   },
  { label: 'Logbook',        route: '/logbook',    icon: 'book'   },
  { label: 'My Profile',     route: '/profile',    icon: 'user'   },
  { label: 'Document Vault', route: '/documents',  icon: 'folder' },
];

const COORD_NAV: NavItem[] = [
  { label: 'Dashboard', route: '/coordinator-dashboard', icon: 'grid'     },
  { label: 'Students',  route: '/students',  icon: 'users'    },
  { label: 'Lecturers', route: '/lecturers', icon: 'grad'     },
  { label: 'Companies', route: '/companies', icon: 'building' },
];

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  logbook:   'Logbook',
  profile:   'My Profile',
  documents: 'Document Vault',
  students:  'Student Management',
  lecturers: 'Lecturer Management',
  companies: 'Company Database',
};

const SVG_ICONS: Record<string, string> = {
  grid:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  book:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  user:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  folder:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  users:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  grad:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  building: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
};

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, GlobalSpinnerComponent],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
  private authService = inject(AuthService);
  private sanitizer   = inject(DomSanitizer);
  private router      = inject(Router);

  // ✅ FIX: Use toSignal() so computed() can track currentUser reactively
  private currentUser$ = toSignal(this.authService.currentUser$, {
    initialValue: this.authService.currentUser,
  });

  isMenuOpen       = signal(false);
  showLogoutDialog = signal(false);

  isCoordinator = computed(() => this.currentUser$()?.role === 'coordinator');

  navItems = computed<NavItem[]>(() =>
    this.isCoordinator() ? COORD_NAV : STUDENT_NAV
  );

  portalLabel = computed(() =>
    this.isCoordinator() ? 'Coordinator Portal' : 'Student Portal'
  );

  currentUser = computed(() => this.currentUser$());

  initials = computed(() => {
    const name = this.currentUser$()?.name ?? '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  });

  userName = computed(() => this.currentUser$()?.name ?? '');
  userSub = computed(() =>
    this.currentUser$()?.registrationNumber ??
    (this.isCoordinator() ? 'Coordinator' : 'Student')
  );

  // Page title
  private routeTitle$ = this.router.events.pipe(
    filter((e) => e instanceof NavigationEnd),
    map((e) => {
      const segments = (e as NavigationEnd).urlAfterRedirects
        .split('/').filter(Boolean);
      return PAGE_TITLES[segments[segments.length - 1]] ?? 'Dashboard';
    })
  );
  pageTitle = toSignal(this.routeTitle$, { initialValue: 'Dashboard' });

  getSvgIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(SVG_ICONS[icon] ?? '');
  }

  confirmLogout(): void {
    this.showLogoutDialog.set(true);
  }

  cancelLogout(): void {
    this.showLogoutDialog.set(false);
  }
confirmAndLogout(): void {
  this.showLogoutDialog.set(false); // close dialog first
  this.authService.logout();        // then logout
}
  // ✅ FIXED logout (ONLY ONE)
  logout(): void {
    this.authService.logout(); // handles redirect
  }

  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
  }
}