import React, { useState } from "react";
import "./Input.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input-field ${error ? "input-field--error" : ""}`}
        {...props}
        type={
          props.type === "password"
            ? isPasswordVisible
              ? "text"
              : "password"
            : props.type
        }
      />
      {props.type === "password" && (
        <button
          type="button"
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          className="password-toggle"
        >
          {isPasswordVisible ? "Hide" : "Show"}
        </button>
      )}
      {error && <p className="input-error-text">{error}</p>}
    </div>
  );
};
