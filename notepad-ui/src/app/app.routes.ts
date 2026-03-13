import { Routes } from '@angular/router';
import { GalleryComponent } from './gallery';
import { CreateNoteComponent } from './create-note';
import { ViewNoteComponent } from './view-note'; // <-- Import it

export const routes: Routes = [
  { path: '', redirectTo: 'gallery', pathMatch: 'full' },
  { path: 'gallery', component: GalleryComponent },
  { path: 'create', component: CreateNoteComponent },
  { path: 'note/:id', component: ViewNoteComponent } // <-- Add the dynamic route
];
