import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { LegendPosition, NgxChartsModule } from '@swimlane/ngx-charts';
import { OrderService } from 'src/app/services/orders/orders.service';
import { NgChartsModule } from 'ng2-charts';
import { single } from './data';
import * as d3 from 'd3';
import { IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
  standalone: true,
  imports: [NgxChartsModule, NgChartsModule, IonicModule],
})
export class PieChartComponent implements OnInit, OnDestroy {
  processedOrders!: any;
  orderSub!: Subscription;
  private data!: [];
  private svg: any;
  private margin = 50;
  private width = 750;
  private height = 600;
  private radius = Math.min(this.width, this.height) / 2 - this.margin;
  private colors: any;

  constructor(private orderService: OrderService) {
    this.orderSub = this.orderService
      .getOrdersQuantity()
      .subscribe((result) => {
        this.processedOrders = result;
        console.log(this.processedOrders);
      });
  }

  ionViewDidLeave() {}

  ngOnInit(): void {
    setTimeout(() => {
      if (this.processedOrders) this.data = this.processedOrders;
      this.createSvg();
      this.createColors();
      this.drawChart();
    }, 500);
  }

  private createSvg(): void {
    this.svg = d3
      .select('figure#pie')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr(
        'transform',
        'translate(' + this.width / 2 + ',' + this.height / 2 + ')'
      );
  }

  private createColors(): void {
    this.colors = d3
      .scaleOrdinal()
      .domain(this.data.map((d: any) => d.totalQuantity.toString()))
      .range(['#c7d3ec', '#a5b8db', '#879cc4', '#677795', '#5a6782']);
  }

  private drawChart(): void {
    // Compute the position of each group on the pie:
    const pie = d3.pie<any>().value((d: any) => Number(d.totalQuantity));

    // Build the pie chart
    this.svg
      .selectAll('pieces')
      .data(pie(this.data))
      .enter()
      .append('path')
      .attr('d', d3.arc().innerRadius(0).outerRadius(this.radius))
      .attr('fill', (d: any, i: any) => this.colors(i))
      .attr('stroke', '#121926')
      .style('stroke-width', '1px');

    // Add labels
    const labelLocation = d3.arc().innerRadius(100).outerRadius(this.radius);

    this.svg
      .selectAll('pieces')
      .data(pie(this.data))
      .enter()
      .append('text')
      .text((d: any) => d.data.itemName)
      .attr(
        'transform',
        (d: any) => 'translate(' + labelLocation.centroid(d) + ')'
      )
      .style('text-anchor', 'middle')
      .style('font-size', 14);
  }

  ngOnDestroy() {
    if (this.orderSub) this.orderSub.unsubscribe();
  }
}
