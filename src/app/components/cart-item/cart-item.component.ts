import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import {
  IonIcon,
  IonItem,
  IonLabel,
  IonRow,
  IonText,
} from '@ionic/angular/standalone';
import { Item } from 'src/app/models/item.model';

@Component({
  selector: 'app-cart-item',
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class CartItemComponent {
  @Input() item: any;
  @Input() index: any;
  @Output() add: EventEmitter<any> = new EventEmitter();
  @Output() minus: EventEmitter<any> = new EventEmitter();

  constructor() {}

  quantityPlus() {
    this.add.emit(this.index);
  }

  quantityMinus() {
    this.minus.emit(this.index);
  }
}
