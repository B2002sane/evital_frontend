import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { LoginService } from 'src/app/service/login.service';

@Component({
  selector: 'app-login-donneur',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-donneur.component.html',
  styleUrls: ['./login-donneur.component.scss'],
  providers: [LoginService],
})
export class LoginDonneurComponent implements OnDestroy {
  email: string = '';
  password: string = '';
  emailError: string = '';
  passwordError: string = '';
  serverError: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  emailTouched: boolean = false;
  passwordTouched: boolean = false;

  failedAttempts: number = 0;
  isLocked: boolean = false;
  lockDuration: number = 30;
  remainingTime: number = 0;
  lockTimerSubscription: Subscription | null = null;

  constructor(private router: Router, public loginService: LoginService) {
    this.restoreLockState();
  }

  private incrementFailedAttempts(): void {
    this.failedAttempts++;
    if (this.failedAttempts >= 3) {
      this.isLocked = true;
      this.remainingTime = this.lockDuration;
      this.startLockTimer();
    }
    this.saveLockState();
  }

  private handleFailedAttempt(): void {
    this.incrementFailedAttempts();

    if (this.isLocked) {
      this.serverError = `Trop de tentatives échouées. Compte bloqué pendant ${this.remainingTime} secondes.`;
    } else {
      this.serverError = 'Email ou mot de passe incorrect';
    }
  }

  private resetForm(): void {
    this.email = '';
    this.password = '';
    this.emailError = '';
    this.passwordError = '';
    this.emailTouched = false;
    this.passwordTouched = false;
  }

  updateFormWithRfidData(uid: string) {
    if (this.isLocked) {
      this.serverError = `Trop de tentatives échouées. Compte bloqué pendant ${this.remainingTime} secondes.`;
      return;
    }

    this.isLoading = true;
    this.serverError = '';

    this.loginService.loginbycard(uid).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.resetLockState();
        this.resetForm();

        if (response.user?.role === 'DONNEUR') {
          this.router.navigate(['/dashboard-donneur']);
        } else {
          this.router.navigate(['/donneur']);
        }
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.handleFailedAttempt();
        if (this.isLocked) {
          this.serverError = `Trop de tentatives échouées. Compte bloqué pendant ${this.remainingTime} secondes.`;
        } else {
          this.serverError = error.message || 'Erreur lors de la connexion par RFID';
        }
      }
    });
  }

  private restoreLockState(): void {
    const lockData = localStorage.getItem('loginLockData');
    if (lockData) {
      const data = JSON.parse(lockData);
      const now = new Date().getTime();
      const lockExpiry = data.lockExpiry;

      if (now < lockExpiry) {
        this.isLocked = true;
        this.failedAttempts = data.attempts;
        this.remainingTime = Math.ceil((lockExpiry - now) / 1000);
        this.startLockTimer();
        this.resetForm();
      } else {
        localStorage.removeItem('loginLockData');
        this.resetLockState();
      }
    }
  }

  private saveLockState(): void {
    if (this.isLocked) {
      const now = new Date().getTime();
      const lockExpiry = now + (this.remainingTime * 1000);
      const lockData = { attempts: this.failedAttempts, lockExpiry: lockExpiry };
      localStorage.setItem('loginLockData', JSON.stringify(lockData));
    } else {
      localStorage.removeItem('loginLockData');
    }
  }

  private startLockTimer(): void {
    if (this.lockTimerSubscription) {
      this.lockTimerSubscription.unsubscribe();
    }

    this.lockTimerSubscription = interval(1000)
      .pipe(take(this.remainingTime))
      .subscribe({
        next: () => {
          this.remainingTime--;
          this.saveLockState();
        },
        complete: () => {
          this.resetLockState();
          if (this.serverError.includes('Trop de tentatives échouées')) {
            this.serverError = '';
          }
        }
      });
  }

  private resetLockState(): void {
    this.isLocked = false;
    this.remainingTime = 0;
    this.failedAttempts = 0;
    localStorage.removeItem('loginLockData');

    if (this.serverError.includes('Trop de tentatives échouées')) {
      this.serverError = '';
    }
  }

  validateEmail(): void {
    this.emailTouched = true;
    this.emailError = '';
    if (!this.email) {
      this.emailError = 'L\'email est requis';
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.email)) {
      this.emailError = 'Format d\'email invalide';
    }
  }

  validatePassword(): void {
    this.passwordTouched = true;
    this.passwordError = '';
    if (!this.password) {
      this.passwordError = 'Le mot de passe est requis';
    } else if (this.password.length < 6) {
      this.passwordError = 'Le mot de passe doit contenir au moins 6 caractères';
    }
  }

  isFormValid(): boolean {
    if (this.isLocked) {
      return false;
    }
    if (!this.emailTouched || !this.passwordTouched) {
      return false;
    }
    return !!this.email && !!this.password && !this.emailError && !this.passwordError;
  }

  onLogin() {
    if (this.isLocked) {
      return;
    }

    this.emailTouched = true;
    this.passwordTouched = true;
    this.serverError = '';

    this.validateEmail();
    this.validatePassword();

    if (!this.email || !this.password || this.emailError || this.passwordError) {
      return;
    }

    this.isLoading = true;

    this.loginService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.resetLockState();
        this.resetForm();

        if (response.user?.role === 'DONNEUR') {
          this.router.navigate(['/dashboard-donneur']);
        } else {
          this.router.navigate(['/color']);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.handleFailedAttempt();
        if (error.status === 500) {
          this.serverError = 'Une erreur interne est survenue. Veuillez réessayer plus tard.';
        } else if (error.status === 0) {
          this.serverError = 'Impossible de se connecter au serveur. Vérifiez votre connexion Internet.';
        } else {
          this.serverError = error.error.message || 'Une erreur est survenue lors de la connexion';
        }
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  ngOnDestroy() {
    if (this.lockTimerSubscription) {
      this.lockTimerSubscription.unsubscribe();
    }
  }
}
