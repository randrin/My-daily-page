import React, { useEffect, useState } from "react";
import AppRowContainer from "@crema/components/AppRowContainer";
import ProductSidebar from "./Sidebar";
import ProductContent from "./Content";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { postDataApi, putDataApi } from "@crema/hooks/APIHooks";
import { useRouter } from "next/router";
import { getStringFromHtml } from "@crema/helpers/StringHelper";
import dayjs from "dayjs";
import { Form } from "antd";
import { StyledTitle5 } from "../index.styled";
import {
  FileType,
  ProductDataType,
  ProductInfoType,
  TagType,
} from "@crema/types/models/ecommerce/EcommerceApp";

type Props = {
  selectedProd?: ProductDataType;
};

export const AddEditProduct = ({ selectedProd }: Props) => {
  const [form] = Form.useForm();
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileType[]>([]);
  const infoViewActionsContext = useInfoViewActionsContext();
  const router = useRouter();
  const [productInfo, setProductInfo] = React.useState<ProductInfoType[]>([
    { id: 1, title: "", desc: "" },
  ]);
  const [productSpec, setProductSpec] = React.useState<ProductInfoType[]>([
    { id: 1, title: "", desc: "" },
  ]);

  useEffect(() => {
    if (selectedProd) {
      setSelectedTags(selectedProd?.tag || []);
      setUploadedFiles(
        selectedProd.image.map((img) => ({ ...img, preview: img.src }))
      );
      setProductInfo(selectedProd?.productInfo || []);
      setProductSpec(selectedProd?.productSpec || []);
    }
  }, [selectedProd]);

  const onFinish = (values: any) => {
    if (selectedProd) {
      const updatedProd = {
        ...selectedProd,
        ...values,
      };
      putDataApi("/api/ecommerce/list/update", infoViewActionsContext, {
        product: updatedProd,
      })
        .then(() => {
          router.push("/ecommerce/product-listing");
          infoViewActionsContext.showMessage("Product updated successfully!");
        })
        .catch((error) => {
          infoViewActionsContext.fetchError(error.message);
        });
    } else {
      postDataApi("/api/ecommerce/list/add", infoViewActionsContext, {
        product: {
          ...values,
          description: getStringFromHtml(values.description),
          image: uploadedFiles.map((file, index) => ({
            id: index,
            src: file.preview,
            rating: 0,
            reviews: 0,
          })),
          createdAt: dayjs().format("DD MMM YYYY"),
          inStock: values?.inStock || false,
          tag: selectedTags,
          productInfo,
          productSpec,
        },
      })
        .then(() => {
          infoViewActionsContext.showMessage("Product created successfully!");
          router.push("/ecommerce/product-listing");
        })
        .catch((error) => {
          infoViewActionsContext.fetchError(error.message);
        });
    }
  };
  return (
    <>
      <StyledTitle5>
        {selectedProd ? "Edit Product" : "Create a new product"}
      </StyledTitle5>

      <Form
        form={form}
        initialValues={
          selectedProd
            ? {
                ...selectedProd,
                category: selectedProd?.category || 1,
              }
            : {
                title: "",
                SKU: "",
                category: 1,
                mrp: 0,
                salemrp: 0,
                discount: 0,
                inStock: false,
              }
        }
        layout="vertical"
        onFinish={onFinish}
      >
        <AppRowContainer>
          <ProductContent
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
          />
          <ProductSidebar
            form={form}
            isEdit={!!selectedProd}
            selectedTags={selectedTags}
            productInfo={productInfo}
            productSpec={productSpec}
            setProductInfo={setProductInfo}
            setSelectedTags={setSelectedTags}
            setProductSpec={setProductSpec}
          />
        </AppRowContainer>
      </Form>
    </>
  );
};

export default AddEditProduct;
