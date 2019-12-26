import { createStyles, makeStyles, Theme, useTheme, CardActionArea } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import React from 'react';
import { MediaItem as MediaItemProps } from "../models/MediaItem";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    playIcon: {
      height: 38,
      width: 38,
    },
    media: {
        height: '200px',
    },
    title: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    card: {
        
    }
  }),
);

export const MediaItemTile = ({ media }: { media: MediaItemProps } ) => {    
    const classes = useStyles();
    const theme = useTheme();

    return (<Card className={classes.card}>
        <CardActionArea>
        <CardMedia
          component="img"
          className={classes.media}
          image={media.getPoster(400)}
          title={media.title}
        />
          <CardContent>
            <Typography component="h6" variant="h6" className={classes.title}>
              {media.title}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {media.year || 'No Year'}
            </Typography>
          </CardContent>
        
        </CardActionArea>
      </Card>)

    /*return (<a className="card-url" target="_blank">
                <div className="card vertical media-card" id={media.id}>
                    <div className="card-image">
                        <img src={media.getPoster(400)} className="media-image" />
                    </div>
                    <div className="card-content">
                        <span className="card-title">{media.title}</span>
                        <span className="year">${media.year}</span>
                        <span className="duration">{
                                                        media.duration.formatted
                                                    }</span>
                    </div>
                </div>
            </a>)*/
}