import { describe, expect, it } from 'vitest';
import { isStageOnlyModeEnabled, isStageOnlyTool } from '@/mcp/stageOnlyFilter.js';

describe('stageOnlyFilter', () => {
  it.each([
    ['true', true],
    ['1', true],
    ['yes', true],
    ['false', false],
    [undefined, false],
  ] as const)('EBAY_STAGE_ONLY=%j → %s', (raw, expected) => {
    const env: NodeJS.ProcessEnv = raw === undefined ? {} : { EBAY_STAGE_ONLY: raw };
    expect(isStageOnlyModeEnabled(env)).toBe(expected);
  });

  it.each([
    'ebay_create_image_from_url',
    'ebay_upload_image_base64',
    'ebay_create_inventory_location',
    'ebay_create_or_replace_inventory_item',
    'ebay_create_offer',
    'ebay_update_offer',
    'ebay_opt_in_to_program',
    'ebay_create_fulfillment_policy',
    'ebay_create_payment_policy',
    'ebay_create_return_policy',
  ])('allows commissioned stage write %s', (name) => {
    expect(isStageOnlyTool({ name })).toBe(true);
  });

  it.each([
    'ebay_delete_offer',
    'ebay_delete_inventory_location',
    'ebay_disable_inventory_location',
    'ebay_bulk_create_offer',
    'ebay_bulk_update_price_quantity',
    'ebay_publish_offer',
    'ebay_create_campaign',
    'ebay_update_fulfillment_policy',
    'ebay_delete_return_policy',
  ])('rejects non-commissioned write %s', (name) => {
    expect(isStageOnlyTool({ name })).toBe(false);
  });
});
