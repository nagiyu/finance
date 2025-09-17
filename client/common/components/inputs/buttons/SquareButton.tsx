'use client';

import React from 'react';

import { Button } from '@mui/material';

interface SquareButtonProps {
    label: string;
    icon?: React.ReactNode;
    size?: string;
    disabled?: boolean;
    loading?: boolean;
    onClick: () => void;
}

export default function SquareButton({
    label,
    icon,
    size = '30vw',
    disabled = false,
    loading = false,
    onClick
}: SquareButtonProps) {
    return (
        <Button
            variant="outlined"
            onClick={onClick}
            loading={loading}
            disabled={disabled}
            sx={{ width: size, height: size, minWidth: size, minHeight: size, aspectRatio: 1 }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {icon}
                <span style={{ marginTop: 4 }}>{label}</span>
            </div>
        </Button>
    );
}
