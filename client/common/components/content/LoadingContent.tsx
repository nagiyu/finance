'use client';

import React, { useState } from 'react';

interface LoadingContentProps {
    children: (
        loading: boolean,
        runWithLoading: <T>(func: () => Promise<T>) => Promise<T>
    ) => React.ReactNode;
}

export default function LoadingContent({
    children
}: LoadingContentProps) {
    const [loading, setLoading] = useState(false);

    async function runWithLoading<T>(func: () => Promise<T>): Promise<T> {
        setLoading(true);
        const result = await func();
        setLoading(false);
        return result;
    }

    return children(loading, runWithLoading);
}
