import type { EbayApiClient } from '@/api/client.js';
import {
  buildEndpointParams,
  type EbayApiError,
  EndpointInputError,
  optionalNonNegativeNumberEffect,
  optionalPositiveNumberEffect,
  optionalStringEffect,
  requestGetEffect,
  requestPostEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import { Effect } from 'effect';

const BROWSE_BASE_PATH = '/buy/browse/v1';
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 200;

export interface BrowseSearchInput {
  readonly query: string;
  readonly categoryIds?: string;
  readonly filter?: string;
  readonly sort?: string;
  readonly limit?: number;
  readonly offset?: number;
  readonly fieldgroups?: string;
  readonly aspectFilter?: string;
}

export interface BrowseImageSearchInput {
  readonly image: string;
  readonly categoryIds?: string;
  readonly filter?: string;
  readonly fieldgroups?: string;
  readonly aspectFilter?: string;
}

export interface BrowseItemInput {
  readonly itemId: string;
  readonly fieldgroups?: string;
}

export type BrowseSearchResponse = Record<string, unknown>;
export type BrowseItemResponse = Record<string, unknown>;

const validateLimit = (raw: number | undefined): Effect.Effect<number, EndpointInputError> => {
  const value = raw ?? DEFAULT_LIMIT;
  if (value > MAX_LIMIT) {
    return Effect.fail(
      new EndpointInputError({
        parameter: 'limit',
        message: `limit must be between 1 and ${MAX_LIMIT}`,
      }),
    );
  }
  return Effect.succeed(value);
};

/**
 * Browse API facade for current active-marketplace research.
 *
 * Every Browse API method explicitly requests an application access token.
 * This is intentional: Browse requires the client-credentials grant even when
 * the server also has a seller user token loaded.
 */
export class BrowseApi {
  public constructor(private readonly client: EbayApiClient) {}

  public searchItems = (
    input: BrowseSearchInput,
  ): Effect.Effect<BrowseSearchResponse, EbayApiError | EndpointInputError> =>
    Effect.gen(this, function* () {
      const value = yield* requireObjectEffect<BrowseSearchInput>(input, 'input');
      const query = yield* requireStringEffect(value.query, 'query');
      const categoryIds = yield* optionalStringEffect(value.categoryIds, 'categoryIds');
      const filter = yield* optionalStringEffect(value.filter, 'filter');
      const sort = yield* optionalStringEffect(value.sort, 'sort');
      const fieldgroups = yield* optionalStringEffect(value.fieldgroups, 'fieldgroups');
      const aspectFilter = yield* optionalStringEffect(value.aspectFilter, 'aspectFilter');
      const limitRaw = yield* optionalPositiveNumberEffect(value.limit, 'limit');
      const limit = yield* validateLimit(limitRaw);
      const offset = yield* optionalNonNegativeNumberEffect(value.offset, 'offset');

      const params = buildEndpointParams({
        query: { wireName: 'q', value: query },
        categoryIds: { wireName: 'category_ids', value: categoryIds },
        filter: { wireName: 'filter', value: filter },
        sort: { wireName: 'sort', value: sort },
        limit: { wireName: 'limit', value: limit },
        offset: { wireName: 'offset', value: offset },
        fieldgroups: { wireName: 'fieldgroups', value: fieldgroups },
        aspectFilter: { wireName: 'aspect_filter', value: aspectFilter },
      });

      return yield* requestGetEffect<BrowseSearchResponse>(
        this.client,
        `${BROWSE_BASE_PATH}/item_summary/search`,
        params,
        { authMode: 'app' },
      );
    });

  public searchItemsByImage = (
    input: BrowseImageSearchInput,
  ): Effect.Effect<BrowseSearchResponse, EbayApiError | EndpointInputError> =>
    Effect.gen(this, function* () {
      const value = yield* requireObjectEffect<BrowseImageSearchInput>(input, 'input');
      const image = yield* requireStringEffect(value.image, 'image');
      const categoryIds = yield* optionalStringEffect(value.categoryIds, 'categoryIds');
      const filter = yield* optionalStringEffect(value.filter, 'filter');
      const fieldgroups = yield* optionalStringEffect(value.fieldgroups, 'fieldgroups');
      const aspectFilter = yield* optionalStringEffect(value.aspectFilter, 'aspectFilter');
      const params = buildEndpointParams({
        categoryIds: { wireName: 'category_ids', value: categoryIds },
        filter: { wireName: 'filter', value: filter },
        fieldgroups: { wireName: 'fieldgroups', value: fieldgroups },
        aspectFilter: { wireName: 'aspect_filter', value: aspectFilter },
      });

      return yield* requestPostEffect<BrowseSearchResponse>(
        this.client,
        `${BROWSE_BASE_PATH}/item_summary/search_by_image`,
        { image },
        { authMode: 'app', params },
      );
    });

  public getItem = (
    input: BrowseItemInput,
  ): Effect.Effect<BrowseItemResponse, EbayApiError | EndpointInputError> =>
    Effect.gen(this, function* () {
      const value = yield* requireObjectEffect<BrowseItemInput>(input, 'input');
      const itemId = yield* requireStringEffect(value.itemId, 'itemId');
      const fieldgroups = yield* optionalStringEffect(value.fieldgroups, 'fieldgroups');
      const params = buildEndpointParams({
        fieldgroups: { wireName: 'fieldgroups', value: fieldgroups },
      });

      return yield* requestGetEffect<BrowseItemResponse>(
        this.client,
        `${BROWSE_BASE_PATH}/item/${encodeURIComponent(itemId)}`,
        params,
        { authMode: 'app' },
      );
    });
}
