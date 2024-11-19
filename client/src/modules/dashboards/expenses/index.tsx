import React, { useState } from "react";
import { StyledContent } from "../index.styled";
import { StyledTitle5 } from "modules/ecommerce/Admin/index.styled";
import { useIntl } from "react-intl";
import { Button, Col, Input } from "antd";
import IntlMessages from "@crema/helpers/IntlMessages";
import { PlusOutlined } from "@ant-design/icons";
import {
  useExpenseActionsContext,
  useExpenseContext,
} from "modules/apps/context/ExpenseContextProvider";
import AppRowContainer from "@crema/components/AppRowContainer";
import AppCard from "@crema/components/AppCard";
import AppsHeader from "@crema/components/AppsContainer/AppsHeader";
import {
  StyledOrderFooterPagination,
  StyledOrderHeader,
  StyledOrderHeaderInputView,
  StyledOrderHeaderPagination,
} from "modules/ecommerce/Orders/index.styled";
import { StatusEnums } from "utils/common-constants.utils";
import ReportTable from "@crema/modules/dashboards/ReportsExpenses/ReportsTable";
import AddReport from "./inc/addReport";
import LegendReportStatus from "@crema/core/components/commons/LegendReportStatus";
import AppPageMeta from "@crema/components/AppPageMeta";
import { ReportType } from "@crema/types/models/dashboards/ReportType";

const ExpensesListing = () => {
  // States
  const { reports, users, loading, report, isReportDrawerOpen } =
    useExpenseContext();
  const { handleOnSubmitReport, setReport, setReportDrawerOpen } =
    useExpenseActionsContext();
  const [page, setPage] = useState(0);
  const [filterData, setFilterData] = useState({
    title: "",
    description: "",
    status: [StatusEnums.ACTIVE, StatusEnums.DISABLED],
  });

  // Desctruction
  const { messages } = useIntl();

  // Functions
  const handleOnAddReport = () => {
    setReportDrawerOpen(!isReportDrawerOpen);
  };

  const onChange = (page: number) => {
    setPage(page);
  };

  const onGetFilteredItems = () => {
    if (filterData.title === "") {
      return reports;
    } else {
      return reports.filter((report: ReportType) =>
        report.title.toUpperCase().includes(filterData.title.toUpperCase())
      );
    }
  };

  const list = onGetFilteredItems();

  // Render
  return (
    <>
      <AppPageMeta title={messages["common.reports"] as string} />
      <StyledContent>
        <StyledTitle5>{messages["common.reports"] as string}</StyledTitle5>
        <LegendReportStatus />
        <Button type="primary" className="btn" onClick={handleOnAddReport}>
          <PlusOutlined /> <IntlMessages id="common.report" />
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
                      id="user-name"
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
            <ReportTable reportData={list || []} loading={loading} />
            <StyledOrderFooterPagination
              pageSize={10}
              count={list?.length}
              page={page}
              onChange={onChange}
            />
            <AddReport
              users={users}
              report={report}
              setReportDrawerOpen={handleOnAddReport}
              handleOnAddReport={handleOnSubmitReport}
              loading={loading}
              setReport={setReport}
              isReportDrawerOpen={isReportDrawerOpen}
            />
          </AppCard>
        </Col>
      </AppRowContainer>
    </>
  );
};

export default ExpensesListing;
