import { Routes } from '@angular/router';
import { OtpComponentComponent } from './page-components/otp-component/otp-component.component';
import { ErrorPageComponent } from './page-components/error-page/error-page.component';
import { UnAuthorizedComponent } from './page-components/un-authorized/un-authorized.component';
import { HomeComponent } from './page-components/home/home.component';
import { DatePickerDemoComponent } from './page-components/date-picker/date-picker-demo.component';

import { AdminLoginComponent } from './users/admins/admin-login/admin-login.component';
import { MasterLoginComponent } from './users/master/master-login/master-login.component';
import { AdminDashboardComponent } from './users/admins/admin-dashboard/admin-dashboard.component';
import { AuthGuardService } from './services/auth-guard.service';
import { UserTypes } from './constants/enums/user-types';
import { ViewCustomersComponent } from './users/customers/view-customers/view-customers.component';
import { ViewNavbarComponent } from './microservices/core/navbar/view-navbar/view-navbar.component';
import { AddNabvarComponent } from './microservices/core/navbar/add-nabvar/add-nabvar.component';
import { EditNavbarComponent } from './microservices/core/navbar/edit-navbar/edit-navbar.component';
import { NavbarComponent } from './microservices/core/navbar/navbar/navbar.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'otp',
    component: OtpComponentComponent,
    title: 'OTP Verification'
  },
  {
    path: 'verify-otp',
    component: OtpComponentComponent,
    title: 'Verify OTP'
  },
  {
    path: 'verify-otp/:type',
    component: OtpComponentComponent,
    title: 'Verify OTP'
  },
  {
    path: 'unauthorized',
    component: UnAuthorizedComponent,
    title: 'Unauthorized'
  },
  {
    path: 'home',
    component: HomeComponent,
    title: 'Home'
  },
  {
    path: 'date-picker-demo',
    component: DatePickerDemoComponent,
    title: 'Date Picker Demo'
  },


  {
    path: 'admin-login',
    component: AdminLoginComponent,
    title: 'Admin Login'
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    title: 'Admin Dashboard',
    canActivate: [AuthGuardService],
    data: { allowedRoles: [UserTypes.ROLE_ADMIN] }
  },



  {
    path: 'master-login',
    component: MasterLoginComponent,
    title: 'Master Login'
  },
  {
    path: 'error',
    component: ErrorPageComponent,
    title: 'Page Not Found'
  },
  
  {
    path: 'view-customers',
    component: ViewCustomersComponent,
    title: 'View Customers',
    canActivate: [AuthGuardService],
    data: { allowedRoles: ['ROLE_ADMIN', 'ROLE_MASTER'] }
  },
  
  {
    path: 'view-navbar',
    component: ViewNavbarComponent,
    title: 'View Navbar',
    canActivate: [AuthGuardService],
    data: { allowedRoles: ['ROLE_MASTER'] }
  },

  {
    path: 'add-navbar',
    component: AddNabvarComponent,
    title: 'Add Navbar',
    canActivate: [AuthGuardService],
    data: { allowedRoles: ['ROLE_MASTER'] }
  },

  {
    path: 'edit-navbar/:id',
    component: EditNavbarComponent,
    title: 'Edit Navbar',
    canActivate: [AuthGuardService],
    data: { allowedRoles: ['ROLE_MASTER'] }
  },

  {
    path: 'navbar/edit/:id',
    component: EditNavbarComponent,
    canActivate: [AuthGuardService],
    data: { allowedRoles: ['ROLE_ADMIN', 'ROLE_MASTER'] },
    title: 'Edit Navbar Item'
  },
  {
    path: 'navbar/:id',
    component: NavbarComponent,
    title: 'Navbar Details'
  },

  {
    path: '**',
    component: ErrorPageComponent,
    title: 'Page Not Found'
  }
];

/**
{ 
    path: 'otp', 
    component: OtpComponentComponent, 
    title: 'OTP Verification',
    canActivate: [AuthGuardService],
    data: { allowedRoles: ['USER'] }  // Example role protection
  }, 
**/
