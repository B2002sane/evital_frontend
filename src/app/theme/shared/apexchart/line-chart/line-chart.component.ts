import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { ChartComponent, ApexOptions } from 'ng-apexcharts';
import { WebsocketService } from 'src/app/service/websocket.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-line-chart',
  imports: [NgApexchartsModule],
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('chart') chart!: ChartComponent;
  @Input() chambreId: string | null = null;
  @Input() litId: number | null = null;
  
  chartOptions!: Partial<ApexOptions>;
  data: { x: number, y: number }[] = []; // Données du graphe
  time = 0; // Temps en secondes
  private resetTimeout: any; // Stocke le timeout
  private subscription: Subscription | null = null;

  constructor(private websocketService: WebsocketService) {}

  ngOnInit() {
    this.initChart();
    this.setupSubscription();
    
    // Lancer le timeout dès le départ pour éviter un graphe vide
    this.resetChartTimeout();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Si l'ID de chambre ou de lit change, reconfigurer l'abonnement
    if (changes['chambreId'] || changes['litId']) {
      this.setupSubscription();
    }
  }

  // Configuration de l'abonnement aux données
  setupSubscription() {
    // Annuler l'abonnement précédent s'il existe
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    // Si nous avons un ID de chambre et de lit, s'abonner aux données filtrées
    if (this.chambreId && this.litId !== null) {
      console.log(`LineChart: configuration pour chambre ${this.chambreId}, lit ${this.litId}`);
      
      this.subscription = this.websocketService.getRawDataUpdates().subscribe(data => {
        // Vérifier si les données concernent la chambre et le lit actuels
        if (data.chambre_id === this.chambreId && 
            data.lit_id.toString() === this.litId?.toString() && 
            data.bpm !== undefined && !isNaN(data.bpm)) {
          
          const bpm = parseInt(data.bpm);
          if (bpm >= 0 && bpm <= 220) {
            console.log(`LineChart: BPM reçu pour chambre ${data.chambre_id}, lit ${data.lit_id}: ${bpm}`);
            this.updateChartData(bpm);
            this.resetChartTimeout();
          }
        }
      });
    } else {
      console.warn("LineChart: impossible de configurer l'abonnement - chambreId ou litId manquant");
    }
  }

  // Initialisation du graphe
  initChart() {
    this.chartOptions = {
      chart: {
        type: 'line',
        height: 300,
        animations: {
          enabled: true,
          dynamicAnimation: { speed: 1000 }
        },
        zoom: { enabled: false },
        toolbar: { show: false }
      },
      series: [{ name: 'Rythme Cardiaque (BPM)', data: this.data }],
      xaxis: {
        type: 'numeric',
        tickAmount: 10,
        labels: { formatter: (value) => `${value}s` }
      },
      yaxis: {
        min: 50,
        max: 150,
        tickAmount: 5
      },
      stroke: { curve: 'stepline', width: 2 },
      colors: ['#FF4560'],
      grid: { borderColor: '#ddd' }
    };
  }

  // Mise à jour des données BPM
  updateChartData(bpm: number) {
    console.log("Nouveau BPM ajouté au graphique :", bpm);
    this.data.push({ x: this.time++, y: bpm });

    if (this.data.length > 20) {
      this.data.shift(); //  Garde les 20 derniers points
    }

    // S'assurer que le chart existe avant de le mettre à jour
    if (this.chart && this.chart.updateSeries) {
      this.chart.updateSeries([{ name: 'Rythme Cardiaque (BPM)', data: this.data }]);
    }
  }

  // ⏳ Fonction pour reset TOUS LES POINTS à 0 après 5 secondes d'inactivité
  resetChartTimeout(): void {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }

    this.resetTimeout = setTimeout(() => {
      console.warn("Aucune donnée reçue depuis 5s → TOUS LES POINTS à 0");

      // ✅ Transformer tous les points en 0
      this.data = this.data.map(point => ({ x: point.x, y: 0 }));

      // S'assurer que le chart existe avant de le mettre à jour
      if (this.chart && this.chart.updateSeries) {
        this.chart.updateSeries([{ name: 'Rythme Cardiaque (BPM)', data: this.data }]);
      }
    }, 5000); // 5 secondes
  }

  ngOnDestroy() {
    // Nettoyer le timeout
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
    
    // Annuler l'abonnement
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}