import { error } from '@angular/compiler/src/util';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  model: any = {};

  constructor(
    public _accountService: AccountService,
    private _router: Router,
    private _toastrService: ToastrService
  ) { }

  ngOnInit(): void {
  }

  login() {
    this._accountService.login(this.model)
      .subscribe(response => {
        console.log(response);
        this._router.navigateByUrl("/members");
      }, error => {
        console.log(error);
        // this._toastrService.error(error.error);
      });
  }

  logout() {
    this._accountService.logout();
    this._router.navigateByUrl("/");
  }

}
