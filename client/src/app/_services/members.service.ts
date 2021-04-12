import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { PaginatedResults } from '../_models/pagination';
import { User } from '../_models/user';
import { UserParams } from '../_models/userParams';
import { AccountService } from './account.service';

// const httpOptions = {
//   headers: new HttpHeaders({
//     Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user'))?.token
//   })
// }

@Injectable({
  providedIn: 'root'
})
export class MembersService {

  baseUrl: string = environment.apiUrl;
  members: Member[] = [];
  membersCache = new Map();
  user: User;
  userParams: UserParams;

  constructor(
    private _httpClient: HttpClient,
    private _accountService: AccountService
  ) {
    this._accountService.currentUser$.pipe(take(1)).subscribe(user => {
      this.user = user;
      this.userParams = new UserParams(this.user);
    });
  }

  getMembers(userparams: UserParams) {
    var response = this.membersCache.get(Object.values(userparams).join('-'));
    if (response) {
      return of(response);
    }

    let params = this.getPaginationHeaders(userparams.pageNumber, userparams.pageSize);

    params = params.append('minAge', userparams.minAge.toString());
    params = params.append('maxAge', userparams.maxAge.toString());
    params = params.append('gender', userparams.gender);
    params = params.append('orderBy', userparams.orderBy);

    return this.getPaginatedResults<Member[]>(`${this.baseUrl}users`, params)
      .pipe(map(response => {
        this.membersCache.set(Object.values(userparams).join('-'), response);
        return response;
      }));
  }

  private getPaginatedResults<T>(url: string, params: HttpParams) {
    const paginatedResult: PaginatedResults<T> = new PaginatedResults<T>();

    return this._httpClient.get<T>(url, { observe: 'response', params })
      .pipe(
        map(response => {
          paginatedResult.result = response.body;
          if (response.headers.get('Pagination') !== null) {
            paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
          }
          return paginatedResult;
        })
      );
  }

  private getPaginationHeaders(pageNumber: number, pageSize: number) {
    let params = new HttpParams();

    params = params.append('pageNumber', pageNumber.toString());
    params = params.append('pageSize', pageSize.toString());

    return params;
  }

  getMember(username: string) {
    const member = [...this.membersCache.values()]
      .reduce((arr, elem) => {
        return arr.concat(elem.result);
      }, [])
      .find((memb: Member) => {
        return memb.username === username;
      });

    if (member)
      return of(member);

    return this._httpClient.get<Member>(`${this.baseUrl}users/${username}`);
  }

  updateMember(member: Member) {
    return this._httpClient.put(`${this.baseUrl}users`, member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    );
  }

  setMainPhoto(photoId: number) {
    return this._httpClient.put(`${this.baseUrl}users/set-main-photo/${photoId}`, {});
  }

  deletePhoto(photoId: number) {
    return this._httpClient.delete(`${this.baseUrl}users/delete-photo/${photoId}`);
  }

  getUserParams() {
    return this.userParams;
  }

  resetUserParams() {
    this.userParams = new UserParams(this.user);
    return this.userParams;
  }

  setUserParams(params: UserParams) {
    this.userParams = params;
  }

}
