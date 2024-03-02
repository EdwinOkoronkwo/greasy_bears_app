import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  Input,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import {
  IonCol,
  IonGrid,
  IonIcon,
  IonImg,
  IonLabel,
  IonRow,
  IonSkeletonText,
  IonText,
  IonThumbnail,
  IonItem,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star } from 'ionicons/icons';
import { Strings } from 'src/app/enum/strings';
import { Restaurant } from 'src/app/models/restaurant.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-restaurant',
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonItem,
    IonGrid,
    IonRow,
    IonLabel,
    IonSkeletonText,
    IonCol,
    IonText,
    IonThumbnail,
    IonImg,
    IonIcon,
    CommonModule,
  ],
})
export class RestaurantComponent {
  @Input() restaurant!: Restaurant;
  serverUrl = environment.serverUrl;
  restaurantUrl = Strings.RESTAURANT_URL;

  constructor() {
    addIcons({
      star,
    });
  }
}
