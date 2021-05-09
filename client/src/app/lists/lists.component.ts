import { Component, OnInit } from '@angular/core';
import { Member } from '../_models/member';
import { Pagination } from '../_models/pagination';
import { MembersService } from '../_services/members.service';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit {

  members: Partial<Member[]>;
  pagination: Pagination;
  predicate: string = 'liked';
  pageNumber: number = 1;
  pageSize: number = 5;

  constructor(
    private _membersService: MembersService
  ) { }

  ngOnInit(): void {
    this.loadLikes();
  }

  loadLikes() {
    this._membersService.getLikes(this.predicate, this.pageNumber, this.pageSize)
      .subscribe(resp => {
        this.members = resp.result;
        this.pagination = resp.pagination;
      });
  }

  pageChanged(event: any) {
    this.pageNumber = event.page;
    this.loadLikes();
  }

}
