import React from "react";
import classNames from "classnames";

export const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={classNames(
        "bg-white dark:bg-gray-900 shadow-md rounded-lg p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={classNames("mt-2", className)} {...props}>
      {children}
    </div>
  );
};
