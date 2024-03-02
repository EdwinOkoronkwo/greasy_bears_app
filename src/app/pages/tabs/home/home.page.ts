import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
// import { BannerService } from 'src/app/services/banner/banner.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { LocationService } from 'src/app/services/location/location.service';
import { GlobalService } from 'src/app/services/global/global.service';
// import { AddressService } from 'src/app/services/address/address.service';
import { NavigationExtras, Router, RouterLink } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { ExploreContainerComponent } from '../../../explore-container/explore-container.component';
import {
  BehaviorSubject,
  EMPTY,
  Subscription,
  catchError,
  combineLatest,
  map,
  tap,
} from 'rxjs';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { UserService } from 'src/app/services/user/user.service';
import { addIcons } from 'ionicons';
import { addOutline, chevronDownOutline, trophyOutline } from 'ionicons/icons';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  IonImg,
  IonThumbnail,
  IonModal,
  IonList,
  IonSkeletonText,
  IonText,
  IonListHeader,
  IonItemGroup,
  IonLabel,
} from '@ionic/angular/standalone';
import { BannerService } from '../../../services/banner/banner.service';
import { environment } from 'src/environments/environment';
import { Strings } from 'src/app/enum/strings';
import { LoadingRestaurantComponent } from 'src/app/components/loading-restaurant/loading-restaurant.component';
import { RestaurantComponent } from 'src/app/components/restaurant/restaurant.component';
import { BannerComponent } from 'src/app/components/banner/banner.component';
import { Banner } from 'src/app/interfaces/banner.interface';
import { Address } from 'src/app/models/address.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    ReactiveFormsModule,
    ExploreContainerComponent,
    CommonModule,
    RouterLink,
    LoadingRestaurantComponent,
    RestaurantComponent,
    BannerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  banners: Banner[] = [];
  location = {} as Address;
  restaurants: Restaurant[] = [];
  isLoading: boolean = false;
  serverUrl = environment.serverUrl;
  verifyOtp = false;
  restaurantUrl = Strings.RESTAURANT_URL;
  selectedUserSubject = new BehaviorSubject<number>(0);
  selectedUserAction$ = this.selectedUserSubject.asObservable();

  selectedUserId!: number;
  errorMessageSubject = new BehaviorSubject<string>('');
  errorMessageAction$ = this.errorMessageSubject.asObservable();
  restaurants$ = this.restaurantService.restaurants$.pipe(
    catchError((error: string) => {
      this.errorMessageSubject.next(error);
      return EMPTY;
    })
  );
  users$ = this.userService.usersWithCRUD$;
  banners$ = this.bannerService.banners$;

  filteredRestaurants$ = combineLatest([
    this.restaurants$,
    this.selectedUserAction$,
  ]).pipe(
    tap((data) => {
      console.log(data);
      this.isLoading = false;
      this.global.hideLoader();
    }),

    map(([restaurants, selectedUserId]) => {
      return restaurants.filter((restaurant: any) =>
        selectedUserId ? restaurant.userId === selectedUserId : true
      );
    })
  );

  constructor(
    private router: Router,
    private global: GlobalService,
    private userService: UserService,
    private locationService: LocationService,
    private profileService: ProfileService,
    private bannerService: BannerService,
    private restaurantService: RestaurantService
  ) {
    addIcons({
      trophyOutline,
      addOutline,
      chevronDownOutline,
    });
    this.bannerService.getBanners().subscribe((result) => {
      this.banners = result;
      console.log(this.banners);
    });
    this.restaurantService.restaurants$.subscribe((result) => {
      this.restaurants = result;
      console.log(this.restaurants);
    });
  }

  onUserChange(event: Event) {
    let selectedUserId: any = parseInt(
      (event.target as HTMLSelectElement).value
    );
    this.selectedUserSubject.next(selectedUserId);
  }

  onDeleteRestaurant(restaurant: Restaurant) {
    this.global.showAlert(
      'Are you sure you want to delete this task?',
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
            this.deleteRestaurant(restaurant);
          },
        },
      ]
    );
  }

  async deleteRestaurant(restaurant: any) {
    try {
      this.global.showLoader();
      await this.restaurantService.deleteRestaurant(restaurant);
      this.global.hideLoader();
      this.global.successToast('Restaurant deleted successfully!');
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
}

//////////////////////////////////////////////////////////////////////////////////////////
////////////////////  OLD CODE //////////////////////////////////////////////////////////
// async modalAdd() {
//   const options = {
//     component: TaskFormComponent,
//     componentProps: {
//       from: 'tab1',
//     },
//     cssClass: 'home-modal',
//     swipeToClose: true,
//   };
//   await this.global.createModal(options);
// }

// @ViewChild('otp_modal') modal: ModalController;
// banners: Banner[] = [];
// restaurants: Restaurant[] = [];
// isLoading: boolean = false;
// location = {} as Address;
// addressSub: Subscription;
// profile: User;
// // profileSub: Subscription;
// verifyOtp = false;

// isLoading = false;
// selectedUserSubject = new BehaviorSubject<number>(0);
// selectedUserAction$ = this.selectedUserSubject.asObservable();
// selectedUserId: number;
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
// //filteredRestaurants$ = this.restaurants$;

// //Combining action stream from select with data stream from Students API
// filteredRestaurants$ = combineLatest([
//   this.restaurants$,
//   this.selectedUserAction$,
//   // this.selectedStatusAction$,
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
//   private userService: UserService,
//   private restaurantService: RestaurantService,
//   private global: GlobalService,
//   private bannerService: BannerService
// ) {
//   addIcons({
//     trophyOutline,
//     addOutline,
//   });
// }

// ngOnInit(): void {
//   this.global.showLoader();
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
//     this.global.successToast('Task deleted successfully!');
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
// async modalAdd() {
//   const options = {
//     component: TaskFormComponent,
//     componentProps: {
//       from: 'tab1',
//     },
//     cssClass: 'home-modal',
//     swipeToClose: true,
//   };
//   await this.global.createModal(options);
// }

// constructor(
//   private router: Router,
//   private addressService: AddressService,
//   private global: GlobalService,
//   private locationService: LocationService,
//   private mapService: GoogleMapsService,
//   private profileService: ProfileService,
//   private bannerService: BannerService,
//   private restaurantService: RestaurantService
// ) {}

// ngOnInit() {
//   this.getProfile();
//   this.addressSub = this.addressService.addressChange.subscribe(
//     (address) => {
//       console.log('address', address);
//       if (address && address?.lat) {
//         if (!this.isLoading) this.isLoading = true;
//         this.location = address;
//         this.nearbyApiCall();
//       } else {
//         if (address && (!this.location || !this.location?.lat)) {
//           this.searchLocation('home', 'home-modal');
//         }
//       }
//     },
//     (e) => {
//       console.log(e);
//       this.isLoading = false;
//       this.global.errorToast();
//     }
//   );
//   this.isLoading = true;
//   this.getBanners();
//   if (!this.location?.lat) {
//     this.getNearbyRestaurants();
//   }
// }

// async getProfile() {
//   try {
//     this.profile = await this.profileService.getProfile();
//     console.log('home page profile: ', this.profile);
//     // if (this.profile && !this.profile?.email_verified) {
//     //   this.checkEmailVerified();
//     // }
//   } catch (e) {
//     console.log(e);
//     this.global.errorToast();
//   }
// }

// async checkEmailVerified() {
//   const verify = await this.global.showButtonToast(
//     'Please verify your email address'
//   );
//   console.log('verify: ', verify);
//   if (verify) this.verifyOtp = true;
// }

// getBanners() {
//   this.bannerService.bannersWithRestaurantsAndCRUD$;
//   // this.bannerService
//   //   .getBanners()
//   //   .then((banners) => {
//   //     this.banners = banners;
//   //     console.log('banners: ', this.banners);
//   //   })
//   //   .catch((e) => {
//   //     console.log(e);
//   //     let msg;
//   //     if (e?.error?.message) {
//   //       msg = e.error.message;
//   //     }
//   //     this.global.errorToast(msg);
//   //   });
// }

// // async nearbyApiCall() {
// //   console.log(this.location);
// //   try {
// //     const radius = this.addressService.radius;
// //     const data = {
// //       lat: this.location.lat,
// //       lng: this.location.lng,
// //       radius,
// //     };
// //     this.restaurants = await this.restaurantService.getNearbyRestaurants(
// //       data
// //     );
// //     console.log('restaurants: ', this.restaurants);
// //     this.isLoading = false;
// //   } catch (e) {
// //     this.isLoading = false;
// //     console.log(e);
// //     let msg;
// //     if (e?.error?.message) {
// //       msg = e.error.message;
// //     }
// //     this.global.errorToast(msg);
// //   }
// // }

// // async getNearbyRestaurants() {
// //   try {
// //     const position = await this.locationService.getCurrentLocation();
// //     const { latitude, longitude } = position.coords;
// //     const address = await this.mapService.getAddress(latitude, longitude);
// //     if (address) {
// //       this.location = new Address(
// //         '',
// //         address.address_components[0].short_name,
// //         address.formatted_address,
// //         '',
// //         '',
// //         latitude,
// //         longitude
// //       );

// //       await this.getData();
// //     }

// //     console.log('restaurants: ', this.restaurants);
// //     this.isLoading = false;
// //   } catch (e) {
// //     console.log(e);
// //     this.isLoading = false;
// //     this.searchLocation('home', 'home-modal');
// //   }
// // }

// async getData() {
//   try {
//     this.restaurants = [];
//     const address = await this.addressService.checkExistAddress(
//       this.location
//     );
//     console.log('address change: ', address);
//     //if(!address) await this.nearbyApiCall(lat, lng);
//   } catch (e) {
//     console.log(e);
//     this.global.errorToast();
//   }
// }

// async searchLocation(prop, className?) {
//   try {
//     const options = {
//       component: SearchLocationComponent,
//       cssClass: className ? className : '',
//       backdropDismiss: prop == 'select-place' ? true : false,
//       componentProps: {
//         from: prop,
//       },
//     };
//     const modal = await this.global.createModal(options);
//     if (modal) {
//       if (modal == 'add') {
//         this.addAddress(this.location);
//       } else if (modal == 'select') {
//         this.searchLocation('select-place');
//       } else {
//         this.location = modal;
//         await this.getData();
//       }
//     }
//   } catch (e) {
//     console.log(e);
//   }
// }

// addAddress(val?) {
//   let navData: NavigationExtras;
//   if (val) {
//     val.from = 'home';
//   } else {
//     val = {
//       from: 'home',
//     };
//   }
//   navData = {
//     queryParams: {
//       data: JSON.stringify(val),
//     },
//   };
//   this.router.navigate(['/', 'tabs', 'address', 'edit-address'], navData);
// }

// resetOtpModal(value) {
//   console.log(value);
//   this.verifyOtp = false;
// }

// otpVerified(event) {
//   if (event) this.modal.dismiss();
// }

// ngOnDestroy() {
//   if (this.addressSub) this.addressSub.unsubscribe();
//   // if(this.profileSub) this.profileSub.unsubscribe();
// }
// }

// restaurants!: Restaurant[];
// restaurantSubscription!: Subscription;

// constructor(
//   private router: Router,
//   // private addressService: AddressService,
//   private global: GlobalService,
//   private locationService: LocationService,
//   private profileService: ProfileService,
//   // private bannerService: BannerService,
//   private restaurantService: RestaurantService
// ) {
//   addIcons({
//     trophyOutline,
//     addOutline,
//   });
// }

// ionViewWillEnter() {
//   this.restaurantSubscription = this.restaurantService
//     .getRestaurants()
//     .subscribe((result) => {
//       this.restaurants = result;
//     });
//   console.log(this.restaurants);
// }

// onDeleteRestaurant(restaurantId: number) {
//   console.log(restaurantId);
//   const index = this.restaurants.findIndex((restaurant) => {
//     return restaurant.id === restaurantId;
//   });
//   this.restaurants.filter((restaurant) => restaurantId !== index);
//   this.restaurantService
//     .deleteRestaurant(restaurantId)
//     .subscribe((result: any) => {
//       console.log('Restaurant was deleted');
//     });
// }

// ngOnDestroy(): void {
//   if (this.restaurantSubscription) this.restaurantSubscription.unsubscribe();
// }

// IonImg,
// ReactiveFormsModule,

// IonHeader,
// IonCard,
// IonTitle,
// IonContent,
// IonToolbar,
// IonCardSubtitle,
// IonCardHeader,
// IonCardTitle,
// CommonModule,
// IonIcon,
// IonCardContent,
// IonThumbnail,

// IonModal,
// RouterLink,
// IonList,
// IonSkeletonText,
// IonText,
// IonList,
// IonListHeader,
// IonItemGroup,
// IonLabel,
