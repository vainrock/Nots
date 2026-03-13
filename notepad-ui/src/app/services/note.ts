import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) { }

  getNotes(): Observable<Note[]> { return this.http.get<Note[]>(this.apiUrl); }
  getNote(id: number): Observable<Note> { return this.http.get<Note>(`${this.apiUrl}/${id}`); }
  updateNote(id: number, note: Note): Observable<Note> { return this.http.put<Note>(`${this.apiUrl}/${id}`, note); }
  createNote(note: Note): Observable<Note> { return this.http.post<Note>(this.apiUrl, note); }
  deleteNote(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }

  // --- NEW EXPORT ENDPOINTS ---
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
