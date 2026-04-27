import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [],
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.css',
})
export class KpiCardComponent {
  @Input() title = '';
  @Input() value = '';
  @Input() trend = '';
  @Input() icon = 'payments';
  @Input() trendType: 'positive' | 'negative' | 'neutral' = 'positive';
}