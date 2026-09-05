import { z } from '@/utils/effectSchema.js';

export const listingPreflightInputSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  condition: z.string().optional(),
  quantity: z.number().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  categoryId: z.string().optional(),
  marketplaceId: z.string().optional(),
  merchantLocationKey: z.string().optional(),
  fulfillmentPolicyId: z.string().optional(),
  paymentPolicyId: z.string().optional(),
  returnPolicyId: z.string().optional(),
  aspects: z.record(z.array(z.string())).optional(),
  requiredAspectNames: z
    .array(z.string())
    .optional()
    .describe('Required aspect names returned by the live Taxonomy API for the selected category'),
  recommendedAspectNames: z
    .array(z.string())
    .optional()
    .describe(
      'Recommended aspect names returned by the live Taxonomy API for the selected category',
    ),
});
