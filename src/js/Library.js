class Library {
    /**
     * Creates a library object
     * @param {object} options 
     */
    constructor(options, drivestream) {
        this.id = options.id
        this.name = options.name
        this.type = options.type
        this.root = options.properties.root

        this.mediaItems = []

        this.drivestream = drivestream

        this.scanner = new MediaScanner(this, this.drivestream)

    }

    refresh() {
        this.scanner.scan()
    }

    updateMediaItems() {
        this.mediaItems = this.scanner.mediaItems
        let payload = this.mediaItems.map(m => Object.values(m))
        gapi.client.sheets.spreadsheets.values.batchUpdate({
            "spreadsheetId": this.id,
            "resource": {
                "valueInputOption": 'RAW',
                "data": [
                    {
                        "range": "A2:Z",
                        "values": payload
                    }
                ]
            }
        }).then(r => console.log(r))
    }
}