import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { LegendPosition, NgxChartsModule } from '@swimlane/ngx-charts';
import { OrderService } from 'src/app/services/orders/orders.service';
import * as d3 from 'd3';
import { Order } from 'src/app/models/order.model';
import { IonHeader } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vertical-bar-chart',
  templateUrl: './vertical-bar-chart.component.html',
  styleUrls: ['./vertical-bar-chart.component.scss'],
  standalone: true,
  imports: [NgxChartsModule, IonicModule],
})
export class VerticalBarChartComponent implements OnInit, OnDestroy {
  processedOrders!: any;
  orderSub!: Subscription;
  private data!: [];
  private svg: any;
  private margin = 40;
  private width = 400 - this.margin * 2;
  private height = 250 - this.margin * 2;

  constructor(private orderService: OrderService) {
    this.orderSub = this.orderService.getOrdersPrice().subscribe((result) => {
      this.processedOrders = result;
      console.log(this.processedOrders);
    });
  }

  ionViewDidLeave() {}

  ngOnInit(): void {
    setTimeout(() => {
      if (this.processedOrders) this.data = this.processedOrders;
      this.createSvg();
      this.drawBars(this.data);
    }, 500);
  }

  private createSvg(): void {
    this.svg = d3
      .select('figure#bar')
      .append('svg')
      .attr('width', this.width + this.margin * 2)
      .attr('height', this.height + this.margin * 2)
      .append('g')
      .attr('transform', 'translate(' + this.margin + ',' + this.margin + ')');
  }

  private drawBars(data: any[]): void {
    // Create the X-axis band scale
    const x = d3
      .scaleBand()
      .range([0, this.width])
      .domain(data.map((d) => d.itemName))
      .padding(0.3);

    // Draw the X-axis on the DOM
    this.svg
      .append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-20,0)rotate(-45)')
      .style('text-anchor', 'end');

    // Create the Y-axis band scale
    const y = d3.scaleLinear().domain([0, 1600]).range([this.height, 0]);

    // Draw the Y-axis on the DOM
    this.svg.append('g').call(d3.axisLeft(y));

    // Create and fill the bars
    this.svg
      .selectAll('bars')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d: any) => x(d.itemName))
      .attr('y', (d: any) => y(d.totalPrice))
      .attr('width', x.bandwidth())
      .attr('height', (d: any) => this.height - y(d.totalPrice))
      .attr('fill', '#0000ff');
  }

  ngOnDestroy() {
    if (this.orderSub) this.orderSub.unsubscribe();
  }
}

/////////////////////////////////////////////////////////////////////////
//////////////// OLD CODE //////////////////////////////////

// // Data
// // chartData: ChartDataSets[] = []
// ////////////////////////////////////////////////////////////////
// // view: any[] = [700, 400];
// // options
// showXAxis = true;
// showYAxis = true;
// gradient = false;
// showLegend = true;
// showXAxisLabel = true;
// xAxisLabel = 'itemName';
// showYAxisLabel = true;
// yAxisLabel = 'totalPrice';
// @Input() view!: any;
// @Input() legendPosition = LegendPosition.Below;
// single: any[] = [];
// order: any;
// colorScheme: any = {
//   domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
// };

// ngOnInit() {
//   // setTimeout(() => {
//   //   if (this.order) {
//   //     console.log(this.order);
//   //     this.single = this.order;
//   //   }
//   // }, 500);
//   this.single = [
//     {
//       itemName: 'Sirloin Steak',
//       totalPrice: 645,
//     },
//     {
//       itemName: 'Norwegian Salmon',
//       totalPrice: 269.85,
//     },
//     {
//       itemName: 'Pizza',
//       totalPrice: 199.95000000000002,
//     },
//     {
//       itemName: 'Caesar Salad',
//       totalPrice: 159.8,
//     },
//     {
//       itemName: 'Meat Pie',
//       totalPrice: 59.849999999999994,
//     },
//   ];
// }
// ionViewDidEnter() {}
// //if (this.processedOrder) this.single = this.processedOrder;
// // this.single = [
// //   {
// //     name: 'Germany',
// //     value: 8940000,
// //   },
// //   {
// //     name: 'USA',
// //     value: 5000000,
// //   },
// //   {
// //     name: 'France',
// //     value: 7200000,
// //   },
// // ];
// onSelect(event: any) {
//   console.log(event);
// }
