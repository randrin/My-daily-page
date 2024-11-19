import React, { useState } from "react";
import { StyledContent } from "../index.styled";
import { StyledTitle5 } from "modules/ecommerce/Admin/index.styled";
import { useIntl } from "react-intl";
import AppRowContainer from "@crema/components/AppRowContainer";
import { Col, Input } from "antd";
import AppCard from "@crema/components/AppCard";
import AppsHeader from "@crema/components/AppsContainer/AppsHeader";
import {
  StyledOrderFooterPagination,
  StyledOrderHeader,
  StyledOrderHeaderInputView,
  StyledOrderHeaderPagination,
} from "modules/ecommerce/Orders/index.styled";
import { useApprovalContext } from "modules/apps/context/ApprovalContextProvider";
import ApprovalTable from "@crema/modules/dashboards/Approvals/approvalsTable";
import LegendExpenseStatus from "@crema/core/components/commons/LegendExpenseStatus";
import AppPageMeta from "@crema/components/AppPageMeta";
import { ReportType } from "@crema/types/models/dashboards/ReportType";

const ApprovalsListing = () => {
  // States
  const { messages } = useIntl();
  const { approvals, loading } = useApprovalContext();
  const [page, setPage] = useState(0);
  const [filterData, setFilterData] = useState("");

  // Functions
  const onChange = (page: number) => {
    setPage(page);
  };

  const onGetFilteredItems = () => {
    if (filterData === "") {
      return approvals;
    } else {
      return approvals.filter((report: ReportType) =>
        report.title.toUpperCase().includes(filterData.toUpperCase())
      );
    }
  };

  const list = onGetFilteredItems();

  // Render
  return (
    <>
      <AppPageMeta
        title={messages["sidebar.app.dashboard.approvals"] as string}
      />
      <StyledContent>
        <StyledTitle5>
          {messages["sidebar.app.dashboard.approvals"] as string}
        </StyledTitle5>
        <LegendExpenseStatus />
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
                      onChange={(event) => setFilterData(event.target.value)}
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
            <ApprovalTable reportData={list || []} loading={loading} />
            <StyledOrderFooterPagination
              pageSize={10}
              count={list?.length}
              page={page}
              onChange={onChange}
            />
          </AppCard>
        </Col>
      </AppRowContainer>
    </>
  );
};

export default ApprovalsListing;
