import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NoteService, Note } from './services/note';

@Component({
  selector: 'app-create-note',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="bg-gray-900 p-8 rounded-xl border border-pink-500/30 max-w-2xl mx-auto mt-6 shadow-[0_0_30px_rgba(236,72,153,0.15)] relative overflow-hidden">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjM2LCA3MiwgMTUzLCAwLjEpIi8+PC9zdmc+')] opacity-50 pointer-events-none"></div>

      <div class="relative z-10">
        <h2 class="text-2xl font-black uppercase tracking-widest text-pink-400 mb-8 flex items-center gap-3">
          <span class="w-3 h-3 bg-pink-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(236,72,153,0.8)]"></span>
          Upload_Data
        </h2>

        <input type="text" [(ngModel)]="newNote.title" placeholder="> Input_Designation..."
               class="w-full text-xl font-mono mb-6 p-4 bg-gray-950 border border-gray-800 text-pink-100 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:outline-none transition-all placeholder-gray-700 rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">

        <textarea [(ngModel)]="newNote.content" placeholder="> Begin_Transmission..." rows="8"
                  class="w-full resize-y p-4 font-mono text-gray-300 bg-gray-950 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all mb-8 border border-gray-800 placeholder-gray-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"></textarea>

        <div class="flex justify-end gap-4 items-center border-t border-gray-800 pt-6">
          <a routerLink="/gallery" class="text-gray-500 hover:text-violet-400 font-mono text-sm py-2.5 px-4 transition-all uppercase tracking-wider">Abort</a>
          <button (click)="saveNote()" class="bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(236,72,153,0.6)] uppercase tracking-widest text-sm transform hover:-translate-y-0.5 border border-pink-400/50">
            Execute_Save
          </button>
        </div>
      </div>
    </div>
  `
})
export class CreateNoteComponent {
  newNote: Note = { title: '', content: '' }; // <-- Changed to title

  constructor(private noteService: NoteService, private router: Router) {}

  saveNote() {
    if (!this.newNote.title || !this.newNote.content) return; // <-- Changed to title

    this.noteService.createNote(this.newNote).subscribe(() => {
      this.router.navigate(['/gallery']);
    });
  }
}
