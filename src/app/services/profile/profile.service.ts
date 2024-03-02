import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../../models/user.model';
import {
  catchError,
  concatMap,
  map,
  scan,
  shareReplay,
  tap,
} from 'rxjs/operators';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  merge,
  of,
  throwError,
} from 'rxjs';
import { CRUDAction } from '../../interfaces/crud.interface';
import { NotificationService } from './../notification/notification.service';
import { ApiService } from './../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  profiles$ = this.api.get('users/profile').pipe(shareReplay(1));

  /***
   * Create CRUD Subject for add, delete and update
   */
  private profileCRUDSubject = new Subject<CRUDAction<User>>();
  profileCRUDAction$ = this.profileCRUDSubject.asObservable();

  private profileCRUDCompleteSubject = new Subject<boolean>();
  profileCRUDCompleteAction$ = this.profileCRUDCompleteSubject.asObservable();

  addProfile(user: User) {
    this.profileCRUDSubject.next({ action: 'add', data: user });
  }

  updateProfile(user: User) {
    this.profileCRUDSubject.next({ action: 'update', data: user });
  }

  deleteProfile(user: User) {
    this.profileCRUDSubject.next({ action: 'delete', data: user });
  }

  // Need to merge students with CRUD actions
  profileWithCRUD$ = merge(
    this.profiles$,
    this.profileCRUDAction$.pipe(
      concatMap((profileAction: any) =>
        this.saveProfile(profileAction).pipe(
          map((user: any) => ({ ...profileAction, data: user }))
        )
      )
    )
  ).pipe(
    scan((user: any, value: any) => {
      return this.modifyProfile(user, value);
    }, [] as User[]),
    shareReplay(1),
    catchError(this.handleError)
  );

  // Modify Students
  modifyProfile(users: User[], value: User[] | CRUDAction<User>) {
    if (!(value instanceof Array)) {
      if (value.action === 'add') {
        return [...users, value.data];
      }
      if (value.action === 'update') {
        return users.map((user) =>
          user.id === value.data.id ? value.data : user
        );
      }
      if (value.action === 'delete') {
        return users.filter((user) => user.id !== value.data.id);
      }
    } else {
      return value;
    }
    return users;
  }

  // save the students data to database
  saveProfile(profileAction: CRUDAction<User>) {
    let profileDetails$!: Observable<User>;
    if (profileAction.action === 'add') {
      profileDetails$ = this.addProfileToServer(profileAction.data).pipe(
        tap((user) => {
          this.notificationService.setSuccessMessage(
            'Profile Added Sucessfully!'
          );
          this.profileCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (profileAction.action === 'update') {
      profileDetails$ = this.updateProfileToServer(profileAction.data).pipe(
        tap((user) => {
          this.notificationService.setSuccessMessage(
            'Profile Updated Sucessfully!'
          );
          this.profileCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (profileAction.action === 'delete') {
      return this.deleteProfileToServer(profileAction.data)
        .pipe(
          tap((user) => {
            this.notificationService.setSuccessMessage(
              'Profile Deleted Sucessfully!'
            );
            this.profileCRUDCompleteSubject.next(true);
          }),
          catchError(this.handleError)
        )
        .pipe(map((user) => profileAction.data));
    }
    return profileDetails$.pipe(shareReplay(1), catchError(this.handleError));
  }

  addProfileToServer(user: User) {
    return this.api.post('users/profile', user);
  }

  updateProfileToServer(user: User) {
    return this.api.patch(`users/updateProfile`, user);
  }

  deleteProfileToServer(user: User) {
    return this.api.delete(`users/profile`);
  }

  /**************
   * Selecting a single user
   */
  private selectedProfileSubject = new BehaviorSubject<number>(0);
  selectedProfileAction$ = this.selectedProfileSubject.asObservable();

  selectProfile(userId: number) {
    this.selectedProfileSubject.next(userId);
  }
  // Combine action data (from select) with data stream from user API
  profile$ = combineLatest([
    this.profileWithCRUD$,
    this.selectedProfileAction$,
  ]).pipe(
    map(([users, selectedUserId]) => {
      return users.find((user: any) => user.id === selectedUserId);
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private api: ApiService
  ) {}

  handleError(error: Error) {
    return throwError(() => {
      return 'Unknown error occurred. Please try again.';
    });
  }

  //////////////////////////////////////////////////////////////////////

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
