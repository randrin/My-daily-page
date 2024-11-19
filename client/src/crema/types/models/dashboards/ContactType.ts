import { AttachmentType } from "./AttachmentType";
import { UserType } from "./UserType";

export type ContactType = {
  _id?: string;
  gender: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  email: string;
  birthday: string;
  phoneNumber: string;
  phoneNumberBis: string;
  website: string;
  companyName: string;
  companyAddress: string;
  photoURL: AttachmentType;
  notes: string;
  createdBy?: UserType;
  label: LabelType;
  isStarred?: boolean;
  isFrequent?: boolean;
  facebookId: string;
  twitterId: string;
  instagramId: string;
};

export type FolderType = {
  _id: string;
  name: string;
  alias: string;
  icon: string;
  createdBy: UserType;
  createdAt: string;
  updatedAt: string;
};

export type LabelType = {
  _id: string;
  name: string;
  alias: string;
  color: string;
  createdBy: UserType;
  createdAt: string;
  updatedAt: string;
};
