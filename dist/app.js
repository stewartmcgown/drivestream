const API_KEY = "AIzaSyA5jzWRF3xGOHLq63ptF3VWOUokXUVOz5U"
const CLIENT_ID = "719757025459-da3v6ad3pte923qd2c8ue96bh3m5mofm.apps.googleusercontent.com"
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive';

let sleep = (time) => { return new Promise((resolve) => setTimeout(resolve, time)); }

class DriveStream {
    constructor(options) {
        this.containers = {
            loading: $("#drivestream .loading")
        }
    }

    set isFirstTime(a) {
        localStorage.setItem("isFirstTime", a)
    }

    get isFirstTime() {
        if (localStorage.getItem("isFirstTime") == "false")
            return false
        else
            return true
    }

    loadDriveAPI() {
        let that = this
        gapi.auth2.authorize({
            'client_id': CLIENT_ID,
            'immediate': false,
            'scope': SCOPES
        }, () => {
            that.isFirstTime = false
            that.hideSignIn()
            console.log("Loaded API")
        })
    }

    load() {
        if (this.isFirstTime) {
            this.showSignIn()
        } else {
            this.loadDriveAPI()
        }
    }

    async initiateClient() {
        await gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES
        })
    }

    showSignIn() {
        this.containers.loading.html(Components.signIn())
    }

    hideSignIn() {
        this.containers.loading.remove()
    }

    showLibraryScan() {
        this.containers.loading.html(Components.scanLibraryButton())
    }

    getLibraries() {
        this.initiateClient().then(() => {
            gapi.client.drive.files.list({
                'q': `properties has {key='drivestream_type' and value='library'}`,
                'spaces': 'drive',
                'fields': "nextPageToken,files(id,name)",
                'pageSize': 1000
            })    
        })
    }

}
class Library {
    /**
     * Creates a library object
     * @param {object} options 
     */
    constructor(options) {
        
    }

    create() {

    }
}
class MediaItem {
    /**
     * Creates a media item
     * @param {google.drive.File} file Drive file
     */
    constructor(file) {
        this.id = file.id
        this.fileName = file.name
        this.videoMediaMetadata_ = file.videoMediaMetadata
        this.thumb = file.thumbnailLink
        this.size = file.fileSize
    }

    get year() {
        let patt = /[^0-9](19|20)[0-9]{2}[^0-9]/, 
            match = patt.exec(this.fileName)

        if (match == null) return null
        else return match[0].split('.').join('')
    }

    get title() {
        let name = this.fileName.split('.').join(' '), 
            patt = /[^0-9](19|20)[0-9]{2}[^0-9]/, 
            match = patt.exec(name)
        if (match)
            return name.substr(0, match.index)
        else
            return null
    }

    get duration() {
        return {
            millis: this.videoMediaMetadata_.durationMillis,
            formatted: Utils.millisToDate(this.videoMediaMetadata_.durationMillis)
        }
    }

    get resolution() {
        return {
            height: this.videoMediaMetadata_.height,
            width: this.videoMediaMetadata_.width,
            formatted: `${this.videoMediaMetadata_.width}x${this.videoMediaMetadata_.height}`
        }
    }


}
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


/**
 * A library of dynamic, reusable components
 */
class Components {
    static signIn(message="Sign in with Google") {
        return `
        <div class="sign-in-container">
        <div class="sign-in-inner">
            <a class="button sign-in" href="#" onclick="gapi.load('client:auth2', app.loadDriveAPI)">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 48 48"><defs><path id="a" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/></defs><clipPath id="b"><use xlink:href="#a" overflow="visible"/></clipPath><path clip-path="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z"/><path clip-path="url(#b)" fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z"/><path clip-path="url(#b)" fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z"/><path clip-path="url(#b)" fill="#4285F4" d="M48 48L17 24l-4-3 35-10z"/></svg>
             ${message}
            </a>

            <a class="privacy-policy" href="privacy.html" target="blank">Privacy Policy</a>
            </div>
            </div>
        `
    }
}
class Utils {
    /**
     * Convert a number of milliseconds into a human readable
     * format.
     * 
     * @see https://stackoverflow.com/a/37168679/1255271
     * 
     * @param {number} millis 
     */
    static millisToDate(millis) {
        let seconds = (millis / 1000).toFixed(0), minutes = Math.floor(seconds / 60), hours = "";
        if (minutes > 59) {
            hours = Math.floor(minutes / 60);
            hours = (hours >= 10) ? hours : "0" + hours;
            minutes = minutes - (hours * 60);
            minutes = (minutes >= 10) ? minutes : "0" + minutes;
        }

        seconds = Math.floor(seconds % 60);
        seconds = (seconds >= 10) ? seconds : "0" + seconds;
        if (hours != "")
            return hours + ":" + minutes + ":" + seconds;
        return minutes + ":" + seconds;
    }
}