import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, ProcessedFile } from '../../services/api.service';

@Component({
  selector: 'app-processed-files',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './processed-files.component.html',
  styleUrls: ['./processed-files.component.css']
})
export class ProcessedFilesComponent implements OnInit {
  files: ProcessedFile[] = [];
  loading = false;
  error = '';

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
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load processed files: ' + err.message;
        this.loading = false;
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }
}
