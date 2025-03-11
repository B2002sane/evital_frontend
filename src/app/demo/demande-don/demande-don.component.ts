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
  demandesAcceptees: any[] = [];
  modalVisible = false;
  
  nouvelleDemande = {
    groupeSanguin: '',
    // urgence: 'NORMAL',
    // quantite: 1
  };

  constructor(private demandeDonService: DemandeDonService) {}

  ngOnInit(): void {
    this.getDemandesAcceptees();

  }

  getDemandesAcceptees(): void {
    this.demandeDonService.getAll().subscribe(
      (response: any) => {
        this.demandesAcceptees = response.demandesDon.filter((d: any) => d.status === 'ACCEPTEE');
      },
      (error) => {
        console.error('Erreur lors de la récupération des demandes:', error);
      }
    );
  }

  ouvrirModalDemande(): void {
    this.modalVisible = true;
  }

  fermerModal(): void {
    this.modalVisible = false;
    this.reinitialiserFormulaire();
  }

  reinitialiserFormulaire(): void {
    this.nouvelleDemande = {
      groupeSanguin: '',
      // urgence: 'NORMAL',
      // quantite: 1
    };
  }

  soumettreNouvelleDemande(): void {
    if (!this.nouvelleDemande.groupeSanguin) {
      alert('Veuillez sélectionner un groupe sanguin');
      return;
    }

    this.demandeDonService.createDemande(this.nouvelleDemande).subscribe(
      (response) => {
        console.log('Demande créée avec succès:', response);
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Demande créée avec succès !',
          confirmButtonColor: '#3085d6'
        });
        
        this.fermerModal();
        this.getDemandesAcceptees();
      
      },
      (error) => {
        console.error('Erreur lors de la création de la demande:', error);
        alert('Erreur lors de la création de la demande. Veuillez réessayer.');
      }
    );
  }
}