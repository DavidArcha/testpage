import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CapWebComponent } from './cap-web/cap-web.component';
import { WebcamModule } from 'ngx-webcam';
import { UploadImageComponent } from './upload-image/upload-image.component';

@NgModule({
  declarations: [
    AppComponent,
    CapWebComponent,
    UploadImageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,WebcamModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
