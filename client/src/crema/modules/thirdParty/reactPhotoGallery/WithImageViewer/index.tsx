import React, { useCallback, useState } from "react";
import Gallery from "react-photo-gallery";
import Carousel, { Modal, ModalGateway } from "react-images";
import AppInfoView from "@crema/components/AppInfoView";
import { StyledReactGalleryPhoto } from "../index.styled";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import AppLoader from "@crema/components/AppLoader";
import { PhotosDataType } from "@crema/types/models/extrapages/Gallery";

const ReactPhotoGallery = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [viewerIsOpen, setViewerIsOpen] = useState(false);
  const [{ apiData: photos, loading }] = useGetDataApi<PhotosDataType[]>(
    "/gallery/photos",
    []
  );
  const openLightBox = useCallback(
    (event: any, { index }: { index: number }) => {
      setCurrentImage(index);
      setViewerIsOpen(true);
    },
    []
  );

  const closeLightbox = () => {
    setCurrentImage(0);
    setViewerIsOpen(false);
  };

  if (loading) {
    return <AppLoader />;
  }
  return (
    <StyledReactGalleryPhoto>
      <Gallery photos={photos} onClick={openLightBox} />
      {/* <ModalGateway> */}
      {viewerIsOpen ? (
        <Modal onClose={closeLightbox}>
          <Carousel
            currentIndex={currentImage}
            views={photos.map((x) => ({
              source: x.src,
            }))}
          />
        </Modal>
      ) : null}
      {/* </ModalGateway> */}
      <AppInfoView />
    </StyledReactGalleryPhoto>
  );
};
export default ReactPhotoGallery;
