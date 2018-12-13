# Drivestream

### Organise and stream media from Google Drive, without a server

![logo](https://twistedcore.co.uk/img/portfolio/drivestream.jpg)

## Setup

1. Create credentials for Google Drive using the [wizard](https://developers.google.com/drive/api/v3/quickstart/js)
2. Add those credentials to a file in the project root called 'credentials.js'

```javascript
export const API_KEY = "YOUR_API_KEY"
export const CLIENT_ID = "YOUR_CLIENT_ID"
```

3. Run the project using `npm run dev`

## Create a Library

Haven't made the UI work with this yet. Run `app.createLibrary({name: "name", root: "rootFolderID"})` to make one. Promise I'll add this to the UI soon!

## Roadmap

1. Switch to Vue
