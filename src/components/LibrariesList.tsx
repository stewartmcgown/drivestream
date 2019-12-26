import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import SettingsIcon from '@material-ui/icons/Settings';
import React, { useState, useEffect } from 'react';
import { useLibraries } from '../hooks/useLibraries';
import { ListItemText, ListItemIcon, CircularProgress } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { deleteLibrary } from '../db/deleteLibrary';

export const LibraryListItem = ({ library }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const isOpen = Boolean(anchorEl);
    const history = useHistory();
    
    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
      };
    
      const handleClose = () => {
        setAnchorEl(null);
      };

      const handleDelete = async (id) => {
            deleteLibrary({ id });
      }
    return (
        <ListItem button onClick={() => history.push(`/library/${library.id}`)} key={library.id}>
                            <ListItemText primary={library.name} />
                            <ListItemIcon onClick={handleMenu}><SettingsIcon /></ListItemIcon>
                            <Menu
                            id={`library-menu-${library.id}`}
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            >
                            <MenuItem onClick={handleClose}>Rename</MenuItem>
                            <MenuItem onClick={e => { handleDelete(library.id); handleClose(); }}>Delete</MenuItem>
                            </Menu>
                        </ListItem>
    )
}

export const LibrariesList = () => {
    const [fetchLibraries, { loading: librariesLoading, called: librariesCalled, data: libraries }] = useLibraries();

    if (!librariesCalled)
        fetchLibraries()


    return (
        <List>
            {libraries ? libraries.map((l, index) => (
                        <LibraryListItem library={l} key={l.id} />
                    )) : <CircularProgress />}
        </List>
    )
}