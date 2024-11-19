import { useGetDataApi } from "@crema/hooks/APIHooks";
import jwtAxios from "@crema/services/auth/jwt-auth";
import { RoleType } from "@crema/types/models/dashboards/RoleType";
import { Modal, message, notification } from "antd";
import { ReactNode, createContext, useContext, useState } from "react";
import { useIntl } from "react-intl";
import { MODE_ADD, MODE_EDIT } from "utils/common-constants.utils";
import {
  TAM_ROLES_URL,
  TAM_ROLE_ADD_PERMISSIONS_URL,
  TAM_ROLE_CREATE_URL,
  TAM_ROLE_DELETE_URL,
  TAM_ROLE_UPDATE_URL,
} from "utils/end-points.utils";

export type RoleContextType = {
  roles: RoleType[];
  loading: boolean;
  isAppDrawerOpen: boolean;
  role: any;
  mode: string;
};

const ContextState: RoleContextType = {
  roles: [],
  loading: false,
  isAppDrawerOpen: false,
  role: {},
  mode: MODE_ADD,
};

export type RoleActionContextType = {
  //setQueryParams: (data: object) => void;
  handleOnAddRole: () => void;
  setRole: (data: object) => void;
  handleOnSubmit: () => void;
  handleOnAddPermissions: (roleId: string, data: string[]) => void;
  setAppDrawerOpen: (data: boolean) => void;
  handleOnGetRole: (data: RoleType) => void;
  handleOnUpdate: (roleId: string, data: object) => void;
  handleOnDelete: (roleId: string) => void;
  onPageChange: (data: number) => void;
  reCallAPI: () => void;
  setPage: (data: number) => void;
};

const RoleContext = createContext<RoleContextType>(ContextState);
const RoleActionsContext = createContext<RoleActionContextType>({
  //setQueryParams: (data: object) => {},
  handleOnAddRole: () => {},
  setRole: (data: object) => {},
  handleOnSubmit: () => {},
  handleOnAddPermissions: (roleId: string, data: string[]) => {},
  setAppDrawerOpen: (data: boolean) => {},
  handleOnGetRole: (data: RoleType) => {},
  handleOnUpdate: (roleId: string, data: object) => {},
  handleOnDelete: (roleId: string) => {},
  onPageChange: (data: number) => {},
  reCallAPI: () => {},
  setPage: (data: number) => {},
});

export const useRoleContext = () => useContext(RoleContext);
export const useRoleActionsContext = () => useContext(RoleActionsContext);

type Props = {
  children: ReactNode;
};

export const RoleContextProvider = ({ children }: Props) => {
  // States
  const { messages } = useIntl();
  const [mode, setMode] = useState(MODE_ADD);
  const [page, setPage] = useState(0);
  const [isAppDrawerOpen, setAppDrawerOpen] = useState(false);
  const [role, setRole] = useState({
    title: "",
    description: "",
  });
  const [{ apiData, loading }, { setQueryParams, reCallAPI }] = useGetDataApi<{
    data: RoleType[];
  }>(TAM_ROLES_URL);

  // Destructing
  const confirm = Modal.confirm;

  // Functions
  const onPageChange = (value: number) => {
    setPage(value);
  };

  const handleOnAddRole = () => {
    setMode(MODE_ADD);
    setAppDrawerOpen(!isAppDrawerOpen);
    setRole({ title: "", description: "" });
  };

  const handleOnSubmit = async () => {
    await jwtAxios
      .post(TAM_ROLE_CREATE_URL, role)
      .then(({ data }) => {
        setRole({ title: "", description: "" });
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
          error.response.data.message || error.response.data.message[0]
        );
      });
  };

  const handleOnUpdate = async (roleId: string, role: object) => {
    await jwtAxios
      .put(`${TAM_ROLE_UPDATE_URL}/${roleId}`, role)
      .then(({ data }) => {
        reCallAPI();
        setAppDrawerOpen(!isAppDrawerOpen);
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

  const handleOnGetMessage = (message: string) => {
    return messages[message] as string;
  };

  const handleOnDelete = async (roleId: string) => {
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
          .delete(`${TAM_ROLE_DELETE_URL}/${roleId}`)
          .then(({ data }) => {
            reCallAPI();
            // TODO: create a custom component notification
            notification.success({
              message: handleOnGetMessage("common.success"),
              description: handleOnGetMessage(
                "common.notification.delete.description"
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

  const handleOnGetRole = (role: RoleType) => {
    setMode(MODE_EDIT);
    setAppDrawerOpen(!isAppDrawerOpen);
    setRole(role);
  };

  const handleOnAddPermissions = async (
    roleId: string,
    permissions: string[]
  ) => {
    console.log(permissions);
    await jwtAxios
      .put(`${TAM_ROLE_ADD_PERMISSIONS_URL}/${roleId}`, permissions)
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

  // Render
  return (
    <RoleContext.Provider
      value={{
        roles: apiData?.data,
        loading,
        isAppDrawerOpen,
        role,
        mode,
      }}
    >
      <RoleActionsContext.Provider
        value={{
          handleOnAddRole,
          setRole,
          handleOnAddPermissions,
          handleOnSubmit,
          setAppDrawerOpen,
          handleOnGetRole,
          onPageChange,
          handleOnUpdate,
          handleOnDelete,
          //setQueryParams,
          reCallAPI,
          setPage,
        }}
      >
        {children}
      </RoleActionsContext.Provider>
    </RoleContext.Provider>
  );
};

export default RoleContextProvider;
