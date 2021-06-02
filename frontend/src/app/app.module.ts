import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LogInComponent } from './pages/log-in/log-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { MainComponent } from './pages/main/main.component';

import { HttpClientModule } from '@angular/common/http';
import { NewDocumentComponent } from './pages/new-document/new-document.component';
import { DraggableModule } from './draggable/draggable.module';

@NgModule({
  declarations: [
    AppComponent,
    LogInComponent,
    SignUpComponent,
    MainComponent,
    NewDocumentComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    DraggableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
