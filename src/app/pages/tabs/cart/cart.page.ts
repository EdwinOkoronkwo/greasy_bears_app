import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { serialize } from 'object-to-formdata';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { Cart } from 'src/app/interfaces/cart.interface';
import { Address } from 'src/app/models/address.model';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  ActivatedRoute,
  NavigationExtras,
  ParamMap,
  Router,
  RouterLink,
} from '@angular/router';
import { GlobalService } from 'src/app/services/global/global.service';
import { CartService } from 'src/app/services/cart/cart.service';
import { AddressService } from 'src/app/services/address/address.service';
import { OrderService } from 'src/app/services/orders/orders.service';
import { EmptyScreenComponent } from 'src/app/components/empty-screen/empty-screen.component';
import { CartItemComponent } from 'src/app/components/cart-item/cart-item.component';
import {
  IonBackButton,
  IonButton,
  IonHeader,
  IonImg,
  IonLabel,
  IonList,
  IonNote,
  IonText,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  IonContent,
  IonCol,
  IonButtons,
  IonItem,
  IonIcon,
  IonListHeader,
  IonFooter,
  IonRow,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  chevronDownOutline,
  homeOutline,
  listOutline,
  personOutline,
  removeOutline,
} from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';
import * as moment from 'moment';
import { SearchLocationComponent } from 'src/app/components/search-location/search-location.component';
import { Strings } from 'src/app/enum/strings';
import { ItemService } from 'src/app/services/item/item.service';
import { Item } from 'src/app/models/item.model';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
import { CompleteOrderComponent } from 'src/app/components/complete-order/complete-order.component';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    IonicModule,
    CartItemComponent,
    EmptyScreenComponent,
    RouterLink,
  ],
})
export class CartPage implements OnInit {
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  id: any;
  restaurantId: any;
  isLoading = false;
  deliveryLocation: any;
  urlCheck: any;
  data: any;
  url: any;
  model = {} as any;
  deliveryCharge = 15;
  instruction: any;
  location = {} as any;
  cartSub!: Subscription;
  addressSub!: Subscription;
  serverImageUrl = environment.serverUrl;
  restaurantUrl = Strings.RESTAURANT_URL;
  restaurant$ = this.restaurantService.restaurant$;
  cartItems!: Item[];
  itemsSub!: Subscription;
  items: Item[] = [];
  itemId!: any;
  status = 'paid';
  orderForm!: FormGroup;
  restaurant: any;

  ngOnInit() {
    // this.getData();
    this.addressSub = this.addressService.addressChange.subscribe((address) => {
      console.log('location cart: ', address);
    });
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id: any = params.get('id');
      this.restaurantId = parseInt(id);
      console.log('restaurantId: ', this.restaurantId);
    });
  }

  constructor(
    private itemService: ItemService,
    private route: ActivatedRoute,
    private cartService: CartService,
    private formBuilder: FormBuilder,
    private orderService: OrderService,
    private navCtrl: NavController,
    private router: Router,
    private global: GlobalService,
    private addressService: AddressService,
    private restaurantService: RestaurantService
  ) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      this.itemId = id;
    });
    this.checkUrl();
    this.restaurantService.getRestaurant(this.urlCheck).subscribe((result) => {
      this.restaurant = result;
      console.log(this.restaurant);
    });

    this.itemsSub = this.itemService.getItems().subscribe((result) => {
      this.items = result;
    });

    this.orderForm = this.formBuilder.group({
      status: ['', [Validators.required]],
      paymentMode: ['', [Validators.required]],
      paymentStatus: ['', [Validators.required]],
      instruction: ['', [Validators.required]],
    });
    addIcons({
      homeOutline,
      addOutline,
      personOutline,
      chevronDownOutline,
      listOutline,
      removeOutline,
    });
  }

  ionViewDidEnter() {
    this.cartService.carts$.subscribe((result) => {
      this.cartItems = result;
      console.log(result);
    });
    if (this.cartItems) {
      this.makeTotals();
    }
  }

  makeTotals() {
    this.getTotalPrice();
    this.getTotalQuantity();
    this.getGrandTotal();
  }

  checkUrl() {
    let url: any = this.router.url.split('/');
    console.log('url: ', url);
    const spliced = url.splice(url.length - 2, 2); // /tabs/cart url.length - 1 - 1
    this.urlCheck = spliced[0];
    console.log('urlcheck: ', this.urlCheck);
    url.push(this.urlCheck);
    this.url = url;

    console.log(this.restaurant);
    console.log(this.url);
  }

  getPreviousUrl() {
    return this.url.join('/');
  }

  addAddress(location?: any) {
    let url: any;
    let navData!: NavigationExtras;
    if (location) {
      location.from = 'cart';
      navData = {
        queryParams: {
          data: JSON.stringify(location),
        },
      };
    }
    if (this.urlCheck == 'tabs') url = ['/', 'tabs', 'address', 'edit-address'];
    else url = [this.router.url, 'address', 'edit-address'];
    this.router.navigate(url, navData);
  }

  async changeAddress() {
    try {
      const options = {
        component: SearchLocationComponent,
        swipeToClose: true,
        //cssClass: 'custom-modal',
        cssClass: 'inline_modal',
        breakpoints: [0, 0.5, 0.8],
        initialBreakpoint: 0.8,
        componentProps: {
          from: 'cart',
        },
      };
      const address = await this.global.createModal(options);
      if (address) {
        console.log(address);
        this.location = address;
        console.log(this.location);
        if (address === 'add') this.addAddress();
        await this.addressService.changeAddress(address);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async completeOrder() {
    const options = {
      component: CompleteOrderComponent,
      componentProps: {},
      cssClass: 'custom-modal',
      //  cssClass: 'inline-modal',
      breakpoints: [0, 0.5, 0.7],
      initialBreakpoint: 0.7,
      swipeToClose: true,
    };
    await this.global.createModal(options);
  }

  scrollToBottom() {
    this.content.scrollToBottom(500);
  }

  getTotalPrice() {
    let totalPrice = 0;
    if (this.cartItems) {
      this.cartItems.forEach((el: any) => {
        totalPrice += el.CartItem.quantity * el.price;
      });
    }
    return totalPrice;
  }

  getTotalQuantity() {
    let totalQuantity = 0;
    if (this.cartItems) {
      this.cartItems.forEach((el: any) => {
        totalQuantity += el.CartItem.quantity;
      });
    }
    return totalQuantity;
  }
  getGrandTotal() {
    return this.getTotalPrice() + this.deliveryCharge;
  }

  onDelete(itemId: any) {
    console.log(itemId);
    const index = this.items.findIndex((item) => {
      return item.id === itemId;
    });
    this.items.filter((item) => itemId !== index);
    this.itemService.deleteItemToServer(itemId).subscribe((result) => {
      console.log('item was deleted');
      window.alert('Item was deleted successfully');
    });
  }

  onOrderSubmit() {
    const formData = this.orderForm.value;
    console.log('formData', formData);
    this.orderService.addOrderToServer(formData).subscribe({
      next: (result) => {
        console.log(result);
        alert('Cart was created successfully');
        this.router.navigateByUrl('/tabs/account');
      },
      error: (err) => {
        console.log(err);
        alert('Registration failed!');
      },
    });
  }
}

///////////////////////////////////////////////////////////////////////////
///////////////  OLD CODE ////////////////////////////////////////////////////////////

// for (var i = 0; i < this.cartItems.length; i++) {
//   if (this.cartItems[i].CartItem.quantity) {
//     total += this.cartItems[i].CartItem.quantity * this.cartItems[i].price;
//   }
// }
// return total;

// getCart() {
//   return Preferences.get({ key: 'cart' });
// }

// getOrderedItems() {
//   let myFormdata = new FormData();

//   this.model.items.forEach((item: any, idx: any) => {
//     myFormdata.append('id_' + idx, item.ID);
//   });
// }

// async calculate() {
//   let item = this.model.items.filter((x: any) => x.quantity > 0);
//   this.model.items = item;
//   console.log(this.model.items);
//   this.model.totalPrice = 0;
//   this.model.totalItem = 0;
//   this.model.deliveryCharge = 0;
//   this.model.grandTotal = 0;
//   item.forEach((element: any) => {
//     this.model.totalItem += element.quantity;
//     this.model.totalPrice +=
//       parseFloat(element.price) * parseFloat(element.quantity);
//   });
//   this.model.deliveryCharge = this.deliveryCharge;
//   this.model.totalPrice = parseFloat(this.model.totalPrice).toFixed(2);
//   this.model.grandTotal =
//     parseFloat(this.model.totalPrice) + parseFloat(this.model.deliveryCharge);
//   if (this.model.totalItem == 0) {
//     this.model.totalItem = 0;
//     this.model.totalPrice = 0;
//     this.model.grandTotal = 0;
//     await this.clearCart();
//     this.model = null;
//   }
//   console.log('cart: ', this.model);
// }

// clearCart() {
//   return Preferences.remove({ key: 'cart' });
// }

// quantityPlus(index: any) {
//   this.cartService.quantityPlus(index);
// }

// quantityMinus(index: any) {
//   this.cartService.quantityMinus(index);
// }
// onAddCartItems(formData: any) {
//   this.cartService.addCartToServer(formData).subscribe({
//     next: (result) => {
//       console.log(result);
//       alert('Cart was created successfully');
//       // this.router.navigate(['/login']);
//     },
//     error: (err) => {
//       console.log(err);
//       alert('Registration failed!');
//     },
//   });
// }

// onDeleteCartItems(item: any) {
//   this.cartService.deleteCartToServer(item).subscribe({
//     next: (result) => {
//       console.log(result);
//       alert('Cart was deleted successfully');
//       //this.router.navigate(['/login']);
//     },
//     error: (err) => {
//       console.log(err);
//       alert('Cart deletion failed!');
//     },
//   });
// }

// quantityPlus(item: any, index: any) {
//   const formData: any = serialize(item, {
//     dotsForObjectNotation: true,
//   });
//   console.log('formData', formData);
//   try {
//     const index = this.allItems.findIndex((x) => x.id === item.id);
//     console.log('item', this.items);
//     console.log('index', index);
//     if (!this.items[index].quantity || this.items[index].quantity == 0) {
//       this.items[index].quantity = 1;
//       this.onAddCartItems(formData);
//     } else {
//       this.items[index].quantity += 1;
//       this.onAddCartItems(formData);
//     }
//   } catch (e) {
//     console.log(e);
//   }
// }

// quantityMinus(index: any, item: any) {
//   try {
//     const index = this.allItems.findIndex((x) => x.id === item.id) - 1;
//     if (this.items[index].quantity !== 0) {
//       this.items[index].quantity -= 1;
//       this.items[index].quantity = 0;
//     }
//     console.log(item);
//     this.onDeleteCartItems(item);
//   } catch (e) {
//     console.log(e);
//   }
// }

// quantityPlus(item: any, index: any) {
//   try {
//     const i = this.items.findIndex((x: any) => x.id === index.id);
//     console.log('this.model.items: ', this.items);
//     console.log('index', i);
//     if (!this.items[i].quantity || this.items[i].quantity == 0) {
//       this.items[i].quantity = 1;
//       this.calculate();
//     } else {
//       this.items[i].quantity = (this.items[i].quantity as any) + 1;
//       this.calculate();
//     }
//   } catch (e) {
//     console.log(e);
//   }
// }

// quantityMinus(item: any, index: any) {
//   try {
//     const i = this.model.items.findIndex((x: any) => x.id === index.id);
//     if (this.model.items[i].quantity !== 0) {
//       this.model.items[i].quantity -= 1; // this.model.items[index].quantity = this.model.items[index].quantity - 1
//     } else {
//       this.model.items[i].quantity = 0;
//     }
//     this.calculate();
//   } catch (e) {
//     console.log(e);
//   }
// }

// convertToString(names: any) {
//   const separator = ',';
//   let result = '';

//   for (let i = 0; i < names.length; i++) {
//     result += names[i];
//     if (i !== names.length - 1) {
//       result += separator;
//     }
//   }
//   console.log(result);
// }

// makePayment() {
//   console.log('model: ', this.model);
//   const data: any = {
//     userId: this.model.userId,
//     restaurantId: parseInt(this.urlCheck),
//     total: parseFloat(this.model.totalPrice),
//     deliveryCharge: parseFloat(this.model.deliveryCharge),
//     grandTotal: parseFloat(this.model.grandTotal),
//     status: 'Created',
//     paymentMode: 'COD',
//     paymentStatus: true,
//     instruction: this.instruction,
//     time: moment().format('lll'),
//   };
//   console.log('restaurantId', data.restaurantId);
//   console.log('order: ', data);
//   console.log('userId', data.userId);
//   console.log(data.orders);
//   this.isLoading = true;
//   this.global.showLoader();
//   const formData: any = serialize(data, { dotsForObjectNotation: true });
//   console.log('formData from placeOrder in OrderService', formData);
//   this.orderService.addOrderToServer(data).subscribe({
//     next: (result) => {
//       console.log(result);
//       this.isLoading = false;
//       this.global.successToast('Menu item was added successfully!');
//       this.global.hideLoader();
//       this.router.navigateByUrl('/tabs/account');
//     },
//     error: (err) => {
//       console.log(err);
//       this.global.errorToast('Restaurant addition failed');
//       this.isLoading = false;
//       this.global.hideLoader();
//     },
//   });
// }

// async getData() {
//   this.checkUrl();
//   this.getModel();
// }

// async getModel() {
//   let data: any = await this.getCart();
//   this.location = {
//     lat: 53.5461,
//     lng: -113.4937,
//   };
// }

//   // console.log(this.formatData());
//   // this.itemService.addItemToServer(this.formatData()).subscribe({
//   //   next: (result) => {
//   //     console.log(result);
//   //     this.isLoading = false;
//   //     this.global.successToast('Menu item was added successfully!');
//   //     this.global.hideLoader();
//   //     this.router.navigateByUrl('/tabs/account');
//   //   },
//   //   error: (err) => {
//   //     console.log(err);
//   //     this.global.errorToast('Item addition failed');
//   //     this.isLoading = false;
//   //     this.global.hideLoader();
//   //   },
//   // });
// }

// makePayment() {
//   try {
//     console.log('model: ', this.model);
//     const data: any = {
//       restaurantId: this.model.restaurant.id,
//       instruction: this.instruction,
//       order: this.model.items, //JSON.stringify(this.model.items)
//       time: moment().format('lll'),
//       address: this.location,
//       total: this.model.totalPrice,
//       grandTotal: this.model.grandTotal,
//       deliveryCharge: this.deliveryCharge,
//       status: 'Created',
//       paymentStatus: true,
//       paymentMode: 'COD',
//     };
//     console.log('order: ', data);
//     this.orderService.placeOrder(data);
//     // clear cart
//     this.cartService.clearCart();
//     this.model = {} as Cart;
//     this.global.successToast('Your Order is Placed Successfully');
//     this.navCtrl.navigateRoot(['tabs/account']);
//   } catch (e) {
//     console.log(e);
//   }
// }

// ionViewWillLeave() {
//   // console.log('ionViewWillLeave CartPage');
//   // if (this.model?.items && this.model?.items.length > 0) {
//   //   this.cartService.saveCart();
//   // }
// }

// ngOnDestroy() {
//   console.log('Destroy CartPage');
//   if (this.addressSub) this.addressSub.unsubscribe();
//   if (this.cartSub) this.cartSub.unsubscribe();
// }

// convertToString(array: any) {
//   return JSON.stringify(
//     array.map((e: any) => ({
//       name: e.name,
//       price: e.price,
//       quantity: e.quantity,
//     }))
//   );
// }

// jsonParse(el: any) {
//   return eval(el);
// }

// convertJSON(arr: any) {
//   return arr.map((item: any) => JSON.stringify(item));
// }
