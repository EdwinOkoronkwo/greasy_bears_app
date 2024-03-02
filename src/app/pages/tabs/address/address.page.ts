import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NavigationExtras, Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import {
  IonButton,
  IonHeader,
  IonLabel,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonContent,
  IonSpinner,
  IonList,
  IonIcon,
  IonRow,
  IonInfiniteScroll,
  IonFooter,
  IonInfiniteScrollContent,
  IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  chevronForwardOutline,
  createOutline,
  homeOutline,
  locationOutline,
  powerOutline,
  trashOutline,
} from 'ionicons/icons';
import {
  BehaviorSubject,
  EMPTY,
  Subscription,
  catchError,
  combineLatest,
  startWith,
  tap,
} from 'rxjs';
import { EmptyScreenComponent } from 'src/app/components/empty-screen/empty-screen.component';
import { Address } from 'src/app/models/address.model';
import { AddressService } from 'src/app/services/address/address.service';
import { ApiService } from 'src/app/services/api/api.service';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-address',
  templateUrl: './address.page.html',
  styleUrls: ['./address.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [RouterLink, CommonModule, IonicModule, EmptyScreenComponent],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AddressPage implements OnInit, OnDestroy {
  isLoading!: boolean;
  addresses: Address[] = [];
  addressesSub!: Subscription;
  model = {
    title: 'No Addresses added yet',
    icon: 'location-outline',
  };
  data: any;
  errorMessageSubject = new BehaviorSubject<string>('');
  errorMessageAction$ = this.errorMessageSubject.asObservable();
  addresses$ = this.addressService.addressesWithUsersAndCRUD$;

  constructor(
    private global: GlobalService,
    private addressService: AddressService,
    private router: Router
  ) {
    addIcons({
      powerOutline,
      homeOutline,
      chevronForwardOutline,
      checkmarkCircleOutline,
      locationOutline,
      createOutline,
      trashOutline,
    });
  }

  ngOnInit() {
    this.addressesSub = this.addressService
      .getAddresses()
      .subscribe((address) => {
        console.log('addresses: ', address);
        this.addresses = address;
      });
    //this.getAddresses();
  }

  notification$ = this.addressService.addressCRUDCompleteAction$.pipe(
    startWith(false),
    tap((message) => {
      if (message) {
        this.router.navigateByUrl('/tabs/tab1');
      }
    })
  );
  address$ = this.addressService.address$;
  //viewModel$ = combineLatest([this.notification$]);

  async getAddresses() {
    try {
      this.isLoading = true;
      this.global.showLoader();
      this.data = await this.addressService.getAddresses();
      console.log(this.data);
      console.log(this.addresses);
      this.isLoading = false;
      this.global.hideLoader();
    } catch (e: any) {
      this.isLoading = false;
      this.global.hideLoader();
      let msg;
      if (e?.error?.message) {
        msg = e.error.message;
      }
      this.global.errorToast(msg);
    }
  }

  async loadMore(event: any) {
    // console.log(event);
    // try {
    //   const perPage = this.data.perPage;
    //   const nextPage = this.data.nextPage;
    //   if (nextPage) {
    //     this.data = await this.addressService.getAddresses(null, nextPage);
    //     console.log(this.data);
    //   }
    //   console.log(this.addresses);
    //   event.target.complete();
    //   if (this.data?.addresses?.length < perPage) event.target.disabled = true;
    // } catch (e: any) {
    //   let msg;
    //   if (e?.error?.message) {
    //     msg = e.error.message;
    //   }
    //   this.global.errorToast(msg);
    // }
  }

  getIcon(title: any) {
    return this.global.getIcon(title);
  }

  editAddress(address: Address) {
    console.log(address);
    const navData: NavigationExtras = {
      queryParams: {
        data: JSON.stringify(address),
      },
    };
    this.router.navigate([this.router.url, 'edit-address'], navData);
  }

  deleteAddressAlert(address: Address) {
    console.log('address: ', address);
    this.global.showAlert(
      'Are you sure you want to delete this address?',
      'Confirm',
      [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('cancel');
            return;
          },
        },
        {
          text: 'Yes',
          handler: () => {
            this.deleteAddress(address);
          },
        },
      ]
    );
  }

  deleteAddress(address: Address) {
    try {
      this.global.showLoader();
      this.addressService.deleteAddress(address);
      this.global.hideLoader();
    } catch (e: any) {
      console.log(e);
      this.global.hideLoader();
      let msg;
      if (e?.error?.message) {
        msg = e.error.message;
      }
      this.global.errorToast(msg);
    }
  }

  ngOnDestroy() {
    if (this.addressesSub) this.addressesSub.unsubscribe();
  }
}

/***
 * Whenever ngOnInt i called, when the page is loaded for the first time. AddressSubscription will be initialized
 * to an observable and a scubscription that will check everytime if there is change in the data by calling the
 * function getAddresses()
 *
 * getAddresses() calls the getAddressses from the address service.
 *
 * The getAddress in the addresss services will provide an observable that will hold all the data.
 *
 * ######Delete
 * In the address page in the ngOnInit, we will get the data. If we are getting the data and it is the delete, we
 * hve to avoid initializing to an array
 */

// RouterLink,
// IonButtons,
// CommonModule,
// IonInfiniteScrollContent,
// IonHeader,
// IonToolbar,
// IonTitle,
// IonLabel,
// IonButton,
// IonBackButton,
// IonContent,
// IonSpinner,
// EmptyScreenComponent,
// IonList,
// IonIcon,
// IonRow,
// IonInfiniteScroll,
// IonFooter,

// selectedUserSubject = new BehaviorSubject<number>(0);
// selectedUserAction$ = this.selectedUserSubject.asObservable();

// selectedUserId!: number;
// errorMessageSubject = new BehaviorSubject<string>('');
// errorMessageAction$ = this.errorMessageSubject.asObservable();
// restaurants$ = this.restaurantService.restaurantsWithUsersAndCRUD$.pipe(
//   catchError((error: string) => {
//     this.errorMessageSubject.next(error);
//     return EMPTY;
//   })
// );
// users$ = this.userService.usersWithCRUD$;
// banners$ = this.bannerService.bannersWithRestaurantsAndCRUD$;

// //Combining action stream from select with data stream from Students API
// filteredRestaurants$ = combineLatest([
//   this.restaurants$,
//   this.selectedUserAction$,
// ]).pipe(
//   tap((data) => {
//     // this.loadingService.hideLoader();
//     console.log(data);
//     this.isLoading = false;
//     this.global.hideLoader();
//   }),

//   map(([restaurants, selectedUserId]) => {
//     return restaurants.filter((restaurant) =>
//       selectedUserId ? restaurant.userId === selectedUserId : true
//     );
//   })
// );

// constructor(
//   private router: Router,
//   // private addressService: AddressService,
//   private global: GlobalService,
//   private userService: UserService,
//   private locationService: LocationService,
//   // private mapService: GoogleMapsService,
//   private profileService: ProfileService,
//   private bannerService: BannerService,
//   private restaurantService: RestaurantService
// ) {
//   addIcons({
//     trophyOutline,
//     addOutline,
//     chevronDownOutline,
//   });
//   this.bannerService.getBanners().subscribe((result) => {
//     this.banners = result;
//     console.log(this.banners);
//   });
// }

// ngOnInit(): void {
//   // this.global.showLoader();
// }

// onUserChange(event: Event) {
//   let selectedUserId: any = parseInt(
//     (event.target as HTMLSelectElement).value
//   );
//   this.selectedUserSubject.next(selectedUserId);
// }

// onDeleteTask(restaurant: Restaurant) {
//   this.global.showAlert(
//     'Are you sure you want to delete this task?',
//     'Confirm',
//     [
//       {
//         text: 'No',
//         role: 'cancel',
//         handler: () => {
//           console.log('cancel');
//           return;
//         },
//       },
//       {
//         text: 'Yes',
//         handler: () => {
//           this.deleteRestaurant(restaurant);
//         },
//       },
//     ]
//   );
// }

// async deleteRestaurant(restaurant: any) {
//   try {
//     this.global.showLoader();
//     await this.restaurantService.deleteRestaurant(restaurant);
//     this.global.hideLoader();
//     this.global.successToast('Restaurant deleted successfully!');
//   } catch (e: any) {
//     console.log(e);
//     this.global.hideLoader();
//     let msg;
//     if (e?.error?.message) {
//       msg = e.error.message;
//     }
//     this.global.errorToast(msg);
//   }
// }
