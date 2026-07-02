export interface DailyEarningPlanning {
  id: number | null;
  date: string;
  day: number;
  plannedIncome: number;
  plannedExpense: number;
  balance: number;
}

export interface MonthlyEarningPlanningResponse {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
  filledDays: number;
  averageDailyIncome: number;
  days: DailyEarningPlanning[];
}

export interface UpsertMonthlyEarningPlanningRequest {
  year: number;
  month: number;
  days: Array<Pick<DailyEarningPlanning, "day" | "date" | "plannedIncome" | "plannedExpense">>;
}

