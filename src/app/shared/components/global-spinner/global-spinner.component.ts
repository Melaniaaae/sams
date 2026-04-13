import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-global-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overlay" *ngIf="loading.isLoading()">
      <div class="spinner-wrap">
        <div class="ring"></div>
        <span class="label">Loading…</span>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(10, 35, 28, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(2px);
    }

    .spinner-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .ring {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(197, 232, 209, 0.25);
      border-top-color: #C5E8D1;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }

    .label {
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: #C5E8D1;
      font-weight: 500;
      letter-spacing: 0.03em;
    }
  `],
})
export class GlobalSpinnerComponent {
  loading = inject(LoadingService);
}