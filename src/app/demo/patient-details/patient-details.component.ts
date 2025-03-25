import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UtilisateurService, Utilisateur } from 'src/app/service/utilisateur.service';
import { CommonModule } from '@angular/common';
import { LineChartComponent } from 'src/app/theme/shared/apexchart/line-chart/line-chart.component';
import { WebsocketService } from 'src/app/service/websocket.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/app/service/notification.service';

@Component({
  selector: 'app-patient-details',
  imports: [CommonModule, LineChartComponent],
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.scss']
})
export class PatientDetailsComponent implements OnInit, OnDestroy {
  patient: Utilisateur | null = null;
  loading: boolean = true;
  error: string | null = null;
  bpm: number = 0; // Variable pour stocker le BPM
  temperature: number = 36.5; // Variable pour stocker la température
  bpmTimeout: any; // Stocke le timeout pour BPM
  tempTimeout: any; // Stocke le timeout pour température
  connectionStatus: boolean = false; // État de la connexion WebSocket
  
  // Pour gérer les souscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private utilisateurService: UtilisateurService,
    private websocketService: WebsocketService,
    private router: Router
  ) {}



  speak(text: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR'; // Définir la langue en français
      utterance.rate = 1; // Vitesse normale
      utterance.pitch = 1; // Tonalité normale
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("La synthèse vocale n'est pas supportée par ce navigateur.");
    }
  }
  
  private BPM_CRITIQUE = 10; // Seuil pour déclencher une alerte

checkBpmAnormal(): void {
  if (this.bpm > this.BPM_CRITIQUE) {
    this.notificationService.sendNotification(
      "🚨 Urgence Médicale !",
      `Le BPM du patient ${this.patient.prenom} ${this.patient.nom}  est critique : ${this.bpm}`
    );
  }
}

  


  ngOnInit(): void {
    // Récupérer l'ID du patient depuis l'URL
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.subscriptions.push(
        this.utilisateurService.getUtilisateurByIdEdit(id).subscribe({
          next: (response) => {
            if (response.status && response.data) {
              this.patient = response.data;
              this.loading = false;
            }
          },
          error: (err) => {
            console.error('Erreur lors du chargement des détails du patient', err);
            this.error = 'Impossible de charger les informations du patient';
            this.loading = false;
          }
        })
      );
    }

    // Écoute des mises à jour BPM
    this.subscriptions.push(
      this.websocketService.getBpmUpdates().subscribe({
        next: (bpmValue) => {
          this.bpm = bpmValue; // Met à jour le BPM
          this.checkBpmAnormal(); // Vérifie si une alerte doit être envoyée
          this.resetBpmTimeout(); // Reset du timeout à chaque nouveau signal
          this.speak(`Le rythme cardiaque est de ${this.bpm} battements par minute`);
        },
        error: (err) => {
          console.error('Erreur WebSocket BPM:', err);
        }
      })
    );

    // Écoute des mises à jour de température
    this.subscriptions.push(
      this.websocketService.getTemperatureUpdates().subscribe({
        next: (tempValue) => {
          this.temperature = tempValue; // Met à jour la température
          this.resetTempTimeout(); // Reset du timeout à chaque nouvelle mesure
          this.speak(`La température est de ${this.temperature} degrés Celsius`);
        },
        error: (err) => {
          console.error('Erreur WebSocket température:', err);
        }
      })
    );

    // Écoute de l'état de connexion
    this.subscriptions.push(
      this.websocketService.getConnectionStatus().subscribe({
        next: (status) => {
          this.connectionStatus = status;
        }
      })
    );
  }

  // Fonction pour remettre le BPM à 0 après 6 secondes sans signal
  resetBpmTimeout(): void {
    if (this.bpmTimeout) {
      clearTimeout(this.bpmTimeout);
    }

    this.bpmTimeout = setTimeout(() => {
      this.bpm = 0; // Remettre le BPM à 0 si aucun battement reçu
    }, 6000); // 6 secondes
  }

  // Fonction pour marquer la température comme obsolète après un certain temps
  resetTempTimeout(): void {
    if (this.tempTimeout) {
      clearTimeout(this.tempTimeout);
    }

    this.tempTimeout = setTimeout(() => {
      // Optionnel: vous pouvez soit mettre une valeur par défaut, soit ajouter un indicateur visuel
      // this.temperature = null; // Ou autre valeur indiquant une mesure obsolète
    }, 30000); // 30 secondes pour la température (peut rester valide plus longtemps que le BPM)
  }

  // Tenter de reconnecter le WebSocket manuellement
  reconnectWebSocket(): void {
    this.websocketService.reconnect();
  }

  // Fonction pour calculer l'âge (réutilisée du composant patient)
  calculateAge(dateNaissance: string): number {
    const birthDate = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  // Vérifier si la température est dans une plage normale
  isTempNormal(): boolean {
    return this.temperature >= 36.1 && this.temperature <= 37.5;
  }

  // Vérifier si le BPM est dans une plage normalej
  isBpmNormal(): boolean {
    return this.bpm > 50 && this.bpm < 100;
  }

  // Annuler et retourner à la liste
  onCancel() {
    this.router.navigate(['/patient']);
  }

  ngOnDestroy(): void {
    // Nettoyer les timeouts
    if (this.bpmTimeout) {
      clearTimeout(this.bpmTimeout);
    }
    if (this.tempTimeout) {
      clearTimeout(this.tempTimeout);
    }
    
    // Désabonner de toutes les souscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}