import type { EbayApiClient } from '@/api/client.js';
import {
  type EbayApiError,
  EndpointInputError,
  requestGetEffect,
  requestPostEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import { Effect } from 'effect';

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
  readonly imageUrl?: string;
  readonly expirationDate?: string;
  readonly [key: string]: unknown;
}

const stripDataUrlPrefix = (image: string): string => {
  const marker = ';base64,';
  const index = image.indexOf(marker);
  return index >= 0 ? image.slice(index + marker.length) : image;
};

/** Media API image methods used to create EPS URLs for Inventory listings. */
export class MediaApi {
  public constructor(private readonly client: EbayApiClient) {}

  public createImageFromUrl = (
    input: CreateImageFromUrlInput,
  ): Effect.Effect<MediaImageResponse, EbayApiError | EndpointInputError> =>
    Effect.gen(this, function* () {
      const value = yield* requireObjectEffect<CreateImageFromUrlInput>(input, 'input');
      const imageUrl = yield* requireStringEffect(value.imageUrl, 'imageUrl');

      return yield* requestPostEffect<MediaImageResponse>(
        this.client,
        `${MEDIA_IMAGE_BASE_PATH}/create_image_from_url`,
        { imageUrl },
      );
    });

  /**
   * Convenience MCP bridge for hosts that can provide image bytes as base64.
   * Native FormData is used so fetch generates the multipart boundary.
   */
  public uploadImageBase64 = (
    input: UploadImageBase64Input,
  ): Effect.Effect<MediaImageResponse, EbayApiError | EndpointInputError> =>
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

      return yield* requestPostEffect<MediaImageResponse>(
        this.client,
        `${MEDIA_IMAGE_BASE_PATH}/create_image_from_file`,
        form,
      );
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
