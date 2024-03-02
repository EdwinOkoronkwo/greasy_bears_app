import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { Observable, lastValueFrom } from 'rxjs';
import { Strings } from 'src/app/enum/strings';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { GlobalService } from 'src/app/services/global/global.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanLoad {
  constructor(
    private router: Router,
    private auth: AuthService,
    private global: GlobalService
  ) {}

  async canLoad(route: Route, segments: UrlSegment[]): Promise<boolean> {
    const existingRole = route?.data?.['role'];
    const user: User | any = await this.auth.getProfile();
    console.log(user);
    if (user) {
      if (user.status !== Strings.STATUS_ACTIVE) {
        this.auth.logout();
        this.navigate(Strings.LOGIN);
      }
      if (user?.type === existingRole) true;
      else this.redirect(user?.type);
    } else if (user === false) {
      this.showAlert(existingRole);
    } else {
      this.navigate(Strings.LOGIN);
    }
    return false;
  }

  navigate(url: any) {
    this.router.navigateByUrl(url, { replaceUrl: true });
    return false;
  }

  showAlert(role: any) {
    this.global.showAlert(
      'Please check your internect connectivity and try again',
      'Retry',
      [
        {
          text: 'Logout',
          handler: () => {
            this.auth.logout();
            this.navigate(Strings.LOGIN);
          },
        },
        {
          text: 'Retry',
          handler: () => {
            this.redirect(role);
          },
        },
      ]
    );
  }

  redirect(role: any) {
    let url = Strings.TABS;
    if (role === Strings.ADMIN_TYPE) url = Strings.ADMIN;
    this.navigate(url);
  }
}

// async canLoad(
//   route: Route,
//   segments: UrlSegment[]
// ): Promise<boolean | UrlTree> {
//   const token = await lastValueFrom(this.authService.isLoggedIn());
//   console.log(token);
//   if (token) return true;
//   else {
//     this.router.navigateByUrl('/login', { replaceUrl: true });
//     return false;
//   }
