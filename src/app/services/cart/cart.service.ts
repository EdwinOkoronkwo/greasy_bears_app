import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cart } from '../../interfaces/cart.interface';
import {
  catchError,
  concatMap,
  map,
  scan,
  shareReplay,
  tap,
  delay,
} from 'rxjs/operators';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  merge,
  of,
  throwError,
} from 'rxjs';
import { CRUDAction } from '../../interfaces/crud.interface';
import { NotificationService } from '../notification/notification.service';
import { ApiService } from '../api/api.service';
import { UserService } from '../user/user.service';
import { RestaurantService } from '../restaurant/restaurant.service';
import { Strings } from 'src/app/enum/strings';
import { StorageService } from '../storage/storage.service';
import { GlobalService } from '../global/global.service';
import { Order } from 'src/app/models/order.model';
import { Item } from 'src/app/models/item.model';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  carts$ = this.api
    .get('carts')
    .pipe(catchError(this.handleError), shareReplay(1));
  users$ = this.userService.usersWithCRUD$.pipe(
    catchError(this.handleError),
    shareReplay(1)
  );

  // Combine two data streams
  cartsWithUsers$ = combineLatest([this.carts$, this.users$]).pipe(
    delay(2000),
    map(([carts, users]) => {
      return carts.map((cart: any) => {
        return {
          ...cart,
          userName: users.find((user: any) => user.id === cart.userId)?.name,
        } as Cart;
      });
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  /***
   * Create CRUD Subject for add, delete and update
   */
  private cartsCRUDSubject = new Subject<CRUDAction<Cart>>();
  cartsCRUDAction$ = this.cartsCRUDSubject.asObservable();

  private cartsCRUDCompleteSubject = new Subject<boolean>();
  cartCRUDCompleteAction$ = this.cartsCRUDCompleteSubject.asObservable();

  addCart(cart: Cart) {
    this.cartsCRUDSubject.next({ action: 'add', data: cart });
  }

  updateCart(cart: Cart) {
    this.cartsCRUDSubject.next({ action: 'update', data: cart });
  }

  deleteCart(cart: Cart) {
    this.cartsCRUDSubject.next({ action: 'delete', data: cart });
  }

  // Need to merge students with CRUD actions
  cartsWithUsersAndCRUD$ = merge(
    this.cartsWithUsers$,
    this.cartsCRUDAction$.pipe(
      concatMap((cartAction: any) =>
        this.saveCarts(cartAction).pipe(
          map((cart) => ({ ...cartAction, data: cart }))
        )
      )
    )
  ).pipe(
    scan((carts, value: any) => {
      return this.modifyCarts(carts, value);
    }, [] as Cart[]),
    shareReplay(1),
    catchError(this.handleError)
  );

  // Modify Students
  modifyCarts(carts: Cart[], value: Cart[] | CRUDAction<Cart>) {
    if (!(value instanceof Array)) {
      if (value.action === 'add') {
        return [...carts, value.data];
      }
      if (value.action === 'update') {
        return carts.map((cart) =>
          cart.id === value.data.id ? value.data : cart
        );
      }
      if (value.action === 'delete') {
        return carts.filter((cart) => cart.id !== value.data.id);
      }
    } else {
      return value;
    }
    return carts;
  }

  // save the students data to database
  saveCarts(cartAction: CRUDAction<Cart>) {
    let cartDetails$!: Observable<Cart>;
    if (cartAction.action === 'add') {
      cartDetails$ = this.addCartToServer(cartAction.data).pipe(
        tap((cart) => {
          this.notificationService.setSuccessMessage('Cart Added Sucessfully!');
          this.cartsCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (cartAction.action === 'update') {
      cartDetails$ = this.updateCartToServer(cartAction.data).pipe(
        tap((cart) => {
          this.notificationService.setSuccessMessage(
            'Cart Updated Sucessfully!'
          );
          this.cartsCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (cartAction.action === 'delete') {
      return this.deleteCartToServer(cartAction.data)
        .pipe(
          tap((cart) => {
            this.notificationService.setSuccessMessage(
              'Cart Deleted Sucessfully!'
            );
            this.cartsCRUDCompleteSubject.next(true);
          }),
          catchError(this.handleError)
        )
        .pipe(map((cart) => cartAction.data));
    }

    return cartDetails$.pipe(
      concatMap((cart: any) =>
        this.userService.usersWithCRUD$.pipe(
          map((users) => {
            return {
              ...cart,
              userName: users.find((user: any) => user.id === cart.userId)
                ?.name,
            };
          })
        )
      ),
      shareReplay(1),
      catchError(this.handleError)
    );
  }

  addCartToServer(cart: Cart) {
    return this.api.post('carts', cart);
  }

  updateCartToServer(cart: Cart) {
    return this.api.patch(`carts/${cart.id}`, cart);
  }

  deleteCartToServer(cart: Cart) {
    return this.api.delete(`carts/${cart.id}`);
  }

  /**************
   * Selecting a single cart
   */
  private selectedCartSubject = new BehaviorSubject<number>(0);
  selectedCartAction$ = this.selectedCartSubject.asObservable();

  selectTask(cartId: number) {
    this.selectedCartSubject.next(cartId);
  }
  // Combine action data (from select) with data stream from cart API
  cart$ = combineLatest([
    this.cartsWithUsersAndCRUD$,
    this.selectedCartAction$,
  ]).pipe(
    map(([carts, selectedCartId]) => {
      return carts.find((cart: any) => cart.id === selectedCartId);
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private storage: StorageService,
    private global: GlobalService,
    private api: ApiService
  ) {}

  handleError(error: Error) {
    return throwError(() => {
      return 'Unknown error occurred. Please try again.';
    });
  }

  ////////////////////////////////////////////////////////////////////////////////////

  ///////////// CART SERVICES /////////////////////////////////////////////

  postCart(formData: any) {
    console.log(formData);
    return this.api.post<any>('carts', formData);
  }

  getCart() {
    return this.api.get<Cart>('carts');
  }

  createCart() {
    // Send http request to the backend to create a cart
    // when the user clicks the Add to cart button
    // This same service will handle increase of items
    // addCart() may be able to provide the functionality
  }

  // getCart() {
  //   // Send http request to the backend to get carts
  //   // the returned cart from backend is availabel to be displayed on the Cart page
  //   // The same data will be required on the cartItem page
  //   // carts$ may be able to provide the functionality
  // }

  deleteCartItem() {
    // call this to delete the cart items
    // delete() may be able to provide the functionality
  }

  ////////////////////////////////////////////////////////////////////////////////////////

  alertClearCart(index: any, items: any, data: any, order?: any) {
    this.global.showAlert(
      order
        ? 'Would you like to reset your cart before re-ordering from this restaurant?'
        : 'Your cart contain items from a different restaurant. Would you like to reset your cart before browsing the restaurant?',
      'Items already in Cart',
      [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            return;
          },
        },
        {
          text: 'Yes',
          handler: () => {
            this.clear(index, items, data, order);
          },
        },
      ]
    );
  }

  async clear(index: any, items: any, data: any, order?: any) {
    await this.clearCart();
    //  this.model = {} as Cart;
  }

  clearCart() {
    this.global.showLoader();
    this.storage.removeStorage(Strings.CART_STORAGE);
    //  this._cart.next(null);
    this.global.hideLoader();
  }
}

///////////////////////////////////////////////////////////////

// getCart() {
//   return this.storage.getStorage(Strings.CART_STORAGE);
// }

// async getCartData(val?: any) {
//   let data: any = await this.getCart();
//   console.log('data: ', data);
//   if (data?.value) {
//     this.model = await JSON.parse(data.value);
//     console.log('model: ', this.model);
//     await this.calculate();
//     if (!val) this._cart.next(this.model);
//   }
// }

// model = {} as Cart;
// deliveryCharge = 20;
// private _cart = new BehaviorSubject<Cart | null>(null);

// get cart() {
//   return this._cart.asObservable();
// }
