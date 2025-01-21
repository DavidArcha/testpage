import { Component } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { WebcamImage, WebcamUtil } from 'ngx-webcam';

@Component({
  selector: 'app-cap-web',
  templateUrl: './cap-web.component.html',
  styleUrl: './cap-web.component.scss'
})
export class CapWebComponent {
// Webcam trigger
private trigger: Subject<void> = new Subject<void>();

// Available devices
public availableDevices: MediaDeviceInfo[] = [];
public selectedDevice: string = '';
public webcamImage: WebcamImage | null = null;
public capturedImages: string[] = [];

constructor() {
  // Get available devices
  WebcamUtil.getAvailableVideoInputs().then((devices) => {
    this.availableDevices = devices;
    if (devices.length > 0) {
      this.selectedDevice = devices[0].deviceId;
    }
  });
}

// Trigger the webcam snapshot
public triggerSnapshot(): void {
  this.trigger.next();
}

// Handle image capture
public handleImage(webcamImage: WebcamImage): void {
  this.webcamImage = webcamImage;
  this.capturedImages.push(webcamImage.imageAsDataUrl);
}

// Get trigger observable
public get triggerObservable(): Observable<void> {
  return this.trigger.asObservable();
}

// Delete captured image
public deleteImage(index: number): void {
  this.capturedImages.splice(index, 1);
}
}