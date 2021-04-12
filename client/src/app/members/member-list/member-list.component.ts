import { error } from '@angular/compiler/src/util';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { Member } from 'src/app/_models/member';
import { Pagination } from 'src/app/_models/pagination';
import { User } from 'src/app/_models/user';
import { UserParams } from 'src/app/_models/userParams';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {

  membersList: Member[];
  pagination: Pagination;
  user: User;
  userParams: UserParams;
  gendersList = [{ value: 'male', display: 'Males' }, { value: 'female', display: 'Females' }];

  constructor(
    private _membersService: MembersService,
  ) {
    this.userParams = this._membersService.getUserParams();
  }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers() {
    this._membersService.setUserParams(this.userParams);
    this._membersService.getMembers(this.userParams)
      .subscribe(response => {
        this.membersList = response.result;
        this.pagination = response.pagination;
      });
  }

  pageChanged(event: any) {
    this.userParams.pageNumber = event.page;
    this.loadMembers();
  }

  resetFilters() {
    this.userParams = this._membersService.resetUserParams();
    this._membersService.setUserParams(this.userParams);
    this.loadMembers();
  }

}
