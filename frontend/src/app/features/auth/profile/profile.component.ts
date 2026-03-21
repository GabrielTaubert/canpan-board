import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="profile-container">
      <div class="profile-card">
        <h2>Edit Profile</h2>
        <p class="subtitle">Update your personal information</p>

        @if (error()) {
          <div class="alert alert-error">{{ error() }}</div>
        }
        @if (success()) {
          <div class="alert alert-success">Profile updated successfully.</div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              [value]="email"
              disabled
              class="input-disabled"
            />
          </div>

          <div class="form-group">
            <label for="displayName">Display name</label>
            <input
              type="text"
              id="displayName"
              [(ngModel)]="displayName"
              name="displayName"
              placeholder="Your display name"
              (ngModelChange)="error.set(null); success.set(false)"
            />
          </div>

          <div class="form-actions">
            <button type="submit" [disabled]="loading()" class="btn-primary">
              {{ loading() ? 'Saving...' : 'Save changes' }}
            </button>
            <a routerLink="/projects" class="btn-cancel">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 3rem 1rem;
      min-height: 100vh;
      background: #FAFAFA;
    }

    .profile-card {
      width: 100%;
      max-width: 440px;
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border-top: 4px solid #f97216;
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a202c;
      margin: 0 0 0.25rem;
    }

    .subtitle {
      color: #718096;
      font-size: 0.9rem;
      margin: 0 0 1.5rem;
    }

    .alert {
      padding: 0.875rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 1.25rem;
    }

    .alert-error {
      background: #FEF2F2;
      color: #DC2626;
      border: 1px solid #FECACA;
    }

    .alert-success {
      background: #F0FDF4;
      color: #16A34A;
      border: 1px solid #BBF7D0;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: border-color 0.2s;
      background: white;
      box-sizing: border-box;

      &:focus {
        outline: none;
        border-color: #f97216;
        box-shadow: 0 0 0 3px rgba(249, 114, 22, 0.15);
      }
    }

    .input-disabled {
      background: #F9FAFB;
      color: #9CA3AF;
      cursor: not-allowed;
    }

    .form-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1.5rem;
      align-items: center;
    }

    .btn-primary {
      padding: 0.75rem 1.5rem;
      background: #f97216;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover:not(:disabled) {
        background: #e06210;
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }

    .btn-cancel {
      padding: 0.75rem 1rem;
      color: #6B7280;
      text-decoration: none;
      font-size: 0.9rem;

      &:hover {
        color: #374151;
      }
    }
  `],
})
export class ProfileComponent implements OnInit {
  email = '';
  displayName = '';

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.user();
    if (user) {
      this.email = user.email;
      this.displayName = user.displayName ?? '';
    }
  }

  onSubmit(): void {
    this.error.set(null);
    this.success.set(false);

    if (!this.displayName.trim()) {
      this.error.set('Display name must not be empty.');
      return;
    }

    this.loading.set(true);

    this.authService.updateProfile(this.displayName.trim()).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: (err: { status?: number; error?: { message?: string } | string }) => {
        this.loading.set(false);
        if (err.status === 0) {
          this.error.set('Could not connect to the server. Please try again.');
        } else if (err.status != null && err.status >= 500) {
          this.error.set('A server error occurred. Please try again later.');
        } else {
          const message = typeof err.error === 'string'
            ? err.error
            : (err.error as { message?: string })?.message;
          this.error.set(message || 'Failed to update profile. Please try again.');
        }
      },
    });
  }
}
