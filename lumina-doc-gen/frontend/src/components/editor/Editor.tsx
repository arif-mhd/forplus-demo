"use client";

import React from 'react';
import CustomEditor from './CustomEditor';
import FixedEditor from './FixedEditor';

export default function Editor({ initialType = 'custom' }: { initialType?: string }) {
    if (initialType === 'custom') {
        return <CustomEditor initialType={initialType} />;
    }

    return <FixedEditor templateType={initialType} />;
}
