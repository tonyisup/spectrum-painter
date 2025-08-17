import { type Chart, type InsertChart } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getChart(id: string): Promise<Chart | undefined>;
  createChart(chart: InsertChart): Promise<Chart>;
  updateChart(id: string, chart: Partial<InsertChart>): Promise<Chart | undefined>;
  deleteChart(id: string): Promise<boolean>;
  getAllCharts(): Promise<Chart[]>;
}

export class MemStorage implements IStorage {
  private charts: Map<string, Chart>;

  constructor() {
    this.charts = new Map();
  }

  async getChart(id: string): Promise<Chart | undefined> {
    return this.charts.get(id);
  }

  async createChart(insertChart: InsertChart): Promise<Chart> {
    const id = randomUUID();
    const chart: Chart = { ...insertChart, id };
    this.charts.set(id, chart);
    return chart;
  }

  async updateChart(id: string, updates: Partial<InsertChart>): Promise<Chart | undefined> {
    const existingChart = this.charts.get(id);
    if (!existingChart) return undefined;
    
    const updatedChart: Chart = { ...existingChart, ...updates };
    this.charts.set(id, updatedChart);
    return updatedChart;
  }

  async deleteChart(id: string): Promise<boolean> {
    return this.charts.delete(id);
  }

  async getAllCharts(): Promise<Chart[]> {
    return Array.from(this.charts.values());
  }
}

export const storage = new MemStorage();
