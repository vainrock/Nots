import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NoteService, Note } from './services/note';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="mb-8 flex justify-between items-center border-b border-gray-800 pb-4">
      <h2 class="text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-500">
        Stored_Memories
      </h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

      <div *ngFor="let note of notes"
           [routerLink]="['/note', note.id]"
           class="bg-gray-900 border border-violet-500/30 p-6 rounded-xl relative group transition-all duration-300 hover:border-pink-500/60 shadow-[0_0_15px_rgba(139,92,246,0.1)] hover:shadow-[0_0_25px_rgba(236,72,153,0.25)] hover:-translate-y-1 overflow-hidden cursor-pointer">

        <div class="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50 group-hover:via-pink-500 transition-all"></div>

        <button (click)="$event.stopPropagation(); deleteNote(note.id)" class="absolute top-4 right-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-all hover:text-pink-500 hover:shadow-[0_0_10px_rgba(236,72,153,0.5)] z-20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        <h3 class="text-xl font-bold text-gray-100 mb-3 pr-8 tracking-wide">{{ note.title }}</h3>
        <p class="text-gray-400 whitespace-pre-wrap leading-relaxed font-mono text-sm line-clamp-4">{{ note.content }}</p>
      </div>

      <div *ngIf="notes.length === 0" class="col-span-2 text-center py-16 font-mono text-violet-400 bg-gray-900/50 rounded-xl border border-dashed border-violet-500/30 shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]">
        > DATABASE_EMPTY. Initialize a new sequence via [Inject_Note].
      </div>
    </div>
  `
})
export class GalleryComponent implements OnInit {
  notes: Note[] = [];

  // Inject ChangeDetectorRef
  constructor(private noteService: NoteService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadNotes(); }

  loadNotes() {
    this.noteService.getNotes().subscribe({
      next: (data: Note[]) => {
        this.notes = data;
        // 1. Force Angular to instantly redraw the HTML with the new data
        this.cdr.detectChanges();
      },
      error: (err) => {
        // 2. If the request fails, scream loudly instead of failing silently!
        alert('API FETCH FAILED: ' + err.message);
        console.error(err);
      }
    });
  }

  deleteNote(id: number | undefined) {
    if (!id) return;
    this.noteService.deleteNote(id).subscribe(() => {
      this.notes = this.notes.filter(n => n.id !== id);
      this.cdr.detectChanges(); // Force redraw on delete too
    });
  }
}

