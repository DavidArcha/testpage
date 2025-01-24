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
  public reviewImage: any | null = null;
  public showLeftIcon = false;
  public showRightIcon = false;

  @Output() stopCameraEvent = new EventEmitter<void>();
  @Output() submitImagesEvent = new EventEmitter<any[]>();

  @ViewChild('imagesContainer') imagesContainer!: ElementRef;

  constructor() {
    this.initializeCameraDevices();
  }

  ngAfterViewInit(): void {
    this.updateScrollIcons();
  }

  private async initializeCameraDevices(): Promise<void> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableDevices = devices.filter((device) => device.kind === 'videoinput');

      const backCamera = this.availableDevices.find((device) =>
        device.label.toLowerCase().includes('back') ||
        device.label.toLowerCase().includes('rear')
      );

      if (backCamera) {
        this.selectedDevice = backCamera.deviceId;
      } else if (this.availableDevices.length > 0) {
        this.selectedDevice = this.availableDevices[0].deviceId;
      }

      await this.setVideoConstraints();
    } catch (error) {
      console.error('Error initializing camera devices:', error);
    }
  }

  private async setVideoConstraints(): Promise<void> {
    const constraints = this.selectedDevice
      ? { video: { deviceId: { exact: this.selectedDevice } } }
      : { video: { facingMode: { ideal: 'environment' } } };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera stream initialized:', stream);
      // Attach the stream to your video element if needed
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public async handleImage(webcamImage: WebcamImage): Promise<void> {
    const imageName = `image_${Date.now()}.png`;
    const blob = this.dataUrlToBlob(webcamImage.imageAsDataUrl);
    const size = blob.size;
    const type = blob.type;

    const overlayedImage = await this.addTimestampToImage(webcamImage.imageAsDataUrl);

    this.capturedImages.push({
      name: imageName,
      size: size,
      type: type,
      imageData: blob,
      dataUrl: overlayedImage,
    });

    setTimeout(() => {
      this.scrollToLatestImage();
      this.updateScrollIcons();
    }, 50);
  }

  public stopCamera(): void {
    this.stopCameraEvent.emit();
  }

  public deleteImage(index: number): void {
    this.capturedImages.splice(index, 1);
    this.updateScrollIcons();
  }

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

  public scrollToLatestImage(): void {
    const container = this.imagesContainer.nativeElement;
    container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
  }

  public updateScrollIcons(): void {
    const container = this.imagesContainer.nativeElement;
    this.showLeftIcon = container.scrollLeft > 0;
    this.showRightIcon =
      container.scrollLeft + container.clientWidth < container.scrollWidth;
  }

  public onScroll(): void {
    this.updateScrollIcons();
  }

  public openImageReview(image: any): void {
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

  public submitImages(): void {
    this.submitImagesEvent.emit(this.capturedImages);
  }
}