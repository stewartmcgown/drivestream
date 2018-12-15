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

## Demo

View the live demo at [my personal site](https://twistedcore.co.uk/drivestream).

## Create a Library

Click the '+' in the top right of the page. Either choose a folder from the list or paste in the ID.
Once a library has been created, click "Update". It will find all the items. Check the console for updates.
Once it has found all the items (or before, it still works), click "Refresh MetaData". It will match all the items to the Movie DB.

## Roadmap

1. Switch to Vue
2. Better library creation process

This whole thing is still a bit janky. Give me a shout in the Issues for new feature requests.
