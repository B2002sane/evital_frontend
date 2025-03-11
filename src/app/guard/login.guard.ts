// import { CanActivateFn } from '@angular/router';

// export const loginGuard: CanActivateFn = (route, state) => {
//   return true;
// };

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from '../service/login.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role'); // Récupération du rôle stocké

    console.log('Token:', token);
    console.log('User Role:', userRole);

    if (token && (userRole === 'MEDECIN' || userRole === 'MEDECIN_CHEF')) {
      return true; // L'utilisateur a un token valide et le bon rôle
    } else {
      console.log('Accès refusé : utilisateur non autorisé');
      this.router.navigate(['/login']);
      return false; // Accès refusé
    }
  }
}
