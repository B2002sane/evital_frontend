// angular import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Project import
import { AdminComponent } from './theme/layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './theme/layouts/guest-layout/guest-layout.component';
import { LoginGuard } from './guard/login.guard';
import { LoginDonneurGuard } from './guard/login-donneur.guard';




const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: '/dashboard/default',
        pathMatch: 'full'
      },
      {
        path: 'dashboard/default',
        loadComponent: () => import('./demo/dashboard/default/default.component').then((c) => c.DefaultComponent),
        canActivate: [LoginGuard]
      },
      {
        path: 'typography',
        loadComponent: () => import('./demo/component/basic-component/color/color.component').then((c) => c.ColorComponent)
      },
      {
        path: 'color',
        loadComponent: () => import('./demo/component/basic-component/typography/typography.component').then((c) => c.TypographyComponent)
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent),
        canActivate: [LoginGuard]
      },
      {
        path: 'sample-page/:id',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent),
        canActivate: [LoginGuard]
      },
      {
        path: 'rendez-vous',
        loadComponent: () => import('./demo/rendez-vous/rendez-vous.component').then((c) => c.RendezVousComponent),
        canActivate: [LoginGuard]
      },
      {
        path: 'patient',
        loadComponent: () => import('./demo/patient/patient.component').then((c) => c.PatientComponent),
        canActivate: [LoginGuard]
      },
      {
        path: 'patient-details/:id',
        loadComponent: () => import('./demo/patient-details/patient-details.component').then((c) => c.PatientDetailsComponent),
        canActivate: [LoginGuard]
      },
      {
        path: 'personnel-medical',
        loadComponent: () => import('./demo/personnel-medical/personnel-medical.component').then((c) => c.PersonnelMedicalComponent),
        canActivate: [LoginGuard]
      },
      {
        path: 'ajout-personnel',
        loadComponent: () => import('./demo/others/ajout-personnel/ajout-personnel.component').then((c) => c.AjoutPersonnelComponent),
        canActivate: [LoginGuard]
      },
      {
        path: 'edit/personnel/:id',
        loadComponent: () => import('./demo/others/ajout-personnel/ajout-personnel.component').then((c) => c.AjoutPersonnelComponent)
      },
      {
        path: 'gestion-chambre',
        loadComponent: () => import ('./demo/gestion-chambre/gestion-chambre.component').then((c) => c.GestionChambreComponent)
      },
      {
        path: 'demande-don',
        loadComponent: () => import('./demo/demande-don/demande-don.component').then((c) => c.DemandeDonComponent),
        canActivate: [LoginGuard]
      }
    ]
  },
  {
    path: '',
    component: GuestLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./demo/pages/authentication/auth-login/auth-login.component').then((c) => c.AuthLoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./demo/pages/authentication/auth-register/auth-register.component').then((c) => c.AuthRegisterComponent)
      },
      {
        path: 'dashboard-donneur',
        loadComponent: () =>
          import('./demo/dashboard-donneur/dashboard-donneur.component').then((c) => c.DashboardDonneurComponent),
        canActivate: [LoginDonneurGuard]
      },
      {
        path: 'historique-donneur',
        loadComponent: () =>
          import('./demo/historique-dons/historique-dons.component').then((c) => c.HistoriqueDonsComponent),
        canActivate: [LoginDonneurGuard]
      },
      {
        path: 'login-donneur',
        loadComponent: () => import('./demo/pages/authentication/login-donneur/login-donneur.component').then((c) => c.LoginDonneurComponent)
      }
      ,
      {
        path: 'dossier-medical/:id',
        loadComponent: () => import('./demo/dossier-medical/dossier-medical.component').then((c) => c.DossierMedicalComponent),
        canActivate: [LoginGuard]
      }
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
