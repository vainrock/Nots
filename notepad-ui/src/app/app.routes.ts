import { Routes } from '@angular/router';
import { GalleryComponent } from './gallery';
import { CreateNoteComponent } from './create-note';

export const routes: Routes = [
  { path: '', redirectTo: 'gallery', pathMatch: 'full' }, // Default page
  { path: 'gallery', component: GalleryComponent },
  { path: 'create', component: CreateNoteComponent }
];
