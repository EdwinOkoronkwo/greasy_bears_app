import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { eyeOutline, key, mail } from 'ionicons/icons';
import { Strings } from 'src/app/enum/strings';
import { AuthService } from 'src/app/services/auth/auth.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    IonicModule,
    RouterLink,
  ],
})
export class LoginPage {
  loginForm!: FormGroup;
  type: boolean = true;
  iconName = 'eye-outline';
  isLogin = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private auth: AuthService,
    private global: GlobalService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
    addIcons({
      mail,
      key,
      eyeOutline,
    });
  }

  toggleType() {
    this.type = !this.type;
  }

  navigate(role?: any) {
    let url = Strings.TABS;
    if (role === Strings.ADMIN) url = Strings.ADMIN;
    this.router.navigateByUrl(url, { replaceUrl: true });
  }

  isLoggedIn() {
    try {
      this.global.showLoader();
      const val = this.auth.getToken();
      console.log(val);
      if (val) this.navigate();
      this.global.hideLoader();
    } catch (e) {
      console.log(e);
    }
  }

  login() {
    console.log(this.loginForm.value);
    this.auth.loginUser(this.loginForm.value).subscribe({
      next: (response: any) => {
        localStorage.setItem('auth_token', response.token);
        console.log(response.token);
        let msg = 'Login was successful';
        this.global.successToast(msg);
        this.loginForm.reset();
        this.navigate(response?.user?.type);
        this.router.navigate(['/tabs/home']);
        return response;
      },
      error: (err: any) => {
        console.log(err);
        this.isLogin = false;
        let msg = 'Could not sign you in. Please try again';
        if (err?.error?.message) {
          msg = err.error.message;
        }
        this.global.showAlert(msg);
      },
    });
  }

  get emailFormControl() {
    return this.loginForm.get('email');
  }

  get passwordFormControl() {
    return this.loginForm.get('password');
  }
}
