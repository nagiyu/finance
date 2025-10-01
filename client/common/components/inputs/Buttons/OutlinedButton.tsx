'use client';

import React from 'react';

import { Button } from '@mui/material';

type OutlinedButtonProps = {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
    sx?: object;
};

export default function OutlinedButton({
    label,
    onClick,
    disabled = false,
    size = 'medium',
    sx = {}
}: OutlinedButtonProps) {
    return (
        <Button
            variant="outlined"
            size={size}
            onClick={onClick}
            disabled={disabled}
            sx={sx}
        >
            {label}
        </Button>
    );
}
