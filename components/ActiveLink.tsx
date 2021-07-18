import React, { ReactElement, Children } from "react";
import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
interface Props extends LinkProps {
  children: ReactElement;
  href: string;
  className?: string;
}
const ActiveLink = ({ children, href, className, ...props }: Props) => {
  const router = useRouter();
  const child = Children.only(children);
  const childClassName = child?.props?.className || "";
  const _class = router.pathname === href || router.pathname === props.as ? `${childClassName} active`.trim() : childClassName;
  return (
    <Link {...props} href={href}>
      {React.cloneElement(child, {
        className: _class || null,
      })}
    </Link>
  );
};
export default ActiveLink;