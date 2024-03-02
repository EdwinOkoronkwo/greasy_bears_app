import { Injectable } from '@angular/core';
import { CanLoad, Router, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Strings } from 'src/app/enum/strings';
import { AuthService } from 'src/app/services/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AutoLoginGuard implements CanLoad {
  constructor(private router: Router, private authService: AuthService) {}
  async canLoad(): Promise<boolean> {
    try {
      const token = await this.authService.getToken();
      console.log(token);
      if (token) {
        this.router.navigateByUrl(Strings.TABS, { replaceUrl: true });
        return false;
      }
      return true;
    } catch (e) {
      console.log(e);
      return true;
    }
  }
}
