// frontend/src/components/Button.jsx
import React from 'react';

const Button = ({
  type = "submit",
  primary = true,
  text,
  disabled = false,
  onClick,
  className = "",
  icon = null,
  children
}) => {
  return (
    <button
      {...(type ? { type } : {})}
      disabled={disabled}
      onClick={onClick}
      className={`button ${primary ? 'primary' : 'secondary'} ${className}`.trim()}
    >
      {icon && <span className="button-icon">{icon}</span>}
      {text ? <span className="label">{text}</span> : children}
    </button>
  );
};

export default Button;
