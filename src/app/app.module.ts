import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AddRideComponent } from './components/add-ride/add-ride.component';
import { FindRidesComponent } from './components/find-rides/find-rides.component';

@NgModule({
  declarations: [AppComponent, AddRideComponent, FindRidesComponent],
  imports: [BrowserModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
