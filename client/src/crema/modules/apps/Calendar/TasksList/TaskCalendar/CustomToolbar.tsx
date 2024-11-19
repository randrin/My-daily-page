import React, { useState } from "react";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useIntl } from "react-intl";
import { MdOutlineViewAgenda } from "react-icons/md";
import {
  AiOutlineCalendar,
  AiOutlineLeft,
  AiOutlineRight,
} from "react-icons/ai";
import { Button, Input, Space } from "antd";
import { StyledFlex, StyledIconBtn } from "./Calendar.style";
import { Fonts } from "@crema/constants/AppEnums";
import { NavigateAction } from "react-big-calendar";

// const IconBtn = styled(IconButton)(({ theme }) => {
//   return {
//     color: theme.palette.text.disabled,
//     backgroundColor: alpha(theme.palette.primary.main, 0.05),
//     padding: 8,
//     '&:hover, &:focus': {
//       color: theme.palette.primary.main,
//     },
//     '&.active': {
//       color: theme.palette.primary.main,
//     },
//   };
// });

type Props = {
  date: Date;
  view: string;
  onNavigate: (navigate: NavigateAction, date?: Date) => void;
  onView: (view: any) => void;
  onSetFilterText: (data: string) => void;
};

const CustomToolbar = (props: Props) => {
  const [viewState, setViewState] = useState("month");
  const { messages } = useIntl();

  function addMonths(date: Date, months: number) {
    const d = date.getDate();
    date.setMonth(date.getMonth() + months);
    if (date.getDate() !== d) {
      date.setDate(0);
    }
    console.log(date);
    return date;
  }

  function addWeeks(date: Date, weeks: number) {
    date.setDate(date.getDate() + 7 * weeks);
    return date;
  }

  function addDays(date: Date, days: number) {
    date.setDate(date.getDate() + days);
    console.log(date);
    return date;
  }

  /*
  const goToDayView = () => {
    props.onView('day');
    setViewState('day');
  };*/

  const goToAgenda = () => {
    props.onView("agenda");
    setViewState("agenda");
  }; /*
  const goToWeekView = () => {
    props.onView('week');
    setViewState('week');
  };*/
  const goToMonthView = () => {
    props.onView("month");
    setViewState("month");
  };

  const goToBack = () => {
    if (viewState === "month") {
      props.onNavigate("prev" as NavigateAction, addMonths(props.date, -1));
    } else if (viewState === "week") {
      props.onNavigate("prev" as NavigateAction, addWeeks(props.date, -1));
    } else {
      props.onNavigate("prev" as NavigateAction, addDays(props.date, -1));
    }
  };

  const goToNext = () => {
    if (viewState === "month") {
      props.onNavigate("next" as NavigateAction, addMonths(props.date, +1));
    } else if (viewState === "week") {
      props.onNavigate("next" as NavigateAction, addWeeks(props.date, +1));
    } else {
      props.onNavigate("next" as NavigateAction, addDays(props.date, +1));
    }
  };

  const goToToday = () => {
    const now = new Date();
    props.date.setMonth(now.getMonth());
    // props.date.setYear(now.getFullYear());
    props.date.setDate(now.getDate());
    props.onNavigate("current" as NavigateAction);
  };

  return (
    <StyledFlex>
      <Space size={14}>
        <StyledIconBtn
          title="Month"
          icon={<AiOutlineCalendar size={20} />}
          onClick={goToMonthView}
          style={{ padding: 0 }}
        />

        <StyledIconBtn
          title="Agenda"
          icon={<MdOutlineViewAgenda size={20} />}
          onClick={goToAgenda}
          style={{ padding: 0 }}
        />
        <div style={{ marginRight: 12 }}>
          <Input.Search
            onChange={(event) => props.onSetFilterText(event.target.value)}
            placeholder={messages["common.searchHere"] as string}
          />
        </div>
      </Space>

      <div style={{ fontWeight: Fonts.BOLD }}>
        {dayjs(props.date).format("DD/MM/YYYY")}
      </div>

      <Space size={14}>
        <StyledIconBtn
          title="Previous"
          icon={<AiOutlineLeft size={20} />}
          onClick={goToBack}
        />
        <Button style={{ maxHeight: 36 }} type="primary" onClick={goToToday}>
          today
        </Button>
        <StyledIconBtn
          title="Next"
          icon={<AiOutlineRight size={20} />}
          onClick={goToNext}
        />
      </Space>
    </StyledFlex>
  );
};

export default CustomToolbar;
