const API_KEY = "AIzaSyA5jzWRF3xGOHLq63ptF3VWOUokXUVOz5U"
const CLIENT_ID = "719757025459-da3v6ad3pte923qd2c8ue96bh3m5mofm.apps.googleusercontent.com"
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest", "https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets';

let sleep = (time) => { return new Promise((resolve) => setTimeout(resolve, time)); }

class DriveStream {
    constructor(options) {
        this.ui = new UI(this)
        this.libraries = []
        this.metadataEngine = new MetadataEngine()
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

    findLibraryById(id) {
        return this.libraries.find((l) => { return l.id == id })
    }

    getLibrary(id) {
        let library = this.findLibraryById(id)
        this.activeLibrary = library
        return gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: library.id,
            range: "A:Z"
        }).then((response) => {
            library.mediaItems = response.result.values.map(row => new MediaItem(row, library))
            this.ui.emptyMediaItems()
            for (let l of library.mediaItems)
                this.ui.showMediaItem(l)
        })
    }

    updateLibrary(id) {
        let library = this.findLibraryById(id)
        library.update()
    }

    refreshMetaLibrary(id) {
        let library = this.findLibraryById(id)
        library.refreshMeta()
    }
}