import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { StudentService } from '../../services/student.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Student, PlacementProgress, Supervisor } from '../../../../shared/models';
import { ProgressRingComponent } from '../../../../shared/components/progress-ring/progress-ring.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ProgressRingComponent, StatusBadgeComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  private studentService = inject(StudentService);
  private auth = inject(AuthService);

  student = signal<Student | null>(null);
  progress = signal<PlacementProgress | null>(null);
  isLoading = signal(true);

  // Mock supervisors (replace with API endpoint when available)
  stationSupervisor: Supervisor = {
    id: 'sup-1',
    name: 'Mr. Brian Ochieng',
    phone: '+254 712 345 678',
    email: 'b.ochieng@safaricom.co.ke',
    type: 'station',
  };

  universitySupervisor: Supervisor = {
    id: 'sup-2',
    name: 'Dr. Ruth Wangeci',
    phone: '+254 722 987 654',
    email: 'r.wangeci@university.ac.ke',
    type: 'university',
  };

  ngOnInit(): void {
  this.auth.currentUser$
    .subscribe(user => {
      if (!user?.id) {
        console.error('User not ready');
        return;
      }

      forkJoin({
        student: this.studentService.getStudent(user.id),
        progress: this.studentService.getPlacementProgress(user.id),
      }).subscribe({
        next: ({ student, progress }) => {
          this.student.set(student);
          this.progress.set(progress);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
        },
      });
    });
}

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
  }

  call(phone: string): void {
    window.location.href = `tel:${phone}`;
  }

  email(address: string): void {
    window.location.href = `mailto:${address}`;
  }
}
