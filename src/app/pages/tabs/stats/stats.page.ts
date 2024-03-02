import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VerticalBarChartComponent } from 'src/app/components/vertical-bar-chart/vertical-bar-chart.component';
import { PieChartComponent } from 'src/app/components/pie-chart/pie-chart.component';
import { LegendPosition, NgxChartsModule } from '@swimlane/ngx-charts';

import {
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  Platform,
} from '@ionic/angular/standalone';
import { OrderService } from 'src/app/services/orders/orders.service';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBackOutline, homeOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterLink,
    FormsModule,
    IonicModule,
    NgClass,
    VerticalBarChartComponent,
    PieChartComponent,
  ],
})
export class StatsPage implements OnInit, OnDestroy {
  ordersPrice: any;
  ordersQuantity: any;
  totalPrice: any;
  totalQuantity: any;
  orderPriceSub!: Subscription;
  orderQuantitySub!: Subscription;

  constructor(private orderService: OrderService) {
    this.orderPriceSub = this.orderService
      .getOrdersPrice()
      .subscribe((result) => {
        this.ordersPrice = result;
        console.log(this.ordersPrice);
      });
    this.orderQuantitySub = this.orderService
      .getOrdersQuantity()
      .subscribe((result) => {
        this.ordersQuantity = result;
        console.log(this.ordersQuantity);
      });
    addIcons({
      homeOutline,
      arrowBackOutline,
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.getTotalPrice(this.ordersPrice);
      this.getTotalQuantity(this.ordersQuantity);
    }, 500);
  }

  getTotalPrice(data: any) {
    const tp = data.reduce((acc: any, curr: any) => acc + curr.totalPrice, 0);
    this.totalPrice = tp;
    console.log('totalPrice: ', tp);
  }

  getTotalQuantity(data: any) {
    const tq = data.reduce(
      (acc: any, curr: any) => acc + curr.totalQuantity,
      0
    );
    this.totalQuantity = tq;
    console.log('totalQuantity: ', tq);
  }

  ngOnDestroy() {
    if (this.orderPriceSub) this.orderPriceSub.unsubscribe();
    if (this.orderQuantitySub) this.orderQuantitySub.unsubscribe();
  }
}
