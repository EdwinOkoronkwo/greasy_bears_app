import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  call,
  cloudUploadOutline,
  key,
  mail,
  person,
  timeOutline,
} from 'ionicons/icons';
import { NgxMaskService } from 'ngx-mask';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
})
export class RegisterPage implements OnInit {
  @ViewChild('filePicker', { static: false }) filePickerRef!: ElementRef;
  registerForm!: FormGroup;
  profile_image!: File;
  image: any;
  isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private auth: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      type: ['', [Validators.required]],
    });
    addIcons({
      timeOutline,
      person,
      mail,
      key,
      call,
      cloudUploadOutline,
    });
  }

  onFileSelected(event: any) {
    this.profile_image = event.target.files[0];
    const file = event.target.files[0];
    const reader: any = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result.toString();
      this.image = dataUrl;
      console.log('image: ', this.image);
    };

    reader.readAsDataURL(file);
    //this.selectedImageSubject.next(this.cover);
  }

  ngOnInit() {}

  register() {
    let formData = new FormData();

    if (this.profile_image) {
      formData.append('profile_image', this.profile_image);
    }

    for (let key in this.registerForm.value) {
      formData.append(key, this.registerForm.value[key]);
    }

    this.auth.signupUser(formData).subscribe({
      next: (result) => {
        console.log(this.registerForm.value);
        alert('User was created successfully');
        // this.router.navigate(['/login']);
      },
      error: (err) => {
        console.log(err);
        alert('Registration failed!');
      },
    });
  }

  changeImage() {
    this.filePickerRef.nativeElement.click();
  }

  get firstNameFormControl() {
    return this.registerForm.get('firstName');
  }

  get lastNameFormControl() {
    return this.registerForm.get('lastName');
  }

  get emailFormControl() {
    return this.registerForm.get('email');
  }

  get passwordFormControl() {
    return this.registerForm.get('password');
  }

  get confirmPasswordFormControl() {
    return this.registerForm.get('confirmPassword');
  }

  get phoneFormControl() {
    return this.registerForm.get('phone');
  }

  get imageFormControl() {
    return this.registerForm.get('image');
  }

  get typeFormControl() {
    return this.registerForm.get('type');
  }
}

///////////////////////////////////////////////////////////////////
////////////////// OLD CODE //////////////////////////////////////////

// onFileSelected(event: any) {
//   this.cover = event.target.files[0];
//   const file = event.target.files[0];
//   const reader = new FileReader();
//   reader.onload = (e) => {
//     console.log('result: ', reader.result);
//     this.cover_file = reader.result;
//   };
//   reader.readAsDataURL(file);
//   this.selectedImageSubject.next(this.cover);
// }

// ngOnInit() {
//   console.log('ngOnInit');
//   //this.getCities();
// }

// onRestaurantSubmit() {
//   this.isLoading = true;
//   this.global.showLoader();
//   let formData = new FormData();

//   if (this.cover) {
//     formData.append('cover', this.cover);
//   }

//   for (let key in this.restaurantForm.value) {
//     formData.append(key, this.restaurantForm.value[key]);
//   }

// onFileSelected(event: any) {
//   const file = event.target.files[0];
//   if (!file) return;
//   console.log('file: ', file);
//   this.profile_image = file;
//   const reader: any = new FileReader();
//   console.log(reader);
//   reader.onload = () => {
//     // const dataUrl = reader.result.toString();
//     this.image = reader.result;
//     console.log('image: ', this.image);
//   };

//   reader.readAsDataURL(file);
// }
