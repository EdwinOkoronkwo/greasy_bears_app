import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Item } from 'src/app/models/item.model';
import { environment } from 'src/environments/environment';
import { LoadingRestaurantComponent } from '../loading-restaurant/loading-restaurant.component';
import { EmptyScreenComponent } from '../empty-screen/empty-screen.component';
import { Strings } from 'src/app/enum/strings';
import { ItemsPage } from 'src/app/pages/tabs/items/items.page';
import { addIcons } from 'ionicons';
import {
  addOutline,
  basketOutline,
  fastFoodOutline,
  removeOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonicModule,
    RouterLink,
    CommonModule,
    LoadingRestaurantComponent,
    EmptyScreenComponent,
  ],
})
export class ItemComponent {
  @Input() item!: Item;
  @Input() index: any;
  @Output() add: EventEmitter<Item> = new EventEmitter();
  @Output() minus: EventEmitter<Item> = new EventEmitter();
  serverUrl = environment.serverUrl;
  itemUrl = Strings.ITEM_URL;

  constructor() {
    addIcons({
      fastFoodOutline,
      removeOutline,
      addOutline,
      basketOutline,
    });
  }

  quantityPlus() {
    this.add.emit(this.item);
  }

  quantityMinus() {
    this.minus.emit(this.item);
  }
}
