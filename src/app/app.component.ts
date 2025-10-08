import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AuthService } from './User/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  template: `
    <div class="app-container">
      <app-sidebar *ngIf="showSidebar()"></app-sidebar>
      <main [class.main-content]="showSidebar()"
            [class.full-width]="!showSidebar()">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      min-height: 100vh;
      background: var(--gray-50);
      position: relative;
    }
    
    .main-content {
      flex: 1;
      margin-left: 250px;
      padding: 24px;
      transition: all var(--transition-normal);
      min-height: 100vh;
      background: linear-gradient(135deg, var(--gray-50) 0%, rgba(255,255,255,0.8) 100%);
      position: relative;
    }
    
    .full-width {
      flex: 1;
      margin-left: 0;
      padding: 0;
      background: linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%);
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
        padding: 16px;
      }
    }

    /* Tablet */
    @media (min-width: 769px) and (max-width: 1023px) {
      .main-content {
        margin-left: 240px;
        padding: 20px;
      }
    }

    /* Desktop Large */
    @media (min-width: 1440px) {
      .main-content {
        margin-left: 280px;
        padding: 32px;
      }
    }
  `]
})
export class AppComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  isAuthRoute(): boolean {
    const currentRoute = this.router.url;
    return currentRoute.includes('/login') || currentRoute.includes('/register');
  }

  showSidebar(): boolean {
    return this.authService.isAuthenticated() && !this.isAuthRoute();
  }
}
