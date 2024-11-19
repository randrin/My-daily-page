import AppCard from "@crema/components/AppCard";
import AppRowContainer from "@crema/components/AppRowContainer";
import AppsHeader from "@crema/components/AppsContainer/AppsHeader";
import IntlMessages from "@crema/helpers/IntlMessages";
import CategoryTable from "@crema/modules/dashboards/Categories/categoriesTable";
import { Button, Col, Drawer, Input, Row, Space } from "antd";
import { StyledTitle5 } from "modules/ecommerce/Admin/index.styled";
import {
  StyledOrderFooterPagination,
  StyledOrderHeader,
  StyledOrderHeaderInputView,
  StyledOrderHeaderPagination,
} from "modules/ecommerce/Orders/index.styled";
import { MODE_ADD, StatusEnums } from "utils/common-constants.utils";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import {
  StyledCategoryContainer,
  StyledContent,
  StyledRequiredField,
} from "../index.styled";
import { PlusOutlined } from "@ant-design/icons";
import {
  useCategoryActionsContext,
  useCategoryContext,
} from "modules/apps/context/CategoryContextProvider";
import { IoReturnUpBackOutline } from "react-icons/io5";
import { LuCheckCircle } from "react-icons/lu";
import AppPageMeta from "@crema/components/AppPageMeta";
import { CategoryType } from "@crema/types/models/dashboards/CategoryType";

const CategoriesListing = () => {
  // States
  const { categories, loading, isAppDrawerOpen, category, mode } =
    useCategoryContext();
  const {
    setAppDrawerOpen,
    handleOnSubmit,
    handleOnUpdate,
    setCategory,
    handleOnAddCategory,
  } = useCategoryActionsContext();
  const { messages } = useIntl();
  const [filterData, setFilterData] = useState({
    title: "",
    description: "",
    status: [StatusEnums.ACTIVE, StatusEnums.DISABLED],
  });
  const [page, setPage] = useState(0);

  // Desctruction
  const { title, description } = category;
  const { TextArea } = Input;

  // Init

  // Functions
  const onChange = (page: number) => {
    setPage(page);
  };

  const onGetFilteredItems = () => {
    if (filterData.title === "") {
      return categories;
    } else {
      return categories.filter(
        (category: CategoryType) =>
          category.title
            .toUpperCase()
            .includes(filterData.title.toUpperCase()) ||
          category.description
            .toUpperCase()
            .includes(filterData.title.toUpperCase())
      );
    }
  };

  const list = onGetFilteredItems();

  // Render
  return (
    <>
      <AppPageMeta title={messages["common.categories"] as string} />
      <StyledContent>
        <StyledTitle5>{messages["common.categories"] as string}</StyledTitle5>
        <Button type="primary" className="btn" onClick={handleOnAddCategory}>
          <PlusOutlined /> <IntlMessages id="common.category" />
        </Button>
      </StyledContent>
      <AppRowContainer>
        <Col xs={24} lg={24}>
          <AppCard
            title={
              <AppsHeader>
                <StyledOrderHeader>
                  <StyledOrderHeaderInputView>
                    <Input
                      id="category-name"
                      placeholder={messages["common.searchHere"] as string}
                      type="search"
                      onChange={(event) =>
                        setFilterData({
                          ...filterData,
                          title: event.target.value,
                        })
                      }
                    />
                  </StyledOrderHeaderInputView>
                  <StyledOrderHeaderPagination
                    pageSize={10}
                    count={list?.length}
                    page={page}
                    onChange={onChange}
                  />
                </StyledOrderHeader>
              </AppsHeader>
            }
          >
            <CategoryTable categoryData={list || []} loading={loading} />
            <StyledOrderFooterPagination
              pageSize={10}
              count={list?.length}
              page={page}
              onChange={onChange}
            />
            <Drawer
              title={
                messages[
                  mode === MODE_ADD
                    ? "dashboard.category.create"
                    : "dashboard.category.update"
                ] as string
              }
              placement={"right"}
              open={isAppDrawerOpen}
              onClose={() => setAppDrawerOpen(!isAppDrawerOpen)}
              footer={
                <Space>
                  <Button
                    className="tt-expenses-space-center"
                    onClick={() => setAppDrawerOpen(!isAppDrawerOpen)}
                  >
                    <IoReturnUpBackOutline className="tt-expenses-margin-btn-icon" />{" "}
                    {messages["common.back"] as string}
                  </Button>
                  <Button
                    type="primary"
                    className="tt-expenses-space-center"
                    onClick={
                      mode === MODE_ADD
                        ? handleOnSubmit
                        : () => handleOnUpdate(category._id, category)
                    }
                    disabled={
                      !!title?.length && !!description.length ? false : true
                    }
                  >
                    <LuCheckCircle className="tt-expenses-margin-btn-icon" />{" "}
                    {messages["common.send"] as string}
                  </Button>
                </Space>
              }
            >
              <StyledCategoryContainer>
                <Row className="tt-category-row">
                  <Col xs={24} lg={24} className="tt-category-col">
                    <label htmlFor="category" className="label">
                      {messages["common.title"] as string}{" "}
                      <StyledRequiredField>*</StyledRequiredField>
                    </label>
                    <Input
                      placeholder={messages["placeholder.input"] as string}
                      value={title}
                      size="large"
                      name="category"
                      onChange={(e) =>
                        setCategory({ ...category, title: e.target.value })
                      }
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={24} lg={24}>
                    <label htmlFor="description" className="label">
                      {messages["common.description"] as string}{" "}
                      <StyledRequiredField>*</StyledRequiredField>
                    </label>
                    <TextArea
                      placeholder={messages["placeholder.input"] as string}
                      value={description}
                      name="description"
                      rows={4}
                      onChange={(e) =>
                        setCategory({
                          ...category,
                          description: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Row>
              </StyledCategoryContainer>
            </Drawer>
          </AppCard>
        </Col>
      </AppRowContainer>
    </>
  );
};

export default CategoriesListing;
