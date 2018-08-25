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