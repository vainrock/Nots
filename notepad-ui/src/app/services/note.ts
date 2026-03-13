import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Note {
  id?: number;
  title: string;  // <-- Changed from 'name' to match C# 'Title'
  content: string;
  created?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  // <-- Updated port to 5275!
  private apiUrl = 'http://localhost:5275/api/notes';

  constructor(private http: HttpClient) { }

  getNotes(): Observable<Note[]> { return this.http.get<Note[]>(this.apiUrl); }
  createNote(note: Note): Observable<Note> { return this.http.post<Note>(this.apiUrl, note); }
  deleteNote(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
