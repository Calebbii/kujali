import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { cloneDeep as ___cloneDeep, flatMap as __flatMap } from 'lodash';
import { Observable, combineLatest, map } from 'rxjs';

import { Logger } from '@iote/bricks-angular';

import {
  Budget,
  BudgetRecord,
  BudgetStatus,
  OrgBudgetsOverview
} from '@app/model/finance/planning/budgets';

import {
  BudgetsStore,
  OrgBudgetsStore
} from '@app/state/finance/budgetting/budgets';

import { CreateBudgetModalComponent } from '../../components/create-budget-modal/create-budget-modal.component';

@Component({
  selector: 'app-select-budget',
  templateUrl: './select-budget.component.html',
  styleUrls: [
    './select-budget.component.scss',
    '../../components/budget-view-styles.scss'
  ],
})
/** List of all active budgets on the system. */
export class SelectBudgetPageComponent implements OnInit
{
  /** Replace constructor with inject() API */
  private _orgBudgets$$ = inject(OrgBudgetsStore);
  private _budgets$$ = inject(BudgetsStore);
  private _dialog = inject(MatDialog);
  private _logger = inject(Logger);

  /** Overview which contains all budgets of an organisation */
  overview$!: Observable<OrgBudgetsOverview>;
  sharedBudgets$: Observable<any[]>;

  showFilter = false;

  allBudgets$: Observable<{ overview: BudgetRecord[], budgets: any[] }>;

  ngOnInit() {
    this.overview$ = this._orgBudgets$$.get();
    this.sharedBudgets$ = this._budgets$$.get();

    this.allBudgets$ = combineLatest([
      this.overview$,
      this._budgets$$.get()
    ]).pipe(
      map(([overview, budgets]) => ({
        overview: __flatMap(overview),
        budgets: __flatMap(budgets)
      })),
      map((overview) => {
        const trBudgets = overview.budgets.map((budget: any) => {
          budget['endYear'] = budget.startYear + budget.duration - 1;
          return budget;
        });
        return { overview: overview.overview, budgets: trBudgets };
      })
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
  }

  fieldsFilter(value: (Invoice) => boolean) {}

  toogleFilter(value) {}

  openDialog(parent: Budget | false): void {
    const dialog = this._dialog.open(CreateBudgetModalComponent, {
      height: 'fit-content',
      width: '600px',
      data: parent != null ? parent : false
    });

    dialog.afterClosed().subscribe(() => {});
  }

  canPromote(record: BudgetRecord) {
    return (record.budget as any).canBeActivated;
  }

  setActive(record: BudgetRecord) {
    const toSave = ___cloneDeep(record.budget);

    delete (toSave as any).canBeActivated;
    delete (toSave as any).access;

    toSave.status = BudgetStatus.InUse;

    (record as any).updating = true;

    this._budgets$$.update(toSave).subscribe(() => {
      (record as any).updating = false;
      this._logger.log(() => `Updated Budget with id ${toSave.id}. Set as an active budget for this org.`);
    });
  }
}