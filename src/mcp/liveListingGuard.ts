/** Tools that can cause an unpublished/staged listing to become publicly live. */
const LIVE_LISTING_TOOL_NAMES = new Set([
  'ebay_publish_offer',
  'ebay_bulk_publish_offer',
  'ebay_publish_offer_by_inventory_item_group',
  'ebay_create_listing',
  'ebay_relist_item',
]);

export interface LiveListingToolDefinition {
  readonly name: string;
}

/**
 * Default-off production guard. Normal seller writes such as creating inventory
 * items or unpublished offers remain available, but calls that make listings
 * publicly live are removed unless explicitly commissioned.
 */
export const isLiveListingTool = (definition: LiveListingToolDefinition): boolean =>
  LIVE_LISTING_TOOL_NAMES.has(definition.name.toLowerCase());

export const isLiveListingModeEnabled = (env: NodeJS.ProcessEnv = process.env): boolean => {
  const raw = env.EBAY_ENABLE_LIVE_LISTINGS?.trim().toLowerCase();
  return raw === 'true' || raw === '1' || raw === 'yes';
};
