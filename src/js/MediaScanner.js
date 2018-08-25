/**
 * Scans a folder for media files and organises them appropriately
 */
class MediaScanner {
    /**
     * 
     * @param {string} id Id of root folder
     * @param {string} type Type of media
     * @param {DriveStream.Library} library A library 
     */
    constructor(id, type, library, drivestream) {
        this.root = id
        this.type = type
        this.library = library

        this.drivestream = drivestream

        this.activeRequests = 0
        this.isScanning_ = false
        this.mediaItems = []

        this.PAGE_SIZE = 1000
        this.MAX_ITEMS = 0
        
        this.UNSUPPORTED_FILE_TYPES = ["video/mp2t"]
    }

    get isScanning() {
        return this.isScanning_
    }

    set isScanning(isScanning) {
        this.isScanning_ = isScanning
    }

    scan() {
        this.isScanning = true

        this.recusriveListFolder(this.root)
    }

    processMediaFileList(list) {
        for (let m of list) {
            if (m.mimeType == "application/vnd.google-apps.folder") {
                this.recusriveListFolder(m.id)
            } else if (m.mimeType.includes("video/") && !this.UNSUPPORTED_FILE_TYPES.includes(m.mimeType)) {
                this.mediaItems.push(new MediaItem(m))
            }
            
        }        
    }

    printUnsupportedMimeTypes() {
        let s = ""
        for (let i = 0, mime; mime = this.UNSUPPORTED_FILE_TYPES[i]; i++) {
            if (s.length > 0)
                s += " "

            s += `mimeType contains ${mime}`

            if (i != (this.UNSUPPORTED_FILE_TYPES.length - 1))
                s += " or"
        }
        return s;
    }

    async recusriveListFolder(root, nextPageToken) {
        while (this.activeRequests >= 3) {
            await sleep(200)
        }

        this.activeRequests++
        this.drivestream.initiateClient().then(gapi.client.drive.files.list({
            'q': `'${root}' in parents and not ${this.printUnsupportedMimeTypes()}`,
            'spaces': 'drive',
            'fields': "nextPageToken,files(id,name,size,mimeType,videoMediaMetadata,thumbnailLink)",
            'pageToken': nextPageToken,
            pageSize: this.PAGE_SIZE
        })).then((response) => {
            this.activeRequests--

            if (response.result.error) {
                this.recusriveListFolder(root, nextPageToken)
            } else if (response.result.files) {
                this.processMediaFileList(response.result.files)

                if (response.result.nextPageToken) {
                    this.recusriveListFolder(root, response.result.nextPageToken)
                } else if (!response.result.nextPageToken)
                    this.isScanning = false
            }
        })
    }
}

