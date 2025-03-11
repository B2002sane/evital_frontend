import { Component, OnInit } from '@angular/core';
import { UtilisateurService, Utilisateur } from 'src/app/service/utilisateur.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-historique-dons',
  imports:[CommonModule],
  templateUrl: './historique-dons.component.html',
  styleUrls: ['./historique-dons.component.scss']
})
export class HistoriqueDonsComponent implements OnInit {
  currentUser: Utilisateur | null = null;
  historiqueDons: any[] = [];
  apiUrl = 'http://localhost:8000/api/historique-dons'; // Remplace par l'URL correcte

  constructor(private utilisateurService: UtilisateurService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    // Supposons que l'ID de l'utilisateur connecté est stocké dans localStorage
    const userId = localStorage.getItem('userId');

    if (userId) {
      this.utilisateurService.getUtilisateurById(userId).subscribe(
        (user) => {
          this.currentUser = user;
          this.loadHistoriqueDons(user.id);
        },
        (error) => {
          console.error("Erreur lors du chargement de l'utilisateur :", error);
        }
      );
    }
  }

  loadHistoriqueDons(userId: string): void {
    this.http.get<any[]>(`${this.apiUrl}/${userId}`).subscribe(
      (dons) => {
        this.historiqueDons = dons;
      },
      (error) => {
        console.error('Erreur lors du chargement de l’historique des dons', error);
      }
    );
  }
}
