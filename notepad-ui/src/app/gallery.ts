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
           class="bg-gray-900 border border-violet-500/30 p-6 rounded-xl relative group transition-all duration-300 hover:border-pink-500/60 shadow-[0_0_15px_rgba(139,92,246,0.1)] hover:shadow-[0_0_25px_rgba(236,72,153,0.25)] hover:-translate-y-1 overflow-hidden cursor-pointer flex flex-col min-h-[160px]">
           [style.view-transition-name]="'note-card-' + note.id" class="bg-gray-900 border border-violet-500/30 p-6 rounded-xl relative group transition-all ...">

        <div class="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50 group-hover:via-pink-500 transition-all"></div>

        <button (click)="$event.stopPropagation(); deleteNote(note.id)" class="absolute top-4 right-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-all hover:text-pink-500 hover:shadow-[0_0_10px_rgba(236,72,153,0.5)] z-20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        <h3 class="text-xl font-bold text-gray-100 mb-3 pr-8 tracking-wide">{{ note.title }}</h3>
        <p class="text-gray-400 whitespace-pre-wrap leading-relaxed font-mono text-sm line-clamp-4 flex-grow">{{ note.content }}</p>

        <div class="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20 translate-y-2 group-hover:translate-y-0">
          <button (click)="$event.stopPropagation(); exportMarkdown(note.id!)" title="Export as Markdown" class="text-[10px] font-bold font-mono bg-gray-800 hover:bg-gray-700 text-gray-300 py-1.5 px-2.5 rounded border border-gray-600 transition-colors uppercase shadow-[0_0_10px_rgba(0,0,0,0.5)]">.MD</button>
          <button (click)="$event.stopPropagation(); exportWord(note.id!)" title="Export as Word" class="text-[10px] font-bold font-mono bg-blue-900/40 hover:bg-blue-800/60 text-blue-400 py-1.5 px-2.5 rounded border border-blue-700/50 transition-colors uppercase shadow-[0_0_10px_rgba(0,0,0,0.5)]">.DOC</button>
          <button (click)="$event.stopPropagation(); exportPDF(note.id!)" title="Export as PDF" class="text-[10px] font-bold font-mono bg-red-900/40 hover:bg-red-800/60 text-red-400 py-1.5 px-2.5 rounded border border-red-700/50 transition-colors uppercase shadow-[0_0_10px_rgba(0,0,0,0.5)]">.PDF</button>
        </div>

      </div>

      <div *ngIf="notes.length === 0" class="col-span-2 text-center py-16 font-mono text-violet-400 bg-gray-900/50 rounded-xl border border-dashed border-violet-500/30 shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]">
        > DATABASE_EMPTY. Initialize a new sequence via [Inject_Note].
      </div>
    </div>
  `
})
export class GalleryComponent implements OnInit {
  notes: Note[] = [];

  constructor(private noteService: NoteService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadNotes(); }

  loadNotes() {
    this.noteService.getNotes().subscribe({
      next: (data: Note[]) => {
        this.notes = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        alert('API FETCH FAILED: ' + err.message);
        console.error(err);
      }
    });
  }

  deleteNote(id: number | undefined) {
    if (!id) return;
    this.noteService.deleteNote(id).subscribe(() => {
      this.notes = this.notes.filter(n => n.id !== id);
      this.cdr.detectChanges();
    });
  }

  // --- EXPORT PROTOCOLS ---
  private downloadFromServer(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  exportMarkdown(id: number) {
    const note = this.notes.find(n => n.id === id);
    if (!note) return;
    this.noteService.exportMd(id).subscribe({
      next: (blob: Blob) => this.downloadFromServer(blob, `${note.title}.md`),
      error: (err: any) => alert('Server failed to generate Markdown.')
    });
  }

  exportWord(id: number) {
    const note = this.notes.find(n => n.id === id);
    if (!note) return;
    this.noteService.exportDoc(id).subscribe({
      next: (blob: Blob) => this.downloadFromServer(blob, `${note.title}.doc`),
      error: (err: any) => alert('Server failed to generate Word document.')
    });
  }

  exportPDF(id: number) {
    const note = this.notes.find(n => n.id === id);
    if (!note) return;
    this.noteService.exportPdf(id).subscribe({
      next: (blob: Blob) => this.downloadFromServer(blob, `${note.title}.pdf`),
      error: (err: any) => alert('Server failed to generate PDF.')
    });
  }
}
