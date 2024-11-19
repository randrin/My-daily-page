import React, { useState } from "react";
import { useRouter } from "next/router";
import MailContentHeader from "./MailContentHeader";
import MailListItem from "./MailListItem";
import AppsPagination from "@crema/components/AppsPagination";
import AppsContent from "@crema/components/AppsContainer/AppsContent";
import AppsHeader from "@crema/components/AppsContainer/AppsHeader";
import AppsFooter from "@crema/components/AppsContainer/AppsFooter";
import AppList from "@crema/components/AppList";
import ListEmptyResult from "@crema/components/AppList/ListEmptyResult";
import EmailListSkeleton from "@crema/components/AppSkeleton/EmailListSkeleton";
import {
  StyledAppsMailFooter,
  StyledMailListDesktop,
  StyledMailListMobile,
} from "./index.styled";
import { putDataApi, useGetDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { MailListItemMobile } from "@crema/modules/apps/Mail";
import type { LabelObjType, MailObjType } from "@crema/types/models/apps/Mail";
import {
  useMailActionsContext,
  useMailContext,
} from "../../context/MailContextProvider";

type Props = {
  data: MailObjType[];
  count: number;
};
const MailsList = () => {
  const router = useRouter();
  const { page, mailList, loading, all, folder, label } = useMailContext();
  const { setMailData, onPageChange } = useMailActionsContext();
  const [filterText, onSetFilterText] = useState("");
  const infoViewActionsContext = useInfoViewActionsContext();

  const [checkedMails, setCheckedMails] = useState<number[]>([]);

  const [{ apiData: labelList }] = useGetDataApi<LabelObjType[]>(
    "/api/mailApp/labels/list"
  );

  const onChangeCheckedMails = (checked: boolean, id: number) => {
    if (checked) {
      setCheckedMails(checkedMails.concat(id));
    } else {
      setCheckedMails(checkedMails.filter((mailId) => mailId !== id));
    }
  };

  const onViewMailDetail = (mail: MailObjType) => {
    if (mail.isRead) {
      router.push(`/apps/mail/${(all as string[])?.join("/")}/${mail.id}`);
    } else {
      mail.isRead = true;
      putDataApi("/api/mailApp/mail/", infoViewActionsContext, { mail })
        .then((data) => {
          onUpdateItem(data as MailObjType);
          if (label) router.push(`/apps/mail/label/${label}/${mail.id}`);
          if (folder) router.push(`/apps/mail/${folder}/${mail.id}`);
          infoViewActionsContext.showMessage(
            mail.isRead
              ? "Mail Marked as Read Successfully"
              : "Mail Marked as Unread Successfully"
          );
        })
        .catch((error) => {
          infoViewActionsContext.fetchError(error.message);
        });
    }
  };

  const onChangeStarred = (checked: boolean, mail: MailObjType) => {
    putDataApi<MailObjType[]>(
      "/api/mailApp/update/starred",
      infoViewActionsContext,
      {
        mailIds: [mail.id],
        status: checked,
      }
    )
      .then((data) => {
        onUpdateItem(data[0]);
        infoViewActionsContext.showMessage(
          checked
            ? "Mail Marked as Starred Successfully"
            : "Mail Marked as Unstarred Successfully"
        );
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const onUpdateItem = (data: MailObjType) => {
    setMailData({
      data: mailList.data.map((item: MailObjType) => {
        if (item.id === data.id) {
          return data;
        }
        return item;
      }),
      count: mailList.count,
    });
  };

  const onRemoveItem = (data: MailObjType) => {
    setMailData({
      data: mailList.data.filter((item) => item.id !== data.id),
      count: mailList.count ? mailList.count - 1 : 0,
    });
  };

  return (
    <>
      <AppsHeader>
        <MailContentHeader
          checkedMails={checkedMails}
          setCheckedMails={setCheckedMails}
          filterText={filterText}
          onSetFilterText={onSetFilterText}
        />
      </AppsHeader>
      <AppsContent>
        <StyledMailListDesktop>
          <AppList
            data={mailList?.data?.filter((item: MailObjType) =>
              item.subject.toLowerCase().includes(filterText.toLowerCase())
            )}
            ListEmptyComponent={
              <ListEmptyResult
                loading={loading}
                placeholder={<EmailListSkeleton />}
              />
            }
            renderItem={(mail) => (
              <MailListItem
                mail={mail}
                key={mail.id}
                labelList={labelList}
                onChangeCheckedMails={onChangeCheckedMails}
                checkedMails={checkedMails}
                onViewMailDetail={onViewMailDetail}
                onChangeStarred={onChangeStarred}
                onRemoveItem={onRemoveItem}
                onUpdateItem={onUpdateItem}
              />
            )}
          />
        </StyledMailListDesktop>
        <StyledMailListMobile>
          <AppList
            data={mailList?.data?.filter((item: MailObjType) =>
              item.subject.toLowerCase().includes(filterText.toLowerCase())
            )}
            ListEmptyComponent={
              <ListEmptyResult
                loading={loading}
                placeholder={<EmailListSkeleton />}
              />
            }
            renderItem={(mail) => (
              <MailListItemMobile
                mail={mail}
                key={mail.id}
                labelList={labelList}
                onViewMailDetail={onViewMailDetail}
                onChangeStarred={onChangeStarred}
                checkedMails={checkedMails}
                onChangeCheckedMails={onChangeCheckedMails}
              />
            )}
          />
        </StyledMailListMobile>
      </AppsContent>
      {mailList?.data?.length > 0 ? (
        <StyledAppsMailFooter>
          <AppsFooter>
            <AppsPagination
              count={mailList?.count || 0}
              page={page}
              onChange={(data) => onPageChange(data)}
            />
          </AppsFooter>
        </StyledAppsMailFooter>
      ) : null}
    </>
  );
};

export default MailsList;
