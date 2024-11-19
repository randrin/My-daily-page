import React from 'react';
import { DatePicker } from 'antd';
import { StyledTodoDetailDatePicker } from '../index.styled';
import dayjs, { Dayjs } from 'dayjs';

type DatePickerProps = {
  scheduleDate: Dayjs;
  setScheduleDate: (date: Dayjs) => void;
};

const DatePickers: React.FC<DatePickerProps> = ({
  scheduleDate,
  setScheduleDate,
}) => {
  return (
    <StyledTodoDetailDatePicker className="form-field">
      <DatePicker
        defaultValue={dayjs(scheduleDate, 'MMM DD,YYYY')}
        onChange={(value) => setScheduleDate(value as Dayjs)}
      />
    </StyledTodoDetailDatePicker>
  );
};

export default DatePickers;
