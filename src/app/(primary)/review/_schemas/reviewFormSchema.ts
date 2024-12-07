import * as yup from 'yup';

export const reviewSchema = yup.object({
  review: yup.string().required('리뷰 내용을 작성해주세요.'),
  status: yup.string().required(),
  price: yup.number().nullable(),
  price_type: yup
    .string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
    .when('price', {
      is: (price: number | null) => price !== null && price > 0,
      then: (schemaOne) =>
        schemaOne
          .oneOf(['GLASS', 'BOTTLE'] as const)
          .required('가격 타입을 선택해주세요.'),
      otherwise: (schemaTwo) =>
        schemaTwo.oneOf(['GLASS', 'BOTTLE', null] as const).nullable(),
    }),
});
