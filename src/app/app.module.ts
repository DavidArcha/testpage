import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CaptureImgComponent } from './capture-img/capture-img.component';
import { CapWebComponent } from './cap-web/cap-web.component';
import { WebcamModule } from 'ngx-webcam';

@NgModule({
  declarations: [
    AppComponent,
    CaptureImgComponent,
    CapWebComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,WebcamModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
