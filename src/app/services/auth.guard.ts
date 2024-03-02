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
