import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { S3SvgService, SvgUploadResponse } from '../../../services/s3/s3.svg.service';
import { PopupService } from '../../../services/popup.service';
import { PopupType } from '../../../constants/enums/popup-types';

@Component({
  selector: 'app-upload-svg',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-svg.component.html'
})
export class UploadSvgComponent implements OnChanges {
  @Output() uploadStart = new EventEmitter<void>();
  @Output() uploadComplete = new EventEmitter<string>();
  @Input() resetSignal: boolean = false;
  
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  isUploading = false;
  
  constructor(
    private s3SvgService: S3SvgService,
    private popupService: PopupService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['resetSignal'] && changes['resetSignal'].currentValue) {
      this.resetForm();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.processFile(input.files);
  }
  
  private processFile(fileList: FileList | null): void {
    if (!fileList || fileList.length === 0) return;
    
    const file = fileList[0];
    
    // Check if file is SVG
    if (file.type !== 'image/svg+xml' && !file.name.toLowerCase().endsWith('.svg')) {
      this.popupService.showPopup(PopupType.ERROR, 'Invalid File Type', 'Please select a valid SVG file');
      this.resetFileInput();
      return;
    }
    
    // Check file size (limit to 1MB)
    if (file.size > 1024 * 1024) {
      this.popupService.showPopup(PopupType.ERROR, 'File Too Large', 'SVG file must be less than 1MB');
      this.resetFileInput();
      return;
    }
    
    this.selectedFile = file;
    this.previewFile(file);
    this.uploadFile();
  }
  
  private previewFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
    reader.onerror = () => {
      console.error('Error reading file');
      this.popupService.showPopup(PopupType.ERROR, 'Error', 'Could not read the SVG file');
    };
    reader.readAsDataURL(file);
  }
  
  private uploadFile(): void {
    if (!this.selectedFile) return;
    
    this.isUploading = true;
    this.uploadStart.emit();
    
    this.s3SvgService.uploadSvg(this.selectedFile, 'ROLE_MASTER').subscribe({
      next: (response: SvgUploadResponse) => {
        if (response.status && response.data) {
          this.uploadComplete.emit(response.data);
        } else {
          throw new Error(response.message || 'Failed to upload SVG');
        }
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.popupService.showPopup(
          PopupType.ERROR,
          'Upload Failed',
          error.error?.message || 'An error occurred while uploading the SVG'
        );
        this.isUploading = false;
      },
      complete: () => {
        this.isUploading = false;
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
    this.processFile(files || null);
  }
  
  private resetFileInput(): void {
    const fileInput = document.getElementById('svgFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
  
  public resetForm(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.resetFileInput();
    this.uploadComplete.emit('');
  }
}
