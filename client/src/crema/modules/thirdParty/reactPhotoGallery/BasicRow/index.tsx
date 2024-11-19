import React from 'react';
import Gallery from 'react-photo-gallery';
import AppInfoView from '@crema/components/AppInfoView';
import { StyledReactGalleryPhoto } from '../index.styled';
import { useGetDataApi } from '@crema/hooks/APIHooks';
import AppLoader from '@crema/components/AppLoader';

const BasicRow = () => {
  const [{ apiData: photos, loading }] = useGetDataApi('/gallery/photos', []);

  if (loading) {
    return <AppLoader />;
  }

  return (
    <StyledReactGalleryPhoto>
      <Gallery photos={photos} />
      <AppInfoView />
    </StyledReactGalleryPhoto>
  );
};
export default BasicRow;
