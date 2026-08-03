/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from 'next/server';
import { POST } from '@/app/api/auth/login/route';
import { createLoginResponse } from '@/lib/auth/server';

jest.mock('@/lib/auth/server', () => ({
  createLoginResponse: jest.fn(),
}));

const createRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });

const createSuccessfulLoginResponse = () =>
  NextResponse.json({
    accessToken: 'bottle-access-token',
    agreementRequired: false,
    user: {
      sub: 'tester@bottle-note.com',
      userId: 1,
      roles: 'ROLE_USER' as const,
      profile: null,
    },
  });

describe('POST /api/auth/login 요청 계약', () => {
  const createLoginResponseMock = jest.mocked(createLoginResponse);

  beforeEach(() => {
    createLoginResponseMock.mockReset();
  });

  it('카카오 authorization code 요청을 로그인 서비스에 전달한다', async () => {
    createLoginResponseMock.mockResolvedValueOnce(
      createSuccessfulLoginResponse(),
    );

    const response = await POST(
      createRequest({
        provider: 'kakao-login',
        authorizationCode: 'kakao-authorization-code',
      }),
    );

    expect(response.status).toBe(200);
    expect(createLoginResponseMock).toHaveBeenCalledWith({
      provider: 'kakao-login',
      authorizationCode: 'kakao-authorization-code',
    });
  });

  it('카카오 SDK access token 요청을 로그인 서비스에 전달한다', async () => {
    createLoginResponseMock.mockResolvedValueOnce(
      createSuccessfulLoginResponse(),
    );

    const response = await POST(
      createRequest({
        provider: 'kakao-login',
        accessToken: 'kakao-sdk-access-token',
      }),
    );

    expect(response.status).toBe(200);
    expect(createLoginResponseMock).toHaveBeenCalledWith({
      provider: 'kakao-login',
      accessToken: 'kakao-sdk-access-token',
    });
  });

  it('Apple idToken과 nonce 요청을 로그인 서비스에 전달한다', async () => {
    createLoginResponseMock.mockResolvedValueOnce(
      createSuccessfulLoginResponse(),
    );

    const response = await POST(
      createRequest({
        provider: 'apple-login',
        idToken: 'apple-id-token',
        nonce: 'apple-nonce',
      }),
    );

    expect(response.status).toBe(200);
    expect(createLoginResponseMock).toHaveBeenCalledWith({
      provider: 'apple-login',
      idToken: 'apple-id-token',
      nonce: 'apple-nonce',
    });
  });

  it('이메일 기반 카카오 로그인 요청은 경계에서 거부한다', async () => {
    createLoginResponseMock.mockResolvedValueOnce(
      createSuccessfulLoginResponse(),
    );

    const response = await POST(
      createRequest({
        provider: 'kakao-login',
        email: 'legacy@bottle-note.com',
      }),
    );

    expect(response.status).toBe(400);
    expect(createLoginResponseMock).not.toHaveBeenCalled();
  });

  it('authorization code와 access token을 동시에 전달한 요청은 거부한다', async () => {
    createLoginResponseMock.mockResolvedValueOnce(
      createSuccessfulLoginResponse(),
    );

    const response = await POST(
      createRequest({
        provider: 'kakao-login',
        authorizationCode: 'kakao-authorization-code',
        accessToken: 'kakao-sdk-access-token',
      }),
    );

    expect(response.status).toBe(400);
    expect(createLoginResponseMock).not.toHaveBeenCalled();
  });
});
