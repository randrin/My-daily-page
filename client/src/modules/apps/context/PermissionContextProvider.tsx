import { useGetDataApi } from "@crema/hooks/APIHooks";
import jwtAxios from "@crema/services/auth/jwt-auth";
import { PermissionType } from "@crema/types/models/dashboards/PermissionType";
import { Modal, message, notification } from "antd";
import { ReactNode, createContext, useContext, useState } from "react";
import { useIntl } from "react-intl";
import {
  MODE_ADD,
  MODE_EDIT,
  PREFIX_PERMISSION,
} from "utils/common-constants.utils";
import {
  TAM_PERMISSIONS_URL,
  TAM_PERMISSION_CREATE_URL,
  TAM_PERMISSION_DELETE_URL,
  TAM_PERMISSION_STATUS_URL,
  TAM_PERMISSION_UPDATE_URL,
} from "utils/end-points.utils";

export type PermissionContextType = {
  permissions: PermissionType[];
  loading: boolean;
  isAppDrawerOpen: boolean;
  permission: any;
  mode: string;
};

const ContextState: PermissionContextType = {
  permissions: [],
  loading: false,
  isAppDrawerOpen: false,
  permission: {},
  mode: MODE_ADD,
};

export type PermissionActionContextType = {
  //setQueryParams: (data: object) => void;
  handleOnAddPermission: () => void;
  setPermission: (data: object) => void;
  handleOnSubmit: () => void;
  setAppDrawerOpen: (data: boolean) => void;
  handleOnGetPermission: (data: PermissionType) => void;
  handleOnUpdate: (permissionId: string, data: object) => void;
  handleOnDelete: (permissionId: string) => void;
  handleOnEnabledOrDisabled: (permissionId: string) => void;
  onPageChange: (data: number) => void;
  reCallAPI: () => void;
  setPage: (data: number) => void;
};

const PermissionContext = createContext<PermissionContextType>(ContextState);
const PermissionActionsContext = createContext<PermissionActionContextType>({
  //setQueryParams: (data: object) => {},
  handleOnAddPermission: () => {},
  setPermission: (data: object) => {},
  handleOnSubmit: () => {},
  setAppDrawerOpen: (data: boolean) => {},
  handleOnGetPermission: (data: PermissionType) => {},
  handleOnUpdate: (permissionId: string, data: object) => {},
  handleOnDelete: (permissionId: string) => {},
  handleOnEnabledOrDisabled: (permissionId: string) => {},
  onPageChange: (data: number) => {},
  reCallAPI: () => {},
  setPage: (data: number) => {},
});

export const usePermissionContext = () => useContext(PermissionContext);

export const usePermissionActionsContext = () =>
  useContext(PermissionActionsContext);
type Props = {
  children: ReactNode;
};

export const PermissionContextProvider = ({ children }: Props) => {
  // States
  const { messages } = useIntl();
  const [mode, setMode] = useState(MODE_ADD);
  const [page, setPage] = useState(0);
  const [isAppDrawerOpen, setAppDrawerOpen] = useState(false);
  const [permission, setPermission] = useState({
    code: "",
    description: "",
  });
  const [{ apiData, loading }, { setQueryParams, reCallAPI }] = useGetDataApi<{
    data: PermissionType[];
  }>(TAM_PERMISSIONS_URL);

  // Destructing
  const confirm = Modal.confirm;

  // Functions
  const onPageChange = (value: number) => {
    setPage(value);
  };

  const handleOnAddPermission = () => {
    setMode(MODE_ADD);
    setAppDrawerOpen(!isAppDrawerOpen);
    setPermission({ code: "", description: "" });
  };

  const handleOnSubmit = async () => {
    let data = {
      ...permission,
      code: PREFIX_PERMISSION + permission.code.toLocaleUpperCase(),
    };

    await jwtAxios
      .post(TAM_PERMISSION_CREATE_URL, data)
      .then(({ data }) => {
        setPermission({ code: "", description: "" });
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

  const handleOnUpdate = async (permissionId: string, permission: PermissionType) => {
    let data = {
      ...permission,
      code: PREFIX_PERMISSION + permission.code.toLocaleUpperCase(),
    };
    await jwtAxios
      .put(`${TAM_PERMISSION_UPDATE_URL}/${permissionId}`, data)
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

  const handleOnEnabledOrDisabled = async (permissionId: string) => {
    await jwtAxios
      .put(`${TAM_PERMISSION_STATUS_URL}/${permissionId}`)
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

  const handleOnGetMessage = (message: string) => {
    return messages[message] as string;
  };

  const handleOnDelete = async (permissionId: string) => {
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
          .delete(`${TAM_PERMISSION_DELETE_URL}/${permissionId}`)
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

  const handleOnGetPermission = (permission: PermissionType) => {
    setMode(MODE_EDIT);
    setAppDrawerOpen(!isAppDrawerOpen);
    setPermission({
      ...permission,
      code: permission.code.slice(PREFIX_PERMISSION.length),
    });
  };

  // Render
  return (
    <PermissionContext.Provider
      value={{
        permissions: apiData?.data,
        loading,
        isAppDrawerOpen,
        permission,
        mode,
      }}
    >
      <PermissionActionsContext.Provider
        value={{
          handleOnAddPermission,
          setPermission,
          handleOnSubmit,
          setAppDrawerOpen,
          handleOnGetPermission,
          onPageChange,
          handleOnUpdate,
          handleOnDelete,
          handleOnEnabledOrDisabled,
          //setQueryParams,
          reCallAPI,
          setPage,
        }}
      >
        {children}
      </PermissionActionsContext.Provider>
    </PermissionContext.Provider>
  );
};

export default PermissionContextProvider;
