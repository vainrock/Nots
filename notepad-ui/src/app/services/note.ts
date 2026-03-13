import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';

export interface Note {
  id?: number;
  title: string;
  content: string;
  created?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private apiUrl = 'http://localhost:5275/api/notes';

  // THE FIX: Active Memory Cache
  private cachedNotes: Note[] | null = null;

  constructor(private http: HttpClient) { }

  // When the gallery asks for notes, hand them the memory cache INSTANTLY
  // so the View Transition can lock onto the elements. Then silently update it in the background.
  getNotes(): Observable<Note[]> {
    if (this.cachedNotes) {
      this.http.get<Note[]>(this.apiUrl).subscribe(data => this.cachedNotes = data);
      return of(this.cachedNotes);
    }
    return this.http.get<Note[]>(this.apiUrl).pipe(
      tap(data => this.cachedNotes = data)
    );
  }

// FIXED: The Editor now instantly pulls from the memory cache so the GPU camera catches it immediately!
  getNote(id: number): Observable<Note> {
    if (this.cachedNotes) {
      const foundNote = this.cachedNotes.find(n => n.id === id);
      if (foundNote) return of(foundNote);
    }
    return this.http.get<Note>(`${this.apiUrl}/${id}`);
  }

  // Update the cache instantly so the gallery is ready before the route even changes!
  updateNote(id: number, note: Note): Observable<Note> {
    return this.http.put<Note>(`${this.apiUrl}/${id}`, note).pipe(
      tap(updatedNote => {
        if (this.cachedNotes) {
          const index = this.cachedNotes.findIndex(n => n.id === id);
          if (index !== -1) this.cachedNotes[index] = updatedNote;
        }
      })
    );
  }

  createNote(note: Note): Observable<Note> {
    return this.http.post<Note>(this.apiUrl, note).pipe(
      tap(newNote => {
        if (this.cachedNotes) this.cachedNotes.push(newNote);
      })
    );
  }

  deleteNote(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        if (this.cachedNotes) this.cachedNotes = this.cachedNotes.filter(n => n.id !== id);
      })
    );
  }

  // --- EXPORTS ---
  exportPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/export/pdf`, { responseType: 'blob' });
  }
  exportMd(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/export/md`, { responseType: 'blob' });
  }
  exportDoc(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/export/doc`, { responseType: 'blob' });
  }
}
