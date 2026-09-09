import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ProcessedFile } from '../../services/api.service';

@Component({
  selector: 'app-processed-files',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './processed-files.component.html',
  styleUrls: ['./processed-files.component.css']
})
export class ProcessedFilesComponent implements OnInit {
  files: ProcessedFile[] = [];
  filteredFiles: ProcessedFile[] = [];
  paginatedFiles: ProcessedFile[] = [];
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
    this.loadFiles();
  }

  loadFiles(): void {
    this.loading = true;
    this.error = '';

    this.apiService.getProcessedFiles().subscribe({
      next: (data) => {
        this.files = data;
        this.applyFiltersAndSort();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load processed files: ' + err.message;
        this.loading = false;
      }
    });
  }

  applyFiltersAndSort(): void {
    // Filter by date range
    let filtered = this.files.filter(file => {
      const ingestedDate = new Date(file.ingestedAt);

      if (this.fromDate) {
        const fromDate = new Date(this.fromDate);
        if (ingestedDate < fromDate) return false;
      }

      if (this.toDate) {
        const toDate = new Date(this.toDate);
        toDate.setHours(23, 59, 59, 999);
        if (ingestedDate > toDate) return false;
      }

      return true;
    });

    // Sort by Ingested Date descending
    filtered.sort((a, b) => {
      return new Date(b.ingestedAt).getTime() - new Date(a.ingestedAt).getTime();
    });

    this.filteredFiles = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredFiles.length / this.pageSize);
    if (this.totalPages === 0) this.totalPages = 1;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedFiles = this.filteredFiles.slice(startIndex, endIndex);
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

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }
}
