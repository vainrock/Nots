import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NoteService, Note } from './services/note';
import { marked } from 'marked';

@Component({
  selector: 'app-view-note',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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


    @keyframes cinematicFold {
      0% { transform: rotateY(0deg) scale(1); opacity: 1; border-color: rgba(139, 92, 246, 0.3); }

      100% { transform: rotateY(180deg) scale(0.8); opacity: 1; border-color: #ec4899; }
    }
    .unfold-3d {
      animation: cinematicUnfold 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      transform-style: preserve-3d;
    }


    /* --- THE UN-FOLD ENGINE (Opening) --- */
    @keyframes cinematicUnfold {
      /* FIXED: Opacity forced to 1 so the View Transition sees a solid box! */
      0% { transform: rotateY(-180deg) scale(0.8); opacity: 1; border-color: #ec4899; }
      100% { transform: rotateY(0deg) scale(1); opacity: 1; border-color: rgba(139, 92, 246, 0.3); }
    }
    .fold-3d {
      animation: cinematicFold 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      transform-style: preserve-3d;
    }


    @keyframes decryptReveal {
      0% { opacity: 0; transform: translateY(15px); filter: blur(8px); }
      100% { opacity: 1; transform: translateY(0); filter: blur(0); }
    }
    .glitch-sequence {
      opacity: 0;
      animation: decryptReveal 0.6s ease-out forwards;
    }
    .seq-1 { animation-delay: 0.3s; }
    .seq-2 { animation-delay: 0.4s; }
    .seq-3 { animation-delay: 0.5s; }
  `],
  template: `
    <div *ngIf="note"
         [style.view-transition-name]="'note-card-' + note.id"
         class="w-full min-h-[90vh] mx-auto mt-4 [perspective:2500px] flex">

      <div [ngClass]="isClosing ? 'fold-3d' : 'unfold-3d'"
           class="bg-gray-900 p-8 md:p-12 rounded-2xl border w-full flex-grow shadow-[0_0_50px_rgba(139,92,246,0.15)] relative overflow-hidden flex flex-col">

        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMTM5LCA5MiwgMjQ2LCAwLjEpIi8+PC9zdmc+')] opacity-50 pointer-events-none"></div>

        <div class="relative z-10 flex flex-col flex-grow">

          <div class="glitch-sequence seq-1 flex justify-between items-start mb-8">
            <h2 class="text-3xl font-black uppercase tracking-widest text-violet-400 flex items-center gap-4">
              <span class="w-4 h-4 bg-violet-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.8)]"></span>
              Edit_Record // ID: {{ note.id }}
            </h2>

            <div class="flex gap-3">
              <button (click)="exportMarkdown()" title="Export as Markdown" class="text-sm font-bold font-mono bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 px-4 rounded-md border border-gray-600 transition-colors uppercase tracking-widest shadow-[0_0_10px_rgba(0,0,0,0.5)]">.MD</button>
              <button (click)="exportWord()" title="Export as Word Document" class="text-sm font-bold font-mono bg-blue-900/40 hover:bg-blue-800/60 text-blue-400 py-2.5 px-4 rounded-md border border-blue-700/50 transition-colors uppercase tracking-widest shadow-[0_0_10px_rgba(0,0,0,0.5)]">.DOC</button>
              <button (click)="exportPDF()" title="Export as PDF" class="text-sm font-bold font-mono bg-red-900/40 hover:bg-red-800/60 text-red-400 py-2.5 px-4 rounded-md border border-red-700/50 transition-colors uppercase tracking-widest shadow-[0_0_10px_rgba(0,0,0,0.5)]">.PDF</button>
            </div>
          </div>

          <input type="text" [(ngModel)]="note.title"
                 class="glitch-sequence seq-2 w-full text-2xl font-mono mb-6 p-5 bg-gray-950 border border-gray-800 text-violet-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">

          <div class="glitch-sequence seq-3 flex flex-col flex-grow">
            <div class="flex gap-4 mb-3 px-2">
              <button (click)="isPreview = false"
                      [class.text-violet-400]="!isPreview" [class.text-gray-600]="isPreview"
                      class="font-mono text-base uppercase tracking-widest font-bold hover:text-violet-300 transition-colors">
                Raw_Input
              </button>
              <span class="text-gray-700">|</span>
              <button (click)="isPreview = true"
                      [class.text-pink-400]="isPreview" [class.text-gray-600]="!isPreview"
                      class="font-mono text-base uppercase tracking-widest font-bold hover:text-pink-300 transition-colors">
                Render_MD
              </button>
            </div>

            <textarea *ngIf="!isPreview" [(ngModel)]="note.content"
                      class="w-full flex-grow resize-none p-6 font-mono text-lg text-gray-300 bg-gray-950 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all mb-8 border border-gray-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"></textarea>

            <div *ngIf="isPreview"
                 class="markdown-preview w-full flex-grow p-6 text-gray-300 bg-gray-950 rounded-lg border border-gray-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] mb-8 overflow-y-auto"
                 [innerHTML]="parsedMarkdown">
            </div>

            <div class="flex justify-end gap-6 items-center border-t border-gray-800 pt-8 mt-auto">
              <button (click)="goBack()" class="text-gray-500 hover:text-pink-400 font-mono text-base py-3 px-6 transition-all uppercase tracking-wider">Back_to_Core</button>

              <button (click)="saveChanges()"
                      class="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold py-4 px-10 rounded-lg transition-all shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] uppercase tracking-widest text-base transform hover:-translate-y-0.5 border border-violet-400/50">
                Commit_Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="!note" class="text-center font-mono text-pink-500 mt-32 text-xl animate-pulse">
      > DECRYPTING_FILE...
    </div>
  `
})
export class ViewNoteComponent implements OnInit {
  note: Note | null = null;
  isPreview = false;
  isClosing = false; // <-- The master trigger for the fold animation

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

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      this.saveChanges();
    }
  }

  // INTERCEPTOR 1: Play animation, wait, then fly back to gallery
  // INTERCEPTOR 1
  goBack() {
    this.isClosing = true;
    setTimeout(() => {
      this.router.navigate(['/gallery']);
    }, 450); // <-- Catch it mid-flip!
  }

  // INTERCEPTOR 2
  saveChanges() {
    if (this.note && this.note.id) {
      this.noteService.updateNote(this.note.id, this.note).subscribe(() => {
        this.isClosing = true;
        setTimeout(() => {
          this.router.navigate(['/gallery']);
        }, 450); // <-- Catch it mid-flip!
      });
    }
  }

  get parsedMarkdown() {
    if (!this.note || !this.note.content) return '';
    return marked.parse(this.note.content) as string;
  }

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
