import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CapWebComponent } from './cap-web/cap-web.component';
import { WebcamModule } from 'ngx-webcam';
import { UploadImageComponent } from './upload-image/upload-image.component';
import { MultipleImageUploadComponent } from './multiple-image-upload/multiple-image-upload.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ImageSliderComponent } from './image-slider/image-slider.component';

@NgModule({
  declarations: [
    AppComponent,
    CapWebComponent,
    UploadImageComponent,
    MultipleImageUploadComponent,
    ImageSliderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,WebcamModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
