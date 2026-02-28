import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthResponse } from '../../models/auth.model';
import { theme } from '../../../theme';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-left">
        <div class="brand">
          <span class="brand-icon">◈</span>
          <span class="brand-text">CanPan</span>
        </div>
        <div class="hero-text">
          <h1>Welcome back</h1>
          <p>Sign in to access your dashboard</p>
        </div>
      </div>
      
      <div class="auth-right">
        <div class="auth-card">
          <h2>Sign in</h2>
          <p class="subtitle">Enter your credentials to continue</p>
          
          @if (error()) {
            <div class="alert alert-error">
              {{ error() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                [(ngModel)]="email" 
                name="email"
                required
                email
                placeholder="name@company.com"
              />
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input 
                type="password" 
                id="password" 
                [(ngModel)]="password" 
                name="password"
                required
                placeholder="••••••••"
              />
            </div>

            <button type="submit" [disabled]="loading()" class="btn-primary">
              {{ loading() ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>

          <p class="auth-footer">
            Don't have an account? <a routerLink="/register">Create one</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .auth-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 100vh;
    }

    .auth-left {
      background: linear-gradient(135deg, #FF8C00 0%, #FFB347 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 3rem;
      color: white;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 3rem;
    }

    .brand-icon {
      font-size: 2rem;
    }

    .brand-text {
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .hero-text h1 {
      font-size: 3rem;
      font-weight: 700;
      margin: 0 0 0.5rem;
      letter-spacing: -1px;
    }

    .hero-text p {
      font-size: 1.125rem;
      opacity: 0.9;
      margin: 0;
    }

    .auth-right {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: #FAFAFA;
    }

    .auth-card {
      width: 100%;
      max-width: 380px;
    }

    .auth-card h2 {
      font-size: 1.75rem;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 0.25rem;
    }

    .subtitle {
      color: #666;
      margin: 0 0 2rem;
      font-size: 0.9rem;
    }

    .alert {
      padding: 0.875rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }

    .alert-error {
      background: #FEF2F2;
      color: #DC2626;
      border: 1px solid #FECACA;
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
      transition: all 0.2s;
      background: white;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #FF8C00;
      box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
    }

    input::placeholder {
      color: #9CA3AF;
    }

    .btn-primary {
      width: 100%;
      padding: 0.875rem;
      background: #FF8C00;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 0.5rem;
    }

    .btn-primary:hover:not(:disabled) {
      background: #E67E00;
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .auth-footer {
      text-align: center;
      margin-top: 2rem;
      color: #6B7280;
      font-size: 0.9rem;
    }

    .auth-footer a {
      color: #FF8C00;
      text-decoration: none;
      font-weight: 500;
    }

    .auth-footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .auth-container {
        grid-template-columns: 1fr;
      }
      
      .auth-left {
        display: none;
      }
    }
  `]
})
export class LoginComponent {
  theme = theme;
  email = '';
  password = '';
  
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error.set('Please enter email and password');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (_response: AuthResponse) => {
        this.router.navigate(['/']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Invalid email or password');
      }
    });
  }
}
