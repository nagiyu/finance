import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { SelectOptionType } from '@client-common/interfaces/SelectOptionType';

export interface ComboBoxAutocompleteProps {
  options: SelectOptionType[];
  value: SelectOptionType | null;
  onChange: (event: React.SyntheticEvent, value: SelectOptionType | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function ComboBoxAutocomplete({ options, value, onChange, label, placeholder, disabled }: ComboBoxAutocompleteProps) {
  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.label}
      value={value}
      onChange={onChange}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          variant="outlined"
          fullWidth
        />
      )}
    />
  );
}
