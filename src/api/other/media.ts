import type { EbayApiClient } from '@/api/client.js';
import {
  type EbayApiError,
  EndpointInputError,
  requestGetEffect,
  requestPostEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import { Data, Effect } from 'effect';

const MEDIA_IMAGE_BASE_PATH = '/commerce/media/v1_beta/image';

export interface CreateImageFromUrlInput {
  readonly imageUrl: string;
}

export interface UploadImageBase64Input {
  readonly image: string;
  readonly filename: string;
  readonly contentType: string;
}

export interface GetImageInput {
  readonly imageId: string;
}

export interface MediaImageResponse {
  readonly imageId?: string;
  readonly imageUrl?: string;
  readonly expirationDate?: string;
  readonly location?: string;
  readonly [key: string]: unknown;
}

/** Successful Media create response that cannot be resolved to an eBay image resource. */
export class MediaResponseError extends Data.TaggedError('MediaResponseError')<{
  readonly message: string;
  readonly location?: string;
}> {}

const stripDataUrlPrefix = (image: string): string => {
  const marker = ';base64,';
  const index = image.indexOf(marker);
  return index >= 0 ? image.slice(index + marker.length) : image;
};

/** Extract the Media image ID from eBay's Location response header. */
const imageIdFromLocation = (location: string | undefined): string | undefined => {
  if (!location) return;

  try {
    // A dummy origin lets the same parser handle both absolute and relative Location values.
    const parsed = new URL(location, 'https://ebay.invalid');
    const segments = parsed.pathname.split('/').filter(Boolean);
    const imageSegment = segments.lastIndexOf('image');
    if (imageSegment < 0 || imageSegment !== segments.length - 2) return;

    const encodedId = segments[imageSegment + 1];
    if (!encodedId) return;

    const imageId = decodeURIComponent(encodedId);
    return imageId.length > 0 ? imageId : undefined;
  } catch {
    return;
  }
};

/** Attach the Location-derived image ID to a successful Media create response. */
const createdImageResult = (
  response: MediaImageResponse,
  location: string | undefined,
): Effect.Effect<MediaImageResponse, MediaResponseError> => {
  const imageId = imageIdFromLocation(location);
  if (!imageId) {
    return Effect.fail(
      new MediaResponseError({
        message:
          'eBay Media create succeeded but did not return a usable Location header; image ID cannot be resolved safely',
        ...(location ? { location } : {}),
      }),
    );
  }

  return Effect.succeed({ ...response, imageId, location });
};

/** Media API image methods used to create EPS URLs for Inventory listings. */
export class MediaApi {
  public constructor(private readonly client: EbayApiClient) {}

  public createImageFromUrl = (
    input: CreateImageFromUrlInput,
  ): Effect.Effect<MediaImageResponse, EbayApiError | EndpointInputError | MediaResponseError> =>
    Effect.gen(this, function* () {
      const value = yield* requireObjectEffect<CreateImageFromUrlInput>(input, 'input');
      const imageUrl = yield* requireStringEffect(value.imageUrl, 'imageUrl');
      let location: string | undefined;

      const response = yield* requestPostEffect<MediaImageResponse>(
        this.client,
        `${MEDIA_IMAGE_BASE_PATH}/create_image_from_url`,
        { imageUrl },
        {
          onResponseHeaders: (headers) => {
            location = headers.location;
          },
        },
      );

      return yield* createdImageResult(response, location);
    });

  /**
   * Convenience MCP bridge for hosts that can provide image bytes as base64.
   * Native FormData is used so fetch generates the multipart boundary.
   */
  public uploadImageBase64 = (
    input: UploadImageBase64Input,
  ): Effect.Effect<MediaImageResponse, EbayApiError | EndpointInputError | MediaResponseError> =>
    Effect.gen(this, function* () {
      const value = yield* requireObjectEffect<UploadImageBase64Input>(input, 'input');
      const image = yield* requireStringEffect(value.image, 'image');
      const filename = yield* requireStringEffect(value.filename, 'filename');
      const contentType = yield* requireStringEffect(value.contentType, 'contentType');

      const bytes = Buffer.from(stripDataUrlPrefix(image), 'base64');
      if (bytes.length === 0) {
        return yield* Effect.fail(
          new EndpointInputError({
            parameter: 'image',
            message: 'image must contain valid base64-encoded bytes',
          }),
        );
      }

      const form = new FormData();
      form.append('image', new Blob([bytes], { type: contentType }), filename);
      let location: string | undefined;

      const response = yield* requestPostEffect<MediaImageResponse>(
        this.client,
        `${MEDIA_IMAGE_BASE_PATH}/create_image_from_file`,
        form,
        {
          onResponseHeaders: (headers) => {
            location = headers.location;
          },
        },
      );

      return yield* createdImageResult(response, location);
    });

  public getImage = (
    input: GetImageInput,
  ): Effect.Effect<MediaImageResponse, EbayApiError | EndpointInputError> =>
    Effect.gen(this, function* () {
      const value = yield* requireObjectEffect<GetImageInput>(input, 'input');
      const imageId = yield* requireStringEffect(value.imageId, 'imageId');

      return yield* requestGetEffect<MediaImageResponse>(
        this.client,
        `${MEDIA_IMAGE_BASE_PATH}/${encodeURIComponent(imageId)}`,
      );
    });
}
