import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Student, PlacementProgress, AppNotification, ApiResponse } from '../../../shared/models';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/students`;

  getStudent(id: string): Observable<Student> {
    return this.http
      .get<ApiResponse<Student>>(`${this.base}/${id}`)
      .pipe(map((r) => r.data));
  }

  getPlacementProgress(studentId: string): Observable<PlacementProgress> {
    return this.http
      .get<ApiResponse<PlacementProgress>>(`${this.base}/${studentId}/placement-progress`)
      .pipe(map((r) => r.data));
  }

  getNotifications(studentId: string): Observable<AppNotification[]> {
    return this.http
      .get<ApiResponse<AppNotification[]>>(`${this.base}/${studentId}/notifications`)
      .pipe(map((r) => r.data));
  }

  markNotificationRead(studentId: string, notifId: string): Observable<void> {
    return this.http.patch<void>(
      `${this.base}/${studentId}/notifications/${notifId}/read`,
      {}
    );
  }
}
