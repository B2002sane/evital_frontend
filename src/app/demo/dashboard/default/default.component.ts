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


@Component({
  selector: 'app-default',
  imports: [
    CommonModule,
    CardComponent,
   // IconDirective,
    MonthlyBarChartComponent,
    IncomeOverviewChartComponent
  ],
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent  {
  private iconService = inject(IconService);
 

  utilisateurs: Utilisateur[] = [];
  statistiques: any = {};

  currentUser: { id: string; nom: string; prenom: string; role: string } | null = null;

  // constructor
    constructor(private LoginService : LoginService , private utilisateurService:UtilisateurService) {
    this.iconService.addIcon(...[RiseOutline, FallOutline, SettingOutline, GiftOutline, MessageOutline]);
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    //this.loadUtilisateurs();
  }

  loadCurrentUser(): void {
    // Utilisez la méthode getCurrentUser() pour récupérer l'utilisateur actuel
    this.currentUser = this.LoginService.getCurrentUser();
    console.log('Utilisateur actuel:', this.currentUser);
  }

 



 
}
