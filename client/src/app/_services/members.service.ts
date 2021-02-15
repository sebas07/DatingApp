import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';

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

  constructor(
    private _httpClient: HttpClient
  ) { }

  getMembers() {
    return this._httpClient.get<Member[]>(`${this.baseUrl}users`);
  }

  getMember(username: string) {
    return this._httpClient.get<Member>(`${this.baseUrl}users/${username}`);
  }

}
