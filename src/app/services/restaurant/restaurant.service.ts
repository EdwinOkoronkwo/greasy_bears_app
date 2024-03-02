import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../../models/user.model';
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
import { NotificationService } from './../notification/notification.service';
import { ApiService } from './../api/api.service';
import { UserService } from '../user/user.service';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { CityService } from '../city/city.service';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  categories$ = of(['Steak', 'Burger', 'Fries', 'Soup', 'Salmon', 'Tuna']);
  cuisines$ = of(['Mexican', 'Indian', 'Brazilian', 'Nigerian', 'Chinese']);
  status$ = of([true, false]);
  isVeg$ = of([true, false]);

  restaurants$ = this.api
    .get('restaurants')
    .pipe(catchError(this.handleError), shareReplay(1));
  users$ = this.userService.usersWithCRUD$.pipe(
    catchError(this.handleError),
    shareReplay(1)
  );
  cities$ = this.cityService.citiesWithCRUD$.pipe(
    catchError(this.handleError),
    shareReplay(1)
  );

  // Combine two data streams
  restaurantsWithUsersAndCities$ = combineLatest([
    this.restaurants$,
    this.users$,
    this.cities$,
  ]).pipe(
    delay(2000),
    map(([restaurants, users, cities]) => {
      return restaurants.map((restaurant: any) => {
        return {
          ...restaurant,
          userName: users.find((user: any) => user.id === restaurant.UserId)
            ?.name,
        } as Restaurant;
      });
    }),
    map(([restaurants, users, cities]) => {
      return restaurants.map((restaurant: any) => {
        return {
          ...restaurant,
          cityName: cities.find((city: any) => city.id === restaurant.CityId)
            ?.name,
        } as Restaurant;
      });
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  /***
   * Create CRUD Subject for add, delete and update
   */
  private restaurantCRUDSubject = new Subject<CRUDAction<Restaurant>>();
  restaurantCRUDAction$ = this.restaurantCRUDSubject.asObservable();

  private restaurantCRUDCompleteSubject = new Subject<boolean>();
  restaurantCRUDCompleteAction$ =
    this.restaurantCRUDCompleteSubject.asObservable();

  addRestaurant(restaurant: Restaurant) {
    this.restaurantCRUDSubject.next({ action: 'add', data: restaurant });
  }

  updateRestaurant(restaurant: Restaurant) {
    this.restaurantCRUDSubject.next({ action: 'update', data: restaurant });
  }

  deleteRestaurant(restaurant: Restaurant) {
    this.restaurantCRUDSubject.next({ action: 'delete', data: restaurant });
  }

  // Need to merge students with CRUD actions
  restaurantsWithUsersAndCitiesAndCRUD$ = merge(
    this.restaurantsWithUsersAndCities$,
    this.restaurantCRUDAction$.pipe(
      concatMap((restaurantAction: any) =>
        this.saveRestaurants(restaurantAction).pipe(
          map((restaurant) => ({ ...restaurantAction, data: restaurant }))
        )
      )
    )
  ).pipe(
    scan((restaurants, value: any) => {
      return this.modifyRestaurants(restaurants, value);
    }, [] as Restaurant[]),
    shareReplay(1),
    catchError(this.handleError)
  );

  // Modify Students
  modifyRestaurants(
    restaurants: Restaurant[],
    value: Restaurant[] | CRUDAction<Restaurant>
  ) {
    if (!(value instanceof Array)) {
      if (value.action === 'add') {
        return [...restaurants, value.data];
      }
      if (value.action === 'update') {
        return restaurants.map((restaurant) =>
          restaurant.id === value.data.id ? value.data : restaurant
        );
      }
      if (value.action === 'delete') {
        return restaurants.filter(
          (restaurant) => restaurant.id !== value.data.id
        );
      }
    } else {
      return value;
    }
    return restaurants;
  }

  // save the students data to database
  saveRestaurants(restaurantAction: CRUDAction<Restaurant>) {
    let restaurantDetails$!: Observable<Restaurant>;
    if (restaurantAction.action === 'add') {
      restaurantDetails$ = this.addRestaurantToServer(
        restaurantAction.data
      ).pipe(
        tap((restaurant) => {
          this.notificationService.setSuccessMessage(
            'Restaurant Added Sucessfully!'
          );
          this.restaurantCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (restaurantAction.action === 'update') {
      restaurantDetails$ = this.updateRestaurantToServer(
        restaurantAction.data
      ).pipe(
        tap((restaurant) => {
          this.notificationService.setSuccessMessage(
            'Restaurant Updated Sucessfully!'
          );
          this.restaurantCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (restaurantAction.action === 'delete') {
      return this.deleteRestaurantToServer(restaurantAction.data)
        .pipe(
          tap((restaurant) => {
            this.notificationService.setSuccessMessage(
              'Restaurant Deleted Sucessfully!'
            );
            this.restaurantCRUDCompleteSubject.next(true);
          }),
          catchError(this.handleError)
        )
        .pipe(map((restaurant) => restaurantAction.data));
    }
    return restaurantDetails$.pipe(
      concatMap((restaurant: any) =>
        this.userService.usersWithCRUD$.pipe(
          map((users) => {
            return {
              ...restaurant,
              userName: users.find((user: any) => user.id === restaurant.UserId)
                ?.name,
            };
          })
        )
      ),
      concatMap((restaurant: any) =>
        this.cityService.citiesWithCRUD$.pipe(
          map((cities) => {
            return {
              ...restaurant,
              cityName: cities.find(
                (city: any) => city.id === restaurant.CityId
              )?.name,
            };
          })
        )
      ),
      shareReplay(1),
      catchError(this.handleError)
    );
  }

  addRestaurantToServer(restaurant: Restaurant) {
    return this.api.post('restaurants', restaurant);
  }

  updateRestaurantToServer(restaurant: Restaurant) {
    return this.api.patch(`restaurants/${restaurant.id}`, restaurant);
  }

  deleteRestaurantToServer(restaurant: Restaurant) {
    return this.api.delete(`restaurants/${restaurant.id}`);
  }

  /**************
   * Selecting a single restaurant
   */
  private selectedRestaurantSubject = new BehaviorSubject<number>(0);
  selectedRestaurantAction$ = this.selectedRestaurantSubject.asObservable();

  selectRestaurant(restaurantId: number) {
    this.selectedRestaurantSubject.next(restaurantId);
  }
  // Combine action data (from select) with data stream from restaurant API
  restaurant$ = combineLatest([
    this.restaurantsWithUsersAndCitiesAndCRUD$,
    this.selectedRestaurantAction$,
  ]).pipe(
    map(([restaurants, selectedRestaurantId]) => {
      return restaurants.find(
        (restaurant: any) => restaurant.id === selectedRestaurantId
      );
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private cityService: CityService,
    private api: ApiService
  ) {}

  handleError(error: Error) {
    return throwError(() => {
      return 'Unknown error occurred. Please try again.';
    });
  }

  getRestaurants() {
    // The code below will get all items from the backend
    return this.api.get<Restaurant[]>('restaurants');
  }

  getRestaurant(urlCheck: number) {
    // The code below will get all items from the backend
    console.log(urlCheck);
    return this.api.get<Restaurant[]>(`restaurants/${urlCheck}`);
  }

  searchRestaurants(formData: any) {
    // The code below will get all items from the backend
    return this.api.post<Restaurant[]>('restaurants/search', formData);
  }
}

///////////////////////////////////////////////////////////////////////////////////
////////////////   OLD CODE //////////////////////////////////////////////////////

// submitRestaurant(formData: any) {
//   // Not likely needed as addToServer is being used
//   return this.api.post<Restaurant>('restaurants', formData);
// }
