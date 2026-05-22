import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  email = '';
  password = '';

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  login(): void {
    this.errorMessage.set(null);

    if (!this.email || !this.password) {
      this.errorMessage.set('Please enter your email and password.');
      return;
    }

    this.loading.set(true);

    this.authService.login({
      email: this.email,
      password: this.password,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/overview']);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Incorrect email or password.');
      },
    });
  }
}
