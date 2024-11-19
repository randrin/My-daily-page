import React from "react";
import { Dayjs } from "dayjs";
import { DatePicker } from "antd";
import { StyledTodoDetailDatePicker } from "../index.styled";
import { getFormattedDate, getDateObject } from "@crema/helpers/DateHelper";

type DatePickerProps = {
  scheduleDate: string | Dayjs;
  scheduleEndDate: string | Dayjs;
  setScheduleDate: (date: string | Dayjs) => void;
  setScheduleEndDate: (date: string | Dayjs) => void;
};

const DatePickers: React.FC<DatePickerProps> = ({
  scheduleDate,
  scheduleEndDate,
  setScheduleDate,
  setScheduleEndDate,
}) => {
  const onHandleValue = (rangeValue: any, dateStrings: [string, string]) => {
    const [start_date, end_date] = dateStrings;
    setScheduleDate(getFormattedDate(start_date));
    setScheduleEndDate(getFormattedDate(end_date));
  };

  return (
    <StyledTodoDetailDatePicker className="form-field">
      <DatePicker.RangePicker
        defaultValue={[
          getDateObject(scheduleDate),
          getDateObject(scheduleEndDate),
        ]}
        onChange={onHandleValue}
      />
    </StyledTodoDetailDatePicker>
  );
};

export default DatePickers;
