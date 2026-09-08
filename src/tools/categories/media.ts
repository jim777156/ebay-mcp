import {
  createImageFromUrlInputSchema,
  getImageInputSchema,
  uploadImageBase64InputSchema,
} from '@/schemas/other/media.js';
import { defineTool } from '@/tools/defineTool.js';
import type { ToolEntry } from '@/tools/registry.js';
import { Effect } from 'effect';

/** eBay Picture Services image tools exposed through the Media API. */
export const mediaEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_create_image_from_url',
    description:
      'Copy a publicly reachable product image into eBay Picture Services (EPS) and return the EPS image URL for use in an Inventory API listing.',
    inputSchema: createImageFromUrlInputSchema.shape,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.media.createImageFromUrl(args)),
  }),
  defineTool({
    name: 'ebay_upload_image_base64',
    description:
      'Upload base64-encoded image bytes to eBay Picture Services (EPS) using the current Media API multipart endpoint. Returns the EPS image URL for listing imageUrls.',
    inputSchema: uploadImageBase64InputSchema.shape,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.media.uploadImageBase64(args)),
  }),
  defineTool({
    name: 'ebay_get_image',
    description:
      'Retrieve eBay Media API image details, including the EPS image URL and expiration metadata, by image ID.',
    inputSchema: getImageInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.media.getImage(args)),
  }),
];
