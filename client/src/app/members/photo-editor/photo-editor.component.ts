import { Component, Input, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { take } from 'rxjs/operators';
import { Member } from 'src/app/_models/member';
import { Photo } from 'src/app/_models/photo';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {

  @Input() _member: Member;
  uploader: FileUploader;
  hasBaseDropzoneOver = false;
  baseUrl = environment.apiUrl;
  user: User;

  constructor(
    private _accountService: AccountService,
    private _membersService: MembersService
  ) {
    this._accountService.currentUser$.pipe(take(1))
      .subscribe(tmpUser => this.user = tmpUser);
  }

  ngOnInit(): void {
    this.initializeUploader();
  }

  fileOverBase(e: any) {
    this.hasBaseDropzoneOver = e;
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: this.baseUrl + 'users/add-photo',
      authToken: 'Bearer ' + this.user.token,
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024
    });

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        const photo = JSON.parse(response);
        this._member.photos.push(photo);
      }
    };
  }

  setMainPhoto(photo: Photo) {
    this._membersService.setMainPhoto(photo.id)
      .subscribe(() => {
        this.user.photoUrl = photo.url;
        this._accountService.setCurrentUser(this.user);
        this._member.photoUrl = photo.url;
        this._member.photos.forEach(tmpPhoto => {
          if (tmpPhoto.isMain)
            tmpPhoto.isMain = false;
          if (tmpPhoto.id == photo.id)
            tmpPhoto.isMain = true;
        });
      });
  }

  deletePhoto(photoId: number) {
    this._membersService.deletePhoto(photoId)
      .subscribe(() => {
        this._member.photos = this._member.photos.filter(x => x.id !== photoId)
      });
  }

}
