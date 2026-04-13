import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { StudentService } from '../../services/student.service';
import { LogbookService } from '../../services/logbook.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PlacementProgress, WeeklyLog, AppNotification } from '../../../../shared/models';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ProgressRingComponent } from '../../../../shared/components/progress-ring/progress-ring.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { NotificationDropdownComponent } from '../../../../shared/components/notification-dropdown/notification-dropdown.component';

interface CalendarCell {
  day: number | null;
  submitted: boolean;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    ProgressRingComponent,
    StatusBadgeComponent,
    NotificationDropdownComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class StudentDashboardComponent implements OnInit {
  private studentService = inject(StudentService);
  private logbookService = inject(LogbookService);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;

  progress = signal<PlacementProgress | null>(null);
  recentLogs = signal<WeeklyLog[]>([]);
  notifications = signal<AppNotification[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  get logsSubmitted(): number {
    return this.recentLogs().filter(
      (l) => l.status === 'submitted' || l.status === 'reviewed'
    ).length;
  }

  get totalWeeks(): number {
    const p = this.progress();
    return p ? Math.ceil(p.daysTotal / 7) : 12;
  }

  /** Build calendar cells for the current month grid. */
  get calendarCells(): CalendarCell[] {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Day-of-week offset: Monday = 0
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;

    // Which days have submitted logs (from recentLogs)
    const submittedDays = new Set(
      this.recentLogs()
        .filter((l) => l.status === 'submitted' || l.status === 'reviewed')
        .map((l) => new Date(l.weekStart).getDate())
    );

    const cells: CalendarCell[] = [];

    // Leading empty cells
    for (let i = 0; i < firstDow; i++) {
      cells.push({ day: null, submitted: false, isToday: false, isPast: false, isFuture: false });
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        submitted: submittedDays.has(d),
        isToday: d === today,
        isPast: d < today,
        isFuture: d > today,
      });
    }

    // Trailing cells to complete final row
    const remainder = cells.length % 7;
    if (remainder !== 0) {
      for (let i = 0; i < 7 - remainder; i++) {
        cells.push({ day: null, submitted: false, isToday: false, isPast: false, isFuture: false });
      }
    }

    return cells;
  }

  ngOnInit(): void {
  const studentId = this.currentUser?.id;

  if (!studentId) {
    this.error.set('User not found. Please log in again.');
    return;
  }

  this.isLoading.set(true);

  forkJoin({
    progress: this.studentService.getPlacementProgress(studentId),
    logs: this.logbookService.getWeeklyLogs(studentId),
    notifications: this.studentService.getNotifications(studentId),
  }).subscribe({
    next: ({ progress, logs, notifications }) => {
      this.progress.set(progress);
      this.recentLogs.set(logs.slice(0, 8));
      this.notifications.set(notifications);
      this.isLoading.set(false);
    },
    error: (err) => {
      this.error.set('Failed to load dashboard data.');
      this.isLoading.set(false);
      console.error(err);
    },
  });
}

  trackByLogId(_: number, log: WeeklyLog): string { return log.id; }
}
