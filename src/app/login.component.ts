import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { UserRole } from './models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public loginForm: FormGroup;
  public showRepeatPopup = false;
  public recentUsers: any[] = [];

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {
    this.loginForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required]
    });
    this.loadRecentUsers();
  }

  loadRecentUsers() {
    const usersStr = localStorage.getItem('recentUsers');
    this.recentUsers = usersStr ? JSON.parse(usersStr) : [];
  }

  saveRecentUser(user: any) {
    let users = this.recentUsers.filter((u: any) => u.email !== user.email);
    users.unshift(user);
    if (users.length > 5) users = users.slice(0, 5);
    this.recentUsers = users;
    localStorage.setItem('recentUsers', JSON.stringify(users));
  }

  public selectRecentUser(user: any) {
    this.loginForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role
    });
  }

  onLogin() {
    const { name, email, role } = this.loginForm.value;
    const result = this.userService.addUser(name, email, role as UserRole);
    if (result.isRepeated) {
      this.showRepeatPopup = true;
    } else {
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      this.saveRecentUser(result.user);
      this.router.navigate(['/dashboard']);
    }
  }

  closePopup() {
    this.showRepeatPopup = false;
    this.userService.users$.subscribe(users => {
      const user = users.find((u: any) => u.email === this.loginForm.value.email);
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.saveRecentUser(user);
        this.router.navigate(['/dashboard']);
      }
    }).unsubscribe();
  }
}
