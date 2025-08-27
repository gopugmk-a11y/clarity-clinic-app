'use server';

/**
 * @fileOverview AI-powered transaction category suggestion flow.
 *
 * - suggestTransactionCategory - A function that suggests transaction categories based on the description.
 * - SuggestTransactionCategoryInput - The input type for the suggestTransactionCategory function.
 * - SuggestTransactionCategoryOutput - The return type for the suggestTransactionCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTransactionCategoryInputSchema = z.object({
  transactionDetails: z
    .string()
    .describe('The description of the transaction, e.g., \'Lunch with supplier\'.'),
});
export type SuggestTransactionCategoryInput = z.infer<typeof SuggestTransactionCategoryInputSchema>;

const SuggestTransactionCategoryOutputSchema = z.object({
  category: z
    .string()
    .describe('The suggested category for the transaction, e.g., \'Supplies\'.'),
});
export type SuggestTransactionCategoryOutput = z.infer<typeof SuggestTransactionCategoryOutputSchema>;

export async function suggestTransactionCategory(input: SuggestTransactionCategoryInput): Promise<SuggestTransactionCategoryOutput> {
  return suggestTransactionCategoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTransactionCategoryPrompt',
  input: {schema: SuggestTransactionCategoryInputSchema},
  output: {schema: SuggestTransactionCategoryOutputSchema},
  prompt: `You are an expert financial assistant helping doctors categorize their transactions.

  Given the following transaction details, suggest the most appropriate category.

  Transaction Details: {{{transactionDetails}}}

  Category:`,
});

const suggestTransactionCategoryFlow = ai.defineFlow(
  {
    name: 'suggestTransactionCategoryFlow',
    inputSchema: SuggestTransactionCategoryInputSchema,
    outputSchema: SuggestTransactionCategoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
