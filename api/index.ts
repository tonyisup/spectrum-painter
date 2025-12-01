import { createApp } from "../server/app";

// Vercel serverless function handler
export default async function (req, res) {
  const { app } = await createApp();
  app(req, res);
}
