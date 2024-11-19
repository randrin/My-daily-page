import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import AppsSideBarFolderItem from "@crema/components/AppsSideBarFolderItem";
import AppList from "@crema/components/AppList";
import ListEmptyResult from "@crema/components/AppList/ListEmptyResult";
import SidebarPlaceholder from "@crema/components/AppSkeleton/SidebarListSkeleton";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import { useRouter } from "next/router";
import { Button } from "antd";
import {
  StyledSidebarHeader,
  StyledPlusOutlined,
  StyledSidebarScrollbar,
  StyledSidebarList,
} from "./index.styled";

const TaskSideBar = () => {
  const router = useRouter();
  const [{ apiData: folderList }] = useGetDataApi(
    "/api/invoice/folders/list",
    [],
    {},
    true
  );

  return (
    <>
      <StyledSidebarHeader>
        <Button
          ghost
          type="primary"
          icon={<StyledPlusOutlined style={{ marginRight: 8 }} />}
          onClick={() => router.push("/invoice/add-invoice")}
        >
          <IntlMessages id="invoice.addNewInvoice" />
        </Button>
      </StyledSidebarHeader>

      <StyledSidebarScrollbar>
        <StyledSidebarList>
          <AppList
            data={folderList}
            ListEmptyComponent={
              <ListEmptyResult
                loading={true}
                placeholder={<SidebarPlaceholder />}
              />
            }
            renderItem={(item) => (
              <AppsSideBarFolderItem
                key={item.id}
                item={item}
                path={`/invoice/home/${item.alias}`}
              />
            )}
          />
        </StyledSidebarList>
      </StyledSidebarScrollbar>
    </>
  );
};

export default TaskSideBar;
