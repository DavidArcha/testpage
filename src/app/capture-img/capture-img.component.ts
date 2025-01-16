import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';

interface CapturedImage {
  name: string; // Image name
  data: string; // Base64 image data
}

interface ExtendedMediaTrackCapabilities extends MediaTrackCapabilities {
  zoom?: {
    max: number;
    min: number;
    step?: number;
  };
}

@Component({
  selector: 'app-capture-img',
  templateUrl: './capture-img.component.html',
  styleUrl: './capture-img.component.scss'
})
export class CaptureImgComponent implements AfterViewChecked {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;

  isCameraActive = false;
  isVideoLoaded = false; // Flag to enable/disable the Capture button
  capturedImages: CapturedImage[] = []; // Array to store captured images
  visibleImages: CapturedImage[] = []; // Images visible in the slider
  currentStartIndex = 0; // Index of the first visible image
  maxVisibleImages = 4; // Maximum number of visible images in the slider

  selectedImage: string | null = null; // Store the currently selected image for preview

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewChecked() {
    this.cdr.detectChanges(); // Ensure DOM updates are detected
  }

  async startCamera() {
    this.isCameraActive = true;
    this.isVideoLoaded = false; // Reset video loaded state
    const constraints = { video: { facingMode: 'environment' } };
  
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.nativeElement.srcObject = stream;
      this.videoElement.nativeElement.play();
        // Video is ready after 'loadeddata' fires
        this.videoElement.nativeElement.addEventListener('loadeddata', () => {
          this.isVideoLoaded = true; // Enable the Capture button
        });
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera.');
      this.isCameraActive = false;
    }
  }  

  captureImage() {
    if (!this.isCameraActive) {
      console.error('Camera is not active. Start the camera first.');
      return;
    }

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (context && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Add overlay text (date, time, and day)
      const now = new Date();
      const formattedDate = now.toLocaleDateString();
      const formattedTime = now.toLocaleTimeString();
      const overlayText = `${formattedDate} ${formattedTime}`;


      context.font = '18px Arial';
      context.fillStyle = 'white';
      context.textAlign = 'right';
      context.fillText(overlayText, canvas.width - 10, canvas.height - 10);

      // Save the canvas image
      // Generate timestamp for the filename
    const formattedDateName = this.formatDate(now);

      const imageData = canvas.toDataURL('image/png');
      const imageName = `Image_${formattedDateName}`; // Set the image name`;
      const imageSize = this.calculateImageSize(imageData); // Get the size in MB

      console.log(`Captured Image Name: ${imageName}`);
    console.log(`Captured Image Size: ${this.calculateImageSize(imageData).toFixed(2)} MB`);
      this.capturedImages.push({ name: imageName, data: imageData });

        // Adjust the currentStartIndex to include the new image
    const totalImages = this.capturedImages.length;
    if (totalImages > this.maxVisibleImages) {
      this.currentStartIndex = totalImages - this.maxVisibleImages;
    } else {
      this.currentStartIndex = 0;
    }

      this.updateVisibleImages();
      console.log(`Captured Image: ${imageName}`);
      // Set the captured image as the selected image
    this.selectedImage = imageData;
    }
  }

  // Helper method to calculate Base64 image size in MB
calculateImageSize(base64String: string): number {
  const base64Length = base64String.length - 'data:image/png;base64,'.length;
  const bytes = (base64Length * 3) / 4; // Convert Base64 length to bytes
  return bytes / (1024 * 1024); // Convert bytes to MB
}

// Helper method to format the date for the filename
formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // Combine into the desired format
  return `${year}_${month}_${day}_${hours}:${minutes}:${seconds}`;
}

deleteImage(index: number) {
  const globalIndex = this.currentStartIndex + index;

  // Remove the image from the array
  this.capturedImages.splice(globalIndex, 1);

  // Update the visible images
  this.updateVisibleImages();

  // Update the selected image if needed
  if (this.selectedImage === this.capturedImages[globalIndex]?.data) {
    this.selectedImage = this.capturedImages.length
      ? this.capturedImages[Math.min(globalIndex, this.capturedImages.length - 1)].data
      : null;
  }
}

  navigateImages(direction: 'back' | 'forward') {
    if (direction === 'back') {
      this.currentStartIndex = Math.max(0, this.currentStartIndex - this.maxVisibleImages);
    } else if (direction === 'forward') {
      this.currentStartIndex = Math.min(
        this.capturedImages.length - this.maxVisibleImages,
        this.currentStartIndex + this.maxVisibleImages
      );
    }
    this.updateVisibleImages();
  }

  selectImage(index: number) {
    this.selectedImage = this.capturedImages[index].data;
  }

  updateVisibleImages() {
    // Ensure the visible images array always displays the correct number of images
    const end = Math.min(
      this.currentStartIndex + this.maxVisibleImages,
      this.capturedImages.length
    );
  
    this.visibleImages = this.capturedImages.slice(this.currentStartIndex, end);
  
    // If fewer than maxVisibleImages are shown, adjust the start index
    if (this.visibleImages.length < this.maxVisibleImages && this.currentStartIndex > 0) {
      this.currentStartIndex = Math.max(this.currentStartIndex - 1, 0);
      this.visibleImages = this.capturedImages.slice(
        this.currentStartIndex,
        this.currentStartIndex + this.maxVisibleImages
      );
    }
  }

  submitImages() {
    if (this.capturedImages.length > 0) {
      console.log('Submitting Images:', this.capturedImages);
      this.capturedImages.forEach(image =>
        console.log(`Image Name: ${image.name}, Data Length: ${image.data.length}`)
      );
      alert(`Submitted ${this.capturedImages.length} images successfully!`);
    } else {
      alert('No images to submit.');
    }
  }

  stopCamera() {
    this.isCameraActive = false;
    const stream = this.videoElement.nativeElement.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    this.videoElement.nativeElement.srcObject = null;
  }
}