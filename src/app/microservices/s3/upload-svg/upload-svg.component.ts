import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { S3SvgService, SvgUploadResponse } from '../../../services/s3/s3.svg.service';
import { PopupService } from '../../../services/popup.service';

@Component({
  selector: 'app-upload-svg',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-svg.component.html',
  styleUrls: ['./upload-svg.component.css']
})
export class UploadSvgComponent {
  @Output() uploadComplete = new EventEmitter<string>();
  
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  isUploading = false;
  
  constructor(
    private s3SvgService: S3SvgService,
    private popupService: PopupService
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Check if file is SVG
      if (file.type !== 'image/svg+xml' && !file.name.endsWith('.svg')) {
        this.popupService.showError('Please select a valid SVG file', 'Invalid File Type');
        this.resetFileInput(input);
        return;
      }
      
      this.selectedFile = file;
      this.previewFile(file);
    }
  }
  
  private previewFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
    reader.readAsDataURL(file);
  }
  
  onUpload(): void {
    if (!this.selectedFile) {
      this.popupService.showError('Please select an SVG file to upload', 'No File Selected');
      return;
    }
    
    this.isUploading = true;
    
    this.s3SvgService.uploadSvg(this.selectedFile, 'ROLE_MASTER').subscribe({
      next: (response: SvgUploadResponse) => {
        if (response.status && response.data) {
          this.uploadComplete.emit(response.data);
          this.popupService.showSuccess('SVG uploaded successfully!', 'Success');
        } else {
          throw new Error(response.message || 'Failed to upload SVG');
        }
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.popupService.showError(
          error.error?.message || 'An error occurred while uploading the SVG',
          'Upload Failed'
        );
      },
      complete: () => {
        this.isUploading = false;
        this.resetForm();
      }
    });
  }
  
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }
  
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      const input = document.createElement('input');
      input.type = 'file';
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      this.onFileSelected({ target: input } as unknown as Event);
    }
  }
  
  private resetFileInput(input: HTMLInputElement): void {
    input.value = '';
    this.selectedFile = null;
    this.previewUrl = null;
  }
  
  private resetForm(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    const fileInput = document.getElementById('svgFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
