import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  template: ''
})
export class RoleRedirectComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    const user = this.auth.currentUser;

    if (!user) {
      this.router.navigateByUrl('/auth/login');
      return;
    }

    if (user.role === 'coordinator') {
      this.router.navigateByUrl('/coordinator-dashboard');
    } else {
      this.router.navigateByUrl('/dashboard');
    }
  }
}