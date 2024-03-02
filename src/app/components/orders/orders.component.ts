import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Order } from 'src/app/models/order.model';
import { OrderService } from 'src/app/services/orders/orders.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class OrdersComponent {
  @Input() order!: any;

  @Output() reorder: EventEmitter<any> = new EventEmitter();
  @Output() help: EventEmitter<any> = new EventEmitter();
  orders!: Order;

  constructor(private orderService: OrderService) {}

  reorderItem() {
    this.reorder.emit(this.order);
  }

  getHelp() {
    this.help.emit(this.order);
  }
}
