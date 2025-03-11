import { Component, OnInit } from '@angular/core';
import { DemandeDonService } from '../../service/demande-don.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginService } from 'src/app/service/login.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-dashboard-donneur',
  imports: [CommonModule , FormsModule],
  templateUrl: './dashboard-donneur.component.html',
  styleUrls: ['./dashboard-donneur.component.scss']
})
export class DashboardDonneurComponent implements OnInit {
  currentUser: { id: string; nom: string; prenom: string; role: string } | null = null;

  dropdownOpen = false;
  demandes: any[] = [];
  demandesFiltrees: any[] = [];
  demandesAffichees: any[] = [];

  searchTerm: string = '';
  selectedDate: string = '';

  page: number = 1;
  demandesParPage: number = 8;
  totalPages: number = 1;

  constructor(private demandeDonService: DemandeDonService , private loginService:LoginService , private router:Router) {}

  ngOnInit() {
    this.chargerDemandesEnCours();
    this.loadCurrentUser();
  }


 

  loadCurrentUser(): void {
    // Utilisez la méthode getCurrentUser() pour récupérer l'utilisateur actuel
    this.currentUser = this.loginService.getCurrentUser();
    console.log('Utilisateur actuel:', this.currentUser);
  }






  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  chargerDemandesEnCours() {
    this.demandeDonService.getDemandesDisponibles().subscribe(
      (data: any) => {
        if (data && Array.isArray(data.demandesDon)) {
          this.demandes = data.demandesDon;
          this.filtrerDemandes();
        } else {
          console.error("Format de réponse incorrect :", data);
          this.demandes = [];
        }
      },
      (error) => {
        console.error("Erreur lors du chargement des demandes", error);
      }
    );
  }

  filtrerDemandes() {
    this.demandesFiltrees = this.demandes.filter(demande => {
      const correspondRecherche = this.searchTerm === '' ||
        demande.groupeSanguin.toLowerCase().includes(this.searchTerm.toLowerCase());

      const correspondDate = this.selectedDate === '' ||
        demande.created_at.startsWith(this.selectedDate);

      return correspondRecherche && correspondDate;
    });

    this.page = 1;
    this.totalPages = Math.ceil(this.demandesFiltrees.length / this.demandesParPage);
    this.mettreAJourAffichage();
  }

  mettreAJourAffichage() {
    const debut = (this.page - 1) * this.demandesParPage;
    this.demandesAffichees = this.demandesFiltrees.slice(debut, debut + this.demandesParPage);
  }

  pagePrecedente() {
    if (this.page > 1) {
      this.page--;
      this.mettreAJourAffichage();
    }
  }

  pageSuivante() {
    if (this.page < this.totalPages) {
      this.page++;
      this.mettreAJourAffichage();
    }
  }



  onLogout() {
    this.loginService.logout().subscribe({
      next: (response) => {
        if (response.status) {
          console.log('Déconnexion réussie', response.message);
          this.router.navigate(['/login-donneur']);
          
        } else {
          console.log('Erreur lors de la déconnexion', response.message);
        }
      },
      error: (error) => {
        console.error('Erreur de déconnexion', error);
      }
    });
  }


  accepterDemande(demandeId: string) {
    if (!this.currentUser) {
      console.error('Utilisateur non connecté');
      return;
    }
  
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Voulez-vous vraiment accepter cette demande de don de sang ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, accepter',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        // Appel à l'API pour accepter la demande
        this.demandeDonService.accepterDemande(demandeId, this.currentUser.id).subscribe(
          (response) => {
            Swal.fire({
              title: 'Succès',
              text: 'La demande de don a été acceptée avec succès !',
              icon: 'success',
              confirmButtonText: 'OK'
            });
            this.chargerDemandesEnCours(); // Recharger les demandes
          },
          (error) => {
            console.error('Erreur lors de l’acceptation de la demande', error);
            let errorMessage = error.error?.message || 'Une erreur est survenue lors de l’acceptation.';
            Swal.fire({
              title: 'Erreur',
              text: errorMessage,
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        );
      }
    });
  }
  
  



}
