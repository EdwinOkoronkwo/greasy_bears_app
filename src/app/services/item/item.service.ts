import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Item } from '../../models/item.model';
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
import { RestaurantService } from '../restaurant/restaurant.service';
import { ItemCategoryService } from '../itemcategory/itemCategory.service';
import { UserService } from '../user/user.service';
import { ItemCategory } from 'src/app/models/itemcategory.model';
import { User } from 'src/app/models/user.model';
import { Restaurant } from 'src/app/models/restaurant.model';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  status$ = of([true, false]);
  isVeg$ = of([true, false]);
  items$ = this.api
    .get('items')
    .pipe(catchError(this.handleError), shareReplay(1));
  restaurants$ =
    this.restaurantService.restaurantsWithUsersAndCitiesAndCRUD$.pipe(
      catchError(this.handleError),
      shareReplay(1)
    );
  itemCategories$ =
    this.categoryService.itemCategoriesWithRestaurantsAndUsersAndCRUD$.pipe(
      catchError(this.handleError),
      shareReplay(1)
    );

  users$ = this.userService.usersCRUDAction$.pipe(
    catchError(this.handleError),
    shareReplay(1)
  );

  // Combine three data streams
  itemsWithRestaurantsAndCategoriesAndUsers$ = combineLatest([
    this.items$,
    this.itemCategories$,
    this.restaurants$,
    this.users$,
  ]).pipe(
    delay(2000),
    map(([items, categories, restaurants, users]) => {
      return items.map((item: any) => {
        return {
          ...item,
          restaurantName: restaurants.find(
            (restaurant: any) => restaurant.id === item.RestaurantId
          )?.name,
        } as Item;
      });
    }),
    map(([items, categories, restaurants, users]) => {
      return items.map((item: any) => {
        return {
          ...item,
          itemCategoryName: categories.find(
            (category: any) => category.id === item.ItemCategoryId
          )?.name,
        } as Item;
      });
    }),
    map(([items, categories, restaurants, users]) => {
      return items.map((item: any) => {
        return {
          ...item,
          userName: users.find((user: any) => user.id === item.UserId)?.name,
        } as Item;
      });
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  /***
   * Create CRUD Subject for add, delete and update
   */
  private itemsCRUDSubject = new Subject<CRUDAction<Item>>();
  itemsCRUDAction$ = this.itemsCRUDSubject.asObservable();

  private itemsCRUDCompleteSubject = new Subject<boolean>();
  itemsCRUDCompleteAction$ = this.itemsCRUDCompleteSubject.asObservable();

  addItem(item: Item) {
    this.itemsCRUDSubject.next({ action: 'add', data: item });
  }

  updateItem(item: Item) {
    this.itemsCRUDSubject.next({ action: 'update', data: item });
  }

  deleteItem(item: Item) {
    this.itemsCRUDSubject.next({ action: 'delete', data: item });
  }

  // Need to merge students with CRUD actions
  itemsWithRestaurantsAndCategoriesAndUsersAndCRUD$ = merge(
    this.itemsWithRestaurantsAndCategoriesAndUsers$,
    this.itemsCRUDAction$.pipe(
      concatMap((itemAction: any) =>
        this.saveItems(itemAction).pipe(
          map((item) => ({ ...itemAction, data: item }))
        )
      )
    )
  ).pipe(
    scan((items, value: any) => {
      return this.modifyItems(items, value);
    }, [] as Item[]),
    shareReplay(1),
    catchError(this.handleError)
  );

  // Modify Students
  modifyItems(items: Item[], value: Item[] | CRUDAction<Item>) {
    if (!(value instanceof Array)) {
      if (value.action === 'add') {
        return [...items, value.data];
      }
      if (value.action === 'update') {
        return items.map((item) =>
          item.id === value.data.id ? value.data : item
        );
      }
      if (value.action === 'delete') {
        return items.filter((item) => item.id !== value.data.id);
      }
    } else {
      return value;
    }
    return items;
  }

  // save the students data to database
  saveItems(itemAction: CRUDAction<Item>) {
    let itemDetails$!: Observable<Item>;
    if (itemAction.action === 'add') {
      itemDetails$ = this.addItemToServer(itemAction.data).pipe(
        tap((item) => {
          this.notificationService.setSuccessMessage('Item Added Sucessfully!');
          this.itemsCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (itemAction.action === 'update') {
      itemDetails$ = this.updateItemToServer(itemAction.data).pipe(
        tap((item) => {
          this.notificationService.setSuccessMessage(
            'Item Updated Sucessfully!'
          );
          this.itemsCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (itemAction.action === 'delete') {
      return this.deleteItemToServer(itemAction.data)
        .pipe(
          tap((item) => {
            this.notificationService.setSuccessMessage(
              'Item Deleted Sucessfully!'
            );
            this.itemsCRUDCompleteSubject.next(true);
          }),
          catchError(this.handleError)
        )
        .pipe(map((item) => itemAction.data));
    }

    return itemDetails$.pipe(
      concatMap((item: any) =>
        this.restaurantService.restaurantsWithUsersAndCitiesAndCRUD$.pipe(
          map((restaurants) => {
            return {
              ...item,
              restaurantName: restaurants.find(
                (restaurant: any) => restaurant.id === item.RestaurantId
              )?.name,
            };
          })
        )
      ),
      concatMap((item: any) =>
        this.categoryService.itemCategoriesWithRestaurantsAndUsersAndCRUD$.pipe(
          map((categories) => {
            return {
              ...item,
              itemCategoryName: categories.find(
                (category: any) => category.id === item.CategoryId
              )?.name,
            };
          })
        )
      ),
      concatMap((item: any) =>
        this.userService.usersWithCRUD$.pipe(
          map((users) => {
            return {
              ...item,
              userName: users.find((user: any) => user.id === item.UserId)
                ?.name,
            };
          })
        )
      ),
      shareReplay(1),
      catchError(this.handleError)
    );
  }

  addItemToServer(item: Item) {
    return this.api.post('items', item);
  }

  updateItemToServer(item: Item) {
    return this.api.patch(`items/${item.id}`, item);
  }

  deleteItemToServer(item: Item) {
    return this.api.delete(`items/${item.id}`);
  }

  /**************
   * Selecting a single item
   */
  private selectedItemSubject = new BehaviorSubject<number>(0);
  selectedItemAction$ = this.selectedItemSubject.asObservable();

  selectItem(itemId: number) {
    this.selectedItemSubject.next(itemId);
  }
  // Combine action data (from select) with data stream from item API
  item$ = combineLatest([
    this.itemsWithRestaurantsAndCategoriesAndUsersAndCRUD$,
    this.selectedItemAction$,
  ]).pipe(
    map(([items, selectedItemId]) => {
      return items.find((item: any) => item.id === selectedItemId);
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  constructor(
    private http: HttpClient,
    private restaurantService: RestaurantService,
    private categoryService: ItemCategoryService,
    private notificationService: NotificationService,
    private userService: UserService,
    private api: ApiService
  ) {}

  handleError(error: Error) {
    return throwError(() => {
      return 'Unknown error occurred. Please try again.';
    });
  }

  /////////////////////////////////////////////////////////////////////

  getItems() {
    return this.api.get<Item>('items');
  }

  getItem(itemId: number) {
    return this.api.get<Item>(`items/${itemId}`);
  }

  postDeleteItem(itemId: any) {
    console.log(itemId);
    return this.api.delete<any>(`carts/${itemId}`);
  }

  // getItems() {
  //   // The code below will get all items from the backend
  //   return this.api.get<Item[]>('items');
  // }

  // getItem(id: number) {
  //   // the code below should get a specific item
  //   return this.api.get<Item>(`items/${id}`);
  // }

  createItem(formData: any) {
    // This code should create an item
    // this is already in use by the add-menu-item page.
    // However addItemToServer is being used directly instead of addItem()
  }

  deleteCartItem() {
    // the item deletion is handled by the cart
  }
}
