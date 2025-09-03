'use client';

import React from 'react';

import { Tab, Tabs } from '@mui/material';

type SimpleTabProps = {
    tabs: {
        label: string;
        content: React.ReactNode;
    }[];
    tabIndex: number;
    onChange: (index: number) => void;
};

export default function SimpleTab({
    tabs,
    tabIndex,
    onChange,
}: SimpleTabProps) {
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        onChange(newValue);
    };

    return (
        <>
            <Tabs value={tabIndex} onChange={handleChange}>
                {tabs.map((tab, idx) => (
                    <Tab key={idx} label={tab.label} />
                ))}
            </Tabs>
            <div>
                {tabs[tabIndex] && tabs[tabIndex].content}
            </div>
        </>
    );
}
