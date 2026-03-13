import { Component, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NoteService, Note } from './services/note';

// Declaring the native browser API so TypeScript doesn't panic
declare var webkitSpeechRecognition: any;

@Component({
  selector: 'app-create-note',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styles: [`
    @keyframes cinematicUnfold {
      0% { transform: rotateY(-180deg) scale(0.8); }
      100% { transform: rotateY(0deg) scale(1); }
    }
    .unfold-3d {
      animation: cinematicUnfold 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      transform-style: preserve-3d;
    }

    @keyframes cinematicFold {
      0% { transform: rotateY(0deg) scale(1); }
      100% { transform: rotateY(180deg) scale(0.8); }
    }
    .fold-3d {
      animation: cinematicFold 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      transform-style: preserve-3d;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .ai-panel { animation: slideDown 0.3s ease-out forwards; }
  `],
  template: `
    <div class="w-full h-[90vh] mx-auto mt-4 [perspective:2500px] flex">
      <div [class.fold-3d]="isClosing" [class.unfold-3d]="!isClosing"
           class="relative w-full h-full [transform-style:preserve-3d]">

        <div class="absolute inset-0 bg-gray-900 rounded-2xl border border-violet-500/30 flex flex-col items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-[0_0_50px_rgba(139,92,246,0.15)] overflow-hidden">
          <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMTM5LCA5MiwgMjQ2LCAwLjEpIi8+PC9zdmc+')] opacity-50 pointer-events-none"></div>
          <div class="w-24 h-24 border border-violet-500/50 rounded-full flex flex-col items-center justify-center mb-6 z-10">
            <span class="text-violet-400 font-mono text-sm tracking-widest uppercase opacity-70">Sector</span>
            <span class="text-violet-300 font-black text-2xl font-mono">NEW</span>
          </div>
          <h3 class="font-mono text-gray-500 text-lg tracking-[0.3em] uppercase text-center border-b border-gray-800 pb-2 z-10">Injecting_Data</h3>
        </div>

        <div class="absolute inset-0 bg-gray-900 p-8 md:p-12 rounded-2xl border border-violet-500/30 flex flex-col [backface-visibility:hidden] shadow-[0_0_50px_rgba(139,92,246,0.15)] overflow-y-auto">
          <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMTM5LCA5MiwgMjQ2LCAwLjEpIi8+PC9zdmc+')] opacity-50 pointer-events-none"></div>

          <div class="relative z-10 flex flex-col flex-grow min-h-full">
            <div class="flex justify-between items-start mb-8">
              <h2 class="text-3xl font-black uppercase tracking-widest text-violet-400 flex items-center gap-4">
                <span class="w-4 h-4 bg-violet-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.8)]"></span>
                Initialize_Record
              </h2>

              <button (click)="toggleAi()"
                      [class.text-pink-500]="showAi" [class.border-pink-500]="showAi"
                      [class.text-gray-500]="!showAi" [class.border-gray-700]="!showAi"
                      class="font-mono text-xs font-bold uppercase tracking-widest py-2 px-4 rounded border transition-all hover:text-pink-400 hover:border-pink-400 flex items-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <span *ngIf="isGenerating" class="w-2 h-2 bg-pink-500 rounded-full animate-ping"></span>
                [ Neural_Link ]
              </button>
            </div>

            <div *ngIf="showAi" class="ai-panel mb-6 p-5 rounded-lg border border-pink-500/30 bg-pink-950/10 shadow-[inset_0_0_20px_rgba(236,72,153,0.05)] flex flex-col">
              <label class="block text-pink-400 font-mono text-xs uppercase tracking-widest mb-2">Raw_Transcript_Feed:</label>

              <div class="flex gap-4 items-stretch">
                <textarea [(ngModel)]="aiKeywords" placeholder="Type context or activate Dictaphone..." [disabled]="isGenerating" rows="3"
                          class="flex-grow font-mono p-3 bg-gray-950 border border-gray-800 text-pink-100 focus:border-pink-500 focus:outline-none transition-all rounded shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] disabled:opacity-50 resize-y"></textarea>

                <div class="flex flex-col gap-2">
                  <button (click)="toggleDictaphone()" [disabled]="isGenerating"
                          [class.bg-red-600]="isRecording" [class.text-white]="isRecording" [class.border-red-400]="isRecording" [class.animate-pulse]="isRecording"
                          [class.bg-gray-800]="!isRecording" [class.text-gray-400]="!isRecording" [class.border-gray-700]="!isRecording"
                          class="flex-grow flex items-center justify-center border font-bold font-mono px-4 rounded transition-all uppercase tracking-widest text-xs shadow-[0_0_10px_rgba(0,0,0,0.5)] disabled:opacity-50">
                    <svg *ngIf="!isRecording" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    <span *ngIf="isRecording" class="w-2 h-2 bg-white rounded-full mr-2"></span>
                    {{ isRecording ? 'Listening...' : 'Mic' }}
                  </button>

                  <button (click)="generateAiNote()" [disabled]="isGenerating || !aiKeywords.trim() || isRecording"
                          class="bg-pink-600/20 hover:bg-pink-600/40 text-pink-400 border border-pink-500/50 font-bold font-mono py-2 px-6 rounded transition-all uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ isGenerating ? 'Syncing...' : 'Execute' }}
                  </button>
                </div>
              </div>
            </div>

            <input type="text" [(ngModel)]="note.title" placeholder="ENTER_TITLE..."
                   class="w-full text-2xl font-mono mb-6 p-5 bg-gray-950 border border-gray-800 text-violet-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">

            <textarea [(ngModel)]="note.content" placeholder="Awaiting manual input or AI synthesis..."
                      class="w-full flex-grow resize-none p-6 font-mono text-lg text-gray-300 bg-gray-950 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all mb-8 border border-gray-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"></textarea>

            <div class="flex justify-end gap-6 items-center border-t border-gray-800 pt-8 mt-auto">
              <button (click)="goBack()" class="text-gray-500 hover:text-pink-400 font-mono text-base py-3 px-6 transition-all uppercase tracking-wider">Abort</button>
              <button (click)="createNote()"
                      class="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold py-4 px-10 rounded-lg transition-all shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] uppercase tracking-widest text-base transform hover:-translate-y-0.5 border border-violet-400/50">
                Commit_Record
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class CreateNoteComponent {
  note: Note = { title: '', content: '' };
  isClosing = false;

  showAi = false;
  aiKeywords = '';
  isGenerating = false;

  // DICTAPHONE STATE
  isRecording = false;
  recognitionRef: any;

  // Added ChangeDetectorRef to force UI updates when the microphone hears something
  constructor(private noteService: NoteService, private router: Router, private cdr: ChangeDetectorRef) {}

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      this.createNote();
    }
  }

  toggleAi() {
    this.showAi = !this.showAi;
  }

  // --- DICTAPHONE LOGIC ---
  toggleDictaphone() {
    if (this.isRecording) {
      this.recognitionRef?.stop();
      return;
    }

    if (!('webkitSpeechRecognition' in window)) {
      alert('Your browser does not support the Neural Dictaphone. Please use Chrome or Edge.');
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      this.isRecording = true;
      this.cdr.detectChanges();
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }

      if (finalTranscript) {
        // Append the new words to the transcript box
        this.aiKeywords += finalTranscript;
        this.cdr.detectChanges();
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Microphone error:', event);
      this.isRecording = false;
      this.cdr.detectChanges();
    };

    recognition.onend = () => {
      this.isRecording = false;
      this.cdr.detectChanges();
    };

    recognition.start();
    this.recognitionRef = recognition;
  }

  generateAiNote() {
    if (!this.aiKeywords.trim()) return;

    this.isGenerating = true;

    if (!this.note.title.trim()) {
      // Auto-title formatted for Russian logs
      const date = new Date();
      this.note.title = `ОТЧЕТ_${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`;
    }

    this.noteService.generateFromAi(this.aiKeywords).subscribe({
      next: (response) => {
        this.note.content = response.generatedContent;
        this.isGenerating = false;
        this.aiKeywords = '';
        this.showAi = false;
      },
      error: (err) => {
        alert('NEURAL LINK FAILED: ' + err.message);
        this.isGenerating = false;
      }
    });
  }

  goBack() {
    this.isClosing = true;
    setTimeout(() => {
      this.router.navigate(['/gallery']);
    }, 450);
  }

  createNote() {
    if (!this.note.title.trim() && !this.note.content.trim()) return;

    this.noteService.createNote(this.note).subscribe(() => {
      this.isClosing = true;
      setTimeout(() => {
        this.router.navigate(['/gallery']);
      }, 450);
    });
  }
}
