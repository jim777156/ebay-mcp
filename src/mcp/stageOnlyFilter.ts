import process from 'node:process';

/**
 * EBAY_STAGE_ONLY mode: allow reads plus the explicitly commissioned sandbox
 * staging writes. Exact names are used so unrelated or destructive writes do
 * not become available by heuristic classification.
 */

const STAGE_ONLY_TOOL_NAMES = new Set([
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
]);

export interface StageOnlyToolDefinition {
  readonly name: string;
}

/** Whether a tool is one of the explicitly approved sandbox staging writes. */
export const isStageOnlyTool = (definition: StageOnlyToolDefinition): boolean =>
  STAGE_ONLY_TOOL_NAMES.has(definition.name.toLowerCase());

/** Whether EBAY_STAGE_ONLY is enabled in the given environment. */
export const isStageOnlyModeEnabled = (env: NodeJS.ProcessEnv = process.env): boolean => {
  const raw = env.EBAY_STAGE_ONLY?.trim().toLowerCase();
  return raw === 'true' || raw === '1' || raw === 'yes';
};
