
import AppAnimate from "@crema/components/AppAnimate";
import IntlMessages from "@crema/helpers/IntlMessages";
import {
  ChangePassword,
  Information,
  PersonalInfo
} from "@crema/modules/profile/UserProfile";
import { AiFillLock } from "react-icons/ai";
import { FaBandcamp } from "react-icons/fa";
import { HiUser } from "react-icons/hi";
import {
  StyledUserProfileContainer,
  StyledUserProfileTabs,
} from "./index.styled";

const items = [
  {
    label: (
      <span className="user-profile-icon">
        <HiUser className="icon" />
        <span>
          <IntlMessages id="userProfile.personalInfo" />
        </span>
      </span>
    ),
    key: "01",
    children: <PersonalInfo />,
  }, // remember to pass the key prop
  {
    label: (
      <span className="user-profile-icon">
        <AiFillLock className="icon" />
        <span>
          <IntlMessages id="userProfile.changePassword" />
        </span>
      </span>
    ),
    key: "02",
    children: <ChangePassword />,
  },
  {
    label: (
      <span className="user-profile-icon">
        <FaBandcamp className="icon" />
        <span>
          <IntlMessages id="userProfile.information" />
        </span>
      </span>
    ),
    key: "03",
    children: <Information />,
  },
  // {
  //   label: (
  //     <span className="user-profile-icon">
  //       <FaNetworkWired className="icon" />
  //       <span>
  //         <IntlMessages id="userProfile.social" />
  //       </span>
  //     </span>
  //   ),
  //   key: "04",
  //   children: <SocialLink socialLink={accountData.member} />,
  // },
  // {
  //   label: (
  //     <span className="user-profile-icon">
  //       <IoMdNotifications className="icon" />
  //       <span>
  //         <IntlMessages id="userProfile.notification" />
  //       </span>
  //     </span>
  //   ),
  //   key: "05",
  //   children: <Notification notification={accountData.notification} />,
  // },
];

const UserProfile = () => {
  return (
    <StyledUserProfileContainer>
      <AppAnimate animation="transition.slideUpIn" delay={200}>
        <StyledUserProfileTabs
          key="1"
          defaultActiveKey="01"
          tabPosition="left"
          items={items}
        />
      </AppAnimate>
    </StyledUserProfileContainer>
  );
};

export default UserProfile;
