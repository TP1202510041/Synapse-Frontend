import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div class="app-container">
      <h1>🚀 Synapse Frontend - Funcionando!</h1>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      padding: 20px;
      text-align: center;
    }
    
    h1 {
      color: #007bff;
      margin-bottom: 20px;
    }
  `]
})
export class AppComponentSimple {
  title = 'Synapse Frontend';
}