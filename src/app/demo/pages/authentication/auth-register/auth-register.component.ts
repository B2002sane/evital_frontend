// Angular import
import { Component , OnInit} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-register',
  imports: [RouterModule , CommonModule],
  templateUrl: './auth-register.component.html',
  styleUrl: './auth-register.component.scss',
 
})
export class AuthRegisterComponent  {
  // public method
  // SignUpOptions = [
  //   {
  //     image: 'assets/images/authentication/google.svg',
  //     name: 'Google'
  //   },
  //   {
  //     image: 'assets/images/authentication/twitter.svg',
  //     name: 'Twitter'
  //   },
  //   {
  //     image: 'assets/images/authentication/facebook.svg',
  //     name: 'Facebook'
  //   }
  // ];
  
}
