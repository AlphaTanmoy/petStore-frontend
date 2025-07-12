import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarControlService } from '../../../../services/navbar/navbar.control.service';
import { S3SvgService } from '../../../../services/s3/s3.svg.service';
import { PopupService } from '../../../../services/popup.service';
import { PopupType } from '../../../../constants/enums/popup-types';
import { ActivatedRoute, Router } from '@angular/router';
import { EditNavbarRequest, NavbarItemResponse } from '../../../../interfaces/navbar.interface';
import { UploadSvgComponent } from '../../../s3/upload-svg/upload-svg.component';

@Component({
  selector: 'app-edit-navbar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UploadSvgComponent],
  templateUrl: './edit-navbar.component.html',
  styleUrls: ['./edit-navbar.component.css']
})
export class EditNavbarComponent implements OnInit {
  navbarForm: FormGroup;
  isSubmitting = false;
  svgFileUrl: string | null = null;
  isSvgUploading = false;
  selectedSvgFile: File | null = null;
  resetUploader = false;
  parentMenus: { firstParameter: string; secondParameter: string }[] = [];
  navbarItemId: string | null = null;
  originalSvgUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private navbarService: NavbarControlService,
    private s3SvgService: S3SvgService,
    private popupService: PopupService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loadParentMenus();
    this.navbarForm = this.fb.group({
      menuName: ['', [Validators.required, Validators.maxLength(100)]],
      doHaveRedirectionLink: [false],
      menuLink: [''],
      isASubMenu: [false],
      parentId: [null],
      canMasterAccess: [false],
      canAdminAccess: [false],
      canUserAccess: [false],
      canDoctorAccess: [false],
      canSellerAccess: [false],
      canRiderAccess: [false],
      canCustomerCareAccess: [false],
      isVisibleToGuest: [false],
      isAvailableWhileLoggedOut: [false],
      svgFileDataLink: ['']
    });
  }

  ngOnInit(): void {
    // Get the ID from the route
    this.route.paramMap.subscribe(params => {
      this.navbarItemId = params.get('id');
      if (this.navbarItemId) {
        this.loadNavbarItem(this.navbarItemId);
      }
    });

    // Toggle menuLink validation based on doHaveRedirectionLink
    this.navbarForm.get('doHaveRedirectionLink')?.valueChanges.subscribe(hasLink => {
      const menuLinkControl = this.navbarForm.get('menuLink');
      if (hasLink) {
        menuLinkControl?.setValidators([Validators.required, Validators.maxLength(255)]);
      } else {
        menuLinkControl?.clearValidators();
        menuLinkControl?.setValue('');
      }
      menuLinkControl?.updateValueAndValidity();
    });

    // Toggle parentId validation based on isASubMenu
    this.navbarForm.get('isASubMenu')?.valueChanges.subscribe(isSubMenu => {
      const parentIdControl = this.navbarForm.get('parentId');
      if (isSubMenu) {
        parentIdControl?.setValidators([Validators.required]);
      } else {
        parentIdControl?.clearValidators();
        parentIdControl?.setValue(null);
      }
      parentIdControl?.updateValueAndValidity();
    });
  }

  private loadNavbarItem(id: string): void {
    this.isSubmitting = true;

    this.navbarService.getNavbarItemById(id).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        if (response.status && response.data) {
          const item = response.data;
          this.originalSvgUrl = item.svgFileDataLink || null;
          this.svgFileUrl = this.originalSvgUrl;

          this.navbarForm.patchValue({
            menuName: item.menuName,
            doHaveRedirectionLink: item.doHaveRedirectionLink,
            menuLink: item.menuLink || '',
            isASubMenu: item.isASubMenu,
            parentId: item.isAssignedToParentMenu ? item.id : null,
            canMasterAccess: item.canMasterAccess,
            canAdminAccess: item.canAdminAccess,
            canUserAccess: item.canUserAccess,
            canDoctorAccess: item.canDoctorAccess,
            canSellerAccess: item.canSellerAccess,
            canRiderAccess: item.canRiderAccess,
            canCustomerCareAccess: item.customerCareAccess,
            isVisibleToGuest: item.isVisibleToGuest,
            isAvailableWhileLoggedOut: false, // Default to false as it's not in the response
            svgFileDataLink: item.svgFileDataLink || ''
          });
        }
      },
      error: (error) => {
        console.error('Error loading navbar item:', error);
        this.popupService.showPopup(
          PopupType.ERROR,
          'Error',
          'Failed to load navbar item'
        );
      }
    });
  }

  private loadParentMenus(): void {
    this.navbarService.getParentMenu().subscribe({
      next: (response) => {
        if (response.status && response.data) {
          this.parentMenus = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading parent menus:', error);
        this.popupService.showPopup(
          PopupType.ERROR,
          'Error',
          'Failed to load parent menus'
        );
      }
    });
  }

  handleSvgFile(file: File): void {
    this.selectedSvgFile = file;
    this.svgFileUrl = URL.createObjectURL(file);
    this.isSvgUploading = true;

    this.s3SvgService.uploadSvg(file).subscribe({
      next: (response) => {
        if (response.status && response.data) {
          this.navbarForm.patchValue({
            svgFileDataLink: response.data
          });
        }
        this.isSvgUploading = false;
      },
      error: (error) => {
        console.error('Error uploading SVG:', error);
        this.popupService.showPopup(
          PopupType.ERROR,
          'Error',
          'Failed to upload SVG file'
        );
        this.isSvgUploading = false;
        this.resetSvgUploader();
      }
    });
  }

  resetSvgUploader(): void {
    this.resetUploader = true;
    this.selectedSvgFile = null;
    this.svgFileUrl = this.originalSvgUrl;

    // Reset the form control if we had a new file
    if (this.navbarForm.get('svgFileDataLink')?.value !== this.originalSvgUrl) {
      this.navbarForm.patchValue({
        svgFileDataLink: this.originalSvgUrl || ''
      });
    }

    // Small timeout to allow the reset to take effect before setting it back to false
    setTimeout(() => {
      this.resetUploader = false;
    }, 100);
  }

  onSubmit(): void {
    if (this.navbarForm.invalid || !this.navbarItemId) {
      this.markFormGroupTouched(this.navbarForm);
      return;
    }

    this.isSubmitting = true;

    const formValue = this.navbarForm.value;
    const updateData: EditNavbarRequest = {
      id: this.navbarItemId,
      menuName: formValue.menuName,
      doHaveRedirectionLink: formValue.doHaveRedirectionLink,
      menuLink: formValue.doHaveRedirectionLink ? formValue.menuLink : null,
      canAdminAccess: formValue.canAdminAccess,
      canUserAccess: formValue.canUserAccess,
      canDoctorAccess: formValue.canDoctorAccess,
      canSellerAccess: formValue.canSellerAccess,
      canRiderAccess: formValue.canRiderAccess,
      canCustomerCareAccess: formValue.canCustomerCareAccess,
      isVisibleToGuest: formValue.isVisibleToGuest,
      isAvailableWhileLoggedOut: formValue.isAvailableWhileLoggedOut,
      svgFileDataLink: formValue.svgFileDataLink || null
    };

    this.navbarService.editNavbarItem(updateData).subscribe({
      next: (response) => {
        if (response.status) {
          this.popupService.showPopup(
            PopupType.SUCCESS,
            'Success',
            'Navbar item updated successfully'
          );
          this.router.navigate(['/navbar/list']);
        } else {
          this.popupService.showPopup(
            PopupType.ERROR,
            'Error',
            response.message || 'Failed to update navbar item'
          );
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating navbar item:', error);
        this.popupService.showPopup(
          PopupType.ERROR,
          'Error',
          'An error occurred while updating the navbar item'
        );
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/navbar/list']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
