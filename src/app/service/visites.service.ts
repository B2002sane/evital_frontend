import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Modèle d'une prescription
export interface Prescription {
  nom_medicament: string;
  frequence: string;
}

// Modèle d'une visite
export interface Visite {
  _id?: string;
  medecinId: string;
  patientId: string;
  prescriptions?: Prescription[];
  created_at?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class VisiteService {
  // Remplace cette URL par celle de ton backend si besoin
  private apiUrl =  'https://evital-sante-1.onrender.com/api/visites'; //'http://localhost:8000/api/visites';

  constructor(private http: HttpClient) {}

  //  Récupère toutes les visites pour un dossier médical donné
  getVisitesByDossier(dossierId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${dossierId}`);
  }

  //  Récupère une seule visite par son ID
  getVisite(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/show/${id}`);
  }

  //  Crée une nouvelle visite
  createVisite(visite: Visite): Observable<any> {
    return this.http.post(`${this.apiUrl}`, visite);
  }

  //  Met à jour une visite existante
  updateVisite(id: string, visite: Partial<Visite>): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, visite);
  }

  //  Supprime une visite
  deleteVisite(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  getByPatient(patientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/patient/${patientId}`);
  }
  
}
