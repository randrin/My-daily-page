import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { AuthUserType } from "@crema/types/models/AuthUser";
import { OrganizationType } from "@crema/types/models/dashboards/OrganizationType";
import { message, notification } from "antd";
import {
  TAM_AUTHENTICATE_URL,
  TAM_LOGIN_URL,
  TAM_LOGOUT_URL,
  TAM_ORGANIZATIONS_USER_URL,
  TAM_REGISTER_URL,
  TAM_SIGNIN_URL,
  TAM_UPDATE_PROFILE_URL,
  TAM_UPDATE_USER_GROUP_URL,
  TAM_USERS_URL,
} from "utils/end-points.utils";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import jwtAxios, { setAuthToken } from "./index";
import {
  StatusEnums,
  UsersProfileStepEnums,
} from "utils/common-constants.utils";
import { useIntl } from "react-intl";
import { Router, useRouter } from "next/router";
import { initialUrl } from "@crema/constants/AppConst";

interface JWTAuthContextProps {
  user: AuthUserType | null | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  groups: OrganizationType[];
  currentOrganization: OrganizationType;
}

interface SignUpProps {
  name: string;
  email: string;
  password: string;
}

export type SignInProps = {
  email: string;
  password: string;
};

interface JWTAuthActionsProps {
  getAuthUser: () => void;
  signUpUser: (data: SignUpProps) => void;
  signInUser: (data: SignInProps) => void;
  logout: () => void;
  refreshUser: (data: string) => void;
  handleOnUpdateUserProfile: (
    data: object,
    userId: string,
    step: string
  ) => void;
  handleOnUserChangeGroup: (data: object, userId: string) => void;
}

const JWTAuthContext = createContext<JWTAuthContextProps>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  groups: [],
  currentOrganization: null,
});
const JWTAuthActionsContext = createContext<JWTAuthActionsProps>({
  getAuthUser: () => {},
  signUpUser: () => {},
  signInUser: () => {},
  logout: () => {},
  refreshUser: (data: string) => {},
  handleOnUpdateUserProfile: (data: object, userId: string, step: string) => {},
  handleOnUserChangeGroup: (data: object, userId: string) => {},
});

export const useJWTAuth = () => useContext(JWTAuthContext);

export const useJWTAuthActions = () => useContext(JWTAuthActionsContext);

interface JWTAuthAuthProviderProps {
  children: ReactNode;
}

const JWTAuthAuthProvider: React.FC<JWTAuthAuthProviderProps> = ({
  children,
}) => {
  // States
  const [userOrganizations, setUserOrganizations] = useState([]);
  const [firebaseData, setJWTAuthData] = useState<JWTAuthContextProps>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    groups: [],
    currentOrganization: null,
  });
  const { messages } = useIntl();
  const router = useRouter();
  const infoViewActionsContext = useInfoViewActionsContext();

  // Init
  useEffect(() => {
    getAuthUser();
  }, []);

  // Functions
  const getAuthUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setJWTAuthData({
        user: undefined,
        isLoading: false,
        isAuthenticated: false,
        groups: [],
        currentOrganization: undefined,
      });
      return;
    }
    setAuthToken(token);

    jwtAxios
      .get(`${TAM_AUTHENTICATE_URL}/${token}`)
      .then(async ({ data }) => {
        if (data) {
          // Retrieve user organizations
          const { data: dataOrganizations } = await jwtAxios.get(
            `${TAM_ORGANIZATIONS_USER_URL}/${data.user._id}`
          );

          setUserOrganizations(dataOrganizations.data);
          setJWTAuthData({
            user: data.user,
            isLoading: false,
            isAuthenticated: true,
            groups: dataOrganizations.data,
            currentOrganization:
              dataOrganizations.data.length === 1
                ? dataOrganizations.data[0]
                : data.user.currentOrganization,
          });
        } else {
          localStorage.removeItem("token");
          setAuthToken();
          setJWTAuthData({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            groups: [],
            currentOrganization: null,
          });
        }
      })
      .catch((error) => {
        setJWTAuthData({
          user: undefined,
          isLoading: false,
          isAuthenticated: false,
          groups: [],
          currentOrganization: undefined,
        });
        console.log("error: ", error);
        infoViewActionsContext.fetchError(error?.response?.data?.message);
      });
  };

  const signInUser = async ({ email, password }: SignInProps) => {
    infoViewActionsContext.fetchStart();
    try {
      const { data } = await jwtAxios.post(TAM_LOGIN_URL, { email, password });

      jwtAxios.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;

      // Retrieve user organizations
      const { data: dataOrganizations } = await jwtAxios.get(
        `${TAM_ORGANIZATIONS_USER_URL}/${data.user._id}`
      );

      if (dataOrganizations.data.length === 1) {
        await jwtAxios.put(
          `${TAM_UPDATE_USER_GROUP_URL}/${dataOrganizations.data[0]._id}/profile/${data.user._id}`,
          {}
        );
      }

      setJWTAuthData({
        ...firebaseData,
        user: data.user,
        isLoading: false,
        isAuthenticated: true,
        groups: dataOrganizations.data,
        currentOrganization:
          dataOrganizations.data.length === 1
            ? dataOrganizations.data[0]
            : data.user.currentOrganization,
      });

      // Store the token in session only if the status is ACTIVE
      if (data.user.status === StatusEnums.ACTIVE && !data.user.tmpPassword) {
        setAuthToken(data.accessToken);
      }

      infoViewActionsContext.fetchSuccess();
    } catch (error) {
      setJWTAuthData({
        ...firebaseData,
        isAuthenticated: false,
        isLoading: false,
      });
      console.log("Error: ", error);
      infoViewActionsContext.fetchError(error?.response?.data?.message);
    }
  };

  const handleOnGetMessage = (message: string) => {
    return messages[message] as string;
  };

  const signUpUser = async ({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }) => {
    infoViewActionsContext.fetchStart();
    try {
      const { data } = await jwtAxios.post("users", { name, email, password });
      localStorage.setItem("token", data.token);
      setAuthToken(data.token);
      const res = await jwtAxios.get(TAM_REGISTER_URL);
      setJWTAuthData({
        user: res.data,
        isAuthenticated: true,
        isLoading: false,
        groups: userOrganizations,
        currentOrganization: null,
      });
      infoViewActionsContext.fetchSuccess();
    } catch (error) {
      setJWTAuthData({
        ...firebaseData,
        isAuthenticated: false,
        isLoading: false,
      });
      infoViewActionsContext.fetchError("Something went wrong");
    }
  };

  const logout = async () => {
    infoViewActionsContext.fetchStart();
    try {
      const { data } = await jwtAxios.post(TAM_LOGOUT_URL);
      localStorage.removeItem("token");
      setAuthToken();
      setJWTAuthData({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        groups: [],
        currentOrganization: null,
      });
      infoViewActionsContext.showMessage(data.message);
    } catch (error) {
      setJWTAuthData({
        ...firebaseData,
        isAuthenticated: false,
        isLoading: false,
      });
      console.log("Error: ", error);
      infoViewActionsContext.fetchError(error?.response?.data?.message);
    }
  };

  const refreshUser = async (userId: string) => {
    infoViewActionsContext.fetchStart();
    try {
      const { data } = await jwtAxios.get(`${TAM_USERS_URL}/${userId}`);
      console.log(data);
      setJWTAuthData({
        ...firebaseData,
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setJWTAuthData({
        ...firebaseData,
        isAuthenticated: false,
        isLoading: false,
      });
      console.log("Error: ", error);
      infoViewActionsContext.fetchError(error?.response?.data?.message);
    }
  };

  const handleOnUpdateUserProfile = async (
    userInfos: any,
    userId: string,
    step: string
  ) => {
    infoViewActionsContext.fetchStart();
    try {
      const { data } = await jwtAxios.put(
        `${TAM_UPDATE_PROFILE_URL}/${userId}/step=${step}`,
        userInfos
      );

      setJWTAuthData({
        ...firebaseData,
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      if (step === UsersProfileStepEnums.RESET_PASSWORD) {
        notification.success({
          message: handleOnGetMessage("common.success"),
          description: handleOnGetMessage("message.profileUpdated"),
        });
        setJWTAuthData({
          ...firebaseData,
          isAuthenticated: false,
          isLoading: false,
        });
        router.push(TAM_SIGNIN_URL);
      } else {
        message.success(messages["message.profileUpdated"] as string);
      }
    } catch (error) {
      setJWTAuthData({
        ...firebaseData,
        isAuthenticated: false,
        isLoading: false,
      });
      console.log("Error: ", error);
      infoViewActionsContext.showMessage(error?.response?.data?.message);
      message.error(error?.response?.data?.message);
    }
  };

  const handleOnUserChangeGroup = async (
    group: OrganizationType,
    userId: string
  ) => {
    console.log(group);
    infoViewActionsContext.fetchStart();
    try {
      await jwtAxios.put(
        `${TAM_UPDATE_USER_GROUP_URL}/${group._id}/profile/${userId}`,
        {}
      );
      getAuthUser();
      message.success(messages["message.organizationUpdated"] as string);
    } catch (error) {
      setJWTAuthData({
        ...firebaseData,
        isAuthenticated: false,
        isLoading: false,
        currentOrganization: null,
      });
      console.log("Error: ", error);
      infoViewActionsContext.showMessage(error?.response?.data?.message);
    }
  };

  // Render
  return (
    <JWTAuthContext.Provider
      value={{
        ...firebaseData,
      }}
    >
      <JWTAuthActionsContext.Provider
        value={{
          getAuthUser,
          signUpUser,
          signInUser,
          logout,
          refreshUser,
          handleOnUpdateUserProfile,
          handleOnUserChangeGroup,
        }}
      >
        {children}
      </JWTAuthActionsContext.Provider>
    </JWTAuthContext.Provider>
  );
};
export default JWTAuthAuthProvider;
