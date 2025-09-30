
import type { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { LoginComponent } from './login.component';

export const routes: Routes = [
	{ path: '', component: LoginComponent },
	{ path: 'dashboard', component: DashboardComponent },
];
