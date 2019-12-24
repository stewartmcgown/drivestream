import React, { useState, useEffect } from 'react';
import { TextField, CircularProgress, Button, RadioGroup, FormControlLabel, Radio, Grid } from '@material-ui/core';
import { useStore } from '../store';
import { useGapi } from '../hooks';

export const CreateLibrary = () => {

    const [gapi, loading] = useGapi();
    const [folders, setFolders] = useState();
    const [foldersCalled, setFoldersCalled] = useState(false);
    const [folderId, setFolderId] = useState('');

    useEffect(() => {
        const getFolders = async () => {
            const folders = await (await gapi.client.drive.files.list({
                q: `mimeType contains 'folder' and 'root' in parents and not trashed`,
                spaces: "drive",
                fields: "nextPageToken,items(id,title,properties)",
                pageSize: 1000
            })).result.items;
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

    const onChange = e => setFolderId(e.target.value)

    return (
        <form noValidate autoComplete="off">
            <RadioGroup aria-label="gender" name="gender1" onChange={onChange}>
                <Grid container spacing={3}>
                   {folders.map(f => 
                    <Grid item xs={3}>
                        <FormControlLabel value={f.id} control={<Radio />}
                            style={{flex: 1}} label={f.title}  />
                    </Grid>)}
                </Grid>
            </RadioGroup>

            <TextField id="outlined-basic" label="Folder ID" value={folderId} onChange={e => setFolderId(e.target.value)} variant="outlined" />
            <Button>Create</Button>
        </form>
    )
}