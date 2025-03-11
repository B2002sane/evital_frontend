
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from '../service/login.service';

@Injectable({
  providedIn: 'root',
})
export class LoginDonneurGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role'); // Récupération du rôle stocké

    console.log('Token:', token);
    console.log('User Role:', userRole);

    if (token && (userRole === 'DONNEUR')) {
      return true; // L'utilisateur a un token valide et le bon rôle
    } else {
      console.log('Accès refusé : utilisateur non autorisé');
      this.router.navigate(['/login-donneur']);
      return false; // Accès refusé
    }
  }
}