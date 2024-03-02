import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonLabel,
  IonSkeletonText,
  IonThumbnail,
  IonList,
  IonItem,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-loading-restaurant',
  templateUrl: './loading-restaurant.component.html',
  styleUrls: ['./loading-restaurant.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonList,
    IonSkeletonText,
    IonContent,
    IonThumbnail,
    IonLabel,
    IonItem,
  ],
})
export class LoadingRestaurantComponent implements OnInit {
  dummy = Array(10);

  constructor() {}

  ngOnInit() {}
}
