import React from 'react';

export interface BasicRadioGroupOption {
  label: string;
  value: string;
  disabled?: boolean;
  description?: string;
}

export interface BasicRadioGroupProps {
  options: BasicRadioGroupOption[];
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  label?: string;
  row?: boolean;
  disabled?: boolean;
}

export default function BasicRadioGroup({
  options,
  value,
  onChange,
  name,
  label,
  row = false,
  disabled = false,
}: BasicRadioGroupProps) {
  const groupId = React.useId();
  const radioName = name || `radio-group-${groupId}`;

  return (
    <fieldset 
      disabled={disabled} 
      style={{ 
        border: 'none', 
        padding: 0, 
        margin: '16px 0',
        minWidth: 0
      }}
    >
      {label && (
        <legend style={{ 
          fontSize: '1rem', 
          fontWeight: 500, 
          marginBottom: '8px',
          padding: '0 4px'
        }}>
          {label}
        </legend>
      )}
      <div style={{ 
        display: 'flex', 
        flexDirection: row ? 'row' : 'column', 
        gap: row ? '16px' : '8px' 
      }}>
        {options.map((option) => {
          const optionId = `${radioName}-${option.value}`;
          const isDisabled = disabled || option.disabled;
          
          return (
            <label 
              key={option.value}
              htmlFor={optionId}
              style={{ 
                display: 'flex', 
                alignItems: row && !option.description ? 'center' : 'flex-start', 
                gap: '8px',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.6 : 1,
                margin: 0,
                padding: '4px 0'
              }}
            >
              <input
                id={optionId}
                type="radio"
                name={radioName}
                value={option.value}
                checked={value === option.value}
                disabled={isDisabled}
                onChange={onChange}
                style={{
                  margin: '0',
                  marginTop: option.description ? '2px' : '0'
                }}
              />
              <div style={{ flex: 1 }}>
                <span style={{ 
                  fontSize: '1rem',
                  lineHeight: '1.5'
                }}>
                  {option.label}
                </span>
                {option.description && (
                  <div style={{ 
                    marginTop: '4px',
                    fontSize: '0.75rem', 
                    color: '#666', 
                    lineHeight: '1.4'
                  }}>
                    {option.description}
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}