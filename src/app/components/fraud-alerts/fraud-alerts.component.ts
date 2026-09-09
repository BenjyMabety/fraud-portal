import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, FraudAlert } from '../../services/api.service';

@Component({
  selector: 'app-fraud-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fraud-alerts.component.html',
  styleUrls: ['./fraud-alerts.component.css']
})
export class FraudAlertsComponent implements OnInit {
  alerts: FraudAlert[] = [];
  loading = false;
  error = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.loading = true;
    this.error = '';

    this.apiService.getFraudAlerts().subscribe({
      next: (data) => {
        this.alerts = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load fraud alerts: ' + err.message;
        this.loading = false;
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  }
}
