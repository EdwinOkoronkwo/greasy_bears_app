import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ItemCategory } from '../../models/itemcategory.model';
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
import { UserService } from '../user/user.service';
import { RestaurantService } from '../restaurant/restaurant.service';

@Injectable({
  providedIn: 'root',
})
export class ItemCategoryService {
  status$ = of([true, false]);
  itemCategories$ = this.api
    .get('itemCategories')
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

  // Combine three data streams
  itemCategoriesWithRestaurantsAndUsers$ = combineLatest([
    this.itemCategories$,
    this.restaurants$,
    this.users$,
  ]).pipe(
    delay(2000),
    map(([itemCategories, restaurants, users]) => {
      return itemCategories.map((itemCategory: any) => {
        return {
          ...itemCategory,
          restaurantName: restaurants.find(
            (restaurant: any) => restaurant.id === itemCategory.RestaurantId
          )?.name,
        } as ItemCategory;
      });
    }),
    map(([itemCategories, restaurants, users]) => {
      return itemCategories.map((itemCategory: any) => {
        return {
          ...itemCategory,
          userName: users.find((user: any) => user.id === itemCategory.UserId)
            ?.name,
        } as ItemCategory;
      });
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  /***
   * Create CRUD Subject for add, delete and update
   */
  private itemCategoryCRUDSubject = new Subject<CRUDAction<ItemCategory>>();
  itemCategoryCRUDAction$ = this.itemCategoryCRUDSubject.asObservable();

  private itemCategoryCRUDCompleteSubject = new Subject<boolean>();
  itemCategoryCRUDCompleteAction$ =
    this.itemCategoryCRUDCompleteSubject.asObservable();

  addItemCategory(itemCategory: ItemCategory) {
    this.itemCategoryCRUDSubject.next({ action: 'add', data: itemCategory });
  }

  updateItemCategory(itemCategory: ItemCategory) {
    this.itemCategoryCRUDSubject.next({ action: 'update', data: itemCategory });
  }

  deleteItemCategory(itemCategory: ItemCategory) {
    this.itemCategoryCRUDSubject.next({ action: 'delete', data: itemCategory });
  }

  // Need to merge students with CRUD actions
  itemCategoriesWithRestaurantsAndUsersAndCRUD$ = merge(
    this.itemCategoriesWithRestaurantsAndUsers$,
    this.itemCategoryCRUDAction$.pipe(
      concatMap((itemCategoryAction: any) =>
        this.saveItemCategories(itemCategoryAction).pipe(
          map((itemCategory) => ({ ...itemCategoryAction, data: itemCategory }))
        )
      )
    )
  ).pipe(
    scan((itemCategories, value: any) => {
      return this.modifyItemCategories(itemCategories, value);
    }, [] as ItemCategory[]),
    shareReplay(1),
    catchError(this.handleError)
  );

  // Modify Students
  modifyItemCategories(
    itemCategories: ItemCategory[],
    value: ItemCategory[] | CRUDAction<ItemCategory>
  ) {
    if (!(value instanceof Array)) {
      if (value.action === 'add') {
        return [...itemCategories, value.data];
      }
      if (value.action === 'update') {
        return itemCategories.map((itemCategory) =>
          itemCategory.id === value.data.id ? value.data : itemCategory
        );
      }
      if (value.action === 'delete') {
        return itemCategories.filter(
          (itemCategory) => itemCategory.id !== value.data.id
        );
      }
    } else {
      return value;
    }
    return itemCategories;
  }

  // save the students data to database
  saveItemCategories(itemCategoryAction: CRUDAction<ItemCategory>) {
    let itemCategoryDetails$!: Observable<ItemCategory>;
    if (itemCategoryAction.action === 'add') {
      itemCategoryDetails$ = this.addItemCategoryToServer(
        itemCategoryAction.data
      ).pipe(
        tap((itemCategory) => {
          this.notificationService.setSuccessMessage(
            'Item Category Added Sucessfully!'
          );
          this.itemCategoryCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (itemCategoryAction.action === 'update') {
      itemCategoryDetails$ = this.updateItemCategoryToServer(
        itemCategoryAction.data
      ).pipe(
        tap((itemCategory) => {
          this.notificationService.setSuccessMessage(
            'Item Category Updated Sucessfully!'
          );
          this.itemCategoryCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (itemCategoryAction.action === 'delete') {
      return this.deleteItemCategoryToServer(itemCategoryAction.data)
        .pipe(
          tap((itemCategory) => {
            this.notificationService.setSuccessMessage(
              'Item Category Deleted Sucessfully!'
            );
            this.itemCategoryCRUDCompleteSubject.next(true);
          }),
          catchError(this.handleError)
        )
        .pipe(map((itemCategory) => itemCategoryAction.data));
    }

    return itemCategoryDetails$.pipe(
      concatMap((itemCategory: any) =>
        this.restaurantService.restaurantsWithUsersAndCitiesAndCRUD$.pipe(
          map((restaurants) => {
            return {
              ...itemCategory,
              restaurantName: restaurants.find(
                (restaurant: any) => restaurant.id === itemCategory.restaurantId
              )?.name,
            };
          })
        )
      ),
      shareReplay(1),
      catchError(this.handleError)
    );
  }

  addItemCategoryToServer(itemCategory: ItemCategory) {
    return this.api.post('itemCategories', itemCategory);
  }

  updateItemCategoryToServer(itemCategory: ItemCategory) {
    return this.api.patch(`itemCategories/${itemCategory.id}`, itemCategory);
  }

  deleteItemCategoryToServer(itemCategory: ItemCategory) {
    return this.api.delete(`itemCategories/${itemCategory.id}`);
  }

  /**************
   * Selecting a single itemCategory
   */
  private selectedItemCategorySubject = new BehaviorSubject<number>(0);
  selectedItemCategoryAction$ = this.selectedItemCategorySubject.asObservable();

  selectItemCategory(itemCategoryId: number) {
    this.selectedItemCategorySubject.next(itemCategoryId);
  }
  // Combine action data (from select) with data stream from itemCategory API
  itemCategory$ = combineLatest([
    this.itemCategoriesWithRestaurantsAndUsersAndCRUD$,
    this.selectedItemCategoryAction$,
  ]).pipe(
    map(([itemCategories, selectedItemCategoryId]) => {
      return itemCategories.find(
        (itemCategory: any) => itemCategory.id === selectedItemCategoryId
      );
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  constructor(
    private http: HttpClient,
    private restaurantService: RestaurantService,
    private notificationService: NotificationService,
    private userService: UserService,
    private api: ApiService
  ) {}

  handleError(error: Error) {
    return throwError(() => {
      return 'Unknown error occurred. Please try again.';
    });
  }

  ///////////////////////////////////////////////////////////////////

  getItemCategories() {
    // consider getting it as itemCategories$
    return this.api.get<ItemCategory>('itemCategories');
  }
}
