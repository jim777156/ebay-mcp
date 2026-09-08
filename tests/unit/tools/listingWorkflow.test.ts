import { runListingPreflight } from '@/tools/categories/listingWorkflow.js';
import { describe, expect, it } from 'vitest';

describe('listing workflow preflight', () => {
  it('blocks staging when a required category aspect is missing', () => {
    const result = runListingPreflight({
      title: 'Handmade 3D Dinosaur Birthday Card',
      description: 'Handmade pop-up birthday card with envelope.',
      imageUrls: ['https://i.ebayimg.com/example.jpg'],
      condition: 'NEW',
      quantity: 1,
      price: 6.99,
      currency: 'GBP',
      categoryId: '123',
      marketplaceId: 'EBAY_GB',
      merchantLocationKey: 'home',
      fulfillmentPolicyId: 'fulfil',
      paymentPolicyId: 'pay',
      returnPolicyId: 'returns',
      aspects: { Occasion: ['Birthday'] },
      requiredAspectNames: ['Occasion', 'Type'],
      recommendedAspectNames: ['Theme'],
    });

    expect(result.readyToStage).toBe(false);
    expect(result.missingRequired).toContain('aspect:Type');
    expect(result.missingRecommendedAspects).toContain('Theme');
  });
});
