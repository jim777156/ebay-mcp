import { z } from '@/utils/effectSchema.js';

const categoryIds = z
  .string()
  .optional()
  .describe('Comma-separated eBay category IDs used to narrow the search');
const filter = z
  .string()
  .optional()
  .describe('Raw Browse API filter expression, for example price:[5..20],priceCurrency:GBP');
const fieldgroups = z
  .string()
  .optional()
  .describe('Browse fieldgroups value when additional response fields are required');
const aspectFilter = z.string().optional().describe('Browse API aspect_filter expression');

export const browseSearchInputSchema = z.object({
  query: z.string().min(1).describe('Keywords for current active eBay listings'),
  categoryIds,
  filter,
  fieldgroups,
  aspectFilter,
  limit: z
    .number()
    .int()
    .positive()
    .max(200)
    .optional()
    .describe('Maximum number of results. Defaults to 20; maximum 200.'),
  sort: z.string().optional().describe('Browse API sort expression'),
  offset: z.number().int().optional().describe('Result offset for pagination'),
});

export const browseImageSearchInputSchema = z.object({
  image: z.string().min(1).describe('Base64-encoded image bytes; do not include a data-URL prefix'),
  categoryIds,
  filter,
  fieldgroups,
  aspectFilter,
});

export const browseGetItemInputSchema = z.object({
  itemId: z.string().min(1).describe('RESTful Browse item ID'),
  fieldgroups: z.string().optional().describe('Optional Browse API fieldgroups value'),
});
