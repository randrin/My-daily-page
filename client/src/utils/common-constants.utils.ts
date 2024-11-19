// ENUMS
export enum StatusEnums {
  ACTIVE = "ACTIVE",
  DISABLED = "DISABLED",
  PENDING = "PENDING",
  NEVER_CONNECTED = "NEVER_CONNECTED",
  ARCHIVED = "ARCHIVED",
}
export enum StatusExpenseEnums {
  VALID = "VALID",
  UNDER_APPROVED = "UNDER_APPROVED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  ACCOUNTING = "ACCOUNTING",
}
export enum UsersRolesEnums {
  USER = "Contributor",
  ADMIN = "Administrator",
  MANAGER = "Manager",
}
export enum UsersProfileStepEnums {
  INFORMATIONS = "INFORMATIONS",
  CHANGE_PASSWORD = "CHANGE_PASSWORD",
  RESET_PASSWORD = "RESET_PASSWORD",
  ADDRESS = "ADDRESS",
}

export enum GenderEnums {
  MALE = "Male",
  FEMALE = "Female",
}

export enum FolderEnums {
  USER = "user",
  STAR = "star",
  CLONE = "clone",
}

export enum LabelColorEnums {
  RED = "red",
  PINK = "pink",
  PURPLE = "purple",
  INDIGO = "indigo",
  BLUE = "blue",
  CYAN = "cyan",
  TEAL = "teal",
  GREEN = "green",
  LIME = "lime",
  YELLOw = "yellow",
  AMBER = "amber",
  ORANGE = "orange",
  BROWN = "brown",
  BREY = "grey",
  BLACK = "black",
}

export const VIEW_TYPE = {
  GRID: "grid",
  LIST: "list",
};

// VARIABILES
export const GENDER_MALE = "Male";
export const GENDER_FEMALE = "Female";
export const FORMAT_DATE_ONE = "YYYY-MM-DD";
export const FORMAT_DATE_TWO = "HH:mm:ss";
export const FORMAT_DATE_THREE = "DD-MM-YYYY HH:mm:ss";
export const FORMAT_DATE_FOURTH = "DD-MM-YYYY";
export const MODE_ADD = "create";
export const MODE_VIEW = "view";
export const MODE_EDIT = "edit";
export const MODE_DELETE = "delete";
export const PREFIX_TAM_TAM = "TT-";
export const PREFIX_PERMISSION = "TT_";
export const PREFIX_PASSWORD = "Tam";
