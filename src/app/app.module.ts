import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { EnterjsonComponent } from './pages/enterjson/enterjson.component';
import { TableComponent } from './pages/table/table.component';
import { EditingComponent } from './pages/editing/editing.component';

import { FormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatInputModule } from '@angular/material/input'; 
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field'; 

@NgModule({
  declarations: [
    AppComponent,
    EnterjsonComponent,
    TableComponent,
    EditingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    TextFieldModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    RouterModule
  ],
  exports: [
    EnterjsonComponent,
    TableComponent,
    EditingComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
