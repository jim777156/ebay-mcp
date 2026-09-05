import { isLiveListingModeEnabled, isLiveListingTool } from '@/mcp/liveListingGuard.js';
import { describe, expect, it } from 'vitest';

describe('liveListingGuard', () => {
  it.each([
    'ebay_publish_offer',
    'ebay_bulk_publish_offer',
    'ebay_publish_offer_by_inventory_item_group',
    'ebay_create_listing',
    'ebay_relist_item',
  ])('blocks %s by default', (name) => {
    expect(isLiveListingTool({ name })).toBe(true);
  });

  it.each([
    'ebay_create_offer',
    'ebay_update_offer',
    'ebay_create_or_replace_inventory_item',
    'ebay_upload_image_base64',
    'ebay_search_active_items',
  ])('does not classify staged/research tool %s as live publication', (name) => {
    expect(isLiveListingTool({ name })).toBe(false);
  });

  it('requires an explicit truthy environment value', () => {
    expect(isLiveListingModeEnabled({})).toBe(false);
    expect(isLiveListingModeEnabled({ EBAY_ENABLE_LIVE_LISTINGS: 'false' })).toBe(false);
    expect(isLiveListingModeEnabled({ EBAY_ENABLE_LIVE_LISTINGS: 'true' })).toBe(true);
  });
});
