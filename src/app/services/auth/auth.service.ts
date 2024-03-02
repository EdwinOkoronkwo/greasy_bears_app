import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { BehaviorSubject, of } from 'rxjs';
import { Router } from '@angular/router';
import { Strings } from 'src/app/enum/strings';
import { User } from 'src/app/models/user.model';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  token$ = of(localStorage.getItem(Strings.TOKEN));

  constructor(
    private router: Router,
    private storage: StorageService,
    private api: ApiService
  ) {}

  logout() {
    this.storage.removeStorage(Strings.TOKEN);
    this.router.navigateByUrl(Strings.LOGIN, { replaceUrl: true });
  }

  signupUser(formData: any) {
    return this.api.post<User>('users/signup', formData);
  }

  loginUser(formData: any) {
    return this.api.post<any>('users/login', formData);
  }

  getProfile() {
    return this.api.get<User>('users/profile');
  }

  getToken() {
    return localStorage.getItem('auth_token');
  }
}

//////////////////////////////////////////////////////////////////////////////////////////
////////////////  OLD CODE /////////////////////////////////////////////////////////////

// async setUserData(token: string) {
//   this.storage.setStorage(Strings.TOKEN, token);
//   this.updateToken(token);
// }

// // updateProfileData(data: any) {
// //   this.profileService.updateProfileData(data);
// // }

// async sendResetPasswordOtp(email: string) {
//   try {
//     const data = { email };
//     const response = await lastValueFrom(
//       this.api.get('user/send/reset/password/token', data)
//     );
//     console.log(response);
//     return response;
//   } catch (e) {
//     throw e;
//   }
// }

// async verifyResetPasswordOtp(email: string, otp: string) {
//   try {
//     const data = {
//       email,
//       reset_password_token: otp,
//     };
//     const response = await lastValueFrom(
//       this.api.get('user/verify/resetPasswordToken', data)
//     );
//     console.log(response);
//     return response;
//   } catch (e) {
//     throw e;
//   }
// }

// async resetPassword(data: any) {
//   try {
//     const response = await lastValueFrom(
//       this.api.patch('user/reset/password', data)
//     );
//     console.log(response);
//     return response;
//   } catch (e) {
//     throw e;
//   }
// }

// async login(email: string, password: string): Promise<any> {
//   //return true;
//   try {
//     const data = {
//       email,
//       password,
//     };
//     let response: any = await this.api
//       .get('users/login', data)
//       .subscribe((result) => {
//         response = result;
//       });

//     console.log(response);
//     this.setUserData(response?.token);
//     this.updateProfileData(response?.user);
//     return response;
//   } catch (e) {
//     throw e;
//   }
// }

// async getUser() {
//   const token = await this.getToken();
//   console.log(token);
//   try {
//     if (token) {
//       const user: any = await this.profileService.getProfile();
//       console.log(user);
//       if (user) return user;
//       return false;
//     }
//     return false;
//   } catch (e) {
//     if (token) return false;
//     return null;
//   }
// }
// async getToken() {
//   let token: any = this._token.value;
//   if (!token) {
//     token = await localStorage.getItem(Strings.TOKEN);
//     this.updateToken(token);
//   }
//   return token;
// }

// private _token = new BehaviorSubject<string | null>(null);

// get token() {
//   return this._token.asObservable();
// }
// updateToken(value: any) {
//   this._token.next(value);
// }
