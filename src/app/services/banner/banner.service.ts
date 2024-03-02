import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Banner } from '../../interfaces/banner.interface';
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
import { Restaurant } from 'src/app/models/restaurant.model';

@Injectable({
  providedIn: 'root',
})
export class BannerService {
  status$ = of(['Active', 'Inactive']);
  banners$ = this.api
    .get('banners')
    .pipe(catchError(this.handleError), shareReplay(1));
  restaurants$ =
    this.restaurantService.restaurantsWithUsersAndCitiesAndCRUD$.pipe(
      catchError(this.handleError),
      shareReplay(1)
    );

  // Combine two data streams
  bannersWithRestaurants$ = combineLatest([
    this.banners$,
    this.restaurants$,
  ]).pipe(
    delay(2000),
    map(([banners, restaurants]) => {
      return banners.map((banner: any) => {
        return {
          ...banner,
          restaurantName: restaurants.find(
            (restaurant: any) => restaurant.id === banner.RestaurantId
          )?.name,
        } as Restaurant;
      });
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  /***
   * Create CRUD Subject for add, delete and update
   */
  private bannerCRUDSubject = new Subject<CRUDAction<Banner>>();
  bannerCRUDAction$ = this.bannerCRUDSubject.asObservable();

  private bannerCRUDCompleteSubject = new Subject<boolean>();
  bannerCRUDCompleteAction$ = this.bannerCRUDCompleteSubject.asObservable();

  addBanner(banner: Banner) {
    this.bannerCRUDSubject.next({ action: 'add', data: banner });
  }

  updateBanner(banner: Banner) {
    this.bannerCRUDSubject.next({ action: 'update', data: banner });
  }

  deleteBanner(banner: Banner) {
    this.bannerCRUDSubject.next({ action: 'delete', data: banner });
  }

  // Need to merge students with CRUD actions
  bannersWithRestaurantsAndCRUD$ = merge(
    this.bannersWithRestaurants$,
    this.bannerCRUDAction$.pipe(
      concatMap((bannerAction: any) =>
        this.saveBanners(bannerAction).pipe(
          map((banner) => ({ ...bannerAction, data: banner }))
        )
      )
    )
  ).pipe(
    scan((banners, value: any) => {
      return this.modifyItemBanners(banners, value);
    }, [] as Banner[]),
    shareReplay(1),
    catchError(this.handleError)
  );

  // Modify Students
  modifyItemBanners(banners: Banner[], value: Banner[] | CRUDAction<Banner>) {
    if (!(value instanceof Array)) {
      if (value.action === 'add') {
        return [...banners, value.data];
      }
      if (value.action === 'update') {
        return banners.map((banner) =>
          banner.id === value.data.id ? value.data : banner
        );
      }
      if (value.action === 'delete') {
        return banners.filter((banner) => banner.id !== value.data.id);
      }
    } else {
      return value;
    }
    return banners;
  }

  // save the students data to database
  saveBanners(bannerAction: CRUDAction<Banner>) {
    let bannerDetails$!: Observable<Banner>;
    if (bannerAction.action === 'add') {
      bannerDetails$ = this.addBannerToServer(bannerAction.data).pipe(
        tap((banner) => {
          this.notificationService.setSuccessMessage(
            'Banner Added Sucessfully!'
          );
          this.bannerCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (bannerAction.action === 'update') {
      bannerDetails$ = this.updateBannerToServer(bannerAction.data).pipe(
        tap((banner) => {
          this.notificationService.setSuccessMessage(
            'Banner Updated Sucessfully!'
          );
          this.bannerCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (bannerAction.action === 'delete') {
      return this.deleteBannerToServer(bannerAction.data)
        .pipe(
          tap((banner) => {
            this.notificationService.setSuccessMessage(
              'Banner Deleted Sucessfully!'
            );
            this.bannerCRUDCompleteSubject.next(true);
          }),
          catchError(this.handleError)
        )
        .pipe(map((banner) => bannerAction.data));
    }

    return bannerDetails$.pipe(
      concatMap((banner: any) =>
        this.restaurantService.restaurantsWithUsersAndCitiesAndCRUD$.pipe(
          map((restaurants) => {
            return {
              ...banner,
              restaurantName: restaurants.find(
                (restaurant: any) => restaurant.id === banner.RestaurantId
              )?.name,
            };
          })
        )
      ),
      shareReplay(1),
      catchError(this.handleError)
    );
  }

  addBannerToServer(banner: Banner) {
    return this.api.post('banners', banner);
  }

  updateBannerToServer(banner: Banner) {
    return this.api.patch(`banners/${banner.id}`, banner);
  }

  deleteBannerToServer(banner: Banner) {
    return this.api.delete(`banners/${banner.id}`);
  }

  /**************
   * Selecting a single banner
   */
  private selectedBannerSubject = new BehaviorSubject<number>(0);
  selectedItemBannerAction$ = this.selectedBannerSubject.asObservable();

  selectBanner(itemCategoryId: number) {
    this.selectedBannerSubject.next(itemCategoryId);
  }
  // Combine action data (from select) with data stream from banner API
  banner$ = combineLatest([
    this.bannersWithRestaurantsAndCRUD$,
    this.selectedItemBannerAction$,
  ]).pipe(
    map(([banners, selectedBannerId]) => {
      return banners.find((banner: any) => banner.id === selectedBannerId);
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  constructor(
    private http: HttpClient,
    private restaurantService: RestaurantService,
    private notificationService: NotificationService,
    private api: ApiService
  ) {}

  handleError(error: Error) {
    return throwError(() => {
      return 'Unknown error occurred. Please try again.';
    });
  }

  /// Review if below code is still needed
  createBanner(formData: any) {
    return this.api.post<Banner>('banners', formData);
  }
  getBanners() {
    return this.api.get<Banner>('banners');
  }
}
