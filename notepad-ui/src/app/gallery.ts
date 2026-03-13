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

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

      <div *ngFor="let note of notes"
           [routerLink]="['/note', note.id]"
           [style.view-transition-name]="'note-card-' + note.id"
           class="group h-72 cursor-pointer [perspective:1000px]">

        <div class="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-[0_0_15px_rgba(139,92,246,0.1)] group-hover:shadow-[0_0_25px_rgba(236,72,153,0.3)] rounded-xl">

          <div class="absolute inset-0 bg-gray-900 border border-violet-500/30 rounded-xl p-6 flex flex-col items-center justify-center [backface-visibility:hidden] overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50"></div>

            <div class="w-20 h-20 border border-violet-500/50 rounded-full flex flex-col items-center justify-center mb-6 shadow-[inset_0_0_20px_rgba(139,92,246,0.2)]">
              <span class="text-violet-400 font-mono text-xs tracking-widest uppercase opacity-70">Sector</span>
              <span class="text-violet-300 font-black text-xl font-mono">{{ note.id }}</span>
            </div>

            <h3 class="font-mono text-gray-500 text-sm tracking-[0.3em] uppercase text-center border-b border-gray-800 pb-2">Encrypted_Data</h3>
            <span class="mt-4 text-[10px] text-gray-600 font-mono tracking-widest animate-pulse">HOVER_TO_DECRYPT</span>
          </div>

          <div class="absolute inset-0 bg-gray-900 border border-pink-500/50 rounded-xl p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col overflow-hidden">

            <button (click)="$event.stopPropagation(); deleteNote(note.id)" class="absolute top-4 right-4 text-gray-500 hover:text-pink-500 hover:shadow-[0_0_10px_rgba(236,72,153,0.5)] z-20 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            <h3 class="text-lg font-bold text-gray-100 mb-2 pr-6 tracking-wide truncate border-b border-gray-800 pb-2">{{ note.title }}</h3>
            <p class="text-gray-400 whitespace-pre-wrap leading-relaxed font-mono text-xs line-clamp-6 flex-grow pt-2">{{ note.content }}</p>

            <div class="absolute bottom-4 right-4 flex gap-2 z-20">
              <button (click)="$event.stopPropagation(); exportMarkdown(note.id!)" class="text-[9px] font-bold font-mono bg-gray-800 hover:bg-gray-700 text-gray-300 py-1.5 px-2 rounded border border-gray-600 transition-colors uppercase">.MD</button>
              <button (click)="$event.stopPropagation(); exportWord(note.id!)" class="text-[9px] font-bold font-mono bg-blue-900/40 hover:bg-blue-800/60 text-blue-400 py-1.5 px-2 rounded border border-blue-700/50 transition-colors uppercase">.DOC</button>
              <button (click)="$event.stopPropagation(); exportPDF(note.id!)" class="text-[9px] font-bold font-mono bg-red-900/40 hover:bg-red-800/60 text-red-400 py-1.5 px-2 rounded border border-red-700/50 transition-colors uppercase">.PDF</button>
            </div>
          </div>

        </div>
      </div>

      <div *ngIf="notes.length === 0" class="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 font-mono text-violet-400 bg-gray-900/50 rounded-xl border border-dashed border-violet-500/30 shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]">
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
