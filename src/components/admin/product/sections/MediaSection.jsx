import React from 'react';
import SectionCard from '../ui/SectionCard';
import ImageUploadZone from '../ui/ImageUploadZone';
import { Image as ImageIcon } from 'lucide-react';

/**
 * Media Upload Section.
 */
const MediaSection = ({ form, onChange, onUploadingChange }) => {
  const handleImagesChange = (newImages) => {
    onChange('images', newImages);
  };

  return (
    <SectionCard
      title="Product Media"
      subtitle="Upload professional images. Set one as primary/cover image."
      icon={ImageIcon}
    >
      <ImageUploadZone
        images={form.images || []}
        onChange={handleImagesChange}
        onUploadingChange={onUploadingChange}
      />
    </SectionCard>
  );
};

export default MediaSection;
