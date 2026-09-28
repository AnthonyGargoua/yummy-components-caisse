import { Component, inject } from '@angular/core';
import { EurosPipe } from '../shared/euros-pipe';
import { NoteService } from '../services/note.service';

@Component({
  imports: [EurosPipe],
  selector: 'app-note-panel',
  styleUrl: './note-panel.css',
  templateUrl: './note-panel.html',
})
export class NotePanel {
  protected readonly note = inject(NoteService);
}
