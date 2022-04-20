import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  catchError,
  ReplaySubject,
  skipUntil,
  tap,
  BehaviorSubject,
  throwError,
} from 'rxjs';
import { UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUser$ = new BehaviorSubject<UserModel | null>(null);
  private isUserFetched$ = new ReplaySubject<void>();

  constructor(private http: HttpClient) { }

  fetchUser() {
    return this.http.get<UserModel>('/user/me').pipe(
      tap(user => this.setCurrentUser(user)),
      catchError(error => {
        this.isUserFetched$.next();
        this.currentUser$.next(null);

        return throwError(error);
      }),
    );
  }

  getCurrentUser() {
    return this.currentUser$.pipe(
      skipUntil(this.isUserFetched$)
    )
  }

  clearData() {
    localStorage.removeItem('token');
    this.currentUser$.next(null);
  }

  setCurrentUser(user: UserModel) {
    this.isUserFetched$.next();
    this.currentUser$.next(user);
  }
}
