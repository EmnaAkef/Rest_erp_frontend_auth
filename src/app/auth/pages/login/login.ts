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

  forgotPasswordMode = signal(false);
  forgotPasswordLoading = signal(false);
  successMessage = signal<string | null>(null);

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

  toggleForgotPassword(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.forgotPasswordMode.set(!this.forgotPasswordMode());
  }

  sendForgotPasswordEmail(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!this.email) {
      this.errorMessage.set('Please enter your email address.');
      return;
    }

    this.forgotPasswordLoading.set(true);

    this.authService.forgotPassword({
      email: this.email,
    }).subscribe({
      next: (message) => {
        this.forgotPasswordLoading.set(false);
        this.successMessage.set(message);
      },
      error: (error) => {
        this.forgotPasswordLoading.set(false);

        if (typeof error?.error === 'string') {
          this.errorMessage.set(error.error);
        } else {
          this.errorMessage.set('Unable to send password reset email.');
        }
      },
    });
  }
}
