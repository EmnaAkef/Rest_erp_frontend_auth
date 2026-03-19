import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chart-card',
  imports: [],
  templateUrl: './chart-card.html',
  styleUrl: './chart-card.css'
})
export class ChartCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() height = '320px';
}