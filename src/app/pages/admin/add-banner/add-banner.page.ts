import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  Form,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  IonButton,
  IonContent,
  IonItem,
  IonThumbnail,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonBackButton,
  IonText,
  IonSelectOption,
  IonSelect,
} from '@ionic/angular/standalone';
import { EMPTY, catchError, combineLatest, map, startWith, tap } from 'rxjs';
import { BannerService } from 'src/app/services/banner/banner.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';

@Component({
  selector: 'app-add-banner',
  templateUrl: './add-banner.page.html',
  styleUrls: ['./add-banner.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    CommonModule,
    IonContent,
    IonItem,
    IonThumbnail,
    IonButton,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle,
    IonBackButton,
    ReactiveFormsModule,
    IonText,
    IonSelectOption,
    IonSelect,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddBannerPage {
  bannerImage!: any;
  cover_file: any;
  bannerId!: number;
  isLoading = false;
  status$ = this.bannerService.status$;
  restaurants$ = this.restaurantService.restaurants$;

  bannerForm: any = new FormGroup({
    cover: new FormControl(''),
    restaurantId: new FormControl(''),
    status: new FormControl(''),
  });

  selectedBanner$ = this.route.paramMap.pipe(
    map((paramMap: any) => {
      let id = paramMap.get('id');
      if (id) this.bannerId = +id;
      this.bannerService.selectBanner(this.bannerId);
    })
  );

  banner$ = this.bannerService.bannersWithRestaurantsAndCRUD$.pipe(
    tap((banner: any) => {
      if (banner) this.bannerId = banner.id;
      banner &&
        this.bannerForm.setValue({
          restaurantId: banner?.restaurantId,
          status: banner?.status,
        });
    }),
    catchError((error) => {
      this.notificationService.setErrorMessage(error);
      return EMPTY;
    })
  );

  notification$ = this.bannerService.bannerCRUDCompleteAction$.pipe(
    startWith(false),
    tap((message) => {
      if (message) {
        this.router.navigateByUrl('/tabs/home');
      }
    })
  );
  viewModel$ = combineLatest([
    this.selectedBanner$,
    this.banner$,
    this.notification$,
  ]);

  constructor(
    private notificationService: NotificationService,
    private restaurantService: RestaurantService,
    private bannerService: BannerService,
    private router: Router,
    private route: ActivatedRoute,
    private global: GlobalService
  ) {}

  onFileSelected(event: any) {
    this.bannerImage = event.target.files[0];
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('result: ', reader.result);
      this.cover_file = reader.result;
    };
    reader.readAsDataURL(file);
  }

  onBannerSubmit() {
    this.isLoading = true;
    this.global.showLoader();
    let formData: any = new FormData();

    if (this.bannerImage) {
      formData.append('bannerImage', this.bannerImage);
    }

    for (let key in this.bannerForm.value) {
      formData.append(key, this.bannerForm.value[key]);
    }
    this.bannerService.addBannerToServer(formData).subscribe({
      next: (result) => {
        console.log(result);
        this.isLoading = false;
        this.global.successToast('Banner was added successfully!');
        this.global.hideLoader();
        this.router.navigateByUrl('/admin');
      },
      error: (err) => {
        console.log(err);
        alert('Registration failed!');
      },
    });
  }

  getArrayAsString(array: any) {
    return array.join(', ');
  }

  // Getters
  get restaurantIdControl() {
    return this.bannerForm.get('restaurantId');
  }

  get statusFormControl() {
    return this.bannerForm.get('status');
  }
  get bannerImageFormControl() {
    return this.bannerForm.get('bannerImage');
  }
}
