/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import type React from "react";
import clsx from "clsx";

interface MenuItemProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLLIElement>) => void;
}

interface MenuItemGroupProps {
  border?: boolean;
  children: React.ReactNode;
}

const MenuItem = (props: MenuItemProps) => (
  <li
    className="leading-6 cursor-default px-2.5 rounded-md hover:text-white hover:bg-blue-500"
    onClick={props.onClick}
  >
    {props.children}
  </li>
);

const MenuItemGroup = (props: MenuItemGroupProps) => {
  const borderClass =
    props.border === false ? "pb-1" : "pb-1.5 border-b border-gray-400 mx-2";

  return (
    <ul className={clsx("relative  pt-1", borderClass)}>{props.children}</ul>
  );
};

export { MenuItem, MenuItemGroup };
