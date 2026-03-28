import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  imports: [],
  templateUrl: './kpi-card.html',
  standalone: true,
  styleUrl: './kpi-card.css',
})
export class KpiCardComponent {
  @Input() title = '';
  @Input() value = '';
  @Input() trend = '';
  @Input() icon = '●';
  @Input() trendType: 'positive' | 'negative' | 'neutral' = 'positive';
}
