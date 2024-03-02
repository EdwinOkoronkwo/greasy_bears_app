import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { City } from '../../interfaces/city.interface';
import {
  catchError,
  concatMap,
  map,
  scan,
  shareReplay,
  tap,
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

@Injectable({
  providedIn: 'root',
})
export class CityService {
  status$ = of([true, false]);
  cities$ = this.api.get('cities').pipe(shareReplay(1));

  /***
   * Create CRUD Subject for add, delete and update
   */
  private citiesCRUDSubject = new Subject<CRUDAction<City>>();
  citiesCRUDAction$ = this.citiesCRUDSubject.asObservable();

  private citiesCRUDCompleteSubject = new Subject<boolean>();
  citiesCRUDCompleteAction$ = this.citiesCRUDCompleteSubject.asObservable();

  addCity(city: City) {
    this.citiesCRUDSubject.next({ action: 'add', data: city });
  }

  updateCity(city: City) {
    this.citiesCRUDSubject.next({ action: 'update', data: city });
  }

  deleteCity(city: City) {
    this.citiesCRUDSubject.next({ action: 'delete', data: city });
  }

  // Need to merge students with CRUD actions
  citiesWithCRUD$ = merge(
    this.cities$,
    this.citiesCRUDAction$.pipe(
      concatMap((cityAction: any) =>
        this.saveCities(cityAction).pipe(
          map((city: any) => ({ ...cityAction, data: city }))
        )
      )
    )
  ).pipe(
    scan((cities: any, value: any) => {
      return this.modifyCities(cities, value);
    }, [] as City[]),
    shareReplay(1),
    catchError(this.handleError)
  );

  // Modify Students
  modifyCities(cities: City[], value: City[] | CRUDAction<City>) {
    if (!(value instanceof Array)) {
      if (value.action === 'add') {
        return [...cities, value.data];
      }
      if (value.action === 'update') {
        return cities.map((city) =>
          city.id === value.data.id ? value.data : city
        );
      }
      if (value.action === 'delete') {
        return cities.filter((city) => city.id !== value.data.id);
      }
    } else {
      return value;
    }
    return cities;
  }

  // save the students data to database
  saveCities(cityAction: CRUDAction<City>) {
    let cityDetails$!: Observable<City>;
    if (cityAction.action === 'add') {
      cityDetails$ = this.addCityToServer(cityAction.data).pipe(
        tap((city) => {
          this.notificationService.setSuccessMessage('City Added Sucessfully!');
          this.citiesCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (cityAction.action === 'update') {
      cityDetails$ = this.updateCityToServer(cityAction.data).pipe(
        tap((city) => {
          this.notificationService.setSuccessMessage(
            'City Updated Sucessfully!'
          );
          this.citiesCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (cityAction.action === 'delete') {
      return this.deleteCityToServer(cityAction.data)
        .pipe(
          tap((city) => {
            this.notificationService.setSuccessMessage(
              'City Deleted Sucessfully!'
            );
            this.citiesCRUDCompleteSubject.next(true);
          }),
          catchError(this.handleError)
        )
        .pipe(map((city) => cityAction.data));
    }
    return cityDetails$.pipe(shareReplay(1), catchError(this.handleError));
  }

  addCityToServer(city: City) {
    return this.api.post('cities', city);
  }

  updateCityToServer(city: City) {
    return this.api.patch(`cities/${city.id}`, city);
  }

  deleteCityToServer(city: City) {
    return this.api.delete(`cities/${city.id}`);
  }

  /**************
   * Selecting a single city
   */
  private selectedCitySubject = new BehaviorSubject<number>(0);
  selectedCityAction$ = this.selectedCitySubject.asObservable();

  selectCity(cityId: number) {
    this.selectedCitySubject.next(cityId);
  }
  // Combine action data (from select) with data stream from city API
  city$ = combineLatest([this.citiesWithCRUD$, this.selectedCityAction$]).pipe(
    map(([cities, selectedCityId]) => {
      return cities.find((city: any) => city.id === selectedCityId);
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private api: ApiService
  ) {}

  handleError(error: Error) {
    return throwError(() => {
      return 'Unknown error occurred. Please try again.';
    });
  }

  getCities() {
    return this.api.get<City>('cities');
  }
}
