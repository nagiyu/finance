import React from 'react';

import { Stack } from '@mui/material';

type DirectionStackProps = {
    spacing?: number;
    justifyContent?: 'flex-start' | 'center' | 'flex-end';
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
    children: React.ReactNode;
};

export default function DirectionStack({
    spacing = 2,
    justifyContent = 'center',
    alignItems = 'center',
    children,
}: DirectionStackProps) {
    return (
        <Stack
            direction="row"
            spacing={spacing}
            justifyContent={justifyContent}
            alignItems={alignItems}
        >
            {children}
        </Stack>
    );
}
