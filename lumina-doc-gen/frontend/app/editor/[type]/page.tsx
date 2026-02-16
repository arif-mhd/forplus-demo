import React from 'react';
import Editor from '@/src/components/editor/Editor';

export default async function EditorPage({ params }: { params: Promise<{ type: string }> }) {
    const { type } = await params;

    return (
        <Editor initialType={type} />
    );
}
