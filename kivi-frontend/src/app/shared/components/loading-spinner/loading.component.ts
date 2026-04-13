import { Component, Input } from '@angular/core';
import { CommonModule }     from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-wrapper" [style.padding]="padding">
      <div class="spinner"></div>
      <p *ngIf="message" class="loading-msg">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 2.5px solid var(--color-border);
      border-top-color: var(--color-accent);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-msg { font-size: 0.875rem; color: var(--color-text-muted); }
  `],
})
export class LoadingComponent {
  @Input() message = '';
  @Input() padding = '64px';
}
