import { HttpClient } from '@angular/common/http';
import { error } from '@angular/compiler/src/util';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test-erros',
  templateUrl: './test-erros.component.html',
  styleUrls: ['./test-erros.component.css']
})
export class TestErrosComponent implements OnInit {

  baseUrl: string = "https://localhost:5001/api/";
  validationErrors: string[] = [];

  constructor(
    private _httpClient: HttpClient
  ) { }

  ngOnInit(): void {
  }

  get404Error() {
    this._httpClient.get(`${this.baseUrl}buggy/not-found`)
      .subscribe(response => {
        console.log(response);
      }, error => {
        console.log(error);
      });
  }

  get400Error() {
    this._httpClient.get(`${this.baseUrl}buggy/bad-request`)
      .subscribe(response => {
        console.log(response);
      }, error => {
        console.log(error);
      });
  }

  get500Error() {
    this._httpClient.get(`${this.baseUrl}buggy/server-error`)
      .subscribe(response => {
        console.log(response);
      }, error => {
        console.log(error);
      });
  }

  get401Error() {
    this._httpClient.get(`${this.baseUrl}buggy/auth`)
      .subscribe(response => {
        console.log(response);
      }, error => {
        console.log(error);
      });
  }

  get400ValidationError() {
    this._httpClient.post(`${this.baseUrl}account/register`, {})
      .subscribe(response => {
        console.log(response);
      }, error => {
        console.log(error);
        this.validationErrors = error;
      });
  }

}
