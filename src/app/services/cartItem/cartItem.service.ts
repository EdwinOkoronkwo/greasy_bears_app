import { Injectable } from '@angular/core';
import { CartItem } from '../../interfaces/cartItem.interface';
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
import { NotificationService } from './../notification/notification.service';
import { ApiService } from './../api/api.service';
import { CartService } from '../cart/cart.service';
import { ItemService } from '../item/item.service';

@Injectable({
  providedIn: 'root',
})
export class CartItemService {
  cartItems$ = this.api
    .get('cartItems')
    .pipe(catchError(this.handleError), shareReplay(1));
  carts$ = this.cartService.cartsWithUsersAndCRUD$.pipe(
    catchError(this.handleError),
    shareReplay(1)
  );
  items$ = this.itemService.itemsWithRestaurantsAndCategoriesAndCRUD$.pipe(
    catchError(this.handleError),
    shareReplay(1)
  );

  // Combine three data streams
  cartItemsWithCartsAndItems$ = combineLatest([
    this.cartItems$,
    this.carts$,
    this.items$,
  ]).pipe(
    delay(2000),
    map(([cartItems, carts, items]) => {
      return cartItems.map((cartItem: any) => {
        return {
          ...cartItem,
          ItemName: items.find((item: any) => item.id === cartItem.itemId)
            ?.name,
        } as CartItem;
      });
    }),
    map(([cartItems, carts, items]) => {
      return cartItems.map((cartItem: any) => {
        return {
          ...cartItem,
          cartName: carts.find((cart: any) => cart.id === cartItem.cartId)?.id,
        } as CartItem;
      });
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  /***
   * Create CRUD Subject for add, delete and update
   */
  private cartItemsCRUDSubject = new Subject<CRUDAction<CartItem>>();
  cartItemsCRUDAction$ = this.cartItemsCRUDSubject.asObservable();

  private cartItemsCRUDCompleteSubject = new Subject<boolean>();
  cartItemsCRUDCompleteAction$ =
    this.cartItemsCRUDCompleteSubject.asObservable();

  addCartItem(cartItem: CartItem) {
    this.cartItemsCRUDSubject.next({ action: 'add', data: cartItem });
  }

  updateCartItem(cartItem: CartItem) {
    this.cartItemsCRUDSubject.next({ action: 'update', data: cartItem });
  }

  deleteCartItem(cartItem: CartItem) {
    this.cartItemsCRUDSubject.next({ action: 'delete', data: cartItem });
  }

  // Need to merge students with CRUD actions
  cartItemsWithCartsAndItemsAndCRUD$ = merge(
    this.cartItemsWithCartsAndItems$,
    this.cartItemsCRUDAction$.pipe(
      concatMap((cartItemAction: any) =>
        this.saveCartItems(cartItemAction).pipe(
          map((cartItem) => ({ ...cartItemAction, data: cartItem }))
        )
      )
    )
  ).pipe(
    scan((cartItems, value: any) => {
      return this.modifyCartItems(cartItems, value);
    }, [] as CartItem[]),
    shareReplay(1),
    catchError(this.handleError)
  );

  // Modify Students
  modifyCartItems(
    cartItems: CartItem[],
    value: CartItem[] | CRUDAction<CartItem>
  ) {
    if (!(value instanceof Array)) {
      if (value.action === 'add') {
        return [...cartItems, value.data];
      }
      if (value.action === 'update') {
        return cartItems.map((cartItem) =>
          cartItem.id === value.data.id ? value.data : cartItem
        );
      }
      if (value.action === 'delete') {
        return cartItems.filter((cartItem) => cartItem.id !== value.data.id);
      }
    } else {
      return value;
    }
    return cartItems;
  }

  // save the students data to database
  saveCartItems(cartItemAction: CRUDAction<CartItem>) {
    let cartItemsDetails$!: Observable<CartItem>;
    if (cartItemAction.action === 'add') {
      cartItemsDetails$ = this.addCartItemToServer(cartItemAction.data).pipe(
        tap((cartItem) => {
          this.notificationService.setSuccessMessage(
            'CartItem Added Sucessfully!'
          );
          this.cartItemsCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (cartItemAction.action === 'update') {
      cartItemsDetails$ = this.updateCartItemToServer(cartItemAction.data).pipe(
        tap((cartItem) => {
          this.notificationService.setSuccessMessage(
            'CartItem Updated Sucessfully!'
          );
          this.cartItemsCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (cartItemAction.action === 'delete') {
      return this.deleteCartItemToServer(cartItemAction.data)
        .pipe(
          tap((cartItem) => {
            this.notificationService.setSuccessMessage(
              'CartItem Deleted Sucessfully!'
            );
            this.cartItemsCRUDCompleteSubject.next(true);
          }),
          catchError(this.handleError)
        )
        .pipe(map((cartItem) => cartItemAction.data));
    }

    return cartItemsDetails$.pipe(
      concatMap((cartItem: any) =>
        this.itemService.itemsWithRestaurantsAndCategoriesAndCRUD$.pipe(
          map((items) => {
            return {
              ...cartItem,
              itemName: items.find((item: any) => item.id === cartItem.itemId)
                ?.name,
            };
          })
        )
      ),
      concatMap((cartItem: any) =>
        this.cartService.cartsWithUsersAndCRUD$.pipe(
          map((carts) => {
            return {
              ...cartItem,
              cartName: carts.find((cart: any) => cart.id === cartItem.cartId)
                ?.userId,
            };
          })
        )
      ),
      shareReplay(1),
      catchError(this.handleError)
    );
  }

  addCartItemToServer(cartItem: CartItem) {
    return this.api.post('cartItems', cartItem);
  }

  updateCartItemToServer(cartItem: CartItem) {
    return this.api.patch(`cartItems/${cartItem.id}`, cartItem);
  }

  deleteCartItemToServer(cartItem: CartItem) {
    return this.api.delete(`cartItems/${cartItem.id}`);
  }

  /**************
   * Selecting a single cartItem
   */
  private selectedCartItemSubject = new BehaviorSubject<number>(0);
  selectedCartItemAction$ = this.selectedCartItemSubject.asObservable();

  selectCartItem(cartId: number) {
    this.selectedCartItemSubject.next(cartId);
  }
  // Combine action data (from select) with data stream from cartItem API
  cartItem$ = combineLatest([
    this.cartItemsWithCartsAndItemsAndCRUD$,
    this.selectedCartItemAction$,
  ]).pipe(
    map(([cartItems, selectedCartItemId]) => {
      return cartItems.find(
        (cartItem: any) => cartItem.id === selectedCartItemId
      );
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  constructor(
    private cartService: CartService,
    private itemService: ItemService,
    private notificationService: NotificationService,
    private api: ApiService
  ) {}

  handleError(error: Error) {
    return throwError(() => {
      return 'Unknown error occurred. Please try again.';
    });
  }
}
