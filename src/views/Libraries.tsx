import React from 'react';
import { useParams } from 'react-router-dom';
import { useLibraries } from '../hooks/useLibraries';
import { useLibrary } from '../hooks/useLibrary';

export const Libraries = () => {
    const { id } = useParams();
    const [library] = useLibrary(id || '');

    return <div>
        <h1>{id}</h1>
    </div>
}