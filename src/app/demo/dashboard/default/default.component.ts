// angular import
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlyBarChartComponent } from 'src/app/theme/shared/apexchart/monthly-bar-chart/monthly-bar-chart.component';
import { IncomeOverviewChartComponent } from 'src/app/theme/shared/apexchart/income-overview-chart/income-overview-chart.component';
// icons
import { IconService, IconDirective } from '@ant-design/icons-angular';
import { FallOutline, GiftOutline, MessageOutline, RiseOutline, SettingOutline } from '@ant-design/icons-angular/icons';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { LoginService } from 'src/app/service/login.service';
import { Utilisateur, UtilisateurService } from 'src/app/service/utilisateur.service';
import { GestionChambreService } from 'src/app/service/gestion-chambre.service';




@Component({
  selector: 'app-default',
  imports: [
    CommonModule,
    MonthlyBarChartComponent,
    IncomeOverviewChartComponent
  ],
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent  {
 
  utilisateurs: Utilisateur[] = [];
  statistiques: any = {
    total_medecins: 0,
    total_patients: 0,
    total_infirmiers: 0,
    total_chambres: 0
  };
   chambres: any[] = [];
   compterchambre: number = 0;
  


  currentUser: { id: string; nom: string; prenom: string; role: string } | null = null;
  currentDate: Date = new Date(); // Date actuelle

  // constructeur
    constructor(private LoginService : LoginService , private utilisateurService:UtilisateurService , private gestionChambreService:GestionChambreService) {
    
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadStatistiques();
    //this.loadUtilisateurs();
  }

  loadCurrentUser(): void {
    // Utilisez la méthode getCurrentUser() pour récupérer l'utilisateur actuel
    this.currentUser = this.LoginService.getCurrentUser();
    console.log('Utilisateur actuel:', this.currentUser);

  }


  loadStatistiques(): void {
    // Récupération des médecins
    this.utilisateurService.getUtilisateursParRoles(['MEDECIN', 'MEDECIN_CHEF']).subscribe(
      (medecins) => {
        this.statistiques.total_medecins = medecins.length;

      },
      (error) => {
        console.error('Erreur lors de la récupération des médecins:', error);
      }
    );
    
    // Récupération des patients
    this.utilisateurService.getPatients().subscribe(
      (patients) => {
        this.statistiques.total_patients = patients.length;
      },
      (error) => {
        console.error('Erreur lors de la récupération des patients:', error);
      }
    );

    this.gestionChambreService.getChambresList().subscribe( response => {
      this.chambres = response.chambres;
      this.compterchambre = this.chambres.length;
    }

    )
    
    // Récupération des infirmiers
    this.utilisateurService.getUtilisateursParRoles(['INFIRMIER']).subscribe(
      (infirmiers) => {
        this.statistiques.total_infirmiers = infirmiers.length;
      },
      (error) => {
        console.error('Erreur lors de la récupération des infirmiers:', error);
      }
    );
 
  }
  
 



 
}
