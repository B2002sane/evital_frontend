import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartComponent, ApexOptions } from 'ng-apexcharts';
import { WebsocketService } from 'src/app/service/websocket.service';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-line-chart',
  imports: [NgApexchartsModule],
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  chartOptions!: Partial<ApexOptions>;
  data: { x: number, y: number }[] = []; // Données du graphe
  time = 0; // Temps en secondes
  private resetTimeout: any; // Stocke le timeout

  constructor(private websocketService: WebsocketService) {}

  ngOnInit() {
    this.initChart();

    // Écoute les BPM et met à jour le graphe
    this.websocketService.getBpmUpdates().subscribe((bpm: number) => {
      this.updateChartData(bpm);
      this.resetChartTimeout(); // Reset du timeout dès qu'un BPM est reçu
    });

    // Lancer le timeout dès le départ pour éviter un graphe vide
    this.resetChartTimeout();
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
    console.log("Nouveau BPM reçu :", bpm);
    this.data.push({ x: this.time++, y: bpm });

    if (this.data.length > 20) {
      this.data.shift(); //  Garde les 20 derniers points
    }

    this.chart.updateSeries([{ name: 'Rythme Cardiaque (BPM)', data: this.data }]);
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

      this.chart.updateSeries([{ name: 'Rythme Cardiaque (BPM)', data: this.data }]);
    }, 5000); // 5 secondes
  }
}
