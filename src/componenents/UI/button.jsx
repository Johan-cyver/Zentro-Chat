import React from "react";
import classNames from "classnames";

export const Button = ({ children, onClick, className, variant = "default", ...props }) => {
  const variants = {
    default: "bg-purple-600 text-white hover:bg-purple-700",
    outline: "border border-purple-600 text-purple-600 hover:bg-purple-100",
  };

  return (
    <button
      onClick={onClick}
      className={classNames(
        "px-4 py-2 rounded transition duration-200 font-semibold",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
