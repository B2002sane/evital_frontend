import { Component, OnInit } from '@angular/core';
import { UtilisateurService, Utilisateur } from 'src/app/service/utilisateur.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { GestionChambreService } from 'src/app/service/gestion-chambre.service';

interface PatientAvecChambre extends Utilisateur {
  numeroChambre?: string;
  numeroLit?: number;
}

interface Lit {
  numero: number;
  patientId?: string | null;
  occupé: boolean;
}

interface Chambre {
  id?: string;
  numero: string;
  disponible: boolean;
  nombreLits: number;
  lits?: Lit[];
  patients?: Utilisateur[];
  raison?: string;
}

@Component({
  selector: 'app-patient',
  imports: [CommonModule, FormsModule],
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss']
})
export class PatientComponent implements OnInit {
  patients: PatientAvecChambre[] = [];
  searchTerm: string = '';
  filteredPatients: PatientAvecChambre[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 6;
  hospitalisationFilter: boolean | null = null; // null = tous les patients
  chambres: any[] = [];
  
  // Variables pour le modal d'hospitalisation
  showHospitalisationModal: boolean = false;
  selectedPatient: PatientAvecChambre | null = null;
  chambresDisponibles: Chambre[] = [];
  selectedChambre: Chambre | null = null;

  constructor(
    private utilisateurService: UtilisateurService, 
    private router: Router,
    private gestionChambreService: GestionChambreService
  ) {}

  ngOnInit(): void {
    // Charger d'abord les chambres
    this.gestionChambreService.getChambresList().subscribe({
      next: (response) => {
        this.chambres = response.chambres;
        
        // Ensuite charger les patients
        this.chargerPatients();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des chambres', error);
        // Charger quand même les patients en cas d'erreur
        this.chargerPatients();
      }
    });
  }
  
  chargerPatients(): void {
    this.utilisateurService.getPatients().subscribe({
      next: (data) => {
        // Pour chaque patient, vérifier s'il est hospitalisé dans une chambre
        this.patients = data.map(patient => {
          const patientAvecChambre: PatientAvecChambre = { ...patient };
          
          if (patient.hospitalisation) {
            // Chercher le patient dans les lits des chambres
            for (const chambre of this.chambres) {
              if (chambre.lits) {
                for (const lit of chambre.lits) {
                  if (lit.patientId === patient.id) {
                    patientAvecChambre.numeroChambre = chambre.numero;
                    patientAvecChambre.numeroLit = lit.numero;
                    break;
                  }
                }
              }
            }
          }
          
          return patientAvecChambre;
        });
        
        this.applyFilters();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des patients', error);
      }
    });
  }
  
  // Appliquer tous les filtres (recherche par nom et filtre d'hospitalisation)
  applyFilters(): void {
    let result = this.patients;
    
    // Filtrer par nom et prénom
    if (this.searchTerm) {
      result = result.filter(patient =>
        (patient.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        patient.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }
    
    // Filtrer par statut d'hospitalisation si un filtre est appliqué
    if (this.hospitalisationFilter !== null) {
      result = result.filter(patient => 
        patient.hospitalisation === this.hospitalisationFilter && 
        patient.role === 'PATIENT'
      );
    } else {
      // Si aucun filtre d'hospitalisation, montrer uniquement les patients
      result = result.filter(patient => patient.role === 'PATIENT');
    }
    
    this.filteredPatients = result;
    this.currentPage = 1;
  }
  
  // Filtre par recherche
  filterPatients(): void {
    this.applyFilters();
  }
  
  // Filtre par hospitalisation
  filterByHospitalisation(isHospitalized: boolean | null): void {
    this.hospitalisationFilter = isHospitalized;
    this.applyFilters();
  }
  
  // Pagination
  paginatedPatients(): PatientAvecChambre[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredPatients.slice(start, start + this.itemsPerPage);
  }
  
  totalPages(): number {
    return Math.ceil(this.filteredPatients.length / this.itemsPerPage);
  }
  
  getPages(): number[] {
    return Array(this.totalPages()).fill(0).map((_, i) => i + 1);
  }
  
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
    }
  }
  
  goToPage(page: number): void {
    this.currentPage = page;
  }

  editPatient(patientId: string) {
    this.router.navigate(['/sample-page', patientId]);
  }

  // Hospitaliser un patient - ouvre le modal
  hospitaliserPatient(patientId: string): void {
    // Trouver le patient dans la liste
    const patient = this.patients.find(p => p.id === patientId);
    
    if (patient) {
      this.selectedPatient = patient;
      
      // Charger les chambres disponibles
      this.gestionChambreService.getChambresDisponibles().subscribe({
        next: (response) => {
          this.chambresDisponibles = response.chambres.map((chambre: any) => ({
            ...chambre,
            patients: chambre.patients?.map((patient: any) => ({
              ...patient,
              telephone: patient.telephone || '',
              matricule: patient.matricule || '',
              adresse: patient.adresse || '',
              email: patient.email || '',
              genre: patient.genre || ''
            }))
          }));
          this.showHospitalisationModal = true;
          this.selectedChambre = null; // Réinitialiser la sélection
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des chambres disponibles', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de charger les chambres disponibles.',
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK'
          });
        }
      });
    }
  }
  
  // Fermer le modal d'hospitalisation
  closeHospitalisationModal(): void {
    this.showHospitalisationModal = false;
    this.selectedPatient = null;
    this.selectedChambre = null;
  }
  
  // Sélectionner une chambre
  selectChambre(chambre: Chambre): void {
    this.selectedChambre = chambre;
  }
  
  // Obtenir le nombre de lits disponibles dans une chambre
  getLitsDisponibles(chambre: Chambre): number {
    if (!chambre.lits) return 0;
    
    return chambre.lits.filter(lit => !lit.occupé).length;
  }
  
  // Trouver le premier lit disponible dans une chambre
  getPremierLitDisponible(chambre: Chambre): Lit | null {
    if (!chambre.lits) return null;
    
    const litDisponible = chambre.lits.find(lit => !lit.occupé);
    return litDisponible || null;
  }
  
// Confirmer l'hospitalisation
confirmerHospitalisation(): void {
  if (!this.selectedPatient || !this.selectedChambre || !this.selectedChambre.id) {
    return;
  }
  
  const litDisponible = this.getPremierLitDisponible(this.selectedChambre);
  
  if (!litDisponible) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: 'Aucun lit disponible dans cette chambre.',
      confirmButtonColor: '#d33',
      confirmButtonText: 'OK'
    });
    return;
  }
  
  // Assigner le lit au patient
  this.gestionChambreService.assignerLit(
    this.selectedChambre.id,
    this.selectedPatient.id,
    litDisponible.numero
  ).subscribe({
    next: (response) => {
      console.log('Patient hospitalisé avec succès:', response);
      
      // Mettre à jour le statut du patient
      // Créer une copie complète de l'utilisateur avec la mise à jour
      const updatedPatient = { ...this.selectedPatient!, hospitalisation: true };
      
      this.utilisateurService.updateUtilisateur(this.selectedPatient!.id!, updatedPatient).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: `Patient ${this.selectedPatient!.nom} ${this.selectedPatient!.prenom} hospitalisé dans la chambre ${this.selectedChambre!.numero}, lit ${litDisponible.numero}.`,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
          }).then(() => {
            this.closeHospitalisationModal();
            this.ngOnInit(); // Recharger les données
          });
        },
        error: (error) => {
          console.error("Erreur lors de la mise à jour du statut d'hospitalisation du patient", error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: "Erreur lors de la mise à jour du statut d'hospitalisation.",
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK'
          });
        }
      });
    },
    error: (error) => {
      console.error("Erreur lors de l'assignation du lit", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: "Erreur lors de l'assignation du lit.",
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK'
      });
    }
  });
}

  // Fonction pour calculer l'âge à partir de la date de naissance
  calculateAge(dateNaissance: string): number {
    const birthDate = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();

    // Si l'anniversaire n'est pas encore passé cette année, diminuer l'âge d'un an
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  // Fonction pour supprimer un patient avec confirmation via SweetAlert2
  deletePatient(id: string): void {
    // Utilisation de SweetAlert2 pour confirmation
    Swal.fire({
      title: 'Êtes-vous sûr de vouloir suppimer ce patient?',
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        // Si l'utilisateur confirme, on supprime le patient
        this.utilisateurService.deleteUtilisateur(id).subscribe({
          next: () => {
            console.log('Patient supprimé avec succès !');
  
            // SweetAlert pour succès
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: 'Patient supprimé avec succès !',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'OK'
            }).then(() => {
              // Recharger la liste des patients après le clic sur "OK"
              this.ngOnInit();
            });
          },
          error: (error) => {
            console.error('Erreur lors de la suppression du patient', error);
  
            // SweetAlert pour erreur
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Erreur lors de la suppression du patient !',
              confirmButtonColor: '#d33',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    });
  }

  // Voir les détails du patient
  viewPatientDetails(patientId: string): void {
    this.router.navigate(['/patient-details', patientId]);
  }

  dossierMedical(patientId: string): void {
    this.router.navigate(['/dossier-medical', patientId]);
  }
}