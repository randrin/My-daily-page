import { AttachmentType } from "./AttachmentType";
import { OrganizationType } from "./OrganizationType";

export type UserType = {
  _id?: string;
  uid?: string;
  gender?: string;
  lastName?: string;
  firstName?: string;
  displayName?: string;
  username?: string;
  biography?: string;
  email?: string;
  currentOrganization?: OrganizationType;
  tmpPassword?: boolean;
  dateOfBorn?: string;
  status?: string;
  photoURL?: AttachmentType;
  role?: string;
  photoRGA?: string;
  password?: string;
  country?: string;
  phoneNumber?: string;
  groups?: string[];
  city?: string[];
  address?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  createdBy: UserType;
};

export type FilterUserType = {
  fullName: string;
  status: string;
  defaultPassword: boolean;
  mrp: { start: number; end: number };
  createdAt?: { start?: string; end?: string };
};
