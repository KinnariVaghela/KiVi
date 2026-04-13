import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { ProfileService }     from '../../core/services/profile.service';
import { AuthService }        from '../../core/services/auth.service';
import { User }               from '../../core/models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  profile: User | null = null;
  profileForm = { name: '', email: '', phone: '', address: '' };
  pwForm      = { current: '', newPw: '', confirm: '' };

  savingProfile = false;
  savingPw      = false;
  profileSuccess = '';
  profileError   = '';
  pwSuccess      = '';
  pwError        = '';

  constructor(
    private profileSvc: ProfileService,
    private auth:       AuthService,
  ) {}

  ngOnInit(): void {
    this.profileSvc.getProfile().subscribe(u => {
      this.profile     = u;
      this.profileForm = {
        name:    u.name,
        email:   u.email,
        phone:   u.phone ?? '',
        address: u.address ?? '',
      };
    });
  }

  get initial(): string { return (this.profile?.name?.[0] ?? '?').toUpperCase(); }

  saveProfile(): void {
    this.profileSuccess = '';
    this.profileError   = '';
    this.savingProfile  = true;

    this.profileSvc.updateProfile(this.profileForm).subscribe({
      next: u => {
        this.profile        = u;
        this.savingProfile  = false;
        this.profileSuccess = 'Profile updated successfully!';
        this.auth.updateLocalUser(u);
        setTimeout(() => { this.profileSuccess = ''; }, 3000);
      },
      error: err => {
        this.savingProfile = false;
        this.profileError  = err.error?.error ?? 'Update failed.';
      },
    });
  }

  changePassword(): void {
    this.pwSuccess = '';
    this.pwError   = '';

    if (this.pwForm.newPw !== this.pwForm.confirm) {
      this.pwError = 'New passwords do not match.';
      return;
    }
    if (this.pwForm.newPw.length < 6) {
      this.pwError = 'Password must be at least 6 characters.';
      return;
    }
    this.savingPw = true;

    this.auth.changePassword(this.pwForm.current, this.pwForm.newPw).subscribe({
      next: () => {
        this.savingPw  = false;
        this.pwSuccess = 'Password changed successfully!';
        this.pwForm    = { current: '', newPw: '', confirm: '' };
        setTimeout(() => { this.pwSuccess = ''; }, 3000);
      },
      error: err => {
        this.savingPw = false;
        this.pwError  = err.error?.error ?? 'Password change failed.';
      },
    });
  }
}
