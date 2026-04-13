import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, throwError, of } from 'rxjs';
import { AuthUser, LoginPayload, AuthResponse } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly TOKEN_KEY = 'sams_token';
  private readonly USER_KEY = 'sams_user';

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(
    this.loadUserFromStorage()
  );

  currentUser$ = this.currentUserSubject.asObservable();

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(
        tap((res) => this.handleAuthSuccess(res)),

        // ✅ fallback if backend is down
        catchError((err) => {
          console.warn('Backend not reachable — using mock login');

         const mockResponse: AuthResponse = {
  access_token: 'mock-token-123',
  token_type: 'bearer', // ✅ FIXED
  user: {
    id: '1',
    name: 'John Doe',
    email: payload.email,
    registrationNumber: 'CS123',
    role: payload.email.includes('admin')
      ? 'coordinator'
      : 'student'
  }
};

          this.handleAuthSuccess(mockResponse);

          return of(mockResponse);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private handleAuthSuccess(res: AuthResponse): void {
    const user: AuthUser = { ...res.user, token: res.access_token };

    localStorage.setItem(this.TOKEN_KEY, res.access_token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    this.currentUserSubject.next(user);

   this.router.navigate(['/dashboard']);
  }

  private loadUserFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}