import React from 'react';

import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

interface ControlledCheckboxProps {
    label?: string;
    checked: boolean;
    disabled?: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ControlledCheckbox({
    label,
    checked,
    disabled,
    onChange
}: ControlledCheckboxProps) {
    if (label) {
        return (
            <FormControlLabel
                control={
                    <Checkbox
                        checked={checked}
                        disabled={disabled}
                        onChange={onChange}
                    />
                }
                label={label}
                disabled={disabled}
            />
        );
    }

    return (
        <Checkbox
            checked={checked}
            disabled={disabled}
            onChange={onChange}
        />
    );
};
