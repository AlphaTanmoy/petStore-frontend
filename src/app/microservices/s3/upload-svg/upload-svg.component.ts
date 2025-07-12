import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-upload-svg',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-svg.component.html'
})
export class UploadSvgComponent {
  @Output() fileSelected = new EventEmitter<File>();
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<File>();

  previewUrl: string | null = null;
  selectedFile: File | null = null;
  fileName = '';
  isPreviewing = false;
  previewError: string | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  handleFile(file: File): void {
    if (!file) return;

    // Check file size (1MB max)
    if (file.size > 1048576) {
      this.handlePreviewError('File size exceeds 1MB limit');
      return;
    }

    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
      this.selectedFile = file;
      this.fileName = file.name;
      
      // Create object URL for preview
      const previewUrl = URL.createObjectURL(file);
      this.previewUrl = previewUrl;
      this.isPreviewing = true;
      this.previewError = null;
      
      // Emit the file selection and preview URL
      this.fileSelected.emit(file);
      this.save.emit(file);
    } else {
      this.handlePreviewError('Please upload a valid SVG file');
    }
  }

  private handlePreviewError(message: string): void {
    this.previewError = message;
    this.isPreviewing = false;
    this.selectedFile = null;
    this.fileName = '';
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
  }

  onCancel(): void {
    this.resetForm();
    this.cancel.emit();
  }

  onSave(): void {
    if (this.selectedFile) {
      this.save.emit(this.selectedFile);
    }
  }

  resetForm(): void {
    this.handlePreviewError('');
    const fileInput = document.getElementById('svgFileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
}