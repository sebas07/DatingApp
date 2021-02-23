import { error } from '@angular/compiler/src/util';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Member } from 'src/app/_models/member';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {

  membersList$: Observable<Member[]>;

  constructor(
    private _membersService: MembersService
  ) { }

  ngOnInit(): void {
    // this.loadMembers();
    this.membersList$ = this._membersService.getMembers();
  }

  // loadMembers() {
  //   this._membersService.getMembers().subscribe(
  //     members => {
  //       this.membersList = members;
  //     }
  //   );
  // }

}
