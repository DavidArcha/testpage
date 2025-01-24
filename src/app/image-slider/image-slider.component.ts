import { Component, OnInit } from '@angular/core';
import { ImageUploadService } from '../image-upload.service';

@Component({
  selector: 'app-image-slider',
  templateUrl: './image-slider.component.html',
  styleUrl: './image-slider.component.scss'
})
export class ImageSliderComponent implements OnInit {
  images: { id: number, imageData: string }[] = [];
  currentImageIndex = 0;

  constructor(private imageService: ImageUploadService) {}

  ngOnInit(): void {
    this.loadImages();
  }

  // Function to load images from the API
  loadImages(): void {
    this.imageService.getImages().subscribe(
      (response: any) => {
        // Assuming response contains an array of image objects with id and imageData
        this.images = response;
        console.log(response);
      },
      (error) => {
        console.error('Error fetching images', error);
      }
    );
  }

  prevImage() {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    } else {
      this.currentImageIndex = this.images.length - 1;
    }
  }

  nextImage() {
    if (this.currentImageIndex < this.images.length - 1) {
      this.currentImageIndex++;
    } else {
      this.currentImageIndex = 0;
    }
  }

  getCurrentImage() {
    return this.images[this.currentImageIndex]?.imageData;
  }

  deleteCurrentImage() {
    const currentImageId = this.images[this.currentImageIndex].id;

    this.imageService.deleteImage(currentImageId)
      .subscribe(() => {
        // Remove the current image from the array
        this.images.splice(this.currentImageIndex, 1);

        // Adjust the index if necessary
        if (this.currentImageIndex >= this.images.length) {
          this.currentImageIndex = this.images.length - 1;
        }
      }, (error) => {
        console.error('Error deleting the image:', error);
      });
  }
}
