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
export class UserService {
  users$ = this.api.get('users').pipe(shareReplay(1));

  /***
   * Create CRUD Subject for add, delete and update
   */
  private usersCRUDSubject = new Subject<CRUDAction<User>>();
  usersCRUDAction$ = this.usersCRUDSubject.asObservable();

  private usersCRUDCompleteSubject = new Subject<boolean>();
  usersCRUDCompleteAction$ = this.usersCRUDCompleteSubject.asObservable();

  addUser(user: User) {
    this.usersCRUDSubject.next({ action: 'add', data: user });
  }

  updateUser(user: User) {
    this.usersCRUDSubject.next({ action: 'update', data: user });
  }

  deleteUser(user: User) {
    this.usersCRUDSubject.next({ action: 'delete', data: user });
  }

  // Need to merge students with CRUD actions
  usersWithCRUD$ = merge(
    this.users$,
    this.usersCRUDAction$.pipe(
      concatMap((userAction: any) =>
        this.saveUsers(userAction).pipe(
          map((user: any) => ({ ...userAction, data: user }))
        )
      )
    )
  ).pipe(
    scan((users: any, value: any) => {
      return this.modifyUsers(users, value);
    }, [] as User[]),
    shareReplay(1),
    catchError(this.handleError)
  );

  // Modify Students
  modifyUsers(users: User[], value: User[] | CRUDAction<User>) {
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
  saveUsers(userAction: CRUDAction<User>) {
    let userDetails$!: Observable<User>;
    if (userAction.action === 'add') {
      userDetails$ = this.addUserToServer(userAction.data).pipe(
        tap((user) => {
          this.notificationService.setSuccessMessage('User Added Sucessfully!');
          this.usersCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (userAction.action === 'update') {
      userDetails$ = this.updateUserToServer(userAction.data).pipe(
        tap((user) => {
          this.notificationService.setSuccessMessage(
            'User Updated Sucessfully!'
          );
          this.usersCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (userAction.action === 'delete') {
      return this.deleteUserToServer(userAction.data)
        .pipe(
          tap((user) => {
            this.notificationService.setSuccessMessage(
              'User Deleted Sucessfully!'
            );
            this.usersCRUDCompleteSubject.next(true);
          }),
          catchError(this.handleError)
        )
        .pipe(map((user) => userAction.data));
    }
    return userDetails$.pipe(shareReplay(1), catchError(this.handleError));
  }

  addUserToServer(user: User) {
    return this.api.post('users', user);
  }

  updateUserToServer(user: User) {
    return this.api.patch(`users/${user.id}`, user);
  }

  deleteUserToServer(user: User) {
    return this.api.delete(`users/${user.id}`);
  }

  /**************
   * Selecting a single user
   */
  private selectedUserSubject = new BehaviorSubject<number>(0);
  selectedUserAction$ = this.selectedUserSubject.asObservable();

  selectUser(userId: number) {
    this.selectedUserSubject.next(userId);
  }
  // Combine action data (from select) with data stream from user API
  user$ = combineLatest([this.usersWithCRUD$, this.selectedUserAction$]).pipe(
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

  //////////////////////////////////////////////////////////////////////////////////

  /// Review if this code is needed
  // Could be replaced by the RxJS codes
  getUsers() {
    return this.api.get<User>('users');
  }

  getUser(userId: number) {
    return this.api.get<User>(`users/${userId}`);
  }
}
