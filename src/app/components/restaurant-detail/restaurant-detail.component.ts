import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  Input,
  NO_ERRORS_SCHEMA,
  OnInit,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import {
  IonLabel,
  IonRow,
  IonSkeletonText,
  IonText,
  IonGrid,
  IonCol,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star } from 'ionicons/icons';
import { Restaurant } from 'src/app/models/restaurant.model';

@Component({
  selector: 'app-restaurant-detail',
  templateUrl: './restaurant-detail.component.html',
  styleUrls: ['./restaurant-detail.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [IonicModule, CommonModule],
})
export class RestaurantDetailComponent {
  @Input() data!: Restaurant;
  @Input() isLoading!: any;

  constructor() {
    addIcons({
      star,
    });
  }
}
