import React, { Ref } from 'react';
import NavLink from 'next/link';

type AppNavLinkProps = {
  activeClassName: string;
  className: string;

  [x: string]: any;
};
const AppNavLink = React.forwardRef(
  (
    { activeClassName, className, ...rest }: AppNavLinkProps,
    ref: Ref<HTMLAnchorElement>
  ) => <NavLink ref={ref} href={rest.to} {...rest} />
);

export default AppNavLink;
