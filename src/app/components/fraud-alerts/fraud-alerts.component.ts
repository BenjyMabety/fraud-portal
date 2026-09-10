import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, FraudAlert } from '../../services/api.service';

@Component({
  selector: 'app-fraud-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fraud-alerts.component.html',
  styleUrls: ['./fraud-alerts.component.css']
})
export class FraudAlertsComponent implements OnInit {
  alerts: FraudAlert[] = [];
  filteredAlerts: FraudAlert[] = [];
  paginatedAlerts: FraudAlert[] = [];
  loading = false;
  error = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  // Filters
  fromDate = '';
  toDate = '';

  // Make Math available in template
  Math = Math;

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
        this.applyFiltersAndSort();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load fraud alerts: ' + err.message;
        this.loading = false;
      }
    });
  }

  applyFiltersAndSort(): void {
    // Filter by date range
    let filtered = this.alerts.filter(alert => {
      const triggeredDate = new Date(alert.triggeredAt);

      if (this.fromDate) {
        const fromDate = new Date(this.fromDate);
        if (triggeredDate < fromDate) return false;
      }

      if (this.toDate) {
        const toDate = new Date(this.toDate);
        toDate.setHours(23, 59, 59, 999);
        if (triggeredDate > toDate) return false;
      }

      return true;
    });

    // Sort by Triggered Date descending
    filtered.sort((a, b) => {
      return new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime();
    });

    this.filteredAlerts = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredAlerts.length / this.pageSize);
    if (this.totalPages === 0) this.totalPages = 1;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedAlerts = this.filteredAlerts.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  onFilterChange(): void {
    this.applyFiltersAndSort();
  }

  refreshAlerts(): void {
    this.loadAlerts();
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
