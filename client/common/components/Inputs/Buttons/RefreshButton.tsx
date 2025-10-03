'use client';

import React from 'react';

import { IconButton } from '@mui/material';
import { Refresh } from '@mui/icons-material';

type RefreshButtonProps = {
    onClick: () => void;
    disabled?: boolean;
};

export default function RefreshButton({
    onClick,
    disabled = false
}: RefreshButtonProps) {
    return (
        <IconButton
            onClick={onClick}
            disabled={disabled}
            color="primary"
            aria-label="refresh"
        >
            <Refresh />
        </IconButton>
    );
}
