import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { theme } from '../../../theme';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="app-container">
      <header class="header">
        <div class="header-left">
          <div class="brand">
            <span class="brand-icon">◈</span>
            <span class="brand-text">CanPan</span>
          </div>
        </div>
        
        <div class="header-right">
          @if (authService.isAuthenticated()) {
            <span class="user-email">{{ authService.user()?.email }}</span>
            <button (click)="logout()" class="btn-logout">Sign out</button>
          } @else {
            <a routerLink="/login" class="btn-text">Sign in</a>
            <a routerLink="/register" class="btn-primary-small">Get started</a>
          }
        </div>
      </header>

      <main class="main">
        @if (authService.isAuthenticated()) {
          <div class="dashboard">
            <div class="dashboard-header">
              <h1>Welcome back</h1>
              <p>You're signed in as <strong>{{ authService.user()?.email }}</strong></p>
            </div>
            
            <div class="dashboard-content">
              <div class="card">
                <div class="card-icon">📊</div>
                <h3>Dashboard</h3>
                <p>Your overview will appear here</p>
              </div>
              <div class="card">
                <div class="card-icon">⚙️</div>
                <h3>Settings</h3>
                <p>Manage your preferences</p>
              </div>
              <div class="card">
                <div class="card-icon">📁</div>
                <h3>Projects</h3>
                <p>View your projects</p>
              </div>
            </div>
          </div>
        } @else {
          <div class="hero">
            <h1>Manage your projects <span class="highlight">effortlessly</span></h1>
            <p class="hero-subtitle">CanPan Board helps teams collaborate and track progress with a clean, intuitive interface.</p>
            
            <div class="cta-group">
              <a routerLink="/register" class="btn-primary-large">Start free</a>
              <a routerLink="/login" class="btn-secondary-large">Sign in</a>
            </div>
            
            <div class="features">
              <div class="feature">
                <span class="feature-icon">⚡</span>
                <span>Fast & responsive</span>
              </div>
              <div class="feature">
                <span class="feature-icon">🔒</span>
                <span>Secure authentication</span>
              </div>
              <div class="feature">
                <span class="feature-icon">🎯</span>
                <span>Simple to use</span>
              </div>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #FAFAFA;
    }

    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: white;
      border-bottom: 1px solid #F3F4F6;
    }

    .header-left {
      display: flex;
      align-items: center;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .brand-icon {
      font-size: 1.5rem;
      color: #FF8C00;
    }

    .brand-text {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1a1a1a;
      letter-spacing: -0.5px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-email {
      font-size: 0.875rem;
      color: #6B7280;
    }

    .btn-text {
      color: #374151;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
      padding: 0.5rem 0.75rem;
      transition: color 0.2s;
    }

    .btn-text:hover {
      color: #FF8C00;
    }

    .btn-primary-small {
      background: #FF8C00;
      color: white;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .btn-primary-small:hover {
      background: #E67E00;
      transform: translateY(-1px);
    }

    .btn-logout {
      background: transparent;
      color: #6B7280;
      border: 1px solid #E5E7EB;
      font-weight: 500;
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-logout:hover {
      background: #FEF2F2;
      color: #DC2626;
      border-color: #FECACA;
    }

    .main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
    }

    .hero {
      text-align: center;
      max-width: 600px;
    }

    .hero h1 {
      font-size: 3rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 1rem;
      line-height: 1.1;
      letter-spacing: -1px;
    }

    .highlight {
      color: #FF8C00;
    }

    .hero-subtitle {
      font-size: 1.125rem;
      color: #6B7280;
      margin: 0 0 2rem;
      line-height: 1.6;
    }

    .cta-group {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 3rem;
    }

    .btn-primary-large {
      background: #FF8C00;
      color: white;
      text-decoration: none;
      font-weight: 600;
      font-size: 1rem;
      padding: 0.875rem 2rem;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .btn-primary-large:hover {
      background: #E67E00;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
    }

    .btn-secondary-large {
      background: white;
      color: #374151;
      text-decoration: none;
      font-weight: 600;
      font-size: 1rem;
      padding: 0.875rem 2rem;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
      transition: all 0.2s;
    }

    .btn-secondary-large:hover {
      background: #F9FAFB;
      border-color: #D1D5DB;
    }

    .features {
      display: flex;
      gap: 2rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #6B7280;
      font-size: 0.9rem;
    }

    .feature-icon {
      font-size: 1.1rem;
    }

    .dashboard {
      width: 100%;
      max-width: 900px;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 0.5rem;
    }

    .dashboard-header p {
      color: #6B7280;
      margin: 0;
    }

    .dashboard-header strong {
      color: #FF8C00;
    }

    .dashboard-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      border: 1px solid #F3F4F6;
      transition: all 0.2s;
    }

    .card:hover {
      border-color: #FF8C00;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .card-icon {
      font-size: 1.5rem;
      margin-bottom: 0.75rem;
    }

    .card h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 0.5rem;
    }

    .card p {
      font-size: 0.875rem;
      color: #6B7280;
      margin: 0;
    }

    @media (max-width: 640px) {
      .hero h1 {
        font-size: 2rem;
      }
      
      .cta-group {
        flex-direction: column;
      }
      
      .btn-primary-large,
      .btn-secondary-large {
        width: 100%;
        text-align: center;
      }
    }
  `]
})
export class HomeComponent {
  theme = theme;

  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
