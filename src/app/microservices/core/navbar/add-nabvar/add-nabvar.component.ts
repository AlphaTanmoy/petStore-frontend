import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarControlService } from '../../../../services/navbar/navbar.control.service';
import { S3SvgService } from '../../../../services/s3/s3.svg.service';
import { PopupService } from '../../../../services/popup.service';
import { PopupType } from '../../../../constants/enums/popup-types';
import { Router } from '@angular/router';
import { AddNavbarRequest } from '../../../../interfaces/navbar.interface';
import { UploadSvgComponent } from '../../../s3/upload-svg/upload-svg.component';

@Component({
  selector: 'app-add-nabvar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UploadSvgComponent],
  templateUrl: './add-nabvar.component.html'
})
export class AddNabvarComponent implements OnInit {
  navbarForm: FormGroup;
  isSubmitting = false;
  svgFileUrl: string | null = null;
  isSvgUploading = false;
  selectedSvgFile: File | null = null;
  resetUploader = false;
  parentMenus: { firstParameter: string; secondParameter: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private navbarService: NavbarControlService,
    private s3SvgService: S3SvgService,
    private popupService: PopupService,
    private router: Router
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
      svgFileDataLink: ['']
    });
  }

  ngOnInit(): void {
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
  }

  private uploadSvg(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.selectedSvgFile) {
        reject(new Error('No file selected'));
        return;
      }

      this.isSvgUploading = true;
      this.s3SvgService.uploadSvg(this.selectedSvgFile).subscribe({
        next: (response: { status: boolean; data: string }) => {
          if (response.status && response.data) {
            this.svgFileUrl = response.data;
            this.isSvgUploading = false;
            resolve();
          } else {
            reject(new Error('Failed to upload SVG'));
          }
        },
        error: (error: any) => {
          console.error('Error uploading SVG:', error);
          this.popupService.showPopup(
            PopupType.ERROR,
            'Error',
            'Failed to upload SVG. Please try again.'
          );
          this.isSvgUploading = false;
          reject(error);
        }
      });
    });
  }

  onSvgUploaded(url: string): void {
    this.svgFileUrl = url;
    this.isSvgUploading = false;
  }

  onSvgUploadStart(): void {
    this.isSvgUploading = true;
    this.svgFileUrl = null;
  }

  onSubmit(): void {
    if (this.navbarForm.invalid) {
      this.popupService.showPopup(
        PopupType.ERROR,
        'Validation Error',
        'Please fill all required fields.'
      );
      return;
    }

    if (!this.selectedSvgFile) {
      this.popupService.showPopup(
        PopupType.ERROR,
        'Validation Error',
        'Please select an SVG file.'
      );
      return;
    }

    this.isSubmitting = true;
    
    // Upload SVG first
    this.uploadSvg().then(() => {
      if (this.svgFileUrl) {
        this.submitForm();
      } else {
        this.popupService.showPopup(
          PopupType.ERROR,
          'Error',
          'Failed to upload SVG file. Please try again.'
        );
        this.isSubmitting = false;
      }
    }).catch((error: any) => {
      console.error('SVG upload failed:', error);
      this.popupService.showPopup(
        PopupType.ERROR,
        'Error',
        'Failed to upload SVG file. Please try again.'
      );
      this.isSubmitting = false;
    });
  }

  private submitForm(): void {
    const isVisibleToGuest = this.navbarForm.get('isVisibleToGuest')?.value || false;
    
    const formData: AddNavbarRequest = {
      ...this.navbarForm.value,
      svgFileDataLink: this.svgFileUrl,
      canMasterAccess: this.navbarForm.get('canMasterAccess')?.value || false,
      canCustomerCareAccess: this.navbarForm.get('canCustomerCareAccess')?.value || false,
      menuLink: this.navbarForm.get('doHaveRedirectionLink')?.value 
        ? this.navbarForm.get('menuLink')?.value 
        : null,
      parentId: this.navbarForm.get('isASubMenu')?.value 
        ? this.navbarForm.get('parentId')?.value 
        : null,
      isVisibleToGuest: isVisibleToGuest,
      isAvailableWhileLoggedOut: isVisibleToGuest // Set same as isVisibleToGuest
    };

    this.navbarService.addNavbarItem(formData).subscribe({
      next: (response) => {
        if (response.status) {
          this.popupService.showPopup(
            PopupType.SUCCESS,
            'Success',
            'Navbar item added successfully!',
            undefined,
            () => this.router.navigate(['/view-navbar'])
          );
        } else {
          throw new Error(response.message || 'Failed to add navbar item');
        }
      },
      error: (error) => {
        console.error('Error adding navbar item:', error);
        const errorMessage = error.error?.errorMessage || error.error?.message || 'Failed to add navbar item';
        this.popupService.showPopup(
          PopupType.ERROR,
          'Error',
          errorMessage
        );
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.resetForm();
    this.router.navigate(['/navbar/list']);
  }

  private resetForm(): void {
    this.navbarForm.reset({
      menuName: '',
      doHaveRedirectionLink: false,
      menuLink: '',
      isASubMenu: false,
      parentId: null,
      canMasterAccess: false,
      canAdminAccess: true,
      canUserAccess: true,
      canDoctorAccess: false,
      canSellerAccess: false,
      canRiderAccess: false,
      canCustomerCareAccess: false,
      isVisibleToGuest: false
    });
    
    this.svgFileUrl = null;
    this.isSvgUploading = false;
    this.resetUploader = !this.resetUploader; // Toggle to trigger change detection
  }
}
