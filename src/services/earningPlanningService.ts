import api from "./api";
import type {
  MonthlyEarningPlanningResponse,
  UpsertMonthlyEarningPlanningRequest,
} from "@/types/earningPlanning";

export const earningPlanningService = {
  getMonth: (year: number, month: number) =>
    api.get<MonthlyEarningPlanningResponse>("/earning-planning/month", {
      params: { year, month },
    }),

  saveMonth: (payload: UpsertMonthlyEarningPlanningRequest) =>
    api.post<MonthlyEarningPlanningResponse>("/earning-planning/month", payload),

  deleteMonth: (year: number, month: number) =>
    api.delete("/earning-planning/month", { params: { year, month } }),
};

