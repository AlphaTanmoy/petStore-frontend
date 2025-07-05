import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGuardService } from '../services/auth-guard.service';
import { RoleGuardDirective } from '../directives/role-guard.directive';

@NgModule({
  declarations: [RoleGuardDirective],
  imports: [CommonModule],
  providers: [AuthGuardService],
  exports: [RoleGuardDirective]
})
export class AuthModule {}
