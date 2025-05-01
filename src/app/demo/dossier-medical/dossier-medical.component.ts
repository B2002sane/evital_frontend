import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtilisateurService, Utilisateur } from 'src/app/service/utilisateur.service';
import { RendezVousService, RendezVous } from 'src/app/service/rendez-vous.service';
import { ActivatedRoute } from '@angular/router';
import { DossierMedicalService } from 'src/app/service/dossier-medical.service';
import { VisiteService, Prescription, Visite } from 'src/app/service/visites.service';
import { LoginService } from 'src/app/service/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dossier-medical',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dossier-medical.component.html',
  styleUrls: ['./dossier-medical.component.scss']
})
export class DossierMedicalComponent implements OnInit {
  patient!: Utilisateur;
  rendezVousPatient: RendezVous[] = [];
  visitesPatient: any[] = [];
  currentUser: { id: string; nom: string; prenom: string; role: string } | null = null;

    // Pagination pour les rendez-vous
  currentPageRdv: number = 1;
  itemsPerPage: number = 6;

  // Pagination pour les visites
  currentPageVisites: number = 1;


  showModalAjoutVisite: boolean = false;

  nouvelleVisite: {
    prescriptions: Prescription[];
    nom_medicament?: string;
    frequence?: string;
  } = {
    prescriptions: []
  };

  constructor(
    private route: ActivatedRoute,
    private utilisateurService: UtilisateurService,
    private rendezVousService: RendezVousService,
    private dossierMedicalService: DossierMedicalService,
    private visiteService: VisiteService,
    private LoginService: LoginService
  ) {}

  loadCurrentUser(): void {
    this.currentUser = this.LoginService.getCurrentUser();
    console.log('Utilisateur actuel:', this.currentUser);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.utilisateurService.getUtilisateurByIdEdit(id).subscribe({
        next: (response) => {
          if (response.status && response.data) {
            this.patient = response.data;

            this.rendezVousService.getByPatient(this.patient.id!).subscribe({
              next: (res) => {
                this.rendezVousPatient = res.rendezVous;
              },
              error: (err) => {
                console.error('Erreur lors du chargement des rendez-vous', err);
                Swal.fire('Erreur', 'Erreur lors du chargement des rendez-vous', 'error');
              }
            });

            this.visiteService.getByPatient(this.patient.id!).subscribe({
              next: (res) => {
                this.visitesPatient = res.data;
                console.log('Visites du patient:', this.visitesPatient);
              },
              error: (err) => {
                console.error('Erreur lors du chargement des visites du patient', err);
                Swal.fire('Erreur', 'Erreur lors du chargement des visites du patient', 'error');
              }
            });
          }
        },
        error: (err) => {
          console.error('Erreur lors du chargement des détails du patient', err);
          Swal.fire('Erreur', 'Impossible d\'afficher les détails du patient', 'error');
        }
      });
    }
    this.loadCurrentUser(); 
  }

  selectedVisite: any = null;

  openOrdonnance(index: number): void {
    this.selectedVisite = this.visitesPatient[index];
    console.log('Ordonnance ouverte pour la visite :', this.selectedVisite);
  }

  closeModal(): void {
    this.selectedVisite = null;
  }

  deconnexion(): void {
    console.log('Logging out');
  }


  ouvrirModalAjout(): void {
    this.showModalAjoutVisite = true;
    this.nouvelleVisite = { prescriptions: [] };
  }

  fermerModalAjout(): void {
    this.showModalAjoutVisite = false;
  }

  ajouterPrescription(): void {
    const { nom_medicament, frequence } = this.nouvelleVisite;
    if (nom_medicament && frequence) {
      this.nouvelleVisite.prescriptions.push({ nom_medicament, frequence });
      this.nouvelleVisite.nom_medicament = '';
      this.nouvelleVisite.frequence = '';
    } else {
      Swal.fire('Champs manquants', 'Remplissez les deux champs', 'warning');
    }
  }

  supprimerPrescription(index: number): void {
    this.nouvelleVisite.prescriptions.splice(index, 1);
  }

  validerAjoutVisite(): void {
    const medecinId = this.currentUser?.id;
    if (!medecinId || !this.patient.id) {
      Swal.fire('Erreur', 'Données incomplètes pour valider la visite', 'error');
      return;
    }

    const visite: Visite = {
      medecinId: medecinId,
      patientId: this.patient.id,
      prescriptions: this.nouvelleVisite.prescriptions
    };

    this.visiteService.createVisite(visite).subscribe({
      next: (res) => {
        this.visitesPatient.push(res.data);
        this.fermerModalAjout();
        Swal.fire('Succès', 'Visite ajoutée avec succès', 'success');
      },
      error: (err) => {
        console.error('Erreur ajout visite', err);
        Swal.fire('Erreur', 'Erreur lors de l\'ajout de la visite', 'error');
      }
    });
  }



  get paginatedRendezVous(): RendezVous[] {
    const start = (this.currentPageRdv - 1) * this.itemsPerPage;
    return this.rendezVousPatient.slice(start, start + this.itemsPerPage);
  }
  
  get paginatedVisites(): any[] {
    const start = (this.currentPageVisites - 1) * this.itemsPerPage;
    return this.visitesPatient.slice(start, start + this.itemsPerPage);
  }
  
  get totalPagesRdv(): number {
    return Math.ceil(this.rendezVousPatient.length / this.itemsPerPage);
  }
  
  get totalPagesVisites(): number {
    return Math.ceil(this.visitesPatient.length / this.itemsPerPage);
  }
  

  changerPageRdv(page: number): void {
    if (page >= 1 && page <= this.totalPagesRdv) {
      this.currentPageRdv = page;
    }
  }
  
  changerPageVisites(page: number): void {
    if (page >= 1 && page <= this.totalPagesVisites) {
      this.currentPageVisites = page;
    }
  }

  /*************************************************** */


  showModalRdv: boolean = false;

  nouveauRdv: {
    date?: string;
    heure?: string;
    motif?: string;
  } = {};

  get minDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  ouvrirModalRdv(): void {
    this.showModalRdv = true;
    this.nouveauRdv = {};
  }

  fermerModalRdv(): void {
    this.showModalRdv = false;
  }


  creerRendezVous(): void {
    const { date, heure, motif } = this.nouveauRdv;
    if (!date || !heure || !motif || !this.patient?.id || !this.currentUser?.id) {
      Swal.fire('Erreur', 'Tous les champs sont requis', 'error');
      return;
    }
  
    const rendezVous: RendezVous = {
      date: `${date}T${heure}`,
      motif,
      medecinId: this.currentUser.id,
      patientId: this.patient.id,
     
    };
  
    this.rendezVousService.create(rendezVous).subscribe({
      next: (res) => {
        this.rendezVousPatient.push(res.rendezVous);
        Swal.fire('Succès', 'Rendez-vous créé avec succès', 'success');
        this.fermerModalRdv();
      },
      error: () => {
        Swal.fire('Erreur', 'Échec de la création du rendez-vous', 'error');
      }
    });
  }
  
  
}
