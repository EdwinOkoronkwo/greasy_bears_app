import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import {
  IonCol,
  IonGrid,
  IonIcon,
  IonLabel,
  IonRow,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cartOutline } from 'ionicons/icons';

@Component({
  selector: 'app-empty-screen',
  templateUrl: './empty-screen.component.html',
  styleUrls: ['./empty-screen.component.scss'],
  standalone: true,
  imports: [CommonModule, IonGrid, IonRow, IonCol, IonText, IonLabel, IonIcon],
})
export class EmptyScreenComponent {
  @Input() model: any;

  constructor() {
    addIcons({
      cartOutline,
    });
  }
}
