import { GoogleGenAI } from "@google/genai";
import { Invoice } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const GeminiService = {
  analyzeBusinessHealth: async (invoices: Invoice[]): Promise<string> => {
    const ai = getClient();
    if (!ai) return "AI analysis unavailable: Missing API Key.";

    // Prepare data summary for the AI
    const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidInvoices = invoices.filter(i => i.status === 'Paid').length;
    const pendingInvoices = invoices.filter(i => i.status === 'Pending').length;

    // Group sales by month for trend analysis
    const salesByMonth: { [key: string]: number } = {};
    invoices.forEach(inv => {
      const month = new Date(inv.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      salesByMonth[month] = (salesByMonth[month] || 0) + inv.total;
    });

    const prompt = `
      Analyze the following business sales data and provide a brief, professional executive summary (max 3 sentences) highlighting trends, health, and one actionable tip.
      
      Data:
      - Total Revenue: ₹{totalSales.toFixed(2)}
      - Paid Invoices: ₹{paidInvoices}
      - Pending Invoices: ₹{pendingInvoices}
      - Monthly Breakdown: ₹{JSON.stringify(salesByMonth)}
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "Could not generate analysis.";
    } catch (error) {
      console.error("Gemini Analysis Failed", error);
      return "Unable to generate insights at this time.";
    }
  }
};