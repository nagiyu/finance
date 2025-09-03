'use client';

import React from 'react';

import { Button } from '@mui/material';

type ContainedButtonProps = {
    label: string;
    onClick: () => void;
    disabled?: boolean;
};

export default function ContainedButton({
    label,
    onClick,
    disabled = false
}: ContainedButtonProps) {
    return (
        <Button
            variant="contained"
            onClick={onClick}
            disabled={disabled}
        >
            {label}
        </Button>
    );
}
