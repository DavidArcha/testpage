import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private baseUrl = 'https://localhost:7087/api/images';
  private apiUrl = 'https://localhost:7087/api/Images/File'; // Your API URL

  constructor(private http: HttpClient) {}

  // Set 3: Multipart/Form-Data Upload with Unique ID
  uploadImageMultipart(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/multipart`, formData, {
      observe: 'response',
      responseType: 'text',
    });
  }

  // Method to fetch the images from API
  getImages(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Function to delete an image by its ID
  deleteImage(imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${imageId}`);
  }
}
