import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthGuardService } from '../services/auth-guard.service';
import { UserTypes } from '../constants/enums/user-types';

@Directive({
  selector: '[appRoleGuard]'
})
export class RoleGuardDirective {
  @Input() set appRoleGuard(role: UserTypes) {
    if (this.authGuard.hasPermission(role)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authGuard: AuthGuardService
  ) {}
}
