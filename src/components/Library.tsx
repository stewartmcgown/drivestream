import React from 'react';
import { MediaItem } from "./MediaItem"
import { MediaItem as MediaItemModel } from '../models/MediaItem';

export interface LibraryProps {
    mediaItems: MediaItemModel[];
}

export const Library = ({
    mediaItems,
}: LibraryProps) => {

    return <div>
        {mediaItems.map(m => <MediaItem media={m} />)}
    </div>
}