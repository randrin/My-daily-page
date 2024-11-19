import React from "react";
import AppCard from "@crema/components/AppCard";
import TimesheetTable from "./TimesheetTable";
import { useIntl } from "react-intl";
import { TimesheetType } from "@crema/types/models/dashboards/CRM";

type Props = {
  timesheet: TimesheetType[];
};
const Timesheet = ({ timesheet }: Props) => {
  const { messages } = useIntl();
  return (
    <AppCard
      className="no-card-space-ltr-rtl"
      title={messages["dashboard.crm.timesheet"] as string}
      extra={<a href="#">{messages["common.viewAll"] as string}</a>}
    >
      <TimesheetTable timesheet={timesheet} />
    </AppCard>
  );
};

export default Timesheet;
