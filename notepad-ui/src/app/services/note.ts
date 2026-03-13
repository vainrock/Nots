import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Note {
  id?: number;
  name: string;
  content: string;
  created?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private apiUrl = 'http://localhost:5000/api/notes'; // Ensure port matches .NET!

  constructor(private http: HttpClient) { }

  getNotes(): Observable<Note[]> { return this.http.get<Note[]>(this.apiUrl); }
  createNote(note: Note): Observable<Note> { return this.http.post<Note>(this.apiUrl, note); }
  deleteNote(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
