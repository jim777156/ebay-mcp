import { z } from '@/utils/effectSchema.js';

export const createImageFromUrlInputSchema = z.object({
  imageUrl: z
    .string()
    .url()
    .describe('Publicly reachable image URL to copy into eBay Picture Services (EPS)'),
});

export const uploadImageBase64InputSchema = z.object({
  image: z
    .string()
    .min(1)
    .describe('Base64 image bytes. A data-URL prefix is accepted but not required.'),
  filename: z.string().min(1).describe('Filename to send to eBay, for example card-front.jpg'),
  contentType: z.string().min(1).describe('Image MIME type, for example image/jpeg or image/png'),
});

export const getImageInputSchema = z.object({
  imageId: z.string().min(1).describe('eBay Media API image ID'),
});
