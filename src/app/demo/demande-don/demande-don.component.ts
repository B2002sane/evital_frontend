import { Component, OnInit } from '@angular/core';
import { DemandeDonService } from '../../service/demande-don.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-demande-don',
  imports: [CommonModule, FormsModule],
  templateUrl: './demande-don.component.html',
  styleUrls: ['./demande-don.component.scss'],
  standalone: true
})
export class DemandeDonComponent implements OnInit {
  demandes: any[] = [];
  demandesAcceptees: any[] = [];
  demandesEnCours: any[] = [];
  modalVisible = false;
  isModification = false;
  demandeEnCours: any = {};
  nombreTotalDemandes = 0;
  nombreDemandesAcceptees = 0;
  nombreDemandesEnCours = 0;
  vueActuelle = 'acceptees'; // 'acceptees' ou 'en_cours'

  constructor(private demandeDonService: DemandeDonService) {}

  ngOnInit(): void {
    this.getDemandes();
  }

  getDemandes(): void {
    this.demandeDonService.getAll().subscribe(
      (response: any) => {
        this.demandes = response.demandesDon;
        this.demandesAcceptees = this.demandes.filter((d: any) => d.status === 'ACCEPTEE');
        this.demandesEnCours = this.demandes.filter((d: any) => d.status === 'EN_COURS');
        this.nombreTotalDemandes = this.demandes.length;
        this.nombreDemandesAcceptees = this.demandesAcceptees.length;
        this.nombreDemandesEnCours = this.demandesEnCours.length;
      },
      (error) => {
        console.error('Erreur lors de la récupération des demandes:', error);
      }
    );
  }

  ouvrirModalDemande(demande?: any): void {
    if (demande) {
      this.isModification = true;
      this.demandeEnCours = { ...demande };
    } else {
      this.isModification = false;
      this.reinitialiserFormulaire();
    }
    this.modalVisible = true;
  }

  fermerModal(): void {
    this.modalVisible = false;
    this.reinitialiserFormulaire();
  }

  reinitialiserFormulaire(): void {
    this.demandeEnCours = {
      groupeSanguin: '',
      // Add other fields as necessary
    };
  }

  soumettreNouvelleDemande(): void {
    if (!this.demandeEnCours.groupeSanguin) {
      alert('Veuillez sélectionner un groupe sanguin');
      return;
    }

    this.demandeDonService.createDemande(this.demandeEnCours).subscribe(
      (response) => {
        console.log('Demande créée avec succès:', response);
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Demande créée avec succès !',
          confirmButtonColor: '#3085d6'
        });

        this.fermerModal();
        this.getDemandes();
      },
      (error) => {
        console.error('Erreur lors de la création de la demande:', error);
        alert('Erreur lors de la création de la demande. Veuillez réessayer.');
      }
    );
  }

  soumettreModificationDemande(): void {
    if (!this.demandeEnCours.groupeSanguin) {
      alert('Veuillez sélectionner un groupe sanguin');
      return;
    }

    this.demandeDonService.updateDemande(this.demandeEnCours.id, this.demandeEnCours).subscribe(
      (response) => {
        console.log('Demande modifiée avec succès:', response);
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Demande modifiée avec succès !',
          confirmButtonColor: '#3085d6'
        });

        this.fermerModal();
        this.getDemandes();
      },
      (error) => {
        console.error('Erreur lors de la modification de la demande:', error);
        alert('Erreur lors de la modification de la demande. Veuillez réessayer.');
      }
    );
  }

  basculerVue(vue: string): void {
    this.vueActuelle = vue;
  }

  modifierDemande(demande: any): void {
    this.ouvrirModalDemande(demande);
  }

  supprimerDemande(demande: any): void {
    Swal.fire({
      title: 'Supprimer la demande',
      text: 'Voulez-vous vraiment supprimer cette demande ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.demandeDonService.deleteDemande(demande.id).subscribe(
          (response) => {
            console.log('Demande supprimée avec succès:', response);
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: 'Demande supprimée avec succès !',
              confirmButtonColor: '#3085d6'
            });
            this.getDemandes();
          },
          (error) => {
            console.error('Erreur lors de la suppression de la demande:', error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Erreur lors de la suppression de la demande. Veuillez réessayer.',
              confirmButtonColor: '#3085d6'
            });
          }
        );
      }
    });
  }
}
