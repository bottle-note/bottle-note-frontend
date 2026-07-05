import { z } from 'zod';

const curationAlcoholSchema = z.object({
  stats: z
    .object({
      rating: z.number().nullable().optional(),
      totalPickCount: z.number().optional(),
      reviewCount: z.number().optional(),
      totalRatingsCount: z.number().optional(),
    })
    .nullable()
    .optional(),
  source: z.string().optional(),
  alcohol: z.object({
    alcoholId: z.number().nullable().optional(),
    korName: z.string(),
    engName: z.string().optional(),
    imageUrl: z.string().optional(),
    regionName: z.string().optional(),
    korCategory: z.string().optional(),
    selectedTags: z.array(z.string()).optional(),
    abv: z.string().optional(),
    volume: z.string().optional(),
  }),
  comment: z.string().nullable().optional(),
});

export const tastingEventPayloadSchema = z.object({
  capacity: z.number(),
  entryFee: z.number(),
  eventDate: z.string(),
  eventTime: z.string(),
  guideText: z.string(),
  placeName: z.string().optional(),
  barAddress: z.string(),
  isRecruiting: z.boolean(),
  detailAddress: z.string(),
  applicationLink: z.string(),
  alcohols: z.array(curationAlcoholSchema).optional(),
});

export const recommendedWhiskyPayloadSchema = z.array(curationAlcoholSchema);

export type CurationAlcohol = z.infer<typeof curationAlcoholSchema>;
export type RecommendedWhiskyPayload = z.infer<
  typeof recommendedWhiskyPayloadSchema
>;
export type TastingEventAlcohol = CurationAlcohol;
export type TastingEventPayload = z.infer<typeof tastingEventPayloadSchema>;
