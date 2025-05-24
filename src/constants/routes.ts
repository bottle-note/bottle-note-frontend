export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  OAUTH: {
    KAKAO: '/oauth/kakao',
  },
  SEARCH: {
    BASE: '/search',
    ALL: (id: string | number) => `/search/all/${id}`,
    CATEGORY: {
      BASE: (category: string, id: string | number) =>
        `/search/${category}/${id}`,
      REVIEWS: (category: string, id: string | number) =>
        `/search/${category}/${id}/reviews`,
    },
  },
  DETAIL: {
    BASE: (id: string | number) => `/detail/${id}`,
    COMMENTS: (id: string | number) => `/detail/${id}/comments`,
  },
  EXPLORE: {
    BASE: '/explore',
  },
  HISTORY: {
    BASE: '/history',
  },
  REVIEW: {
    BASE: '/review',
    DETAIL: (id: string | number) => `/review/${id}`,
    REGISTER: (id: string | number) => `/review/register?alcoholId=${id}`,
    MODIFY: (reviewId: string | number) =>
      `/review/modify?reviewId=${reviewId}`,
  },
  USER: {
    BASE: (id: string | number) => `/user/${id}`,
    EDIT: (id: string | number) => `/user/${id}/edit`,
    MY_BOTTLE: (id: string | number) => `/user/${id}/my-bottle`,
    FOLLOW: (id: string | number, type: 'follower' | 'following') =>
      `/user/${id}/follow?type=${type}`,
  },
  ANNOUNCEMENT: {
    BASE: '/announcement',
    DETAIL: (id: string | number) => `/announcement/${id}`,
  },
  INQUIRE: {
    BASE: '/inquire',
    REGISTER: '/inquire/register',
  },
  REPORT: {
    USER: (userId: string | number) => `/report?type=user&userId=${userId}`,
    REVIEW: (reviewId: string | number) =>
      `/report?type=review&reviewId=${reviewId}`,
  },

  // Error routes
  ERROR: '/error',
} as const;
