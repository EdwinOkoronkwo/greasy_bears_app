import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, switchMap, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const isApiUrl = req.url.startsWith(environment.serverBaseUrl);
  const auth = inject(AuthService);
  return auth.token$.pipe(
    take(1),
    switchMap((token) => {
      console.log('token from authInterceptor: ', token);
      if (token && isApiUrl) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      return next(req);
    })
  );
};

///////////////////////////////////////////////////////////////////////////////////////////
/////////////////////  OLD CODE //////////////////////////////////////////////////////////////

// const userService = inject(UserService);
// const token = userService.getToken();
// if (token) {
//   const cloned = req.clone({
//     setHeaders: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   return next(cloned);
// } else {
//   return next(req);
// }

// import {
//   HttpEvent,
//   HttpHandler,
//   HttpInterceptor,
//   HttpRequest,
// } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable, map, switchMap, take } from 'rxjs';
// import { AuthService } from '../auth/auth.service';

// import { UserService } from '../user/user.service';
// import { environment } from 'src/environments/environment';

// @Injectable({
//   providedIn: 'root',
// })
// export class TokenInterceptorService implements HttpInterceptor {
//   constructor(private auth: AuthService) {}

//   intercept(
//     req: HttpRequest<any>,
//     next: HttpHandler
//   ): Observable<HttpEvent<any>> {
//     // throw new Error('Method not implemented.');
//     const isApiUrl = req.url.startsWith(environment.serverBaseUrl);
//     return this.auth.token$.pipe(
//       take(1),
//       switchMap((token) => {
//         console.log('token: ', token);
//         if (token && isApiUrl) {
//           req = req.clone({
//             setHeaders: {
//               Authorization: `Bearer ${token}`,
//             },
//           });
//         }
//         return next.handle(req);
//       })
//     );
//   }
// }
