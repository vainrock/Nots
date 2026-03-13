import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NoteService, Note } from './services/note';

@Component({
  selector: 'app-view-note',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div *ngIf="note" class="bg-gray-900 p-8 rounded-xl border border-violet-500/30 max-w-2xl mx-auto mt-6 shadow-[0_0_30px_rgba(139,92,246,0.15)] relative overflow-hidden">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMTM5LCA5MiwgMjQ2LCAwLjEpIi8+PC9zdmc+')] opacity-50 pointer-events-none"></div>

      <div class="relative z-10">
        <h2 class="text-2xl font-black uppercase tracking-widest text-violet-400 mb-8 flex items-center gap-3">
          <span class="w-3 h-3 bg-violet-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.8)]"></span>
          Edit_Record // ID: {{ note.id }}
        </h2>

        <input type="text" [(ngModel)]="note.title"
               class="w-full text-xl font-mono mb-6 p-4 bg-gray-950 border border-gray-800 text-violet-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">

        <textarea [(ngModel)]="note.content" rows="12"
                  class="w-full resize-y p-4 font-mono text-gray-300 bg-gray-950 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all mb-8 border border-gray-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"></textarea>

        <div class="flex justify-end gap-4 items-center border-t border-gray-800 pt-6">
          <a routerLink="/gallery" class="text-gray-500 hover:text-pink-400 font-mono text-sm py-2.5 px-4 transition-all uppercase tracking-wider">Back_to_Core</a>

          <button (click)="saveChanges()"
                  class="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] uppercase tracking-widest text-sm transform hover:-translate-y-0.5 border border-violet-400/50">
            Commit_Update
          </button>
        </div>
      </div>
    </div>

    <div *ngIf="!note" class="text-center font-mono text-pink-500 mt-20 animate-pulse">
      > DECRYPTING_FILE...
    </div>
  `
})
export class ViewNoteComponent implements OnInit {
  note: Note | null = null;

  constructor(
    private route: ActivatedRoute,
    private noteService: NoteService,
    private router: Router
  ) {}

  ngOnInit() {
    // Grab the ID from the URL (e.g., /note/5)
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      // Fetch that specific note from the C# backend
      this.noteService.getNote(id).subscribe((data: Note) => this.note = data);
    }
  }

  saveChanges() {
    if (this.note && this.note.id) {
      this.noteService.updateNote(this.note.id, this.note).subscribe(() => {
        this.router.navigate(['/gallery']);
      });
    }
  }
}
