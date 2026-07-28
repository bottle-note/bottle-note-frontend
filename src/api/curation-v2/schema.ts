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

export const programTypeSchema = z.enum([
  'MASTER_CLASS',
  'TASTING',
  'SEMINAR',
  'BOOTH_EVENT',
  'OTHER',
]);

export const programTagSchema = z.enum([
  'WHISKY',
  'TRADITIONAL_LIQUOR',
  'WINE',
  'COCKTAIL',
  'BEER',
  'OTHER_SPIRITS',
]);

const programFeedItemSchema = z.object({
  name: z.string(),
  type: programTypeSchema,
  programDate: z.string(),
  startTime: z.string(),
});

export const programFeedPayloadSchema = z.object({
  eventStartDate: z.string(),
  eventEndDate: z.string(),
  placeName: z.string(),
  entryFee: z.number().nullable().optional(),
  programTags: z.array(programTagSchema).optional(),
  programs: z.array(programFeedItemSchema).min(1),
});

const programScheduleSchema = programFeedItemSchema.extend({
  endTime: z.string().nullish(),
  venue: z.string().nullish(),
  host: z.string().nullish(),
  description: z.string(),
  applicationUrl: z.string().nullish(),
  whiskies: z.array(curationAlcoholSchema).optional(),
});

export const programPayloadSchema = z.object({
  eventStartDate: z.string(),
  eventEndDate: z.string(),
  placeName: z.string(),
  address: z.string(),
  detailLocation: z.string().nullish(),
  organizer: z.string().nullish(),
  sponsor: z.string().nullish(),
  entryFee: z.number().nullish(),
  officialUrl: z.string().nullish(),
  registrationUrl: z.string().nullish(),
  programTags: z.array(programTagSchema).optional(),
  programs: z.array(programScheduleSchema).min(1),
});

export type CurationAlcohol = z.infer<typeof curationAlcoholSchema>;
export type RecommendedWhiskyPayload = z.infer<
  typeof recommendedWhiskyPayloadSchema
>;
export type TastingEventAlcohol = CurationAlcohol;
export type TastingEventPayload = z.infer<typeof tastingEventPayloadSchema>;
export type ProgramType = z.infer<typeof programTypeSchema>;
export type ProgramTag = z.infer<typeof programTagSchema>;
export type ProgramFeedPayload = z.infer<typeof programFeedPayloadSchema>;
export type ProgramFeedSchedule = z.infer<typeof programFeedItemSchema>;
export type ProgramPayload = z.infer<typeof programPayloadSchema>;
export type ProgramSchedule = z.infer<typeof programScheduleSchema>;
export type ProgramWhisky = CurationAlcohol;
