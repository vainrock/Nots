import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NoteService, Note } from './services/note';
import { marked } from 'marked'; // <-- The Markdown Engine

@Component({
  selector: 'app-view-note',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  // We inject custom CSS here so Tailwind doesn't strip our Markdown styles!
  styles: [`
    ::ng-deep .markdown-preview h1 { font-size: 2.2em; font-weight: 900; margin-bottom: 0.5em; color: #f3f4f6; letter-spacing: -0.025em; }
    ::ng-deep .markdown-preview h2 { font-size: 1.8em; font-weight: 800; margin-bottom: 0.5em; color: #f3f4f6; border-bottom: 1px solid #374151; padding-bottom: 0.2em; }
    ::ng-deep .markdown-preview h3 { font-size: 1.4em; font-weight: 700; margin-bottom: 0.5em; color: #d1d5db; }
    ::ng-deep .markdown-preview p { margin-bottom: 1.2em; line-height: 1.7; }
    ::ng-deep .markdown-preview ul { list-style-type: disc; margin-left: 1.5em; margin-bottom: 1.2em; color: #d1d5db; }
    ::ng-deep .markdown-preview ol { list-style-type: decimal; margin-left: 1.5em; margin-bottom: 1.2em; color: #d1d5db; }
    ::ng-deep .markdown-preview li { margin-bottom: 0.3em; }
    ::ng-deep .markdown-preview a { color: #8b5cf6; text-decoration: none; font-weight: 600; transition: color 0.2s; }
    ::ng-deep .markdown-preview a:hover { color: #ec4899; text-decoration: underline; }
    ::ng-deep .markdown-preview blockquote { border-left: 4px solid #8b5cf6; padding-left: 1em; margin-left: 0; color: #9ca3af; font-style: italic; background: rgba(139, 92, 246, 0.05); padding-top: 0.5em; padding-bottom: 0.5em; border-radius: 0 8px 8px 0; }
    ::ng-deep .markdown-preview code { background-color: #1f2937; padding: 0.2em 0.4em; border-radius: 4px; font-family: monospace; color: #ec4899; font-size: 0.9em; }
    ::ng-deep .markdown-preview pre { background-color: #111827; padding: 1.2em; border-radius: 8px; overflow-x: auto; margin-bottom: 1.2em; border: 1px solid #374151; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5); }
    ::ng-deep .markdown-preview pre code { background-color: transparent; padding: 0; color: #a78bfa; border-radius: 0; }
  `],
  template: `
    <div *ngIf="note" class="bg-gray-900 p-8 rounded-xl border border-violet-500/30 max-w-2xl mx-auto mt-6 shadow-[0_0_30px_rgba(139,92,246,0.15)] relative overflow-hidden">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMTM5LCA5MiwgMjQ2LCAwLjEpIi8+PC9zdmc+')] opacity-50 pointer-events-none"></div>
      <div *ngIf="note"
           [style.view-transition-name]="'note-card-' + note.id" class="bg-gray-900 p-8 rounded-xl border border-violet-500/30 max-w-2xl mx-auto mt-6 ...">
      <div class="relative z-10">
        <div class="flex justify-between items-start mb-8">
          <h2 class="text-2xl font-black uppercase tracking-widest text-violet-400 flex items-center gap-3">
            <span class="w-3 h-3 bg-violet-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.8)]"></span>
            Edit_Record // ID: {{ note.id }}
          </h2>

          <div class="flex gap-2">
            <button (click)="exportMarkdown()" title="Export as Markdown" class="text-xs font-bold font-mono bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 px-3 rounded-md border border-gray-600 transition-colors uppercase tracking-widest shadow-[0_0_10px_rgba(0,0,0,0.5)]">.MD</button>
            <button (click)="exportWord()" title="Export as Word Document" class="text-xs font-bold font-mono bg-blue-900/40 hover:bg-blue-800/60 text-blue-400 py-2 px-3 rounded-md border border-blue-700/50 transition-colors uppercase tracking-widest shadow-[0_0_10px_rgba(0,0,0,0.5)]">.DOC</button>
            <button (click)="exportPDF()" title="Export as PDF" class="text-xs font-bold font-mono bg-red-900/40 hover:bg-red-800/60 text-red-400 py-2 px-3 rounded-md border border-red-700/50 transition-colors uppercase tracking-widest shadow-[0_0_10px_rgba(0,0,0,0.5)]">.PDF</button>
          </div>
        </div>

        <input type="text" [(ngModel)]="note.title"
               class="w-full text-xl font-mono mb-6 p-4 bg-gray-950 border border-gray-800 text-violet-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">

        <div class="flex gap-3 mb-2 px-1">
          <button (click)="isPreview = false"
                  [class.text-violet-400]="!isPreview" [class.text-gray-600]="isPreview"
                  class="font-mono text-sm uppercase tracking-widest font-bold hover:text-violet-300 transition-colors">
            Raw_Input
          </button>
          <span class="text-gray-700">|</span>
          <button (click)="isPreview = true"
                  [class.text-pink-400]="isPreview" [class.text-gray-600]="!isPreview"
                  class="font-mono text-sm uppercase tracking-widest font-bold hover:text-pink-300 transition-colors">
            Render_MD
          </button>
        </div>

        <textarea *ngIf="!isPreview" [(ngModel)]="note.content" rows="12"
                  class="w-full resize-y p-4 font-mono text-gray-300 bg-gray-950 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all mb-8 border border-gray-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"></textarea>

        <div *ngIf="isPreview"
             class="markdown-preview w-full p-4 text-gray-300 bg-gray-950 rounded-lg border border-gray-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] min-h-[17.5rem] mb-8 overflow-y-auto"
             [innerHTML]="parsedMarkdown">
        </div>

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
  isPreview = false; // <-- Tracks if we are looking at raw text or markdown

  constructor(
    private route: ActivatedRoute,
    private noteService: NoteService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);

      this.noteService.getNote(id).subscribe({
        next: (data: Note) => {
          this.note = data;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          alert('FAILED TO DECRYPT URL / API ERROR: ' + err.message);
          console.error(err);
        }
      });
    }
  }

  saveChanges() {
    if (this.note && this.note.id) {
      this.noteService.updateNote(this.note.id, this.note).subscribe(() => {
        this.router.navigate(['/gallery']);
      });
    }
  }

  // --- MARKDOWN GETTER ---
  // This automatically translates your raw string into safe HTML whenever you click 'Render_MD'
  get parsedMarkdown() {
    if (!this.note || !this.note.content) return '';
    return marked.parse(this.note.content) as string;
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

  exportMarkdown() {
    if (!this.note?.id) return;
    this.noteService.exportMd(this.note.id).subscribe({
      next: (blob: Blob) => this.downloadFromServer(blob, `${this.note!.title}.md`),
      error: (err: any) => alert('Server failed to generate Markdown.')
    });
  }

  exportWord() {
    if (!this.note?.id) return;
    this.noteService.exportDoc(this.note.id).subscribe({
      next: (blob: Blob) => this.downloadFromServer(blob, `${this.note!.title}.doc`),
      error: (err: any) => alert('Server failed to generate Word document.')
    });
  }

  exportPDF() {
    if (!this.note?.id) return;
    this.noteService.exportPdf(this.note.id).subscribe({
      next: (blob: Blob) => this.downloadFromServer(blob, `${this.note!.title}.pdf`),
      error: (err: any) => alert('Server failed to generate PDF.')
    });
  }
}
