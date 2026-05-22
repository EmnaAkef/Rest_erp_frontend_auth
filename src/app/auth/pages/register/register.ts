import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  companyName = '';

  selectedPhoto: File | null = null;
  photoPreview: string | null = null;

  loading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedPhoto = null;
      this.photoPreview = null;
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Veuillez sélectionner une image valide.');
      return;
    }

    this.selectedPhoto = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  register(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!this.firstName.trim() || !this.lastName.trim() || !this.email.trim() || !this.companyName.trim()) {
      this.errorMessage.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const formData = new FormData();
    formData.append('firstName', this.firstName.trim());
    formData.append('lastName', this.lastName.trim());
    formData.append('email', this.email.trim());
    formData.append('companyName', this.companyName.trim());

    if (this.selectedPhoto) {
      formData.append('photo', this.selectedPhoto);
    }

    this.loading.set(true);

    this.authService.register(formData).subscribe({
      next: (message) => {
        this.loading.set(false);
        this.successMessage.set(message);

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1800);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error?.error || 'Erreur lors de l’envoi de la demande.');
      },
    });
  }
}