import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {
  BehaviorSubject,
  EMPTY,
  Subscription,
  catchError,
  combineLatest,
  startWith,
  tap,
} from 'rxjs';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { CityService } from 'src/app/services/city/city.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import {
  addOutline,
  call,
  cashOutline,
  cloudUploadOutline,
  key,
  locationOutline,
  mail,
  person,
  timeOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-add-city',
  templateUrl: './add-city.page.html',
  styleUrls: ['./add-city.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class AddCityPage implements OnInit {
  status$ = this.cityService.status$;
  isLoading: boolean = false;
  cityId!: number;
  errorMessageSubject = new BehaviorSubject<string>('');
  errorMessageAction$ = this.errorMessageSubject.asObservable();
  citySub!: Subscription;
  cities$ = this.cityService.citiesWithCRUD$.pipe(
    catchError((error: string) => {
      this.errorMessageSubject.next(error);
      return EMPTY;
    })
  );

  cityForm: any = new FormGroup({
    name: new FormControl(''),
    lat: new FormControl(''),
    lng: new FormControl(''),
    status: new FormControl(''),
  });

  city$ = this.cityService.citiesWithCRUD$.pipe(
    tap((city: any) => {
      if (city) this.cityId = city.id;
      city &&
        this.cityForm.setValue({
          name: city?.name,
          lat: city?.lat,
          lng: city?.lng,
          status: city?.status,
        });
    }),
    catchError((error) => {
      this.notificationService.setErrorMessage(error);
      return EMPTY;
    })
  );

  notification$ = this.cityService.citiesWithCRUD$.pipe(
    startWith(false),
    tap((message) => {
      if (message) {
        this.router.navigateByUrl('/tabs/admin');
      }
    })
  );
  viewModel$ = combineLatest([this.cities$, this.notification$]);

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private global: GlobalService,
    private cityService: CityService
  ) {
    addIcons({
      person,
      locationOutline,
    });
  }

  ngOnInit() {
    console.log('ngOnInit');
  }

  onCitySubmit() {
    this.isLoading = true;
    this.global.showLoader();
    let formData: any = new FormData();
    for (let key in this.cityForm.value) {
      formData.append(key, this.cityForm.value[key]);
    }
    this.citySub = this.cityService.addCityToServer(formData).subscribe({
      next: (result) => {
        console.log(result);
        this.isLoading = false;
        this.global.successToast('City was added successfully!');
        this.global.hideLoader();
        this.router.navigateByUrl('/admin');
      },
      error: (err) => {
        console.log(err);
        this.global.errorToast('City addition failed');
        this.isLoading = false;
        this.global.hideLoader();
      },
    });
  }

  // Getters
  get nameFormControl() {
    return this.cityForm.get('name');
  }

  get latFormControl() {
    return this.cityForm.get('lat');
  }

  get lngFormControl() {
    return this.cityForm.get('lng');
  }

  get statusFormControl() {
    return this.cityForm.get('status');
  }
}
