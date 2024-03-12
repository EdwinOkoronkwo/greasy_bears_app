import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, powerOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink],
})
export class AdminPage implements OnInit {
  constructor(public auth: AuthService) {
    addIcons({
      powerOutline,
      homeOutline,
    });
  }

  ngOnInit() {}
}

// IonHeader,
// IonToolbar,
// IonTitle,
// IonButton,
// IonButtons,
// IonIcon,
// IonContent,
