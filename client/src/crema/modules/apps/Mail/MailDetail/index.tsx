import React, { createRef, useEffect } from "react";
import MailDetailHeader from "./MailDetailHeader";
import MailDetailBody from "./MailDetailBody";
import { useRouter } from "next/router";
import AppsContent from "@crema/components/AppsContainer/AppsContent";
import AppsHeader from "@crema/components/AppsContainer/AppsHeader";
import { MailDetailSkeleton } from "@crema/components/AppSkeleton/MailDetailSkeleton";
import { StyledMailDetail } from "./index.styled";
import AppAnimate from "@crema/components/AppAnimate";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import { MailObjType } from "@crema/types/models/apps/Mail";

const MailDetail = () => {
  const contentRef = createRef<any>();

  const router = useRouter();
  const { all } = router.query;

  const [{ apiData: selectedMail }, { setQueryParams, setData }] =
    useGetDataApi<MailObjType>("/api/mailApp/mail/", undefined, {}, false);

  useEffect(() => {
    setQueryParams({ id: all?.slice(-1)[0] });
  }, [all]);

  const onUpdateSelectedMail = (data: MailObjType) => {
    if (setData) setData(data);
  };

  if (!selectedMail) {
    return <MailDetailSkeleton />;
  }

  return (
    <StyledMailDetail ref={contentRef}>
      <AppsHeader>
        <MailDetailHeader
          selectedMail={selectedMail}
          onUpdateSelectedMail={onUpdateSelectedMail}
        />
      </AppsHeader>
      <AppsContent isDetailView>
        <AppAnimate animation="transition.slideUpIn" delay={200}>
          <MailDetailBody
            selectedMail={selectedMail}
            key={"mail_detail"}
            onUpdateSelectedMail={onUpdateSelectedMail}
          />
        </AppAnimate>
      </AppsContent>
    </StyledMailDetail>
  );
};

export default MailDetail;
