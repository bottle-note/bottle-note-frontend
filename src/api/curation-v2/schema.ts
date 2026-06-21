import { z } from 'zod';

export const tastingEventPayloadSchema = z.object({
  capacity: z.number(),
  entryFee: z.number(),
  eventDate: z.string(),
  eventTime: z.string(),
  guideText: z.string(),
  barAddress: z.string(),
  isRecruiting: z.boolean(),
  detailAddress: z.string(),
  applicationLink: z.string(),
});

export type TastingEventPayload = z.infer<typeof tastingEventPayloadSchema>;
