import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtilisateurService , Utilisateur} from 'src/app/service/utilisateur.service';
import { RendezVousService ,RendezVous} from 'src/app/service/rendez-vous.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dossier-medical',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dossier-medical.component.html',
  styleUrls: ['./dossier-medical.component.scss']
})
export class DossierMedicalComponent implements OnInit {
  patient!: Utilisateur; // Utilise le bon type ici
  rendezVousPatient: RendezVous[] = [];
  currentUser: { id: string } | null = null;


  historiqueVisites = [
    { date: '12 Jan 2022', medecin: 'Dr Jacob Ryan', prescription: 'Ordonnance' },
    { date: '12 Jan 2022', medecin: 'Dr Jacob Ryan', prescription: 'Ordonnance' },
    { date: '12 Jan 2022', medecin: 'Dr Jacob Ryan', prescription: 'Ordonnance' }
  ];

  prochainsRendezVous = [
    { date: '12 Jan 2022', medecin: 'DR DIOP', heure: '10h00' },
    { date: '12 Fév 2022', medecin: 'DR DIOP', heure: '11h30' },
    { date: '13 Mar 2022', medecin: 'DR DIOP', heure: '10h00' }
  ];

  constructor(
    private route: ActivatedRoute,
    private utilisateurService: UtilisateurService,
    private rendezVousService: RendezVousService
  ) {}

  ngOnInit(): void {

       // Récupérer l'ID du patient depuis l'URL
       const id = this.route.snapshot.paramMap.get('id');
       if (id) {
           this.utilisateurService.getUtilisateurByIdEdit(id).subscribe({
             next: (response) => {
               if (response.status && response.data) {
                 this.patient = response.data;
           
               }
             },
             error: (err) => {
               console.error('Erreur lors du chargement des détails du patient', err);
               alert('impossible d\'afficher les details d\'un patient');
             }
           })
       }




       if (id) {
        this.utilisateurService.getUtilisateurByIdEdit(id).subscribe({
          next: (response) => {
            if (response.status && response.data) {
              this.patient = response.data;
      
              // Appel pour récupérer les rendez-vous du patient
              this.rendezVousService.getByPatient(this.patient.id!).subscribe({
                next: (res) => {
                  this.rendezVousPatient = res.rendezVous;
                },
                error: (err) => {
                  console.error('Erreur lors du chargement des rendez-vous', err);
                }
              });
            }
          },
          error: (err) => {
            console.error('Erreur lors du chargement des détails du patient', err);
            alert('Impossible d\'afficher les détails du patient');
          }
        });
      }
      

  }

  openOrdonnance(index: number): void {
    console.log('Opening prescription for visit at index', index);
  }

  deconnexion(): void {
    console.log('Logging out');
  }

  prendreRendezVous(): void {
    console.log('Scheduling new appointment');
  }
}
