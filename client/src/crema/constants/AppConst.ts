export const countries = [
  {
    code: "CMR",
    name: "Cameroun",
    currency: "FCFA",
  },
  {
    code: "USA",
    name: "Etats Unis",
    currency: "$",
  },
];

export const decisions = [
  {
    value: "Yes",
    label: "Yes",
  },
  {
    value: "No",
    label: "No",
  },
];

export const currencies = [
  {
    value: "FCFA",
    label: "FCFA",
  },
  {
    value: "DOLLAR",
    label: "$",
  },
  {
    value: "EURO",
    label: "€",
  },
];

export const authRole = {
  Admin: ["admin"],
  User: ["user", "admin"],
};

export const defaultUser: any = {
  uid: "john-alex",
  displayName: "John Alex",
  email: "demo@example.com",
  token: "access-token",
  role: "user",
  photoURL: "/assets/images/avatar/A11.jpg",
};
export const allowMultiLanguage =
  process.env.NEXT_PUBLIC_MULTILINGUAL === "true";
export const fileStackKey = process.env.NEXT_PUBLIC_FILESTACK_KEY as string;
export const authorizationUrl = process.env
  .NEXT_PUBLIC_CHECK_USER_URL as string; // this url will open before login if user has ACTIVE status and more organizations
export const initialUrl = process.env.NEXT_PUBLIC_INITIAL_URL as string; // this url will open after login if user has only one organization
export const isTemporalPasswordUrl = process.env.NEXT_PUBLIC_TEMPORAL_PASSWORD_USER_URL as string; // This url will open only in the first authentification of the user 
