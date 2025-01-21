import { Component } from '@angular/core';

@Component({
  selector: 'app-upload-image',
  templateUrl: './upload-image.component.html',
  styleUrl: './upload-image.component.scss'
})
export class UploadImageComponent {
  showCapWebComponent: boolean = false; // Determines if CapWebComponent should be displayed
  public storedImages: any[] = []; // Array to store images from CapWebComponent

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
  }
}
