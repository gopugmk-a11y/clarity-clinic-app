"use server";

import { suggestTransactionCategory } from "@/ai/flows/suggest-transaction-category";
import { z } from "zod";

const SuggestionInput = z.string().min(10, "Description must be at least 10 characters.");

export async function getCategorySuggestion(description: string) {
  try {
    const validatedDescription = SuggestionInput.parse(description);
    const result = await suggestTransactionCategory({ transactionDetails: validatedDescription });
    return { success: true, category: result.category };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input." };
    }
    console.error("AI suggestion flow failed:", error);
    return { success: false, error: "Failed to get suggestion." };
  }
}
