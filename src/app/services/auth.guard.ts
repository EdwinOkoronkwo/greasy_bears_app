import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from './user/user.service';
import { AuthService } from './auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService {
  constructor(private router: Router, private auth: AuthService) {}
  canActivate() {
    if (!this.auth.getToken()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}

// import { Injectable } from '@angular/core';
// import { CanLoad, Route, Router, UrlSegment, UrlTree } from '@angular/router';
// import { Observable, lastValueFrom } from 'rxjs';
// import { Strings } from 'src/app/enum/strings';
// import { AuthService } from 'src/app/services/auth/auth.service';
// import { GlobalService } from 'src/app/services/global/global.service';
// import { UserService } from './user/user.service';
// import { ProfileService } from './profile/profile.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthGuard implements CanLoad {
//   user: any;
//   constructor(
//     private router: Router,
//     private auth: AuthService,
//     private global: GlobalService,
//     private profileService: ProfileService
//   ) {}

//   async canLoad(route: Route | any, segments: UrlSegment[]): Promise<boolean> {
//     const existingRole = route.data['role'];
//     await this.profileService
//       .getProfile()
//       .subscribe((result) => (this.user = result));
//     console.log(this.user);
//     if (this.user) {
//       if (this.user?.status !== Strings.STATUS_ACTIVE) {
//         this.auth.logout();
//         this.navigate(Strings.LOGIN);
//       }
//       if (this.user?.type === existingRole) true;
//       else this.redirect(this.user?.type);
//     } else if (this.user === false) {
//       this.showAlert(existingRole);
//     } else {
//       this.navigate(Strings.LOGIN);
//     }
//     return false;
//   }

//   navigate(url: any) {
//     this.router.navigateByUrl(url, { replaceUrl: true });
//     return false;
//   }

//   showAlert(role: any) {
//     this.global.showAlert(
//       'Please check your internect connectivity and try again',
//       'Retry',
//       [
//         {
//           text: 'Logout',
//           handler: () => {
//             this.auth.logout();
//             this.navigate(Strings.LOGIN);
//           },
//         },
//         {
//           text: 'Retry',
//           handler: () => {
//             this.redirect(role);
//           },
//         },
//       ]
//     );
//   }

//   redirect(role: any) {
//     let url = Strings.TABS;
//     if (role === Strings.ADMIN_TYPE) url = Strings.ADMIN;
//     this.navigate(url);
//   }
// }
