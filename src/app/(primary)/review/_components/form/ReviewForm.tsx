import React, { Children } from 'react';
import ImagesForm from './ImagesForm';
import PriceForm from './PriceForm';
import AddressForm from './AddressForm';
import TagsForm from './TagsForm';
import ContentForm from './ContentForm';
import RatingForm from './RatingForm';
import TastingNoteForm from './TastingNoteForm';

const Section = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {children &&
        Children.map(children, (child, index) => (
          <>
            {child}
            {index < Children.count(children) - 1 && (
              <div className="my-12 border-t border-stroke-neutral-subtle" />
            )}
          </>
        ))}
    </div>
  );
};

function ReviewForm() {
  return (
    <section className="px-20 pt-36 pb-[var(--sticky-cta-space)] relative">
      <Section>
        <RatingForm />
        <ContentForm />
        <TagsForm />
        <TastingNoteForm />
        <AddressForm />
        <PriceForm />
        <ImagesForm />
      </Section>
    </section>
  );
}

export default ReviewForm;
