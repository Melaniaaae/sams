import { Injectable, signal, computed } from '@angular/core';

/**
 * Global loading service — tracks concurrent async operations.
 * Increment when a request starts, decrement when it completes.
 * The template checks isLoading() to decide whether to show a spinner.
 *
 * Usage:
 *   loadingService.increment();
 *   someObservable$.pipe(finalize(() => loadingService.decrement())).subscribe(...)
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _count = signal(0);

  /** True if at least one request is in flight. */
  isLoading = computed(() => this._count() > 0);

  increment(): void {
    this._count.update((c) => c + 1);
  }

  decrement(): void {
    this._count.update((c) => Math.max(0, c - 1));
  }

  /** Force-reset — use in error handlers to avoid stuck spinners. */
  reset(): void {
    this._count.set(0);
  }
}
