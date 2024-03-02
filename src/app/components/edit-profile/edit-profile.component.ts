import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  Input,
  NgModule,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NgForm,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { EMPTY, Subscription, combineLatest } from 'rxjs';
import { catchError, map, startWith, tap } from 'rxjs/operators';
import { Strings } from 'src/app/enum/strings';
import { AuthService } from 'src/app/services/auth/auth.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class EditProfileComponent {
  @Input() profile: any;
  isSubmitted = false;
  profileId: any;
  isLoading = false;
  profileSub!: Subscription;
  profile_file: any;
  profile_image: any;
  serverUrl = environment.serverUrl;
  profileUrl = Strings.PROFILE_URL;

  constructor(
    private profileService: ProfileService,
    private global: GlobalService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  editProfileForm: any = new FormGroup({
    phone: new FormControl(''),
  });

  selectedProfile$ = this.route.paramMap.pipe(
    map((paramMap: any) => {
      let id = paramMap.get('id');
      if (id) this.profileId = +id;
      this.profileService.selectProfile(this.profileId);
    })
  );

  profile$ = this.profileService.profileWithCRUD$.pipe(
    tap((profile: any) => {
      if (profile) this.profileId = profile.id;
      profile &&
        this.editProfileForm.setValue({
          phone: profile?.phone,
        });
    }),
    catchError((error) => {
      this.notificationService.setErrorMessage(error);
      return EMPTY;
    })
  );

  notification$ = this.profileService.profileCRUDCompleteAction$.pipe(
    startWith(false),
    tap((message) => {
      if (message) {
        this.router.navigateByUrl('/tabs/account');
      }
    })
  );
  viewModel$ = combineLatest([
    this.selectedProfile$,
    this.profile$,
    this.notification$,
  ]);

  // Getters
  get phoneFormControl() {
    return this.editProfileForm.get('phone');
  }

  get emailFormControl() {
    return this.editProfileForm.get('email');
  }

  onProfileSubmit() {
    this.isLoading = true;
    this.global.showLoader();
    let formData: any = new FormData();

    if (this.profile_image) {
      formData.append('profile_image', this.profile_image);
    }

    for (let key in this.editProfileForm.value) {
      formData.append(key, this.editProfileForm.value[key]);
    }
    this.profileService.updateProfileToServer(formData).subscribe({
      next: (result) => {
        console.log(result);
        this.isLoading = false;
        this.global.successToast('Profile was updated successfully!');
        this.global.hideLoader();
        this.router.navigateByUrl('/tabs/account');
      },
      error: (err) => {
        console.log(err);
        this.global.errorToast('Restaurant addition failed');
        this.isLoading = false;
        this.global.hideLoader();
      },
    });
  }

  onFileSelected(event: any) {
    this.profile_image = event.target.files[0];
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('result: ', reader.result);
      this.profile_file = reader.result;
    };
    reader.readAsDataURL(file);
  }

  reset() {
    this.router.navigateByUrl('/tabs/account');
    this.isLoading = false;
    this.global.hideLoader();
  }
}
