import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from '../../models/order.model';
import { serialize } from 'object-to-formdata';

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
  lastValueFrom,
  merge,
  of,
  throwError,
} from 'rxjs';
import { CRUDAction } from '../../interfaces/crud.interface';
import { NotificationService } from '../notification/notification.service';
import { ApiService } from '../api/api.service';
import { RestaurantService } from '../restaurant/restaurant.service';
import { UserService } from '../user/user.service';
import { ItemService } from '../item/item.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  status$ = of(['Complete', 'In Progress']);
  paymentMode$ = of(['Debit', 'Credit', 'Cash']);
  paymentStatus$ = of(['Paid', 'Not Paid']);
  orders$ = this.api
    .get('orders')
    .pipe(catchError(this.handleError), shareReplay(1));
  restaurants$ =
    this.restaurantService.restaurantsWithUsersAndCitiesAndCRUD$.pipe(
      catchError(this.handleError),
      shareReplay(1)
    );
  users$ = this.userService.usersWithCRUD$.pipe(
    catchError(this.handleError),
    shareReplay(1)
  );
  items$ =
    this.itemService.itemsWithRestaurantsAndCategoriesAndUsersAndCRUD$.pipe(
      catchError(this.handleError),
      shareReplay(1)
    );

  // Combine three data streams
  ordersWithRestaurantsAndUsersAndItems$ = combineLatest([
    this.orders$,
    this.users$,
    this.restaurants$,
    this.items$,
  ]).pipe(
    delay(2000),
    map(([orders, restaurants, users, items]: any) => {
      return orders.map((order: any) => {
        return {
          ...order,
          restaurantName: restaurants.find(
            (restaurant: any) => restaurant.id === order.RestaurantId
          )?.name,
        } as Order;
      });
    }),
    map(([orders, users, restaurants, items]) => {
      return orders.map((order: any) => {
        return {
          ...order,
          userName: users.find((user: any) => user.id === order.UserId)?.name,
        } as Order;
      });
    }),
    map(([orders, users, restaurants, items]) => {
      return orders.map((order: any) => {
        return {
          ...order,
          itemName: items.find((item: any) => item.id === order.ItemId)?.name,
        } as Order;
      });
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  /***
   * Create CRUD Subject for add, delete and update
   */
  private ordersCRUDSubject = new Subject<CRUDAction<Order>>();
  ordersCRUDAction$ = this.ordersCRUDSubject.asObservable();

  private ordersCRUDCompleteSubject = new Subject<boolean>();
  itemsCRUDCompleteAction$ = this.ordersCRUDCompleteSubject.asObservable();

  addOrder(order: Order) {
    this.ordersCRUDSubject.next({ action: 'add', data: order });
  }

  updateOrder(order: Order) {
    this.ordersCRUDSubject.next({ action: 'update', data: order });
  }

  deleteOrder(order: Order) {
    this.ordersCRUDSubject.next({ action: 'delete', data: order });
  }

  // Need to merge students with CRUD actions
  ordersWithRestaurantsAndUsersAndItemsAndCRUD$ = merge(
    this.ordersWithRestaurantsAndUsersAndItems$,
    this.ordersCRUDAction$.pipe(
      concatMap((orderAction: any) =>
        this.saveOrders(orderAction).pipe(
          map((order) => ({ ...orderAction, data: order }))
        )
      )
    )
  ).pipe(
    scan((orders, value: any) => {
      return this.modifyOrders(orders, value);
    }, [] as Order[]),
    shareReplay(1),
    catchError(this.handleError)
  );

  // Modify Students
  modifyOrders(orders: Order[], value: Order[] | CRUDAction<Order>) {
    if (!(value instanceof Array)) {
      if (value.action === 'add') {
        return [...orders, value.data];
      }
      if (value.action === 'update') {
        return orders.map((order) =>
          order.id === value.data.id ? value.data : order
        );
      }
      if (value.action === 'delete') {
        return orders.filter((order) => order.id !== value.data.id);
      }
    } else {
      return value;
    }
    return orders;
  }

  // save the order data to database
  saveOrders(orderAction: CRUDAction<Order>) {
    let orderDetails$!: Observable<Order>;
    if (orderAction.action === 'add') {
      orderDetails$ = this.addOrderToServer(orderAction.data).pipe(
        tap((order) => {
          this.notificationService.setSuccessMessage(
            'Order Added Sucessfully!'
          );
          this.ordersCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (orderAction.action === 'update') {
      orderDetails$ = this.updateOrderToServer(orderAction.data).pipe(
        tap((order) => {
          this.notificationService.setSuccessMessage(
            'Order Updated Sucessfully!'
          );
          this.ordersCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (orderAction.action === 'delete') {
      return this.deleteOrderToServer(orderAction.data)
        .pipe(
          tap((order) => {
            this.notificationService.setSuccessMessage(
              'Order Deleted Sucessfully!'
            );
            this.ordersCRUDCompleteSubject.next(true);
          }),
          catchError(this.handleError)
        )
        .pipe(map((order) => orderAction.data));
    }

    return orderDetails$.pipe(
      concatMap((order: any) =>
        this.restaurantService.restaurantsWithUsersAndCitiesAndCRUD$.pipe(
          map((restaurants) => {
            return {
              ...order,
              restaurantName: restaurants.find(
                (restaurant: any) => restaurant.id === order.RestaurantId
              )?.name,
            };
          })
        )
      ),
      concatMap((order: any) =>
        this.userService.usersWithCRUD$.pipe(
          map((users) => {
            return {
              ...order,
              userName: users.find((user: any) => user.id === order.UserId)
                ?.name,
            };
          })
        )
      ),
      concatMap((order: any) =>
        this.itemService.itemsWithRestaurantsAndCategoriesAndUsersAndCRUD$.pipe(
          map((items) => {
            return {
              ...order,
              itemName: items.find((item: any) => item.id === order.ItemId)
                ?.name,
            };
          })
        )
      ),
      shareReplay(1),
      catchError(this.handleError)
    );
  }

  addOrderToServer(order: Order) {
    return this.api.post('orders', order);
  }

  updateOrderToServer(order: Order) {
    return this.api.patch(`orders/${order.id}`, order);
  }

  deleteOrderToServer(order: Order) {
    return this.api.delete(`orders/${order.id}`);
  }

  /**************
   * Selecting a single order
   */
  private selectedOrderSubject = new BehaviorSubject<number>(0);
  selectedOrderAction$ = this.selectedOrderSubject.asObservable();

  selectOrder(orderId: number) {
    this.selectedOrderSubject.next(orderId);
  }
  // Combine action data (from select) with data stream from order API
  order$ = combineLatest([
    this.ordersWithRestaurantsAndUsersAndItemsAndCRUD$,
    this.selectedOrderAction$,
  ]).pipe(
    map(([orders, selectedOrderId]) => {
      return orders.find((order: any) => order.id === selectedOrderId);
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  handleError(error: Error) {
    return throwError(() => {
      return 'Unknown error occurred. Please try again.';
    });
  }

  constructor(
    private http: HttpClient,
    private restaurantService: RestaurantService,
    private userService: UserService,
    private notificationService: NotificationService,
    private itemService: ItemService,
    private api: ApiService
  ) {}

  ///////////////////////////////////////////////////////////////////////////////

  getOrders() {
    return this.api.get<Order>('orders');
  }

  getOrdersPrice() {
    return this.api.get<Order>('orders/ordersPrice');
  }

  getOrdersQuantity() {
    return this.api.get<Order>('orders/ordersQuantity');
  }

  postOrder(formData: any) {
    console.log('order placed');
    return this.api.post('orders', formData);
  }

  // getOrders() {
  //   // Will be used to recover orders from the server
  //   // Try to use ordersWithRestaurantsAndUsersAndItems$
  //   return this.api.get('orders');
  // }

  placeOrder(formData: any) {
    // this should be used to send order request to backend for order creation
    // the createOrder handler will take care of this
    // try to use the addOrder() or addOrderToServer()
    return this.api.post<Order>('orders', formData);
  }
}
