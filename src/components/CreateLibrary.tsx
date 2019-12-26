import React, { useState, useEffect } from 'react';
import { TextField, CircularProgress, Button, RadioGroup, FormControlLabel, Radio, Grid, Snackbar, IconButton } from '@material-ui/core';
import { useStore, dispatch } from '../store';
import { useGapi } from '../hooks';
import { createLibrary } from '../db/createLibrary';
import { useScanLibrary } from '../hooks/useScanLibrary';
import { useHistory } from 'react-router-dom';

export const CreateLibrary = () => {

    const [gapi, loading] = useGapi();
    const [folders, setFolders] = useState();
    const [foldersCalled, setFoldersCalled] = useState(false);
    const [folderId, setFolderId] = useState('');
    const [name, setName] = useState('');
    const [snackbar] = useStore('snackbar');
    const history = useHistory();

    useEffect(() => {
        const getFolders = async () => {
            const folders = await (await gapi.client.drive.files.list({
                q: `mimeType contains 'folder' and 'root' in parents and not trashed`,
                spaces: "drive",
                fields: "nextPageToken,files(id,name,properties)",
                pageSize: 1000
            })).result.files;
            console.log(folders)
            if (folders !== undefined)
                setFolders(folders);
        }

        if (!foldersCalled && gapi) {
            setFoldersCalled(true)
            getFolders()
        }
    })

    if (!gapi || !folders)
        return <CircularProgress />

    const onChange = e => { 
        setFolderId(e.target.value)
        setName(e.target.label)
    }

    const doCreateLibrary = async () => {
        dispatch({ type: 'updateSnackbar', payload: { message: `Creating '${name}'...`}})
        const a = await createLibrary({ folderIds: [folderId], name, type: 'Movies' })
        dispatch({ type: 'closeSnackbar' });
        history.push(`/library/${a.id}`)
    }

    return (
        <div>
        <form noValidate autoComplete="off">
            <RadioGroup name="folderIds" onChange={onChange}>
                <Grid container spacing={3}>
                   {folders.map(f => 
                    <Grid item xs={3} key={f.id}>
                        <FormControlLabel value={f.id} control={<Radio />}
                            style={{flex: 1}} label={f.name}  />
                    </Grid>)}
                </Grid>
            </RadioGroup>

            <TextField label="Folder ID" value={folderId} onChange={e => setFolderId(e.target.value)} variant="outlined" />
            <TextField label="Library Name" value={name} onChange={e => setName(e.target.value)} variant="outlined" />
            <Button onClick={doCreateLibrary}>Create</Button>
        </form>
        </div>
    )
}