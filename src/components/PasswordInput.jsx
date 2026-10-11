import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({ id, name, value, onChange, placeholder = 'Enter password', error, label }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="form-group">
      {label && <label className="form-label" htmlFor={id}>{label}</label>}
      <div className="password-wrapper">
        <input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          className={`form-input ${error ? 'error' : ''}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="current-password"
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShow(s => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
};

export default PasswordInput;
