import { z } from 'zod';

const kakaoAccessTokenLoginSchema = z
  .object({
    provider: z.literal('kakao-login'),
    accessToken: z.string().min(1),
  })
  .strict();

const kakaoAuthorizationCodeLoginSchema = z
  .object({
    provider: z.literal('kakao-login'),
    authorizationCode: z.string().min(1),
  })
  .strict();

const appleLoginSchema = z
  .object({
    provider: z.literal('apple-login'),
    idToken: z.string().min(1),
    nonce: z.string().min(1),
  })
  .strict();

export const loginPayloadSchema = z.union([
  kakaoAccessTokenLoginSchema,
  kakaoAuthorizationCodeLoginSchema,
  appleLoginSchema,
]);

export type LoginPayload = z.infer<typeof loginPayloadSchema>;
export type KakaoLoginPayload =
  | z.infer<typeof kakaoAccessTokenLoginSchema>
  | z.infer<typeof kakaoAuthorizationCodeLoginSchema>;

export type LoginCredentialsByProvider = {
  'kakao-login':
    | Omit<z.infer<typeof kakaoAccessTokenLoginSchema>, 'provider'>
    | Omit<z.infer<typeof kakaoAuthorizationCodeLoginSchema>, 'provider'>;
  'apple-login': Omit<z.infer<typeof appleLoginSchema>, 'provider'>;
};

export type LoginProvider = keyof LoginCredentialsByProvider;
