import IntlMessages from "@crema/helpers/IntlMessages";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Space,
  message,
} from "antd";
import dayjs from "dayjs";
import React from "react";
import { useDropzone } from "react-dropzone";
import { useIntl } from "react-intl";
import {
  StyledContactForm,
  StyledContactFormBtn,
  StyledContactFormContent,
  StyledContactFormContentField,
  StyledContactFormContentItem,
  StyledContactFormFooter,
  StyledContactFormItemTitle,
  StyledContactModalScrollbar,
} from "./index.styled";

import {
  StyledInfoUpload,
  StyledInfoUploadAvatar,
  StyledInfoUploadBtnView,
  StyledInfoUploadContent,
} from "@crema/modules/profile/UserProfile/PersonalInfo/index.styled";
import jwtAxios from "@crema/services/auth/jwt-auth";
import {
  ContactType,
  LabelType,
} from "@crema/types/models/dashboards/ContactType";
import {
  useContactsActionsContext,
  useContactsContext,
} from "modules/apps/context/ContactsContextProvider";
import { BsCloudUpload } from "react-icons/bs";
import { CiTrash } from "react-icons/ci";
import { IoReturnUpBackOutline } from "react-icons/io5";
import { LuCheckCircle } from "react-icons/lu";
import Resizer from "react-image-file-resizer";
import {
  FORMAT_DATE_FOURTH,
  GenderEnums,
  MODE_ADD,
} from "utils/common-constants.utils";
import {
  TAM_EXPENSE_UPLOAD_DELETE_URL,
  TAM_EXPENSE_UPLOAD_SINGLE_URL,
} from "utils/end-points.utils";

type AddContactFormProps = {
  selectContact?: ContactType | null;
  setContact: (contact: ContactType) => void;
  userImage: string;
  setUserImage: (image: string) => void;
  handleAddContactClose: () => void;
};

const AddContactForm: React.FC<AddContactFormProps> = ({
  userImage,
  selectContact,
  setContact,
  setUserImage,
  handleAddContactClose,
}) => {
  // States
  const { messages } = useIntl();
  const { labelList, contact, mode } = useContactsContext();
  const { handleOnSubmitContact, handlOnUpdateContact } =
    useContactsActionsContext();
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    onDrop: (acceptedFiles) => {
      if (!acceptedFiles.length) {
        message.error(<IntlMessages id="common.upload.not.allowed" />);
      } else if (acceptedFiles[0].size > 8000 * 1024) {
        message.error(<IntlMessages id="common.upload.file.size" />);
      } else {
        // Resize
        Resizer.imageFileResizer(
          acceptedFiles[0],
          720,
          720,
          "JPEG",
          100,
          0,
          async () => {
            const url = `${TAM_EXPENSE_UPLOAD_SINGLE_URL}`;
            const file = new FormData();
            file.append("file", acceptedFiles[0]);
            await jwtAxios
              .post(url, file, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              })
              .then((res) => {
                setContact({
                  ...selectContact,
                  photoURL: res.data,
                });
                setUserImage(res.data.secure_url);
              })
              .catch((error) => {
                console.log("handleOnChange Error: ", error);
                message.error(error.response.data.message);
              });
          },
          "base64"
        );
      }
    },
  });

  // Desctruction
  const { Option } = Select;

  // Functions
  const onFinish = (values: any) => {
    if (mode === MODE_ADD) {
      setContact({
        ...values,
        photoURL: selectContact?.photoURL ?? null,
      });
      handleOnSubmitContact();
    } else {
      let updContact = {
        ...values,
        photoURL: selectContact?.photoURL ?? null,
      }
      handlOnUpdateContact(contact._id, updContact);
    }
  };

  const onReset = async () => {
    const url = `${TAM_EXPENSE_UPLOAD_DELETE_URL}/${
      selectContact.photoURL.public_id.split("/")[1]
    }`;
    await jwtAxios
      .delete(url)
      .then((res) => {
        if (res.data.result === "ok" && res.status === 200) {
          setContact({
            ...selectContact,
            photoURL: null,
          });
          setUserImage("/assets/images/placeholder.jpg");
        }
      })
      .catch((error) => {
        console.log("handleImageRemove Error: ", error);
        message.error(error.response.data.message);
      });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  console.log("selectContact: ", selectContact);

  // Render
  return (
    <StyledContactForm
      name="basic"
      initialValues={{
        ...(selectContact
          ? {
              ...selectContact,
              label: selectContact.label._id,
              birthday: selectContact.birthday
                ? dayjs(selectContact.birthday)
                : "",
            }
          : {}),
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <StyledInfoUpload className="tt-expenses-space-center">
        <StyledInfoUploadAvatar src={userImage} />
        <StyledInfoUploadContent>
          <StyledInfoUploadBtnView>
            <div {...getRootProps({ className: "dropzone" })}>
              <input {...getInputProps()} />
              <label htmlFor="icon-button-file">
                <Button type="primary" className="tt-expenses-space-center">
                  <BsCloudUpload className="tt-expenses-margin-btn-icon" />{" "}
                  <IntlMessages id="common.upload" />
                </Button>
              </label>
            </div>
            {selectContact?.photoURL && (
              <Button
                danger
                onClick={onReset}
                className="tt-expenses-space-center"
              >
                <CiTrash className="tt-expenses-margin-btn-icon" />{" "}
                <IntlMessages id="common.delete" />
              </Button>
            )}
          </StyledInfoUploadBtnView>
          <p>
            <IntlMessages id="common.upload.allowed" />
          </p>
        </StyledInfoUploadContent>
      </StyledInfoUpload>

      <StyledContactModalScrollbar>
        <StyledContactFormContent>
          <StyledContactFormContentItem>
            <StyledContactFormItemTitle>
              <IntlMessages id="contactApp.personalDetails" />
            </StyledContactFormItemTitle>
            <StyledContactFormContentField>
              <Form.Item
                className="form-field"
                name="gender"
                rules={[
                  {
                    required: true,
                    message: <IntlMessages id="validation.genderRequired" />,
                  },
                ]}
              >
                <Radio.Group>
                  <Radio value={GenderEnums.MALE}>
                    {messages["common.gender.male"] as string}
                  </Radio>
                  <Radio value={GenderEnums.FEMALE}>
                    {messages["common.gender.female"] as string}
                  </Radio>
                </Radio.Group>
              </Form.Item>
              <Row style={{ marginBottom: 0 }}>
                <Col xl={12} lg={12}>
                  <Form.Item
                    className="form-field"
                    name="firstName"
                    rules={[
                      {
                        required: true,
                        message: (
                          <IntlMessages id="validation.firstNameRequired" />
                        ),
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder={messages["common.firstname"] as string}
                    />
                  </Form.Item>
                </Col>
                <Col xl={12} lg={12}>
                  <Form.Item
                    className="form-field"
                    name="lastName"
                    rules={[
                      {
                        required: true,
                        message: (
                          <IntlMessages id="validation.lastNameRequired" />
                        ),
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder={messages["common.lastname"] as string}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item className="form-field" name="email">
                <Input
                  size="large"
                  placeholder={messages["common.email"] as string}
                />
              </Form.Item>
              <Row style={{ marginBottom: 0 }}>
                <Col xl={12} lg={12}>
                  <Form.Item
                    className="form-field"
                    name="phoneNumber"
                    rules={[
                      {
                        required: true,
                        message: (
                          <IntlMessages id="validation.phoneNumberRequired" />
                        ),
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      type="tel"
                      onKeyPress={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      placeholder={messages["common.phone"] as string}
                    />
                  </Form.Item>
                </Col>
                <Col xl={12} lg={12}>
                  <Form.Item className="form-field" name="phoneNumberBis">
                    <Input
                      size="large"
                      type="tel"
                      onKeyPress={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      placeholder={messages["common.phone.bis"] as string}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row style={{ marginBottom: 0 }}>
                <Col xl={12} lg={12}>
                  <Form.Item
                    className="form-field"
                    name="label"
                    rules={[
                      {
                        required: true,
                        message: <IntlMessages id="validation.labelRequired" />,
                      },
                    ]}
                  >
                    <Select
                      size="large"
                      placeholder={messages["placeholder.select"] as string}
                    >
                      {labelList.map((label: LabelType) => {
                        return (
                          <Option value={label._id} key={label._id}>
                            {label.name}
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xl={12} lg={12}>
                  <Form.Item className="form-field" name="birthday">
                    <DatePicker
                      size="large"
                      format={FORMAT_DATE_FOURTH}
                      placeholder={messages["common.birthday"] as string}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </StyledContactFormContentField>
          </StyledContactFormContentItem>

          <StyledContactFormContentItem>
            <StyledContactFormItemTitle>
              <IntlMessages id="common.otherDetails" />
            </StyledContactFormItemTitle>
            <StyledContactFormContentField>
              <Form.Item className="form-field" name="companyName">
                <Input
                  size="large"
                  placeholder={messages["common.company"] as string}
                />
              </Form.Item>
              <Form.Item className="form-field" name="companyAddress">
                <Input
                  size="large"
                  placeholder={messages["common.address"] as string}
                />
              </Form.Item>
              <Form.Item className="form-field" name="website">
                <Input
                  size="large"
                  placeholder={messages["common.website"] as string}
                />
              </Form.Item>
            </StyledContactFormContentField>
          </StyledContactFormContentItem>

          <StyledContactFormContentItem>
            <StyledContactFormItemTitle>
              <IntlMessages id="common.socialMedia" />
            </StyledContactFormItemTitle>
            <StyledContactFormContentField>
              <Form.Item className="form-field" name="facebookId">
                <Input
                  size="large"
                  placeholder={messages["common.facebookId"] as string}
                />
              </Form.Item>
              <Form.Item className="form-field" name="instagramId">
                <Input
                  size="large"
                  placeholder={messages["common.instagramId"] as string}
                />
              </Form.Item>
              <Form.Item className="form-field" name="twitterId">
                <Input
                  size="large"
                  placeholder={messages["common.twitterId"] as string}
                />
              </Form.Item>
            </StyledContactFormContentField>
          </StyledContactFormContentItem>

          <StyledContactFormContentItem>
            <StyledContactFormItemTitle>
              <IntlMessages id="common.notes" />
            </StyledContactFormItemTitle>
            <Form.Item className="form-field" name="notes">
              <Input.TextArea
                rows={4}
                placeholder={messages["common.notes"] as string}
              />
            </Form.Item>
          </StyledContactFormContentItem>
        </StyledContactFormContent>

        <StyledContactFormFooter>
          <Space>
            <StyledContactFormBtn
              type="primary"
              ghost
              className="tt-expenses-space-center"
              onClick={handleAddContactClose}
            >
              <IoReturnUpBackOutline className="tt-expenses-margin-btn-icon" />{" "}
              <IntlMessages id="common.back" />
            </StyledContactFormBtn>
            <StyledContactFormBtn
              type="primary"
              className="tt-expenses-space-center"
              htmlType="submit"
            >
              <LuCheckCircle className="tt-expenses-margin-btn-icon" />{" "}
              <IntlMessages id="common.submit" />
            </StyledContactFormBtn>
          </Space>
        </StyledContactFormFooter>
      </StyledContactModalScrollbar>
    </StyledContactForm>
  );
};

export default AddContactForm;
