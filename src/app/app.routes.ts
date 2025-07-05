import { Routes } from '@angular/router';
import { OtpComponentComponent } from './page-components/otp-component/otp-component.component';
import { ErrorPageComponent } from './page-components/error-page/error-page.component';
import { UnAuthorizedComponent } from './page-components/un-authorized/un-authorized.component';
import { HomeComponent } from './page-components/home/home.component';
import { DatePickerDemoComponent } from './page-components/date-picker/date-picker-demo.component';
import { SingleSelectDemoComponent } from './page-components/single-select/single-select-demo.component';
import { MultiSelectDemoComponent } from './page-components/multi-select/multi-select-demo.component';

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
    path: 'single-select-demo', 
    component: SingleSelectDemoComponent, 
    title: 'Single Select Demo' 
  },
  { 
    path: 'multi-select-demo', 
    component: MultiSelectDemoComponent, 
    title: 'Multi Select Demo' 
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
