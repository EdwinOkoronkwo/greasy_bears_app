import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { UserService } from 'src/app/services/user/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class ProfileComponent {
  profile: User = {} as User;
  users!: User[];
  serverUrl = environment.serverUrl;

  constructor(private profileService: ProfileService) {
    this.profileService.getProfile().subscribe((result) => {
      this.profile = result;
    });
  }
}
