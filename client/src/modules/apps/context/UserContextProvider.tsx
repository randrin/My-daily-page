import { useGetDataApi } from "@crema/hooks/APIHooks";
import jwtAxios from "@crema/services/auth/jwt-auth";
import { UserType } from "@crema/types/models/dashboards/UserType";
import { Modal, message, notification } from "antd";
import { MODE_ADD, MODE_EDIT, StatusEnums } from "utils/common-constants.utils";
import {
  TAM_USERS_URL,
  TAM_USER_ADD_ORGANIZATIONS_URL,
  TAM_USER_CREATE_URL,
  TAM_USER_DELETE_URL,
  TAM_USER_STATUS_URL,
  TAM_USER_UPDATE_URL,
} from "utils/end-points.utils";
import { ReactNode, createContext, useContext, useState } from "react";
import { useOrganizationContext } from "./OrganizationContextProvider";
import { useIntl } from "react-intl";

export type UserContextType = {
  users: UserType[];
  loading: boolean;
  isAppDrawerOpen: boolean;
  mode: string;
  user: any;
};

const ContextState: UserContextType = {
  users: [],
  loading: false,
  isAppDrawerOpen: false,
  mode: MODE_ADD,
  user: {},
};

export type UserActionsContextType = {
  handleOnAddUser: () => void;
  handleOnSubmitUser: () => void;
  setUser: (data: object) => void;
  handleOnGetUser: (data: UserType) => void;
  handleOnUpdateUser: (userId: string, data: UserType) => void;
  setAppDrawerOpen: (data: boolean) => void;
  handleOnAddOrganizationsToUser: (userId: string, data: object) => void;
  handleOnUpdateUserStatus: (userId: string, data: string) => void;
  handleOnDelete: (data: UserType) => void;
  onPageChange: (data: number) => void;
  reCallAPI: () => void;
  setPage: (data: number) => void;
};

const UserContext = createContext<UserContextType>(ContextState);
const UserActionsContext = createContext<UserActionsContextType>({
  handleOnAddUser: () => {},
  handleOnSubmitUser: () => {},
  setUser: (data: object) => {},
  handleOnGetUser: (data: UserType) => {},
  handleOnUpdateUser: (userId: string, data: UserType) => {},
  setAppDrawerOpen: (data: boolean) => {},
  handleOnAddOrganizationsToUser: (userId: string, data: object) => {},
  handleOnUpdateUserStatus: (userId: string, data: string) => {},
  handleOnDelete: (data: UserType) => {},
  onPageChange: (data: number) => {},
  reCallAPI: () => {},
  setPage: (data: number) => {},
});

export const useUserContext = () => useContext(UserContext);

export const useUserActionsContext = () => useContext(UserActionsContext);

type Props = {
  children: ReactNode;
};

export const UserContextProvider = ({ children }: Props) => {
  // States
  const { messages } = useIntl();
  const { organizations } = useOrganizationContext();
  const [user, setUser] = useState({
    gender: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    dateOfBorn: new Date(),
    phoneNumber: null,
    groups: [],
  });
  const [mode, setMode] = useState(MODE_ADD);
  const [isAppDrawerOpen, setAppDrawerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [{ apiData, loading }, { setQueryParams, reCallAPI }] = useGetDataApi<{
    data: UserType[];
  }>(TAM_USERS_URL);

  // Destructing
  const confirm = Modal.confirm;

  // Functions
  const handleOnGetMessage = (message: string) => {
    return messages[message] as string;
  };

  const handleOnSubmitUser = async () => {
    console.log(user);
    await jwtAxios
      .post(TAM_USER_CREATE_URL, user)
      .then(({ data }) => {
        resetUser();
        reCallAPI();
        setAppDrawerOpen(!isAppDrawerOpen);
        // TODO: create a custom component notification
        notification.success({
          message: handleOnGetMessage("common.success"),
          description: handleOnGetMessage(
            "common.notification.add.description"
          ),
        });
      })
      .catch((error: any) => {
        console.log("Error: ", error);
        message.error(
          error.response.data.message || error.response.data.message
        );
      });
  };

  const onPageChange = (value: number) => {
    setPage(value);
  };

  const handleOnAddUser = () => {
    setMode(MODE_ADD);
    setAppDrawerOpen(!isAppDrawerOpen);
    resetUser();
  };

  const resetUser = () => {
    setUser({
      gender: "",
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      dateOfBorn: new Date(),
      phoneNumber: null,
      groups: [],
    });
  };
  const handleOnGetUser = (user: any | UserType) => {
    setMode(MODE_EDIT);
    setAppDrawerOpen(!isAppDrawerOpen);
    setUser({
      ...user,
      groups: organizations
        ?.filter((org) => org.status === StatusEnums.ACTIVE)
        .filter((org) => org.users.find((orgUser) => user._id === orgUser._id))
        .map((org) => org._id),
    });
  };

  const handleOnUpdateUser = async (userId: string, user: UserType) => {
    await jwtAxios
      .put(`${TAM_USER_UPDATE_URL}/${userId}`, user)
      .then(({ data }) => {
        setAppDrawerOpen(!isAppDrawerOpen);
        reCallAPI();
        // TODO: create a custom component notification
        notification.success({
          message: handleOnGetMessage("common.success"),
          description: handleOnGetMessage(
            "common.notification.update.description"
          ),
        });
      })
      .catch((error: any) => {
        console.log("Error: ", error);
        message.error(
          error.response.data.message || error.response.data.message[0]
        );
      });
  };

  const handleOnAddOrganizationsToUser = async (
    userId: string,
    groups: string[]
  ) => {
    await jwtAxios
      .put(`${TAM_USER_ADD_ORGANIZATIONS_URL}/${userId}`, groups)
      .then(({ data }) => {
        reCallAPI();
        // TODO: create a custom component notification
        notification.success({
          message: handleOnGetMessage("common.success"),
          description: handleOnGetMessage(
            "common.notification.update.description"
          ),
        });
      })
      .catch((error: any) => {
        console.log("Error: ", error);
        message.error(
          error.response.data.message || error.response.data.message[0]
        );
      });
  };

  const handleOnUpdateUserStatus = async (userId: string, status: string) => {
    await jwtAxios
      .put(`${TAM_USER_STATUS_URL}/${status}/${userId}`, {})
      .then(({ data }) => {
        reCallAPI();
        // TODO: create a custom component notification
        notification.success({
          message: handleOnGetMessage("common.success"),
          description: handleOnGetMessage(
            "common.notification.update.description"
          ),
        });
      })
      .catch((error: any) => {
        console.log("Error: ", error);
        message.error(
          error.response.data.message || error.response.data.message[0]
        );
      });
  };

  const handleOnDelete = async (user: UserType) => {
    confirm({
      title: handleOnGetMessage("common.modal.confirm.delete.title"),
      content: handleOnGetMessage("common.modal.confirm.delete.content"),
      okText: handleOnGetMessage("common.yes"),
      okType: "primary",
      cancelButtonProps: {
        style: { background: "#d12420", color: "white", border: "none" },
      },
      cancelText: handleOnGetMessage("common.no"),
      async onOk() {
        await jwtAxios
          .delete(`${TAM_USER_DELETE_URL}/${user._id}`)
          .then(({ data }) => {
            reCallAPI();
            // TODO: create a custom component notification
            notification.success({
              message: handleOnGetMessage("common.success"),
              description: handleOnGetMessage(
                "common.notification.archive.description"
              ),
            });
          })
          .catch((error: any) => {
            console.log("Error: ", error);
            message.error(
              error.response.data.message || error.response.data.message[0]
            );
          });
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  // Render
  return (
    <UserContext.Provider
      value={{
        users: apiData?.data,
        loading,
        isAppDrawerOpen,
        mode,
        user,
      }}
    >
      <UserActionsContext.Provider
        value={{
          handleOnAddUser,
          handleOnSubmitUser,
          setUser,
          handleOnGetUser,
          handleOnUpdateUser,
          handleOnUpdateUserStatus,
          handleOnDelete,
          handleOnAddOrganizationsToUser,
          setAppDrawerOpen,
          onPageChange,
          reCallAPI,
          setPage,
        }}
      >
        {children}
      </UserActionsContext.Provider>
    </UserContext.Provider>
  );
};

export default UserContextProvider;
