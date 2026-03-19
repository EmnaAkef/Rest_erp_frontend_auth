import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-title',
  imports: [],
  templateUrl: './section-title.html',
  styleUrl: './section-title.css'
})
export class SectionTitleComponent {
  @Input() title = '';
  @Input() subtitle = '';
}