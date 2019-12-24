import React from 'react';
import { MediaItem as MediaItemProps } from "../models/MediaItem";

export const MediaItem = ({ media }: { media: MediaItemProps } ) => {
    return (<a className="card-url" target="_blank">
                <div className="card vertical media-card" id={media.id}>
                    <div className="card-image">
                        <img src={media.getPoster(400)} className="media-image" />
                    </div>
                    <div className="card-content">
                        <span className="card-title">{media.name}</span>
                        <span className="year">${media.year}</span>
                        <span className="duration">{
                                                        media.duration.formatted
                                                    }</span>
                    </div>
                </div>
            </a>)
}