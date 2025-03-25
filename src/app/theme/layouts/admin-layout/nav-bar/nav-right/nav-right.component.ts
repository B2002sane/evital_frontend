// angular import
import { Component, inject, input, output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from 'src/app/service/login.service';
import { Route } from '@angular/router';

// project import

// icon
import { IconService } from '@ant-design/icons-angular';
import {
  BellOutline,
  SettingOutline,
  GiftOutline,
  MessageOutline,
  PhoneOutline,
  CheckCircleOutline,
  LogoutOutline,
  EditOutline,
  UserOutline,
  ProfileOutline,
  WalletOutline,
  QuestionCircleOutline,
  LockOutline,
  CommentOutline,
  UnorderedListOutline,
  ArrowRightOutline,
  GithubOutline,
  
} from '@ant-design/icons-angular/icons';
import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
  selector: 'app-nav-right',
  imports: [RouterModule, NgScrollbarModule, NgbNavModule, NgbDropdownModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent {

  currentUser: { id: string; nom: string; prenom: string; role: string } | null = null;

  private iconService = inject(IconService);

  styleSelectorToggle = input<boolean>();
  Customize = output();
  windowWidth: number;
  screenFull: boolean = true;

  constructor(private LoginService :LoginService, private router:Router ) {
    this.windowWidth = window.innerWidth;
    this.iconService.addIcon(
      ...[
        CheckCircleOutline,
        GiftOutline,
        MessageOutline,
        SettingOutline,
        PhoneOutline,
        LogoutOutline,
        UserOutline,
        EditOutline,
        ProfileOutline,
        QuestionCircleOutline,
        LockOutline,
        CommentOutline,
        UnorderedListOutline,
        ArrowRightOutline,
        BellOutline,
        GithubOutline,
        WalletOutline
      ]
    );
    
  }

  onLogout() {
    this.LoginService.logout().subscribe({
      next: (response) => {
        if (response.status) {
          console.log('Déconnexion réussie', response.message);
          this.router.navigate(['/login']);
          
        } else {
          console.log('Erreur lors de la déconnexion', response.message);
        }
      },
      error: (error) => {
        console.error('Erreur de déconnexion', error);
      }
    });
  }


  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    // Utilisez la méthode getCurrentUser() pour récupérer l'utilisateur actuel
    this.currentUser = this.LoginService.getCurrentUser();
    console.log('Utilisateur actuel:', this.currentUser);
  }

}
