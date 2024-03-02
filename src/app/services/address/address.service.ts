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
import { Address } from 'src/app/models/address.model';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  addresses$ = this.api
    .get('addresses')
    .pipe(catchError(this.handleError), shareReplay(1));
  users$ = this.userService.users$.pipe(
    catchError(this.handleError),
    shareReplay(1)
  );

  // Combine two data streams
  addressesWithUsers$ = combineLatest([this.addresses$, this.users$]).pipe(
    delay(2000),
    map(([addresses, users]) => {
      return addresses.map((address: any) => {
        return {
          ...address,
          userName: users.find((user: any) => user.id === address.UserId)?.name,
        } as User;
      });
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  /***
   * Create CRUD Subject for add, delete and update
   */
  private addressesCRUDSubject = new Subject<CRUDAction<Address>>();
  addressesCRUDAction$ = this.addressesCRUDSubject.asObservable();

  private addressCRUDCompleteSubject = new Subject<boolean>();
  addressCRUDCompleteAction$ = this.addressCRUDCompleteSubject.asObservable();

  addAddress(address: Address) {
    this.addressesCRUDSubject.next({ action: 'add', data: address });
  }

  updateAddress(address: Address) {
    this.addressesCRUDSubject.next({ action: 'update', data: address });
  }

  deleteAddress(address: Address) {
    this.addressesCRUDSubject.next({ action: 'delete', data: address });
  }

  // Need to merge students with CRUD actions
  addressesWithUsersAndCRUD$ = merge(
    this.addressesWithUsers$,
    this.addressesCRUDAction$.pipe(
      concatMap((addressAction: any) =>
        this.saveAddresses(addressAction).pipe(
          map((address) => ({ ...addressAction, data: address }))
        )
      )
    )
  ).pipe(
    scan((addresses, value: any) => {
      return this.modifyAddresses(addresses, value);
    }, [] as Address[]),
    shareReplay(1),
    catchError(this.handleError)
  );

  // Modify Students
  modifyAddresses(
    addresses: Address[],
    value: Address[] | CRUDAction<Address>
  ) {
    if (!(value instanceof Array)) {
      if (value.action === 'add') {
        return [...addresses, value.data];
      }
      if (value.action === 'update') {
        return addresses.map((address) =>
          address.id === value.data.id ? value.data : address
        );
      }
      if (value.action === 'delete') {
        return addresses.filter((address) => address.id !== value.data.id);
      }
    } else {
      return value;
    }
    return addresses;
  }

  // save the students data to database
  saveAddresses(addressAction: CRUDAction<Address>) {
    let addressDetails$!: Observable<Address>;
    if (addressAction.action === 'add') {
      addressDetails$ = this.addAddressToServer(addressAction.data).pipe(
        tap((address) => {
          this.notificationService.setSuccessMessage(
            'Address Added Sucessfully!'
          );
          this.addressCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (addressAction.action === 'update') {
      addressDetails$ = this.updateAddressToServer(addressAction.data).pipe(
        tap((address) => {
          this.notificationService.setSuccessMessage(
            'Address Updated Sucessfully!'
          );
          this.addressCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (addressAction.action === 'delete') {
      return this.deleteAddressToServer(addressAction.data)
        .pipe(
          tap((address) => {
            this.notificationService.setSuccessMessage(
              'Address Deleted Sucessfully!'
            );
            this.addressCRUDCompleteSubject.next(true);
          }),
          catchError(this.handleError)
        )
        .pipe(map((address) => addressAction.data));
    }
    return addressDetails$.pipe(
      concatMap((address: any) =>
        this.userService.usersWithCRUD$.pipe(
          map((users) => {
            return {
              ...address,
              userName: users.find((user: any) => user.id === address.UserId)
                ?.name,
            };
          })
        )
      ),
      shareReplay(1),
      catchError(this.handleError)
    );
  }

  addAddressToServer(address: Address) {
    return this.api.post('addresses', address);
  }

  updateAddressToServer(address: Address) {
    return this.api.patch(`addresses/${address.id}`, address);
  }

  deleteAddressToServer(address: Address) {
    return this.api.delete(`addresses/${address.id}`);
  }

  /**************
   * Selecting a single address
   */
  private selectedAddressSubject = new BehaviorSubject<number>(0);
  selectedAddressAction$ = this.selectedAddressSubject.asObservable();

  selectTask(addressId: number) {
    this.selectedAddressSubject.next(addressId);
  }
  // Combine action data (from select) with data stream from address API
  address$ = combineLatest([
    this.addressesWithUsersAndCRUD$,
    this.selectedAddressAction$,
  ]).pipe(
    map(([addresses, selectedAddressId]) => {
      return addresses.find((address: any) => address.id === selectedAddressId);
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private api: ApiService
  ) {}

  handleError(error: Error) {
    return throwError(() => {
      return 'Unknown error occurred. Please try again.';
    });
  }

  /// Additional code that may be removed eventually

  private _addresses = new BehaviorSubject<Address[]>([]);
  private _addressChange = new BehaviorSubject<Address | null>(null);
  get addresses() {
    return this._addresses.asObservable();
  }
  get addressChange() {
    return this._addressChange.asObservable();
  }

  changeAddress(address: any) {
    this._addressChange.next(address);
  }

  getAddresses() {
    return this.api.get<Address>('addresses');
  }

  createAddress(formData: any) {
    console.log('formData from address service', formData);
    return this.api.post<any>('addresses', formData);
  }

  getAddress(addressId: number) {
    return this.api.get<Address>(`addresses/${addressId}`);
  }
}
