import React, { useEffect, useState } from "react";
import Gallery from "react-photo-gallery";
import { SortableContainer, SortableElement } from "react-sortable-hoc";

import Photo from "./Photo";
import AppInfoView from "@crema/components/AppInfoView";
import { StyledReactGalleryPhoto } from "../index.styled";
import { arrayMoveImmutable } from "array-move";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import AppLoader from "@crema/components/AppLoader";
import { PhotosDataType } from "@crema/types/models/extrapages/Gallery";

/* popout the browser and maximize to see more rows! -> */
const SortablePhoto = SortableElement(({ value }: any) => <Photo {...value} />);
const SortableGallery = SortableContainer(
  ({ items }: { items: PhotosDataType[] }) => (
    <Gallery
      photos={items}
      renderImage={(props) => <SortablePhoto {...props} />}
    />
  )
);

const ReactSortableHoc = () => {
  const [{ apiData: photos, loading }] = useGetDataApi("/gallery/photos", []);
  const [items, setItems] = useState<PhotosDataType[]>(photos);

  useEffect(() => {
    if (photos.length > 0) {
      setItems(photos);
    }
  }, [photos]);

  const onSortEnd = ({
    oldIndex,
    newIndex,
  }: {
    oldIndex: number;
    newIndex: number;
  }) => {
    setItems(arrayMoveImmutable(items, oldIndex, newIndex));
  };

  if (loading) {
    return <AppLoader />;
  }
  return (
    <StyledReactGalleryPhoto>
      <SortableGallery
        // items={items}
        onSortEnd={onSortEnd}
        axis={"xy"}
      />
      <AppInfoView />
    </StyledReactGalleryPhoto>
  );
};
export default ReactSortableHoc;
