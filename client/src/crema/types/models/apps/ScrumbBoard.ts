export type LabelObjType = {
  id: number;
  name: string;
  type: number;
  color: string;
};

export type MemberObjType = {
  id: number;
  name: string;
  image: string;
};

export type CheckedListObjType = {
  id: number;
  title: string;
};

export type AttachmentObjType = {
  id: number;
  file: {
    path: string;
    name: string;
    lastModified: number;
    lastModifiedDate: string;
  };
  preview: string;
};

export type CardObjType = {
  id: number;
  title: string;
  attachments: AttachmentObjType[];
  label: LabelObjType[];
  date: any;
  comments: any[];
  desc: string;
  members: MemberObjType[];
  checkedList: CheckedListObjType[];
};

export type CardListObjType = {
  id: number;
  name: string;
  cards: CardObjType[];
};

export type BoardObjType = {
  id: number;
  name: string;
  list: CardListObjType[];
};
