import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  NgModelGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgModel, NgForm } from '@angular/forms';
import { catchError, map, startWith, tap } from 'rxjs/operators';
import { BehaviorSubject, EMPTY, Subscription, combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';
import { GlobalService } from '../../../services/global/global.service';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonDatetime,
  IonIcon,
  IonImg,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonText,
  IonThumbnail,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { CityService } from '../../../services/city/city.service';
// import { ItemCategoryService } from 'src/app/services/itemcategory/itemCategory.service';
import { IonicModule } from '@ionic/angular';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { addIcons } from 'ionicons';
import {
  addOutline,
  call,
  cashOutline,
  key,
  locationOutline,
  mail,
  person,
  pinOutline,
  timeOutline,
} from 'ionicons/icons';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { Strings } from 'src/app/enum/strings';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-add-restaurant',
  templateUrl: './add-restaurant.page.html',
  styleUrls: ['./add-restaurant.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [ReactiveFormsModule, CommonModule, IonicModule],
  //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddRestaurantPage implements OnDestroy {
  isLoading = false;
  restaurantId!: number;
  cities$ = this.cityService.citiesWithCRUD$;
  categories$ = this.restaurantService.categories$;
  cuisines$ = this.restaurantService.cuisines$;
  status$ = this.restaurantService.status$;
  cover: any;
  cover_file: any;
  restaurantSub!: Subscription;
  isSubmitted = false;
  update!: boolean;
  id: any;
  isEditMode: boolean = false;
  restaurants!: Restaurant[];
  //restaurantForm: FormGroup;

  restaurantForm: any = new FormGroup({
    cover: new FormControl(''),
    name: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    phone: new FormControl(''),
    ownerName: new FormControl(''),
    openTime: new FormControl(''),
    closeTime: new FormControl(''),
    cityId: new FormControl(''),
    status: new FormControl(''),
    description: new FormControl(''),
    restaurantAddress: new FormControl(''),
    price: new FormControl(''),
    deliveryTime: new FormControl(''),
    cuisines: new FormControl(''),
    categories: new FormControl(''),
    postalCode: new FormControl(''),
  });
  constructor(
    private notificationService: NotificationService,
    private restaurantService: RestaurantService,
    private cityService: CityService,
    private router: Router,
    private route: ActivatedRoute,
    private global: GlobalService,
    private formBuilder: FormBuilder
  ) {
    // this.restaurantForm = formBuilder.group({
    //   cover: ['', [Validators.required]],
    //   name: ['', [Validators.required]],
    //   email: ['', [Validators.required]],
    //   password: ['', [Validators.required]],
    //   phone: ['', [Validators.required]],
    //   ownerName: ['', [Validators.required]],
    //   openTime: ['', [Validators.required]],
    //   closeTime: ['', [Validators.required]],
    //   cityId: ['', [Validators.required]],
    //   status: ['', [Validators.required]],
    //   description: ['', [Validators.required]],
    //   restaurantAddress: ['', [Validators.required]],
    //   price: ['', [Validators.required]],
    //   deliveryTime: ['', [Validators.required]],
    //   cuisines: ['', [Validators.required]],
    //   categories: ['', [Validators.required]],
    //   postalCode: ['', [Validators.required]],
    // });
    addIcons({
      timeOutline,
      person,
      mail,
      key,
      call,
      cashOutline,
      addOutline,
      pinOutline,
    });
    this.restaurantSub = this.route.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.restaurantId = parseInt(id);
        console.log(this.restaurantId);
      }
    });

    this.restaurantSub = this.restaurantService
      .getRestaurants()
      .subscribe((results) => {
        this.restaurants = results;
        // console.log(this.tasks);
      });

    if (this.restaurantId) {
      this.restaurantSub = this.restaurantService
        .getRestaurant(this.restaurantId)
        .subscribe((result) => {
          console.log(result);
          this.restaurantForm.patchValue(result);
        });
    }
  }

  onFileSelected(event: any) {
    this.cover = event.target.files[0];
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('result: ', reader.result);
      this.cover_file = reader.result;
    };
    reader.readAsDataURL(file);
    // this.selectedImageSubject.next(this.cover);
  }

  onRestaurantSubmit() {
    this.isEditMode ? this.updateTask() : this.createTask();
    console.log(this.isEditMode);
  }

  toggleSubmit() {
    this.isSubmitted = !this.isSubmitted;
  }

  createTask() {
    let restaurantDetails = this.restaurantForm.value;
    let formData: any = new FormData();
    if (this.cover) {
      formData.append('cover', this.cover);
    }
    for (let key in restaurantDetails) {
      formData.append(key, restaurantDetails[key]);
    }

    this.restaurantSub = this.restaurantService
      .addRestaurantToServer(formData)
      .subscribe({
        next: (result) => {
          console.log(result);
          this.isLoading = false;
          this.global.successToast('Restaurant was added successfully!');
          this.global.hideLoader();
          this.router.navigateByUrl('/admin');
        },
        error: (err) => {
          console.log(err);
          this.global.errorToast('Restaurant addition failed');
          this.isLoading = false;
          this.global.hideLoader();
        },
      });
  }

  updateTask() {
    this.isLoading = true;
    this.global.showLoader();
    let restaurantDetails = this.restaurantForm.value;
    if (this.restaurantId) {
      console.log(this.restaurantId);
      restaurantDetails = { ...restaurantDetails, id: this.restaurantId };
      let formData: any = new FormData();
      if (this.cover) {
        formData.append('cover', this.cover);
      }
      for (let key in restaurantDetails) {
        formData.append(key, restaurantDetails[key]);
      }

      this.restaurantSub = this.restaurantService
        .updateRestaurantToServer(formData)
        .subscribe({
          next: (result) => {
            console.log(result);
            this.isLoading = false;
            this.global.successToast('Restaurant was updated successfully!');
            this.global.hideLoader();
            this.router.navigateByUrl('/admin');
          },
          error: (err) => {
            console.log(err);
            this.global.errorToast('Restaurant addition failed');
            this.isLoading = false;
            this.global.hideLoader();
          },
        });
    }
  }

  ngOnDestroy(): void {
    if (this.restaurantSub) this.restaurantSub.unsubscribe();
  }

  // Getters
  get nameFormControl() {
    return this.restaurantForm.get('name');
  }

  get coverFormControl() {
    return this.restaurantForm.get('cover');
  }

  get descriptionFormControl() {
    return this.restaurantForm.get('description');
  }

  get emailFormControl() {
    return this.restaurantForm.get('email');
  }

  get passwordFormControl() {
    return this.restaurantForm.get('password');
  }

  get phoneFormControl() {
    return this.restaurantForm.get('phone');
  }

  get ownerNameFormControl() {
    return this.restaurantForm.get('ownerName');
  }
  get openTimeFormControl() {
    return this.restaurantForm.get('openTime');
  }

  get closeTimeFormControl() {
    return this.restaurantForm.get('closeTime');
  }
  get cityIdFormControl() {
    return this.restaurantForm.get('cityId');
  }

  get statusFormControl() {
    return this.restaurantForm.get('status');
  }

  get categoriesFormControl() {
    return this.restaurantForm.get('categories');
  }

  get restaurantAddressFormControl() {
    return this.restaurantForm.get('restaurantAddress');
  }

  get cuisinesFormControl() {
    return this.restaurantForm.get('cuisines');
  }

  get categoriesNameFormControl() {
    return this.restaurantForm.get('categories');
  }
  get postalCodeFormControl() {
    return this.restaurantForm.get('postalCode');
  }

  get priceFormControl() {
    return this.restaurantForm.get('price');
  }

  get coverImageFormControl() {
    return this.restaurantForm.get('coverImage');
  }

  get deliveryTimeFormControl() {
    return this.restaurantForm.get('deliveryTime');
  }
}

// isLoading = false;
// restaurantId!: number;
// cities$ = this.cityService.citiesWithCRUD$;
// categories$ = this.restaurantService.categories$;
// cuisines$ = this.restaurantService.cuisines$;
// status$ = this.restaurantService.status$;
// selectedImageSubject = new BehaviorSubject<number>(0);
// selectedImageAction$ = this.selectedImageSubject.asObservable();
// cover: any;
// cover_file: any;
// restaurantSub!: Subscription;

// selectedRestaurantId$ = this.route.paramMap.pipe(
//   map((paramMap) => {
//     let id = paramMap.get('id');
//     if (id) this.restaurantId = +id;
//     this.restaurantService.selectRestaurant(this.restaurantId);
//   })
// );

// restaurant$ = this.restaurantService.restaurant$.pipe(
//   tap((restaurant: any) => {
//     if (restaurant) this.restaurantId = restaurant.id;
//     restaurant &&
//       this.restaurantForm.setValue({
//         coverImage: restaurant?.coverImage,
//         name: restaurant?.name,
//         email: restaurant?.email,
//         password: restaurant?.password,
//         phone: restaurant?.phone,
//         restaurantName: restaurant?.restaurantName,
//         openTime: restaurant?.openTime,
//         description: restaurant?.description,
//         closeTime: restaurant?.closeTime,
//         cityId: restaurant?.cityId,
//         status: restaurant?.status,
//         address: restaurant?.address,
//         price: restaurant?.price,
//         deliveryTime: restaurant?.deliveryTime,
//         cuisines: restaurant?.cuisines,
//         categories: restaurant?.categories,
//         postalCode: restaurant?.postalCode,
//       });
//   }),
//   catchError((error) => {
//     this.notificationService.setErrorMessage(error);
//     return EMPTY;
//   })
// );

// notification$ = this.restaurantService.restaurantCRUDCompleteAction$.pipe(
//   startWith(false),
//   tap((message) => {
//     if (message) {
//       this.router.navigateByUrl('/tabs/home');
//     }
//   })
// );
// viewModel$ = combineLatest([
//   this.selectedRestaurantId$,
//   this.restaurant$,
//   this.notification$,
//   // this.selectedImageAction$,
// ]);

// ngOnInit() {
//   console.log('ngOnInit');
//   //this.getCities();
// }

// onRestaurantSubmit() {
//   this.isLoading = true;
//   this.global.showLoader();
//   let restaurantDetails = this.restaurantForm.value;
//   if (this.restaurantId) {
//     restaurantDetails = { ...restaurantDetails, id: this.restaurantId };

//     let formData: any = new FormData();
//     if (this.cover) {
//       formData.append('cover', this.cover);
//     }
//     for (let key in restaurantDetails) {
//       formData.append(key, restaurantDetails[key]);
//     }

//     this.restaurantSub = this.restaurantService
//       .updateRestaurantToServer(formData)
//       .subscribe({
//         next: (result) => {
//           console.log(result);
//           this.isLoading = false;
//           this.global.successToast('Restaurant was updated successfully!');
//           this.global.hideLoader();
//           this.router.navigateByUrl('/admin');
//         },
//         error: (err) => {
//           console.log(err);
//           this.global.errorToast('Restaurant addition failed');
//           this.isLoading = false;
//           this.global.hideLoader();
//         },
//       });
//   } else {
//     let formData: any = new FormData();
//     if (this.cover) {
//       formData.append('cover', this.cover);
//     }
//     for (let key in restaurantDetails) {
//       formData.append(key, restaurantDetails[key]);
//     }

//     this.restaurantSub = this.restaurantService
//       .addRestaurantToServer(formData)
//       .subscribe({
//         next: (result) => {
//           console.log(result);
//           this.isLoading = false;
//           this.global.successToast('Restaurant was added successfully!');
//           this.global.hideLoader();
//           this.router.navigateByUrl('/admin');
//         },
//         error: (err) => {
//           console.log(err);
//           this.global.errorToast('Restaurant addition failed');
//           this.isLoading = false;
//           this.global.hideLoader();
//         },
//       });
//   }
// }

// getArrayAsString(array: any) {
//   return array.join(', ');
// }

//////////////////////////////////////////////////////////////////////////////////////////

////  OLD CODE

//////////////////////////////////////////////////////////////////////////////////////

// registerForm!: FormGroup;
// profile_image!: File;

// constructor(
//   private formBuilder: FormBuilder,
//   private userService: UserService,
//   private router: Router
// ) {
//   this.registerForm = this.formBuilder.group({
//     firstName: ['', [Validators.required, Validators.minLength(2)]],
//     lastName: ['', [Validators.required, Validators.minLength(2)]],
//     email: ['', [Validators.required, Validators.email]],
//     password: ['', [Validators.required]],
//     confirmPassword: ['', [Validators.required]],
//     type: ['', [Validators.required]],
//     status: ['', [Validators.required]],
//     phone: ['', [Validators.required]],
//   });
// }

// onFileSelected(event: any) {
//   this.profile_image = event.target.files[0];
// }

// ngOnInit() {}

// register() {
//   let formData = new FormData();

//   if (this.profile_image) {
//     formData.append('profile_image', this.profile_image);
//   }

//   for (let key in this.registerForm.value) {
//     formData.append(key, this.registerForm.value[key]);
//   }

//   this.userService.signupUser(formData).subscribe({
//     next: (result) => {
//       console.log(this.registerForm.value);
//       alert('User was created successfully');
//       this.router.navigate(['/login']);
//     },
//     error: (err) => {
//       console.log(err);
//       alert('Registration failed!');
//     },
//   });
// }

// isLoading = false;
// restaurantId!: number;
// cities$ = this.cityService.citiesWithCRUD$;
// categories$ = this.restaurantService.categories$;
// cuisines$ = this.restaurantService.cuisines$;

// //restaurantForm!: FormGroup;
// isEditMode: boolean = false;
// restaurantSubscription!: Subscription;
// restaurants!: Restaurant[];
// location: any = {};
// coverImage: any;
// category!: string;
// isCuisine: boolean = false;

// //cities = ['Edmonton', 'Calgary'];
// cover_file: any;

// restaurantForm: any = new FormGroup({
//   coverImage: new FormControl(''),
//   name: new FormControl(''),
//   email: new FormControl(''),
//   password: new FormControl(''),
//   phone: new FormControl(''),
//   restaurantName: new FormControl(''),
//   openTime: new FormControl(''),
//   closeTime: new FormControl(''),
//   city: new FormControl(''),
//   status: new FormControl(''),
//   description: new FormControl(''),
//   address: new FormControl(''),
//   price: new FormControl(''),
//   deliveryTime: new FormControl(''),
//   cuisines: new FormControl(''),
//   categories: new FormControl(''),
//   location: new FormControl(''),
// });

// selectedRestaurantId$ = this.route.paramMap.pipe(
//   map((paramMap) => {
//     let id = paramMap.get('id');
//     if (id) this.restaurantId = +id;
//     this.restaurantService.selectRestaurant(this.restaurantId);
//   })
// );

// restaurant$ = this.restaurantService.restaurantsWithUsersAndCRUD$.pipe(
//   tap((restaurant: any) => {
//     if (restaurant) this.restaurantId = restaurant.id;
//     restaurant &&
//       this.restaurantForm.setValue({
//         coverImage: restaurant?.coverImage,
//         name: restaurant?.name,
//         email: restaurant?.email,
//         password: restaurant?.password,
//         phone: restaurant?.phone,
//         restaurantName: restaurant?.restaurantName,
//         openTime: restaurant?.openTime,
//         description: restaurant?.description,
//         closeTime: restaurant?.closeTime,
//         city: restaurant?.city,
//         status: restaurant?.status,
//         address: restaurant?.address,
//         price: restaurant?.price,
//         deliveryTime: restaurant?.deliveryTime,
//         cuisines: restaurant?.cuisines,
//         categories: restaurant?.categories,
//         location: restaurant?.location,
//       });
//   }),
//   catchError((error) => {
//     this.notificationService.setErrorMessage(error);
//     return EMPTY;
//   })
// );

// notification$ = this.restaurantService.restaurantCRUDCompleteAction$.pipe(
//   startWith(false),
//   tap((message) => {
//     if (message) {
//       this.router.navigateByUrl('/tabs/tab1');
//     }
//   })
// );
// viewModel$ = combineLatest([
//   this.selectedRestaurantId$,
//   this.restaurant$,
//   this.notification$,
// ]);

// constructor(
//   private notificationService: NotificationService,
//   private restaurantService: RestaurantService,
//   private cityService: CityService,
//   private router: Router,
//   private route: ActivatedRoute,
//   private global: GlobalService
// ) {
//   addIcons({
//     timeOutline,
//     person,
//     mail,
//     key,
//     call,
//     cashOutline,
//     addOutline,
//   });
// }

// onRestaurantSubmit() {
//   this.isLoading = true;
//   this.global.showLoader();
//   let restaurantDetails = this.restaurantForm.value;
//   if (this.restaurantId) {
//     restaurantDetails = { ...restaurantDetails, id: this.restaurantId };
//     this.restaurantService.updateRestaurant(restaurantDetails);
//     this.isLoading = false;
//     this.global.hideLoader();
//     this.router.navigateByUrl('/tabs/tab1');
//     this.global.successToast('Restaurant was updated successfully!');
//     this.global.modalDismiss();
//   } else {
//     this.restaurantService.addRestaurant(restaurantDetails);
//     this.global.successToast('Restaurant was added successfully!');
//     this.isLoading = false;
//     this.global.hideLoader();
//   }
// }

// reset() {
//   this.router.navigateByUrl('/tabs/tab1');
//   this.isLoading = false;
//   this.global.hideLoader();
// }

//   preview(event: any) {
//     console.log(event);
//     const files = event.target.files;
//     if (files.length == 0) return;
//     const mimeType = files[0].type;
//     if (mimeType.match(/image\/*/) == null) return;
//     const file = files[0];
//     this.cover_file = file;
//     const filePath = 'restaurants/' + Date.now() + '_' + file.name;
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       console.log('result: ', reader.result);
//       this.coverImage = reader.result;
//     };
//     reader.readAsDataURL(file);
//   }

//   getArrayAsString(array: any) {
//     return array.join(', ');
//   }
// }

// }

// constructor(
//   private formBuilder: FormBuilder,
//   private route: ActivatedRoute,
//   private notificationService: NotificationService,
//   private restaurantService: RestaurantService,
//   // private cityService: CityService,
//   private router: Router,
//   private global: GlobalService
// ) {
//   this.restaurantForm = formBuilder.group({
//     name: [
//       '',
//       [
//         Validators.required,
//         Validators.minLength(3),
//         // avoidWord,
//         // prohibited(/peter/),
//         // prohibited(/god/),
//       ],
//     ],
//     coverImage: ['', [Validators.required]],
//     email: ['', [Validators.required]],
//     password: ['', [Validators.required]],
//     priority_level: ['', [Validators.required]],
//     phone: ['', [Validators.required]],
//     restaurantName: ['', [Validators.required]],
//     openTime: ['', [Validators.required]],
//     closeTime: ['', [Validators.required]],
//     city: ['', [Validators.required]],
//     status: ['', [Validators.required]],
//     description: ['', [Validators.required]],
//     address: ['', [Validators.required]],
//     price: ['', [Validators.required]],
//     deliveryTime: ['', [Validators.required]],
//     cuisines: ['', [Validators.required]],
//     categories: ['', [Validators.required]],
//     location: ['', [Validators.required]],
//   });

//   this.restaurantSubscription = this.route.paramMap.subscribe(
//     (params: ParamMap) => {
//       const id = params.get('id');
//       if (id) {
//         this.isEditMode = true;
//         this.restaurantId = parseInt(id);
//       }
//     }
//   );

//   this.restaurantSubscription = this.restaurantService
//     .getRestaurants()
//     .subscribe((results) => {
//       this.restaurants = results;
//       console.log(this.restaurants);
//     });

//   if (this.restaurantId) {
//     this.restaurantSubscription = this.restaurantService
//       .getRestaurant(this.restaurantId)
//       .subscribe((result) => {
//         console.log(result);
//         this.restaurantForm.patchValue(result);
//       });
//   }
//   addIcons({
//     timeOutline,
//     person,
//     mail,
//     key,
//     call,
//     cashOutline,
//     addOutline,
//   });
// }

// onRestaurantSubmit() {
//   this.isEditMode ? this.updateRestaurant() : this.createRestaurant();
//   console.log(this.restaurantForm.value);
// }

// createRestaurant() {
//   const formData = this.restaurantForm.value;

//   //Http call
//   if (formData) {
//     this.restaurantSubscription = this.restaurantService
//       .createRestaurant(formData)
//       .subscribe((result) => {
//         console.log(result);
//         alert('Restaurant was created successfully');
//         this.restaurantForm.reset(); //Clear web form data
//       });
//   }
// }

// updateRestaurant() {
//   const formData = this.restaurantForm.value;

//   //Http call
//   this.restaurantSubscription = this.restaurantService
//     .updateRestaurant(this.restaurantId, formData)
//     .subscribe((result) => {
//       console.log(result);
//       alert('Restaurant was updated successfully');
//       this.restaurantForm.reset(); //Clear web form data
//     });
// }

// isLoading: boolean = false;
// cities!: any;
// location: any = {};
// cover: any;
// category: string;
// isCuisine: boolean = false;
// cuisines = this.restaurantService.getCuisines();
// categories = this.restaurantService.getCategories();
// status = this.restaurantService.getStatus();
// cover_file: any;
// restaurantForm: FormGroup;
// CommonModule,
// ReactiveFormsModule,
// IonSelectOption,
// IonHeader,
// IonTitle,
// IonListHeader,
// IonBackButton,
// IonToolbar,
// IonSpinner,
// IonInfiniteScroll,
// ScrollingModule,
// IonDatetime,
// FormsModule,

// reset() {
//   this.router.navigateByUrl('/tabs/tab1');
//   this.isLoading = false;
//   this.global.hideLoader();
// }

// async onRestaurantSubmit(form: NgForm) {
//   if (!form.valid || !this.location?.lat) return;
//   let postData = new FormData();
//   if (!this.coverImage || this.coverImage === '') {
//     this.global.errorToast('Please select a cover image');
//   }
//   if (form.value.description) {
//     postData.append('description', form.value.description);
//   }
//   const location = {
//     type: 'Point',
//     coordinates: [this.location.lng, this.location.lat],
//   };
//   postData.append('restaurantImages', this.cover_file, this.cover_file.name);
//   postData.append('name', form.value.name);
//   postData.append('email', form.value.email);
//   postData.append('phone', form.value.phone);
//   postData.append('password', form.value.password);
//   postData.append('res_name', form.value.res_name);
//   postData.append('short_name', form.value.res_name.toLowerCase());
//   postData.append('openTime', form.value.openTime);
//   postData.append('closeTime', form.value.closeTime);
//   postData.append('price', form.value.price.toString());
//   postData.append('city_id', form.value.city);
//   postData.append('delivery_time', form.value.delivery_time.toString());
//   postData.append('address', this.location.address);
//   postData.append('status', Strings.STATUS_ACTIVE);
//   postData.append('cuisines', JSON.stringify(this.cuisines));
//   postData.append('categories', JSON.stringify(this.categories));
//   postData.append('location', JSON.stringify(this.location));

//   try {
//     // const response = await this.restaurantService.
//     this.global.showLoader();
//     const response = await this.restaurantService.createRestaurant(postData);
//     console.log(response);
//     this.global.successToast('Restaurant added successfully!');
//     this.global.hideLoader();
//   } catch (e) {
//     console.log(e);
//     this.global.hideLoader();
//     this.global.errorToast();
//   }
// }

// async getCities() {
//   try {
//     this.cities = await this.cityService.getCities();
//     console.log(this.cities);
//   } catch (e) {
//     console.log(e);
//     this.global.errorToast(e);
//   }
// }

// async searchLocation() {
//   try {
//     const options = {
//       component: SearchLocationComponent,
//     };
//     const modal = await this.global.createModal(options);
//     if (modal) {
//       console.log(modal);
//       this.location = modal;
//     }
//   } catch (e) {
//     console.log(e);
//   }
// }

// addCategory() {
//   console.log(this.category);
//   if (this.category.trim() === '') return;
//   console.log(this.isCuisine);
//   const checkString = this.categories.find((x) => x === this.category);
//   if (checkString) {
//     this.global.errorToast('Category already added');
//     return;
//   }
//   this.categories.push(this.category);
//   if (this.isCuisine) this.cuisines.push(this.category);
// }

// onRestaurantSubmit() {
//   this.isLoading = true;
//   this.global.showLoader();
//   let restaurantDetails = this.restaurantForm.value;
//   if (this.restaurantId) {
//     restaurantDetails = { ...restaurantDetails, id: this.restaurantId };
//     this.restaurantService.updateRestaurant(restaurantDetails);
//     this.isLoading = false;
//     this.global.hideLoader();
//     this.router.navigateByUrl('/tabs/tab1');
//     this.global.successToast('Restaurant was updated successfully!');
//     this.global.modalDismiss();
//   } else {
//     this.restaurantService.addRestaurant(restaurantDetails);
//     this.global.successToast('Restaurant was added successfully!');
//     this.isLoading = false;
//     this.global.hideLoader();
//   }
// }

// constructor(
//   private authService: AuthService,
//   private router: Router,
//   private global: GlobalService,
//   private cityService: CityService,
//   private restaurantService: RestaurantService
// ) {}

// constructor(
//   private formBuilder: FormBuilder,
//   private route: ActivatedRoute,
//   private notificationService: NotificationService,
//   private restaurantService: RestaurantService,
//   private cityService: CityService,
//   private router: Router,
//   private global: GlobalService
// ) {
//   this.restaurantForm = formBuilder.group({
//     name: [
//       '',
//       [
//         Validators.required,
//         Validators.minLength(3),
//         // avoidWord,
//         // prohibited(/peter/),
//         // prohibited(/god/),
//       ],
//     ],
//     //  cover: ['', [Validators.required]],
//     email: ['', [Validators.required]],
//     password: ['', [Validators.required]],
//     phone: ['', [Validators.required]],
//     restaurantName: ['', [Validators.required]],
//     openTime: ['', [Validators.required]],
//     closeTime: ['', [Validators.required]],
//     city: ['', [Validators.required]],
//     status: ['', [Validators.required]],
//     description: ['', [Validators.required]],
//     address: ['', [Validators.required]],
//     price: ['', [Validators.required]],
//     deliveryTime: ['', [Validators.required]],
//     cuisines: ['', [Validators.required]],
//     categories: ['', [Validators.required]],
//     // location: ['', [Validators.required]],
//   });

//   this.cityService.getCities().subscribe((result) => {
//     this.cities = result;
//   });
//   console.log(this.cities);
//   addIcons({
//     timeOutline,
//     person,
//     mail,
//     key,
//     call,
//     cashOutline,
//     addOutline,
//   });
// }

//restaurantForm!: FormGroup;
// isEditMode: boolean = false;
// restaurantSubscription!: Subscription;
// restaurants!: Restaurant[];
// location: any = {};
// coverImage: any;
// category!: string;
// isCuisine: boolean = false;

//cities = ['Edmonton', 'Calgary'];
//cover_file: any;

// onRestaurantSubmit() {
//   let formData = new FormData();

//   if (this.cover) {
//     formData.append('cover', this.cover);
//   }

//   for (let key in this.restaurantForm.value) {
//     formData.append(key, this.restaurantForm.value[key]);
//   }

//   this.restaurantService.submitRestaurant(formData).subscribe({
//     next: (result) => {
//       console.log(this.restaurantForm.value);
//       alert('User was created successfully');
//       this.router.navigate(['/login']);
//     },
//     error: (err) => {
//       console.log(err);
//       alert('Registration failed!');
//     },
//   });
// }

// IonImg,
// IonInfiniteScrollContent,
// IonRow,
// IonList,
// IonIcon,
// IonLabel,
// IonInput,
// IonText,
// IonButton,
// IonButtons,
// IonItem,
// IonSelect,
// CommonModule,
// IonTitle,
// IonListHeader,
// IonBackButton,
// IonToolbar,
// IonDatetime,
// ReactiveFormsModule,
// IonSelectOption,
// IonSelect,
// IonInfiniteScroll,

// async onRestaurantSubmit() {
//   this.isLoading = true;
//   this.global.showLoader();
//   let restaurantDetails = this.restaurantForm.value;
//   if (this.restaurantId) {
//     restaurantDetails = { ...restaurantDetails, id: this.restaurantId };
//     let formData: any = new FormData();

//     if (this.cover) {
//       formData.append('cover', this.cover);
//     }

//     for (let key in restaurantDetails) {
//       formData.append(key, restaurantDetails[key]);
//     }
//     //let restaurantDetails: any = formData;
//     this.restaurantService.updateRestaurant(formData);
//     this.isLoading = false;
//     this.global.successToast('Restaurant was updated successfully!');
//     this.global.hideLoader();
//     // this.router.navigateByUrl('/tabs/home');
//   } else {
//     let formData: any = new FormData();
//     if (this.cover) {
//       formData.append('cover', this.cover);
//     }
//     for (let key in restaurantDetails) {
//       formData.append(key, restaurantDetails[key]);
//     }
//     //this.restaurantService.submitRestaurant(formData).subscribe
//     this.restaurantService.addRestaurantToServer(formData).subscribe({
//       next: (result) => {
//         console.log(result);
//         this.isLoading = false;
//         this.global.successToast('Restaurant was added successfully!');
//         this.global.hideLoader();
//         this.router.navigateByUrl('/admin');
//       },
//       error: (err) => {
//         console.log(err);
//         alert('Registration failed!');
//       },
//     });
//     // this.restaurantService.addRestaurant(formData);
//     // const response = await this.restaurantService.createRestaurant(formData);
//     // console.log(formData);
//     // console.log(response);
//     // this.isLoading = false;
//     // this.global.successToast('Restaurant was added successfully!');
//     // this.global.hideLoader();
//     // this.router.navigateByUrl('/tabs/home');
//   }
// }

// onRestaurantSubmit() {
//   this.isLoading = true;
//   this.global.showLoader();
//   let restaurantDetails = this.restaurantForm.value;

//   let formData: any = new FormData();
//   if (this.cover) {
//     formData.append('cover', this.cover);
//   }
//   for (let key in restaurantDetails) {
//     formData.append(key, restaurantDetails[key]);
//   }
//   if (this.restaurantId) {
//     formData = { ...formData, id: this.restaurantId };
//     this.restaurantService.updateRestaurant(formData);
//     this.isLoading = false;
//     this.global.hideLoader();
//     this.router.navigateByUrl('/admin');
//     this.global.successToast('Restaurant was updated successfully!');
//     this.global.modalDismiss();
//   } else {
//     this.restaurantService.addRestaurant(formData);
//     this.global.successToast('Restaurant was added successfully!');
//     this.isLoading = false;
//     this.global.hideLoader();
//   }
// }

// onRestaurantSubmit() {
//   this.isLoading = true;
//   this.global.showLoader();
//   let restaurantDetails = this.restaurantForm.value;

//   let formData: any = new FormData();
//   if (this.cover) {
//     formData.append('cover', this.cover);
//   }
//   for (let key in restaurantDetails) {
//     formData.append(key, restaurantDetails[key]);
//   }
//   if (this.restaurantId) {
//     formData = { ...formData, id: this.restaurantId };
//     this.restaurantService.updateRestaurant(formData);
//     this.isLoading = false;
//     this.global.hideLoader();
//     this.router.navigateByUrl('/admin');
//     this.global.successToast('Restaurant was updated successfully!');
//     this.global.modalDismiss();
//   } else {
//     this.restaurantService.addRestaurant(formData);
//     this.global.successToast('Restaurant was added successfully!');
//     this.isLoading = false;
//     this.global.hideLoader();
//   }
// }

// IonImg,
// IonInfiniteScrollContent,
// IonRow,
// IonList,
// IonIcon,
// IonLabel,
// IonInput,
// IonText,
// IonButton,
// IonButtons,
// IonItem,
// IonSelect,
// CommonModule,
// IonTitle,
// IonListHeader,
// IonBackButton,
// IonToolbar,
// IonDatetime,
// ReactiveFormsModule,
// IonSelectOption,
// IonSelect,
// IonInfiniteScroll,

// selectedImageSubject = new BehaviorSubject<number>(0);
// selectedImageAction$ = this.selectedImageSubject.asObservable();
