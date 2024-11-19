import { AttachmentType } from "./dashboards/AttachmentType";
import { OrganizationType } from "./dashboards/OrganizationType";

export type AuthUserType = {
  _id?: string;
  uid?: string;
  gender?: string;
  lastName?: string;
  firstName?: string;
  displayName?: string;
  username?: string;
  email?: string;
  currentOrganization?: OrganizationType;
  tmpPassword?: boolean;
  dateOfBorn?: string;
  status?: string;
  photoURL?: AttachmentType;
  token?: string;
  role?: string;
  photoRGA?: string;
  password?: string;
  country?: string;
  phoneNumber?: string;
  city?: string;
  address?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
};
