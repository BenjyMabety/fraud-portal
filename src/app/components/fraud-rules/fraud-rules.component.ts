import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, FraudRule } from '../../services/api.service';

@Component({
  selector: 'app-fraud-rules',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fraud-rules.component.html',
  styleUrls: ['./fraud-rules.component.css']
})
export class FraudRulesComponent implements OnInit {
  rules: FraudRule[] = [];
  paginatedRules: FraudRule[] = [];
  loading = false;
  error = '';
  successMessage = '';
  showForm = false;
  editingRuleId: number | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  formData = {
    ruleName: '',
    fieldName: '',
    operator: '',
    thresholdValue: '',
    isActive: true
  };

  fieldOptions = [
    'Amount',
    'TransactionCount',
    'AccountAge',
    'MerchantCategory',
    'AccountBalance',
    'LocationChange'
  ];

  operatorOptions = [
    '>',
    '<',
    '>=',
    '<=',
    '==',
    '!=',
    'CONTAINS',
    'NOT_CONTAINS'
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadRules();
  }

  loadRules(): void {
    this.loading = true;
    this.error = '';
    this.successMessage = '';

    this.apiService.getFraudRules().subscribe({
      next: (data) => {
        this.rules = data;
        this.updatePagination();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load fraud rules: ' + err.message;
        this.loading = false;
      }
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.rules.length / this.pageSize);
    if (this.totalPages === 0) this.totalPages = 1;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedRules = this.rules.slice(startIndex, endIndex);
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

  openCreateForm(): void {
    this.editingRuleId = null;
    this.formData = {
      ruleName: '',
      fieldName: '',
      operator: '',
      thresholdValue: '',
      isActive: true
    };
    this.showForm = true;
    this.error = '';
  }

  openEditForm(rule: FraudRule): void {
    this.editingRuleId = rule.ruleId;
    this.formData = {
      ruleName: rule.ruleName,
      fieldName: rule.fieldName,
      operator: rule.operator,
      thresholdValue: rule.thresholdValue,
      isActive: rule.isActive
    };
    this.showForm = true;
    this.error = '';
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingRuleId = null;
    this.formData = {
      ruleName: '',
      fieldName: '',
      operator: '',
      thresholdValue: '',
      isActive: true
    };
  }

  submitForm(): void {
    if (!this.formData.ruleName || !this.formData.fieldName || !this.formData.operator || !this.formData.thresholdValue) {
      this.error = 'All fields are required';
      return;
    }

    this.loading = true;
    this.error = '';

    if (this.editingRuleId) {
      // Update rule
      this.apiService.updateFraudRule(this.editingRuleId, {
        ruleName: this.formData.ruleName,
        fieldName: this.formData.fieldName,
        operator: this.formData.operator,
        thresholdValue: this.formData.thresholdValue,
        isActive: this.formData.isActive
      }).subscribe({
        next: () => {
          this.successMessage = 'Fraud rule updated successfully';
          this.showForm = false;
          this.loadRules();
        },
        error: (err) => {
          this.error = 'Failed to update rule: ' + err.message;
          this.loading = false;
        }
      });
    } else {
      // Create rule
      this.apiService.createFraudRule({
        ruleName: this.formData.ruleName,
        fieldName: this.formData.fieldName,
        operator: this.formData.operator,
        thresholdValue: this.formData.thresholdValue,
        isActive: this.formData.isActive
      }).subscribe({
        next: () => {
          this.successMessage = 'Fraud rule created successfully';
          this.showForm = false;
          this.loadRules();
        },
        error: (err) => {
          this.error = 'Failed to create rule: ' + err.message;
          this.loading = false;
        }
      });
    }
  }

  deleteRule(ruleId: number): void {
    if (confirm('Are you sure you want to delete this rule?')) {
      this.loading = true;
      this.error = '';

      this.apiService.deleteFraudRule(ruleId).subscribe({
        next: () => {
          this.successMessage = 'Fraud rule deleted successfully';
          this.loadRules();
        },
        error: (err) => {
          this.error = 'Failed to delete rule: ' + err.message;
          this.loading = false;
        }
      });
    }
  }

  toggleRuleStatus(rule: FraudRule): void {
    this.loading = true;
    this.error = '';

    this.apiService.updateFraudRule(rule.ruleId, {
      ruleName: rule.ruleName,
      fieldName: rule.fieldName,
      operator: rule.operator,
      thresholdValue: rule.thresholdValue,
      isActive: !rule.isActive
    }).subscribe({
      next: () => {
        this.successMessage = `Rule ${!rule.isActive ? 'activated' : 'deactivated'} successfully`;
        this.loadRules();
      },
      error: (err) => {
        this.error = 'Failed to update rule status: ' + err.message;
        this.loading = false;
      }
    });
  }
}
