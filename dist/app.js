const API_KEY = "AIzaSyA5jzWRF3xGOHLq63ptF3VWOUokXUVOz5U"
const CLIENT_ID = "719757025459-da3v6ad3pte923qd2c8ue96bh3m5mofm.apps.googleusercontent.com"
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest", "https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets';

let sleep = (time) => { return new Promise((resolve) => setTimeout(resolve, time)); }

class DriveStream {
    constructor(options) {
        this.ui = new UI(this)
        this.libraries = []
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
        }, async () => {
            that.isFirstTime = false
            that.ui.hideSignIn()
            await that.initiateClient()
            that.getLibraries()
            console.log("Loaded API")
        })
    }

    load() {
        if (this.isFirstTime) {
            this.ui.showSignIn()
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

    /**
     * Creates a remote library from a Library object
     * @param {Library} library 
     */
    createLibrary(library) {
        gapi.client.sheets.spreadsheets.create({}, {
            "properties": {
                "title": library.name
            }
        }).then((sheets) => {
            gapi.client.drive.files.update({
                'fileId': sheets.result.spreadsheetId,
                'removeParents': 'root',
                'fields': 'id, name, properties',
                'resource': { "properties": [{ "drivestream": "library" }] }
            }).then((r) => {
                gapi.client.drive.files.update({
                    'fileId': sheets.result.spreadsheetId,
                    'fields': 'id, name, properties',
                    'resource': { "properties": [{ "root": library.root }] }
                }).then((r) => {
                    console.log(r)
                    this.getLibraries()
                })
            })
        })
    }

    /**
     * Batch update a remote library
     * @param {Library} library 
     */
    updateLibrary(library) {

    }

    /**
     * Set the current libraries
     * @param {Library[]} libraries 
     */
    setLibraries(libraries) {
        this.libraries = []
        for (let l of libraries) {
            this.libraries.push(new Library(l, this))
        }

        this.ui.showLibraries()
    }

    async getLibraries() {
        gapi.client.drive.files.list({
            'q': `properties has {key='drivestream' and value='library'} and trashed = false`,
            'spaces': 'drive',
            'fields': "nextPageToken,files(id,name,properties)",
            'pageSize': 1000
        }).then((response) => {
            this.setLibraries(response.result.files)
        })
    }

    getLibrary(library) {
        this.activeLibrary = library
        return gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: library.id,
            range: "A2:Z"
        }).then((response) => {
            library.mediaItems = response.result.values.map(row => new MediaItem(row))
            this.ui.emptyMediaItems()
            for (let l of library.mediaItems)
                this.ui.showMediaItem(l)
        })
    }

    refreshLibrary(library) {
        let l = this.libraries.find(o => o.id == library.id)
        l.refresh()
    }
}
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
class MediaItem {
    /**
     * Creates a media item
     * @param {google.drive.File} file Drive file OR a row
     */
    constructor(file) {
        let a = file.constructor === Array

        this.id = a ? file[0] : file.id
        this.name = a ? file[1] : MediaItem.getTitle(file.name)
        this.durationMillis = a ? Number.parseInt(file[2]) : file.videoMediaMetadata.durationMillis
        this.width = a ? Number.parseInt(file[4]) : file.videoMediaMetadata.width
        this.height = a ? Number.parseInt(file[3]) : file.videoMediaMetadata.height
        this.thumb = a ? file[5] : file.thumbnailLink
        this.size = a ? file[6] : file.size
        this.year = a ? file[7] : MediaItem.getYear(file.name)
        this.description = a ? file[8] : undefined
        this.poster_ = a ? file[9] : undefined

        /*this.videoMediaMetadata_ = a ? {
            durationMillis: Number.parseInt(file[2]),
            height: Number.parseInt(file[3]),
            width: Number.parseInt(file[4])
        } : file.videoMediaMetadata */
    }

    static getYear(title) {
        if (this.year_)
            return this.year_

        let patt = /[^0-9](19|20)[0-9]{2}[^0-9]/,
            match = patt.exec(title)

        if (match == null) return null
        else return match[0].split('.').join('')
    }

    static getTitle(title) {
        if (this.title_)
            return this.title_

        let name = title.split('.').join(' '),
            patt = /[^0-9](19|20)[0-9]{2}[^0-9]/,
            match = patt.exec(title)
        if (match)
            return name.substr(0, match.index).trim()
        else
            return null
    }

    get title() {
        return this.name
    }

    /**
     * Returns a link to the thumbnail
     * 
     * https://drive.google.com/thumbnail?authuser=0&sz=w546-h585-p-k-nu&id=1F05ZRe390FeklNnveX3I-cTeSPnN7TOyFg
     * 
     * @param {Object} options {
     *      width: Number,
     *      height: Number,
     *      aspect: Boolean,
     *      crop: Boolean
     * }
     */
    getThumbSize(options) {
        // Util: Appends parameter to list of parameters
        let append = (s, v) => {
            if (params.length > 0)
                params+="-"

            params += s

            if (v)
                params += v
        }

        let params = ""

        if (options.crop && !options.height)
            options.height = options.width

        options.width && append("w", Math.floor(options.width))
        options.height && append("h", Math.floor(options.height))
        options.crop && append("p-k-nu")
        options.aspect && append("no")

        return `https://drive.google.com/thumbnail?authuser=0&id=${this.id}&sz=${params}`
        
    }

    get playbackUrl() {
        return `https://drive.google.com/file/d/${this.id}/preview`
    }

    get poster() {
        if (this.poster_)
            return `https://image.tmdb.org/t/p/w400${this.poster_}`
        else
            return this.getThumbSize({width: 800, crop: true})
    }

    get duration() {
        return {
            millis: this.durationMillis,
            formatted: Utils.millisToDate(this.durationMillis)
        }
    }

    get resolution() {
        return {
            height: this.height,
            width: this.width,
            formatted: `${this.width}x${this.height}`
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
    constructor(library, drivestream) {
        this.root = library.root
        this.type = library.type

        this.library = library
        this.drivestream = drivestream

        this.activeRequests = 0
        this.queuedRequests = 0
        this.isScanning_ = false
        this.mediaItems = []

        this.PAGE_SIZE = 1000
        this.MAX_ITEMS = 0
        
        this.UNSUPPORTED_FILE_TYPES = ["video/mp2t", "video/ts"]
    }

    get isScanning() {
        return this.isScanning_
    }

    set isScanning(isScanning) {
        this.isScanning_ = isScanning

        if (!this.isScanning_) {
            toast({content: `Finished scanning ${this.type} library in ${this.root}`})
            this.library.updateMediaItems()
        }
    }

    addMediaItem(mediaItem) {
        this.mediaItems.push(mediaItem)
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
                this.addMediaItem(new MediaItem(m))
            }
            
        }        
    }

    printUnsupportedMimeTypes() {
        let s = ""
        for (let i = 0, mime; mime = this.UNSUPPORTED_FILE_TYPES[i]; i++) {
            if (s.length > 0)
                s += " "

            s += `mimeType contains '${mime}'`

            if (i != (this.UNSUPPORTED_FILE_TYPES.length - 1))
                s += " or"
        }
        return s;
    }

    async recusriveListFolder(root, nextPageToken) {
        this.isScanning = true
        while (this.activeRequests >= 3) {
            this.queuedRequests++
            await sleep(250)
            this.queuedRequests--
        }
        
            

        this.activeRequests++

        await this.drivestream.initiateClient().then(() => gapi.client.drive.files.list({
            'q': `'${root}' in parents and not (${this.printUnsupportedMimeTypes()}) and not (name contains 'sample')`,
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
                } else if (!response.result.nextPageToken && this.activeRequests == 0 && this.queuedRequests == 0)
                    this.isScanning = false
            }

        })
    }
}


class MetadataEngine {
    constructor(mediaItem) {
        this.mediaItem = mediaItem
    }

    getMetadata() {
        year ? year : "" // Fix null year

        let url = `https://api.themoviedb.org/3/search/movie?include_adult=false&page=1&query=${title}&language=en-US&api_key=42e5714f80280415f205eca7e2cb61dd&year=${year}`,
        response = JSON.parse(UrlFetchApp.fetch(url, options).getContentText());

        if (response.total_results == 0) {
            console.log(`Unable to load metadata for ${this.title}`);
            return;
        }

        console.log(response.results[0])
    }
}
/**
 * A library of dynamic, reusable components
 */
class Components {
    static signIn(message = "Sign in with Google") {
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

    static mediaItem(mediaItem) {
        return `<div class="col s2">
                <a href="${mediaItem.playbackUrl}" class="card-url" target="_blank">
                    <div class="card vertical media-card" id="${mediaItem.id}">
                        <div class="card-image">
                            <img src="${mediaItem.poster}" class="media-image">
                        </div>
                        <div class="card-content">
                            <div class="card-title">${mediaItem.name}</div>
                        </div>
                    </div>
                </a>
            </div>`
    }
}

class UI {
    constructor(drivestream) {
        this.drivestream = drivestream
        this.containers = {
            loading: $("#drivestream .loading"),
            libraries: $("#drivestream .libraries"),
            media: $("#drivestream .mediaItems")
        }


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

    showLibraries() {
        this.containers.libraries.empty();
        for (let library of this.drivestream.libraries) {
            this.containers.libraries.append(`
                 <div class="col s4"> 
                   <div class="card"> 
                     <div class="card-content" 
                       <span class="card-title">${library.name}</span> 
                     </div> 
                      <div class="card-action"> 
                       <a href="#" data-library-id="${library.id}" data-library-name="${library.name}" class="openLibrary">Open</a> 
                       <a href="#" data-library-id="${library.id}" data-library-name="${library.name}" class="refreshLibrary">Refresh</a> 
                      </div> 
                    </div> 
                 </div>
            `);
        }

        let that = this

        $("a.openLibrary").on('click', function () {
            that.drivestream.getLibrary({ id: $(this).attr("data-library-id") })
        })

        $("a.refreshLibrary").on('click', function () {
            that.drivestream.refreshLibrary({ id: $(this).attr("data-library-id") })
        })
    }

    emptyMediaItems() {
        this.containers.media.empty()
    }

    /**
     * 
     * @param {MediaItem} mediaItem 
     */
    showMediaItem(mediaItem) {
        if (mediaItem.name == "")
            return

        this.containers.media.append(Components.mediaItem(mediaItem))

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