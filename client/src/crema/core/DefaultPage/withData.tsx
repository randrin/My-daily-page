import AppLoader from "@crema/components/AppLoader";
import {
  authorizationUrl,
  initialUrl,
  isTemporalPasswordUrl,
} from "@crema/constants/AppConst";
import { useAuthUser } from "@crema/hooks/AuthHooks";
import Router, { useRouter } from "next/router";
import { StatusEnums } from "utils/common-constants.utils";
import { TAM_SIGNIN_URL } from "utils/end-points.utils";
import { useEffect } from "react";

// eslint-disable-next-line react/display-name
const withData = (ComposedComponent: any) => (props: any) => {
  // States
  const { user, isLoading, groups } = useAuthUser();
  const { asPath } = useRouter();
  console.log(asPath);
  
  const queryParams = asPath.split("?")[1];

  console.log(asPath);
  console.log(queryParams);

  // Init
  useEffect(() => {
    console.log(user);
    console.log(groups);

    if (user) {
      if (user.status === StatusEnums.ACTIVE && groups.length === 1) {
        Router.push(initialUrl + (queryParams ? "?" + queryParams : ""));
      }
       else if (user.status !== StatusEnums.ACTIVE || groups.length > 1) {
        Router.push(authorizationUrl);
      }
      // else {
      //   Router.push(authorizationUrl);
      // }
    } 
    // else {
    //   Router.push(TAM_SIGNIN_URL);
    // }
  }, [queryParams, user, groups]);

  // Functions
  if (isLoading) return <AppLoader />;
  if (user) return <AppLoader />;

  // Render
  return <ComposedComponent {...props} />;
};

export default withData;
