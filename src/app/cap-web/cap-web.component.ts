import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
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
  styleUrl: './cap-web.component.scss',
})
export class CapWebComponent implements AfterViewInit {
  private trigger: Subject<void> = new Subject<void>();
  public availableDevices: MediaDeviceInfo[] = [];
  public selectedDevice: string = '';
  public capturedImages: any[] = [];
  public reviewImage: CapturedImage | null = null;
  public showLeftIcon = false;
  public showRightIcon = false;

  @Output() stopCameraEvent = new EventEmitter<void>(); // Notify parent when camera stops
  @Output() submitImagesEvent = new EventEmitter<any[]>(); // Emit capturedImages on submit

  @ViewChild('imagesContainer') imagesContainer!: ElementRef;

  constructor() {
  // Initialize available devices
  WebcamUtil.getAvailableVideoInputs().then((devices) => {
    this.availableDevices = devices;

    // Prefer back camera if available
    const backCamera = devices.find((device) =>
      device.label.toLowerCase().includes('back')
    );
    this.selectedDevice = backCamera ? backCamera.deviceId : devices[0]?.deviceId;
  });
  }

  ngAfterViewInit(): void {
    this.updateScrollIcons(); // Initialize scroll icons
  }

  // Trigger the webcam snapshot
  public triggerSnapshot(): void {
    this.trigger.next();
  }

  // Get trigger observable
  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  // Handle image capture and add timestamp
  public async handleImage(webcamImage: WebcamImage): Promise<void> {
    const imageName = `image_${Date.now()}.png`;
    const blob = this.dataUrlToBlob(webcamImage.imageAsDataUrl);
    const size = blob.size;
    const type = blob.type;

    // Add timestamp to the captured image
    const overlayedImage = await this.addTimestampToImage(
      webcamImage.imageAsDataUrl
    );

    this.capturedImages.push({
      name: imageName,
      size: size,
      type: type,
      dataUrl: webcamImage.imageAsDataUrl,
    });

    console.log('Captured image with timestamp added:', {
      name: imageName,
      size: size,
      type: type,
    });

    setTimeout(() => {
      this.scrollToLatestImage(); // Ensure latest image is visible
      this.updateScrollIcons(); // Update scroll icons after adding an image
    }, 50); // Slight delay to ensure DOM updates
  }

  // Stop the camera and emit event
  public stopCamera(): void {
    console.log('Camera stopped');
    this.stopCameraEvent.emit();
  }

  // Delete a captured image
  public deleteImage(index: number): void {
    this.capturedImages.splice(index, 1);
    console.log(`Deleted image at index: ${index}`);
    this.updateScrollIcons();
  }

  // Scroll the images container
  public scrollImages(direction: 'left' | 'right'): void {
    const scrollAmount = 150;
    const container = this.imagesContainer.nativeElement;

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else if (direction === 'right') {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }

    this.updateScrollIcons();
  }

  // Scroll to the latest image
  public scrollToLatestImage(): void {
    const container = this.imagesContainer.nativeElement;
    container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
  }

  // Update visibility of scroll icons
  public updateScrollIcons(): void {
    const container = this.imagesContainer.nativeElement;
    this.showLeftIcon = container.scrollLeft > 0;
    this.showRightIcon =
      container.scrollLeft + container.clientWidth < container.scrollWidth;
  }

  public onScroll(): void {
    this.updateScrollIcons();
  }

  public openImageReview(image: CapturedImage): void {
    this.reviewImage = image;
  }

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

  private async addTimestampToImage(dataUrl: string): Promise<string> {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const image = new Image();

    return new Promise<string>((resolve) => {
      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;

        context!.drawImage(image, 0, 0);

        const now = new Date();
        const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

        context!.font = '24px Arial';
        context!.fillStyle = 'white';
        context!.strokeStyle = 'black';
        context!.lineWidth = 2;

        context!.strokeText(timestamp, image.width - 300, image.height - 20);
        context!.fillText(timestamp, image.width - 300, image.height - 20);

        resolve(canvas.toDataURL());
      };

      image.src = dataUrl;
    });
  }

  // New Submit Method
  public submitImages(): void {
    console.log('Submitting images:', this.capturedImages);
    this.submitImagesEvent.emit(this.capturedImages); // Emit capturedImages array to the parent
  }
}
