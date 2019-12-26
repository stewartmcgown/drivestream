import React from 'react';
import { MediaItemTile } from "./MediaItemTile"
import { MediaItem as MediaItemModel } from '../models/MediaItem';

export interface LibraryProps {
    mediaItems: MediaItemModel[];
}

export const Library = ({
    mediaItems,
}: LibraryProps) => {

    return <div>
        {mediaItems.map(m => <MediaItemTile media={m} />)}
    </div>
}