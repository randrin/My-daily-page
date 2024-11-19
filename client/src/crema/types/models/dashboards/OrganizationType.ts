import { AttachmentType } from "./AttachmentType";
import { UserType } from "./UserType";

export type OrganizationType = {
  _id?: string;
  code: string;
  name: string;
  description: string;
  createdBy: UserType;
  users: UserType[];
  logo: AttachmentType;
  phoneNumber: string;
  headOffice: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};
