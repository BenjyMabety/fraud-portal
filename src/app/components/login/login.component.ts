import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, LoginRequest } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    if (!this.username || !this.password) {
      this.error = 'Username and password are required';
      return;
    }

    this.loading = true;
    this.error = '';

    const credentials: LoginRequest = {
      userName: this.username,
      password: this.password
    };

    this.apiService.login(credentials).subscribe({
      next: (response: any) => {
        this.authService.setCurrentUser(response.user);
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.error = err.message || 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
