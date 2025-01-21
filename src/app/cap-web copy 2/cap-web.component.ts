import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { WebcamImage, WebcamUtil } from 'ngx-webcam';

interface CapturedImage {
  name: string;
  size: number; // In bytes
  type: string;
  dataUrl: string;
}

@Component({
  selector: 'app-cap-web',
  templateUrl: './cap-web.component.html',
  styleUrl: './cap-web.component.scss'
})
export class CapWebComponent implements AfterViewInit {
  private trigger: Subject<void> = new Subject<void>();
  public availableDevices: MediaDeviceInfo[] = [];
  public selectedDevice: string = '';
  public capturedImages: CapturedImage[] = [];
  public reviewImage: CapturedImage | null = null;
  public showLeftIcon = false;
  public showRightIcon = false;

  @ViewChild('imagesContainer') imagesContainer!: ElementRef;

  @Output() stopCameraEvent = new EventEmitter<void>(); // Notify parent when camera stops

  constructor() {
    // Get available devices
    WebcamUtil.getAvailableVideoInputs().then((devices) => {
      this.availableDevices = devices;
      if (devices.length > 0) {
        this.selectedDevice = devices[0].deviceId;
      }
    });
  }

  ngAfterViewInit(): void {
    this.updateScrollIcons(); // Initialize scroll icons
  }

  // Trigger the webcam snapshot
  public triggerSnapshot(): void {
    this.trigger.next();
  }

  // Handle image capture and add timestamp
  public async handleImage(webcamImage: WebcamImage): Promise<void> {
    const imageName = `image_${Date.now()}.png`;
    const blob = this.dataUrlToBlob(webcamImage.imageAsDataUrl);
    const size = blob.size;
    const type = blob.type;

    // Add timestamp to the captured image
    const overlayedImage = await this.addTimestampToImage(webcamImage.imageAsDataUrl);

    this.capturedImages.push({
      name: imageName,
      size: size,
      type: type,
      dataUrl: overlayedImage
    });

    console.log('Captured image with timestamp added:', {
      name: imageName,
      size: size,
      type: type
    });

    setTimeout(() => {
      this.scrollToLatestImage(); // Ensure latest image is visible
      this.updateScrollIcons(); // Update scroll icons after adding an image
    }, 50); // Slight delay to ensure DOM updates
  }

  // Open the clicked image in review container
  public openImageReview(image: CapturedImage): void {
    this.reviewImage = image;
  }

  // Convert data URL to Blob
  private dataUrlToBlob(dataUrl: string): Blob {
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  // Add timestamp to the captured image
  private addTimestampToImage(dataUrl: string): Promise<string> {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const image = new Image();

    return new Promise<string>((resolve) => {
      image.onload = () => {
        // Set canvas dimensions to match the image
        canvas.width = image.width;
        canvas.height = image.height;

        // Draw the original image onto the canvas
        context!.drawImage(image, 0, 0);

        // Add timestamp
        const now = new Date();
        const dateString = now.toLocaleDateString();
        const timeString = now.toLocaleTimeString();
        const dayString = now.toLocaleDateString('en-US', { weekday: 'long' });

        const timestamp = `${dayString}, ${dateString} ${timeString}`;

        // Set font and text color
        context!.font = '24px Arial';
        context!.fillStyle = 'white';
        context!.strokeStyle = 'black';
        context!.lineWidth = 2;

        // Add stroke for better visibility
        context!.strokeText(timestamp, image.width - 300, image.height - 20);
        context!.fillText(timestamp, image.width - 300, image.height - 20);

        // Convert the canvas back to a data URL
        resolve(canvas.toDataURL());
      };

      image.src = dataUrl;
    });
  }

  // Get trigger observable
  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  // Notify the parent component to stop the camera
  public stopCamera(): void {
    console.log('Camera stopped');
    this.stopCameraEvent.emit(); // Emit the event
  }

  // Delete a captured image
  public deleteImage(index: number): void {
    this.capturedImages.splice(index, 1);
    console.log(`Deleted image at index: ${index}`);
    setTimeout(() => this.updateScrollIcons(), 300); // Update scroll icons after deletion
    if (this.reviewImage === this.capturedImages[index]) {
      this.reviewImage = null; // Clear the review image if it was deleted
    }
  }

  // Scroll the images container
  public scrollImages(direction: 'left' | 'right'): void {
    const scrollAmount = 150; // Adjust scroll amount as needed
    const container = this.imagesContainer.nativeElement;

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else if (direction === 'right') {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }

    setTimeout(() => this.updateScrollIcons(), 300); // Recheck icon visibility after scrolling
  }

  // Scroll to the latest image
  private scrollToLatestImage(): void {
    const container = this.imagesContainer.nativeElement;
    container.scrollTo({
      left: container.scrollWidth,
      behavior: 'smooth'
    });
  }

  // Update visibility of scroll icons
  private updateScrollIcons(): void {
    const container = this.imagesContainer.nativeElement;
    this.showLeftIcon = container.scrollLeft > 0;
    this.showRightIcon =
      container.scrollLeft + container.clientWidth < container.scrollWidth;
  }

  // Triggered when the user scrolls manually
  public onScroll(): void {
    this.updateScrollIcons();
  }
}