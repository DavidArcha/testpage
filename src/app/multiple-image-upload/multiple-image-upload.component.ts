import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ImageUploadService } from '../image-upload.service';

@Component({
  selector: 'app-multiple-image-upload',
  templateUrl: './multiple-image-upload.component.html',
  styleUrl: './multiple-image-upload.component.scss',
})
export class MultipleImageUploadComponent {
  selectedImages: any[] = [];
  totalSize: number = 0;
  maxTotalSize: number = 50 * 1024 * 1024; // 50MB
  isUploading: boolean = false; // Track if uploading is in progress
  uploadProgress: string = '';
  uploadedCount = 0; // Store the count of successfully uploaded images
  subscriptions: Subscription[] = []; // Store subscriptions for cancellation
  uploadCanceled: boolean = false; // Track if upload was canceled
  uploadProgressArray: number[] = []; // Holds upload progress for each image
  uploadStatus: string[] = []; // Holds 'success' or 'error' for each image
  failedImages: any[] = []; // List of failed/infected images
  uploadSummaryVisible: boolean = false; // Flag to display the upload summary

  @ViewChild('fileInput') fileInput!: ElementRef; // Reference to file input element

  showCapWebComponent: boolean = false; // Determines if CapWebComponent should be displayed
  public storedImages: any[] = []; // Array to store images from CapWebComponent

  constructor(private imageUploadService: ImageUploadService) {}

  // Existing functionality for selecting images
  onSelectImage(event: any) {
    const files = event.target.files;
    this.handleFiles(files);
  }

  // Enhancement: Handle files for drag-and-drop and file input selection
  handleFiles(files: FileList): void {
    const duplicateFiles: string[] = [];

    // Convert FileList to an array and iterate over each file
    Array.from(files).forEach((file) => {
      if (this.isDuplicateFile(file)) {
        // Collect duplicate file names to notify the user
        duplicateFiles.push(file.name);
      } else {
        const fileSize = file.size;

        if (fileSize + this.totalSize > this.maxTotalSize) {
          alert('Cannot add more images. Total size exceeds 50MB.');
          return;
        }

        this.selectedImages.push({
          name: file.name,
          size: file.size,
          file: file,
          id: this.generateUniqueId(), // Add unique ID for each file
          oversized: fileSize > 5 * 1024 * 1024, // Mark images > 5MB
        });
        this.uploadStatus.push(''); // Initialize upload status
        this.uploadProgressArray.push(0); // Initialize upload progress
        this.totalSize += file.size;
      }
    });

    // Notify user if there are duplicate files
    if (duplicateFiles.length > 0) {
      alert(
        `The following files are duplicates and were not added: ${duplicateFiles.join(
          ', '
        )}`
      );
    }
  }

  // Method to check for duplicate files based on name and size
  isDuplicateFile(newFile: File): boolean {
    return this.selectedImages.some(
      (existingFile) =>
        existingFile.name === newFile.name && existingFile.size === newFile.size
    );
  }

  // Remove selected image
  removeImage(index: number) {
    if (!this.isUploading) {
      this.totalSize -= this.selectedImages[index].size;
      this.selectedImages.splice(index, 1);
      this.uploadProgressArray.splice(index, 1);
      this.uploadStatus.splice(index, 1);
    }
  }

  // Trigger file input for adding more images
  onAddMoreImages() {
    this.fileInput.nativeElement.click();
  }

  // Upload images one by one with delay (testing)
  async onUploadImages() {
    if (this.selectedImages.length === 0) {
      alert('Please select images to upload.');
      return;
    }

    this.isUploading = true;
    this.uploadCanceled = false;
    this.uploadedCount = 0;
    this.failedImages = []; // Reset failed images before starting upload

    for (const [index, image] of this.selectedImages.entries()) {
      if (image.oversized) continue;

      if (this.uploadCanceled) {
        this.uploadProgress = 'Uploading stopped';
        break;
      }

      this.uploadProgress = `Uploading images: ${this.uploadedCount + 1}/${
        this.selectedImages.length
      }`;

      await new Promise((resolve) => setTimeout(resolve, 500));

      const multipartSub = this.uploadMultipart(image.id, image.file).subscribe(
        (event: any) => {
          this.handleUploadResponse(event, index); // Pass index to update specific file progress
        },
        (error) => {
          this.handleUploadError(error, index);
        }
      );
      this.subscriptions.push(multipartSub);

      this.uploadedCount++;
      this.uploadProgress = `Uploading images: ${this.uploadedCount}/${this.selectedImages.length}`;
    }

    // Use a temporary array to filter out successful images
    this.selectedImages = this.selectedImages.filter((image, index) => {
      if (
        this.uploadStatus[index] === 'error' ||
        this.uploadStatus[index] === 'infected'
      ) {
        this.failedImages.push(image); // Add to failedImages
        return false; // Exclude from selectedImages
      } else {
        return true; // Keep in selectedImages
      }
    });

    if (!this.uploadCanceled) {
      this.uploadProgress = 'Upload complete!';
      this.isUploading = false;
      this.uploadSummaryVisible = true;
    }
  }

  handleUploadError(error: any, index: number) {
    if (error.status === 500) {
      // Mark the file as infected and set a custom error message
      this.uploadStatus[index] = 'infected';
      this.selectedImages[index].errorMessage = 'infected file cannot upload';
    } else {
      // General error handling
      console.error('Upload failed', error);
      this.uploadStatus[index] = 'error';
    }
  }

  handleUploadResponse(event: any, index: number) {
    if (event.type === HttpEventType.Response) {
      // Increment the uploaded count only after a response is received for each image
      this.uploadedCount++;
      this.uploadProgress = `Uploading images: ${this.uploadedCount}/${this.selectedImages.length}`;

      // Check if all images have been uploaded
      if (this.uploadedCount === this.selectedImages.length) {
        this.uploadProgress = 'Upload complete!';
        this.resetUploadState(); // Reset state after upload completes
      }
    } else if (event instanceof HttpErrorResponse) {
      // Log detailed error information to the console
      console.error('Error during upload:', event.error);
    }
  }

  uploadMultipart(id: number, file: File) {
    const formData: FormData = new FormData();
    formData.append('id', id.toString()); // Add unique integer ID
    formData.append('file', file);

    return this.imageUploadService.uploadImageMultipart(formData);
  }

  generateUniqueId(): number {
    // Generate a random integer between 1 and 999999 (or any desired range)
    return Math.floor(Math.random() * 999999) + 1;
  }

  // Utility function to create a delay of specified milliseconds
  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Cancel the ongoing upload process
  onCancelUpload() {
    this.uploadCanceled = true; // Mark as canceled
    this.uploadProgress = 'Uploading stopped'; // Set progress message
    this.resetUploadState(); // Reset state after cancel
    // Unsubscribe from all active uploads
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  // Reset the state after cancel or after upload completes
  resetUploadState() {
    this.isUploading = false;
    this.selectedImages = []; // Clear images list
    this.totalSize = 0; // Reset the total size
    this.uploadedCount = 0; // Reset upload count
  }

  // Enhancement: Handle drag-over event
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  // Enhancement: Handle drop event
  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  hasOversizedFiles(): boolean {
    return this.selectedImages.some((image) => image.oversized);
  }

  removeFailedImage(index: number): void {
    this.failedImages.splice(index, 1); // Allow removing failed images
  }

  captureImage(): void {
    this.showCapWebComponent = true; // Show CapWebComponent
  }

  handleStopCamera(): void {
    this.showCapWebComponent = false; // Hide CapWebComponent and show Capture Image button
    console.log('Camera stopped and returning to Capture Image button');
  }

  public storeCapturedImages(images: any[]): void {
    this.storedImages = images; // Store images in storedImages
    this.showCapWebComponent = false;
    console.log('Stored images:', this.storedImages);

    // Process captured images
    images.forEach((image) => {
      const fileSize = image.size;

      if (fileSize + this.totalSize > this.maxTotalSize) {
        alert('Cannot add more images. Total size exceeds 50MB.');
        return;
      }

      const file = new File([image.imageData], image.name, { type: image.type });

      this.selectedImages.push({
        name: file.name,
        size: file.size,
        file: file,
        id: this.generateUniqueId(), // Add unique ID for each file
        oversized: fileSize > 5 * 1024 * 1024, // Mark images > 5MB
      });
      this.uploadStatus.push(''); // Initialize upload status
      this.uploadProgressArray.push(0); // Initialize upload progress
      this.totalSize += file.size;
    });
  }
}
