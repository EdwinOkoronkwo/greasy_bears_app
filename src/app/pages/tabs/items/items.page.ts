import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { ItemService } from 'src/app/services/item/item.service';
import { CartService } from 'src/app/services/cart/cart.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  BehaviorSubject,
  EMPTY,
  Subscription,
  catchError,
  combineLatest,
  map,
  take,
  tap,
} from 'rxjs';
import { Item } from 'src/app/models/item.model';
import { ItemCategory } from 'src/app/models/itemcategory.model';
import { Cart } from 'src/app/interfaces/cart.interface';
import { Restaurant } from 'src/app/models/restaurant.model';
import { Preferences } from '@capacitor/preferences';
import { ItemComponent } from 'src/app/components/item/item.component';
import { RestaurantDetailComponent } from 'src/app/components/restaurant-detail/restaurant-detail.component';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
import { ItemCategoryService } from 'src/app/services/itemcategory/itemCategory.service';
import { LoadingRestaurantComponent } from 'src/app/components/loading-restaurant/loading-restaurant.component';
import { EmptyScreenComponent } from 'src/app/components/empty-screen/empty-screen.component';
import { addIcons } from 'ionicons';
import {
  addOutline,
  basketOutline,
  fastFoodOutline,
  removeOutline,
} from 'ionicons/icons';
import { serialize } from 'object-to-formdata';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-items',
  templateUrl: './items.page.html',
  styleUrls: ['./items.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ItemComponent,
    RestaurantDetailComponent,
    LoadingRestaurantComponent,
    EmptyScreenComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsPage implements OnInit {
  id: any;
  data: any = {};
  items: any[] = [];
  isVeg: boolean = false;
  isLoading!: boolean;
  cartData: any = {};
  storedData: any = {};
  model = {
    icon: 'fast-food-outline',
    title: 'No Menu Available',
  };
  restaurants!: Restaurant[];
  categories!: ItemCategory[];
  allItems!: Item[];
  restaurants$ = this.restaurantService.restaurants$;
  categories$ = this.categoryService.itemCategories$;

  selectedVegSubject = new BehaviorSubject<boolean>(false);
  selectedVegAction$ = this.selectedVegSubject.asObservable();
  selectedVeg!: boolean;
  selectedRestaurantSubject = new BehaviorSubject<number>(0);
  selectedRestaurantAction$ = this.selectedRestaurantSubject.asObservable();
  selectedRestaurantId!: number;

  errorMessageSubject = new BehaviorSubject<string>('');
  errorMessageAction$ = this.errorMessageSubject.asObservable();
  items$ = this.itemService.itemsWithRestaurantsAndCategoriesAndUsersAndCRUD$;

  filteredItems$ = combineLatest([this.items$, this.selectedVegAction$]).pipe(
    tap((data) => {
      this.isLoading = false;
      this.global.hideLoader();
    }),
    map(([items, selectedVeg]) => {
      return items.filter((item: any) =>
        selectedVeg ? item.isVeg === selectedVeg : true
      );
    })
  );

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: ItemCategoryService,
    private restaurantService: RestaurantService,
    private itemService: ItemService,
    private cartService: CartService,
    private global: GlobalService
  ) {
    this.restaurantService.getRestaurants().subscribe((result) => {
      this.restaurants = result;
      console.log(this.restaurants);
    });
    this.categoryService.getItemCategories().subscribe((result) => {
      this.categories = result;
      console.log(this.categories);
    });
    this.itemService.getItems().subscribe((result) => {
      this.allItems = result;
      console.log(this.allItems);
    });
    addIcons({
      fastFoodOutline,
      removeOutline,
      addOutline,
      basketOutline,
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      console.log('data: ', paramMap);
      if (!paramMap.has('restaurantId')) {
        this.navCtrl.back();
        return;
      }
      this.id = paramMap.get('restaurantId');
      console.log('id: ', this.id);
    });
  }

  onRestaurantChange(event: Event) {
    this.selectedRestaurantSubject.next(this.selectedRestaurantId);
  }

  vegOnly(event: any) {
    console.log(event.detail.checked);
    this.items = [];
    if (event.detail.checked === true) {
      this.items = this.allItems.filter((x) => x.isVeg === true);
    } else {
      this.items = this.allItems;
    }
    console.log('items: ', this.items);
  }

  onAddCartItems(formData: any) {
    this.cartService.addCartToServer(formData).subscribe({
      next: (result) => {
        console.log(result);
        alert('Item was successfully added to cart');
        // this.router.navigate(['/login']);
      },
      error: (err) => {
        console.log(err);
        alert('Item addition failed!');
      },
    });
  }

  onDeleteCartItems(item: any) {
    this.cartService.deleteCartToServer(item).subscribe({
      next: (result) => {
        console.log(result);
        alert('Item was removed from cart');
        //this.router.navigate(['/login']);
      },
      error: (err) => {
        console.log(err);
        alert('Cart removal failed!');
      },
    });
  }

  addItem(item: any, index: any) {
    const formData: any = serialize(item, {
      dotsForObjectNotation: true,
    });
    console.log('formData', formData);
    try {
      const index = this.allItems.findIndex((x) => x.id === item.id);
      console.log('item', this.items);
      console.log('index', index);
      if (!this.items[index].quantity || this.items[index].quantity === 0) {
        this.items[index].quantity = 1;
        this.onAddCartItems(formData);
      } else {
        this.items[index].quantity += 1;
        this.onAddCartItems(formData);
      }
    } catch (e) {
      console.log(e);
    }
  }

  subtractItem(index: any, item: any) {
    try {
      const index = this.allItems.findIndex((x) => x.id === item.id);
      if (this.items[index].quantity !== 0) {
        this.items[index].quantity -= 1;
      } else {
        this.items[index].quantity = 0;
      }
      console.log(item);
      this.onDeleteCartItems(item);
    } catch (e) {
      console.log(e);
    }
  }

  async viewCart() {
    this.router.navigate([this.router.url + '/cart']);
  }
}

///////////////////////////////////////////////////////////////////////////////
/////////////////////// OLD CODE ///////////////////////////////////////////////////
// async getItems() {
//   //return this.allItems;
//   this.isLoading = true;
//   this.allItems;
//   this.data = {};
//   setTimeout(async () => {
//     let data: any = this.restaurants.filter((x) => x.id == this.id);
//     this.data = data[0];
//     this.categories = this.categories.filter((x) => x.id == this.id);
//     this.items = this.allItems.filter((x) => x.id == this.id);
//     console.log('restaurant: ', this.data);
//     this.isLoading = false;
//   }, 1000);
// }
