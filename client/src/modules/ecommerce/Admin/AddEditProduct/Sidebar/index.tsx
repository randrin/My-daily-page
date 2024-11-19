import React from "react";
import AppCard from "@crema/components/AppCard";
import { productCategory } from "@crema/mockapi/fakedb/ecommerce/ecommerceData";
import { useRouter } from "next/router";
import AppRowContainer from "@crema/components/AppRowContainer";
import AppScrollbar from "@crema/components/AppScrollbar";
import {
  Button,
  Col,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
} from "antd";
import { useIntl } from "react-intl";
import { StyledFormWrapper } from "./index.styled";
import {
  ProductInfoType,
  TagType,
} from "@crema/types/models/ecommerce/EcommerceApp";

const TagList = [
  {
    value: 1,
    label: "Fashion",
  },
  {
    value: 2,
    label: "Hotel",
  },
  {
    value: 3,
    label: "Event",
  },
];

const { Option } = Select;

type Props = {
  form: FormInstance;
  isEdit: boolean;
  productInfo: ProductInfoType[];
  productSpec: ProductInfoType[];
  setProductSpec: React.Dispatch<React.SetStateAction<ProductInfoType[]>>;
  setProductInfo: React.Dispatch<React.SetStateAction<ProductInfoType[]>>;
  selectedTags: TagType[];
  setSelectedTags: React.Dispatch<React.SetStateAction<TagType[]>>;
};

const BlogSidebar = ({
  form,
  isEdit,
  productInfo,
  productSpec,
  setProductSpec,
  setProductInfo,
  selectedTags,
  setSelectedTags,
}: Props) => {
  const { messages } = useIntl();
  const router = useRouter();

  return (
    <Col xs={24} lg={8}>
      <AppScrollbar style={{ height: "700px" }}>
        <StyledFormWrapper>
          <AppCard title="Product Details">
            <Form.Item name="inStock" valuePropName="checked">
              <span className="mr-10">In Stock</span>
              <Switch
                defaultChecked={form.getFieldValue("inStock")}
                onChange={(checked) => form.setFieldValue("inStock", checked)}
              />
            </Form.Item>

            <Form.Item label="Product SKU" name="SKU">
              <Input placeholder="Product SKU" />
            </Form.Item>

            <Form.Item
              label={messages["common.category"] as string}
              name="category"
            >
              <Select placeholder={messages["common.category"] as string}>
                {productCategory.map((category) => {
                  return (
                    <Option value={category.id} key={category.id}>
                      {category.name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>

            <Form.Item label="Tags" name="tag">
              <Select
                mode="multiple"
                allowClear
                placeholder="Tags"
                value={selectedTags}
                onChange={(value) => setSelectedTags(value)}
                options={TagList}
              />
            </Form.Item>
          </AppCard>

          <AppCard title="Product Pricing">
            <Form.Item label="Regular Price" name="mrp">
              <InputNumber placeholder="Regular Price" addonAfter="$" />
            </Form.Item>
            <Form.Item label="Sale Price" name="salemrp">
              <InputNumber placeholder="Sale Price" addonAfter="$" />
            </Form.Item>

            <Form.Item name="includeTax" valuePropName="checked">
              <span className="mr-10">Tax Inclusive</span>
              <Switch />
            </Form.Item>

            <Form.Item label="Discount %" name="discount">
              <InputNumber placeholder="Discount %" />
            </Form.Item>
          </AppCard>

          <AppCard
            title="Product Specification"
            extra={
              <Button
                type="primary"
                onClick={() => {
                  setProductSpec([
                    ...productSpec,
                    { id: productSpec.length + 1, title: "", desc: "" },
                  ]);
                }}
              >
                Add New
              </Button>
            }
          >
            <AppRowContainer>
              {productSpec.map((productItem, index) => {
                return (
                  <React.Fragment key={index}>
                    <Col xs={24} sm={12}>
                      <Input
                        className="mb-20"
                        placeholder="Product Label"
                        value={productItem.title}
                        onChange={(event) => {
                          const { value } = event.target;
                          const newProductSpec = [...productSpec];
                          newProductSpec[index].title = value;
                          setProductSpec(newProductSpec);
                        }}
                      />
                    </Col>
                    <Col xs={24} sm={12}>
                      <Input
                        className="mb-20"
                        placeholder="Product Value"
                        value={productItem.desc}
                        onChange={(event) => {
                          const { value } = event.target;
                          const newProductSpec = [...productSpec];
                          newProductSpec[index].desc = value;
                          setProductSpec(newProductSpec);
                        }}
                      />
                    </Col>
                  </React.Fragment>
                );
              })}
            </AppRowContainer>
          </AppCard>

          <AppCard
            title="Product Details"
            extra={
              <Button
                type="primary"
                onClick={() => {
                  setProductInfo([
                    ...productInfo,
                    { id: productInfo.length + 1, title: "", desc: "" },
                  ]);
                }}
              >
                Add New
              </Button>
            }
          >
            <AppRowContainer>
              {productInfo.map((productItem, index) => {
                return (
                  <React.Fragment key={index}>
                    <Col xs={24} sm={12}>
                      <Input
                        className="mb-20"
                        placeholder="Product Label"
                        value={productItem.title}
                        onChange={(event) => {
                          const { value } = event.target;
                          const newProductInfo = [...productInfo];
                          newProductInfo[index].title = value;
                          setProductInfo(newProductInfo);
                        }}
                      />
                    </Col>
                    <Col xs={24} sm={12}>
                      <Input
                        className="mb-20"
                        placeholder="Product Value"
                        value={productItem.desc}
                        onChange={(event) => {
                          const { value } = event.target;
                          const newProductInfo = [...productInfo];
                          newProductInfo[index].desc = value;
                          setProductInfo(newProductInfo);
                        }}
                      />
                    </Col>
                  </React.Fragment>
                );
              })}
            </AppRowContainer>
          </AppCard>
        </StyledFormWrapper>
      </AppScrollbar>
      <Space
        style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}
      >
        <Button
          style={{
            minWidth: 100,
          }}
          type="text"
          onClick={() => router.back()}
          ghost
        >
          Cancel
        </Button>

        <Button
          style={{
            display: "block",
            minWidth: 100,
          }}
          type="primary"
          htmlType="submit"
        >
          {isEdit ? "Edit" : "Add"} Product
        </Button>
      </Space>
    </Col>
  );
};

export default BlogSidebar;
