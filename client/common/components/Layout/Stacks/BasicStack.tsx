import React from 'react';

import { Stack } from '@mui/material';

type BasicStackProps = {
    spacing?: number;
    children: React.ReactNode;
};

export default function BasicStack({ spacing = 2, children }: BasicStackProps) {
    return (
        <Stack spacing={spacing}>
            {children}
        </Stack>
    );
}
