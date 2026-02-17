import React, { Children } from 'react';
import ImagesForm from './ImagesForm';
import PriceForm from './PriceForm';
import AddressForm from './AddressForm';
import TagsForm from './TagsForm';
import ContentForm from './ContentForm';
import RatingForm from './RatingForm';

const Section = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {children &&
        Children.map(children, (child, index) => (
          <>
            {child}
            {index < Children.count(children) - 1 && (
              <div className="border-t border-mainGray/30 my-3" />
            )}
          </>
        ))}
    </div>
  );
};

function ReviewForm() {
  return (
    <section className="px-5 pt-9 pb-[36px] relative">
      <Section>
        <RatingForm />
        <ContentForm />
        <TagsForm />
        <AddressForm />
        <PriceForm />
        <ImagesForm />
      </Section>
    </section>
  );
}

export default ReviewForm;
