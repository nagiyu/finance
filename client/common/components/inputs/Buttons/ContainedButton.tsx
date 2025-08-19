'use client';

import React from 'react';

import { Button } from '@mui/material';

type ContainedButtonProps = {
    label: string;
    onClick: () => void;
};

export default function ContainedButton({ label, onClick }: ContainedButtonProps) {
    return (
        <Button
            variant="contained"
            onClick={onClick}
        >
            {label}
        </Button>
    );
}
