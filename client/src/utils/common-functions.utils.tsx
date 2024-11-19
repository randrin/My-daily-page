import {
  StyledFlex,
  StyledText,
  StyledUserInfoAvatar,
} from "@crema/modules/dashboards/index.styled";
import { UserType } from "@crema/types/models/dashboards/UserType";
import { Avatar, Typography } from "antd";
import moment from "moment";
import {
  AiOutlineDelete,
  AiOutlineSchedule,
  AiOutlineSend,
  AiOutlineStop,
} from "react-icons/ai";
import { BiArchiveIn, BiCalendarMinus, BiUser } from "react-icons/bi";
import {
  FaRegCheckCircle,
  FaRegEnvelope,
  FaRegEnvelopeOpen,
  FaRegStar,
} from "react-icons/fa";
import { FiInfo, FiRefreshCw } from "react-icons/fi";
import { MdOutlineCancel, MdOutlinePayment } from "react-icons/md";

export const Tt_ExtractDateToMonth = (date: string) => {
  switch (date) {
    case "01":
      return "Jan";
    case "02":
      return "Fév";
    case "03":
      return "Mar";
    case "04":
      return "Avr";
    case "05":
      return "Mai";
    case "06":
      return "Juin";
    case "07":
      return "Juil";
    case "08":
      return "Août";
    case "09":
      return "Sept";
    case "10":
      return "Oct";
    case "11":
      return "Nov";
    case "12":
      return "Déc";
    default:
      return "Jan";
  }
};

export const Tt_FormatDate = (date: string) => {
  // Enter date format yyyy-mm-dd
  const day = date.split("-")[2];
  const month = Tt_ExtractDateToMonth(date.split("-")[1]);
  const year = date.split("-")[0];
  return day + " " + month + " " + year;
};

export const Tt_DateFormat = (date: string) => {
  return moment(date).format("DD-MM-YYYY");
};

export const Tt_GetUserAvatar = (user: UserType) => {
  if (user?.displayName) {
    return user?.displayName.charAt(0).toUpperCase();
  }
  if (user?.email) {
    return user?.email.charAt(0).toUpperCase();
  }
};

export const Tt_GetUser = (user: UserType) => {
  return (
    <StyledFlex>
      {user?.photoURL ? (
        <Avatar
          style={{
            marginRight: 14,
            width: 44,
            height: 44,
          }}
          src={user?.photoURL.secure_url}
        />
      ) : (
        <StyledUserInfoAvatar photoRGA={user?.photoRGA}>
          {Tt_GetUserAvatar(user)}
        </StyledUserInfoAvatar>
      )}
      <div
        style={{
          flex: 1,
        }}
      >
        <Typography.Title level={5} style={{ fontSize: 14, marginBottom: 0 }}>
          {user?.displayName}
        </Typography.Title>
        <StyledText>{user?.email}</StyledText>
      </div>
    </StyledFlex>
  );
};

export const IconByName: any = {
  sent: <AiOutlineSend />,
  paid: <MdOutlinePayment />,
  declined: <AiOutlineStop />,
  cancelled: <MdOutlineCancel />,
  "check-circle": <FaRegCheckCircle />,
  envelope: <FaRegEnvelope />,
  star: <FaRegStar />,
  "calendar-minus": <BiCalendarMinus />,
  user: <BiUser />,
  clock: <AiOutlineSchedule />,
  "envelope-open": <FaRegEnvelopeOpen />,
  "trash-alt": <AiOutlineDelete />,
  "file-archive": <BiArchiveIn />,
  "question-circle": <FiInfo />,
  clone: <FiRefreshCw />,
};

// export const Tt_GetStatusExpense = (status: string) => {
//   switch (status) {
//     case StatusExpenseEnums.VALID:
//       return (
//         <span className="tt-expenses-success">
//           <FaCheck />
//         </span>
//       );

//     case StatusExpenseEnums.REJECTED: {
//       return (
//         <span className="tt-expenses-tomato">
//           <FaChevronLeft />
//         </span>
//       );
//     }
//     case StatusExpenseEnums.PENDING: {
//       return (
//         <span className="tt-expenses-warning">
//           <MdOutlineMoreHoriz />
//         </span>
//       );
//     }
//     case StatusExpenseEnums.UNDER_APPROVED: {
//       return (
//         <span className="tt-expenses-primary">
//           <FaChevronRight />
//         </span>
//       );
//     }
//   }
// };
