import {
  browseGetItemInputSchema,
  browseImageSearchInputSchema,
  browseSearchInputSchema,
} from '@/schemas/other/browse.js';
import { defineTool } from '@/tools/defineTool.js';
import type { ToolEntry } from '@/tools/registry.js';
import { Effect } from 'effect';

/**
 * Current Browse API tools for active marketplace research.
 *
 * The previous `ebay_find_completed_items` tool used the decommissioned Finding
 * API and is intentionally not registered by this fork.
 */
export const browseEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_search_active_items',
    description:
      'Search current active eBay listings by keyword/category/filter for competitor and pricing research. Uses the current Browse API with an application access token. This is active-marketplace data, not sold-history data.',
    inputSchema: browseSearchInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.browse.searchItems(args)),
  }),
  defineTool({
    name: 'ebay_search_items_by_image',
    description:
      'Search current eBay listings using a base64-encoded product image. Particularly useful for visually similar competitor discovery. Supported by the eBay GB marketplace. This is active-marketplace data, not sold-history data.',
    inputSchema: browseImageSearchInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.browse.searchItemsByImage(args)),
  }),
  defineTool({
    name: 'ebay_get_browse_item',
    description:
      'Retrieve current public Browse API details for one RESTful eBay item ID.',
    inputSchema: browseGetItemInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.browse.getItem(args)),
  }),
];
