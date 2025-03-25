import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UtilisateurService } from 'src/app/service/utilisateur.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

// project import
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

@Component({
  selector: 'app-sample-page',
  standalone: true,
  imports: [CommonModule, CardComponent, ReactiveFormsModule],
  templateUrl: './sample-page.component.html',
  styleUrls: ['./sample-page.component.scss']
})
export class SamplePageComponent implements OnInit {
  patientId: string | null = null;
  patientForm: FormGroup;
  today: string = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
  isHomme: boolean = false; // Pour cacher l'option "Femme Enceinte"
  isLoading: boolean = false;
  isEditMode: boolean = false;
  pageTitle: string = 'Ajout d\'un patient';
  photoPreview: string | null = null;
  photoFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private utilisateurService: UtilisateurService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.patientForm = this.createForm();
  }

  ngOnInit(): void {
    // Déterminer si nous sommes en mode édition en vérifiant les paramètres de route
    this.route.params.subscribe(params => {
      this.patientId = params['id'];
      if (this.patientId) {
        this.isEditMode = true;
        this.pageTitle = 'Modification d\'un patient';
        this.loadPatientData(this.patientId);

        // En mode édition, le mot de passe n'est pas requis
        this.patientForm.get('password')?.clearValidators();
        this.patientForm.get('password')?.updateValueAndValidity();
      }
    });

    // Écoute les changements de genre pour désactiver la catégorie "Femme enceinte"
    this.patientForm.get('genre')?.valueChanges.subscribe(value => {
      this.isHomme = value === 'HOMME';
      if (this.isHomme && this.patientForm.get('categorie')?.value === 'FEMME_ENCEINTE') {
        this.patientForm.get('categorie')?.setValue('');
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      dateNaissance: ['', Validators.required],
      genre: ['', Validators.required],
      groupeSanguin: ['', Validators.required],
      poids: ['', [Validators.required, Validators.min(1)]],
      categorie: ['', Validators.required],
      adresse: ['', Validators.required],
      photo: [''],
      role: ['PATIENT'],
      password: ['', this.isEditMode ? [] : [Validators.required]]
    });
  }

  get f() { return this.patientForm.controls; }

  loadPatientData(id: string): void {
    this.isLoading = true;
    this.utilisateurService.getUtilisateurByIdEdit(id).subscribe({
      next: (response) => {
        if (response.status && response.data) {
          // Accéder aux données à travers response.data
          const patient = response.data;

          // Préremplir le formulaire avec les données existantes
          this.patientForm.patchValue({
            nom: patient.nom,
            prenom: patient.prenom,
            email: patient.email,
            telephone: patient.telephone,
            dateNaissance: patient.dateNaissance,
            genre: patient.genre,
            groupeSanguin: patient.groupeSanguin,
            poids: patient.poids,
            categorie: patient.categorie || '',  // Au cas où ce champ n'existe pas dans la réponse
            adresse: patient.adresse || '',      // Au cas où ce champ n'existe pas dans la réponse
            photo: patient.photo || '',          // Au cas où ce champ n'existe pas dans la réponse
            role: patient.role,
            password: ''  // Vider le champ mot de passe en mode édition
          });

          // Afficher la photo existante si disponible
          if (patient.photo) {
            this.photoPreview = patient.photo;
          }

          // Mise à jour de isHomme en fonction du genre chargé
          this.isHomme = patient.genre === 'HOMME';
        } else {
          // Gérer le cas où response.data est absent
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Données patient incorrectes ou manquantes',
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK'
          }).then(() => {
            this.router.navigate(['/patient']);
          });
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données du patient', error);

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les données du patient',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/patient']);
        });

        this.isLoading = false;
      }
    });
  }

  onPhotoChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length) {
      this.photoFile = input.files[0];

      // Prévisualisation de l'image
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result as string;
      };
      reader.readAsDataURL(this.photoFile);
    }
  }

  removePhoto() {
    this.photoPreview = null;
    this.photoFile = null;
    this.patientForm.get('photo')?.setValue('');
  }

  onSubmit() {
    if (this.patientForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.patientForm.controls).forEach(key => {
        const control = this.patientForm.get(key);
        control?.markAsTouched();
      });

      return;
    }

    // Préparer les données
    const formData = {...this.patientForm.value};

    // Gérer le cas où le mot de passe est vide en mode édition
    if (this.isEditMode && !formData.password) {
      delete formData.password;
    }

    // Ajouter l'URL de la photo si disponible
    if (this.photoPreview && this.photoFile) {
      // Dans un cas réel, vous utiliseriez un service pour télécharger la photo
      // et obtenir l'URL, mais pour cet exemple, nous allons simuler
      formData.photo = this.photoPreview;
    }

    if (this.isEditMode && this.patientId) {
      // Mode modification
      this.utilisateurService.updateUtilisateur(this.patientId, formData).subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Patient mis à jour avec succès !',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
          }).then(() => {
            this.router.navigate(['/patient']);
          });
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur est survenue lors de la mise à jour.',
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK'
          });
        }
      });
    } else {
      // Mode ajout
      this.utilisateurService.createUtilisateur(formData).subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Patient ajouté avec succès !',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
          }).then(() => {
            this.router.navigate(['/patient']);
          });
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout', error);

          let errorMessage = 'Une erreur est survenue.';

          if (error.error && error.error.errors) {
            const errors = error.error.errors;
            errorMessage = Object.values(errors)
              .flat() // Aplatit les tableaux imbriqués
              .join('   |  \n'); // Concatène les messages avec un saut de ligne
          }

          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: errorMessage,
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK'
          });
        }
      });
    }
  }

  // Annuler et retourner à la liste
  onCancel() {
    this.router.navigate(['/patient']);
  }
}
