import { listingPreflightInputSchema } from '@/schemas/listing-workflow/preflight.js';
import { defineTool } from '@/tools/defineTool.js';
import type { ToolEntry } from '@/tools/registry.js';

interface ListingPreflightInput {
  readonly title?: string;
  readonly description?: string;
  readonly imageUrls?: string[];
  readonly condition?: string;
  readonly quantity?: number;
  readonly price?: number;
  readonly currency?: string;
  readonly categoryId?: string;
  readonly marketplaceId?: string;
  readonly merchantLocationKey?: string;
  readonly fulfillmentPolicyId?: string;
  readonly paymentPolicyId?: string;
  readonly returnPolicyId?: string;
  readonly aspects?: Record<string, string[]>;
  readonly requiredAspectNames?: string[];
  readonly recommendedAspectNames?: string[];
}

const hasText = (value: string | undefined): boolean => Boolean(value?.trim());
const hasAspect = (aspects: Record<string, string[]> | undefined, name: string): boolean =>
  Boolean(aspects?.[name]?.some((value) => value.trim().length > 0));

export const runListingPreflight = (input: ListingPreflightInput) => {
  const missingRequired: string[] = [];
  const warnings: string[] = [];

  if (!hasText(input.title)) missingRequired.push('title');
  if ((input.title?.length ?? 0) > 80) missingRequired.push('title <= 80 characters');
  if (!hasText(input.description)) missingRequired.push('description');
  if (!input.imageUrls?.some((url) => hasText(url))) missingRequired.push('at least one imageUrl');
  if (!hasText(input.condition)) missingRequired.push('condition');
  if (
    !(typeof input.quantity === 'number' && Number.isInteger(input.quantity) && input.quantity >= 1)
  ) {
    missingRequired.push('integer quantity >= 1');
  }
  if (!(typeof input.price === 'number' && Number.isFinite(input.price) && input.price > 0)) {
    missingRequired.push('price > 0');
  }
  if (!hasText(input.currency)) missingRequired.push('currency');
  if (!hasText(input.categoryId)) missingRequired.push('categoryId');
  if (!hasText(input.marketplaceId)) missingRequired.push('marketplaceId');
  if (!hasText(input.merchantLocationKey)) missingRequired.push('merchantLocationKey');
  if (!hasText(input.fulfillmentPolicyId)) missingRequired.push('fulfillmentPolicyId');
  if (!hasText(input.paymentPolicyId)) missingRequired.push('paymentPolicyId');
  if (!hasText(input.returnPolicyId)) missingRequired.push('returnPolicyId');

  const missingRequiredAspects = (input.requiredAspectNames ?? []).filter(
    (name) => !hasAspect(input.aspects, name),
  );
  const missingRecommendedAspects = (input.recommendedAspectNames ?? []).filter(
    (name) => !hasAspect(input.aspects, name),
  );

  for (const name of missingRequiredAspects) {
    missingRequired.push(`aspect:${name}`);
  }

  return {
    readyToStage: missingRequired.length === 0,
    missingRequired,
    missingRecommendedAspects,
    warnings,
    checks: {
      titleLength: input.title?.length ?? 0,
      imageCount: input.imageUrls?.length ?? 0,
      requiredAspectCount: input.requiredAspectNames?.length ?? 0,
      suppliedAspectCount: Object.keys(input.aspects ?? {}).length,
    },
    note: 'Local workflow preflight only. After staging, read the unpublished offer back and use eBay API validation/fee responses before any publication decision.',
  };
};

/** Pure local governance/workflow tools; these do not mutate eBay. */
export const listingWorkflowEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_listing_preflight',
    description:
      'Check a proposed listing draft for the fields required by the governed staging workflow, plus required/recommended category aspects supplied from the live Taxonomy API. Does not create, update, or publish anything on eBay.',
    inputSchema: listingPreflightInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (_api, args) => runListingPreflight(args),
  }),
];
