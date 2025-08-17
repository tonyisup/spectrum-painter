import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChartSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all charts
  app.get("/api/charts", async (req, res) => {
    try {
      const charts = await storage.getAllCharts();
      res.json(charts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch charts" });
    }
  });

  // Get single chart
  app.get("/api/charts/:id", async (req, res) => {
    try {
      const chart = await storage.getChart(req.params.id);
      if (!chart) {
        return res.status(404).json({ message: "Chart not found" });
      }
      res.json(chart);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chart" });
    }
  });

  // Create chart
  app.post("/api/charts", async (req, res) => {
    try {
      const validatedData = insertChartSchema.parse(req.body);
      const chart = await storage.createChart(validatedData);
      res.status(201).json(chart);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid chart data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create chart" });
      }
    }
  });

  // Update chart
  app.patch("/api/charts/:id", async (req, res) => {
    try {
      const validatedData = insertChartSchema.partial().parse(req.body);
      const chart = await storage.updateChart(req.params.id, validatedData);
      if (!chart) {
        return res.status(404).json({ message: "Chart not found" });
      }
      res.json(chart);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid chart data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update chart" });
      }
    }
  });

  // Delete chart
  app.delete("/api/charts/:id", async (req, res) => {
    try {
      const success = await storage.deleteChart(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Chart not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete chart" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
