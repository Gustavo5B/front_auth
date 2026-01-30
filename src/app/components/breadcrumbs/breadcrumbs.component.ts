import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface Breadcrumb {
  label: string;
  url?: string;
  active?: boolean;
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol class="breadcrumb-list">
        <li *ngFor="let crumb of breadcrumbs; let last = last" class="breadcrumb-item">
          <a 
            *ngIf="!last && crumb.url" 
            [routerLink]="crumb.url" 
            class="breadcrumb-link">
            {{ crumb.label }}
          </a>
          <span *ngIf="last" class="breadcrumb-current">
            {{ crumb.label }}
          </span>
          <span *ngIf="!last" class="breadcrumb-separator">›</span>
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumbs {
      background: #ffffff;
      padding: 15px 60px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 14px;
    }

    .breadcrumb-list {
      list-style: none;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      padding: 0;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .breadcrumb-link {
      color: #666666;
      text-decoration: none;
      transition: color 0.3s;
    }

    .breadcrumb-link:hover {
      color: #ff6b6b;
      text-decoration: underline;
    }

    .breadcrumb-current {
      color: #000000;
      font-weight: 600;
    }

    .breadcrumb-separator {
      color: #cccccc;
      font-size: 16px;
      user-select: none;
    }

    @media (max-width: 768px) {
      .breadcrumbs {
        padding: 12px 20px;
        font-size: 13px;
      }
    }
  `]
})
export class BreadcrumbsComponent {
  @Input() breadcrumbs: Breadcrumb[] = [];
}