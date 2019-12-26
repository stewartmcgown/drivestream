import React from 'react';
import { useParams } from 'react-router-dom';
import { useLibraries } from '../hooks/useLibraries';
import { useLibrary } from '../hooks/useLibrary';
import { MediaItemTile } from '../components/MediaItemTile';
import { Grid, CircularProgress } from '@material-ui/core';

export const LibraryView = () => {
    const { id } = useParams();
    const [fetchLibrary, { loading, called, data: library }] = useLibrary(id!);

    if (!called)
        fetchLibrary()

    if (loading || !called) return <CircularProgress color="secondary" />

    return <div>
        <h1>{library.name}</h1>

        <Grid container spacing={3}>
            {Object.values(library.mediaItems).map(m => 
                <Grid item xs={3} key={m.id}>
                    <MediaItemTile media={m} />
                </Grid>
            )}
        </Grid>
    </div>
}