import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() {}

  // Demande la permission pour afficher les notifications
  requestNotificationPermission(): void {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log("✅ Notifications autorisées !");
        } else {
          console.log("🚫 Permission refusée !");
        }
      });
    } else {
      console.log("⚠️ Notifications non supportées par ce navigateur.");
    }
  }

  // Envoie une notification si la permission est accordée
  sendNotification(title: string, message: string): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'info', // success, warning, error
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      background: '#ffcccc',
      timer: 3000
    });
  }
}
