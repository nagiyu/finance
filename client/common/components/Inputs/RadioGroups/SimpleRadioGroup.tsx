import React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

export interface SimpleRadioGroupOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SimpleRadioGroupProps {
  options: SimpleRadioGroupOption[];
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void;
  name?: string;
  label?: string;
  row?: boolean;
  disabled?: boolean;
}

export default function SimpleRadioGroup({
  options,
  value,
  onChange,
  name,
  label,
  row = false,
  disabled = false,
}: SimpleRadioGroupProps) {
  return (
    <FormControl component="fieldset" disabled={disabled}>
      {label && <FormLabel component="legend">{label}</FormLabel>}
      <RadioGroup
        aria-label={name}
        name={name}
        value={value}
        onChange={onChange}
        row={row}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
            disabled={option.disabled}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}

