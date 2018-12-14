import MetadataEngine from "./MetadataEngine"
import Library from "./Library"
import MediaItem from "./MediaItem"
import UI from "./UI"
import { API_KEY, CLIENT_ID } from "../../credentials.js"
import loadingToast from "./Toasts/LoadingToast"

export const DISCOVERY_DOCS = [
	"https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
	"https://sheets.googleapis.com/$discovery/rest?version=v4"
]
export const SCOPES =
	"https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets"

export default class DriveStream {
	constructor(options) {
		this.ui = new UI(this)
		this.libraries = []
		this.metadataEngine = new MetadataEngine()
	}

	set isFirstTime(a) {
		localStorage.setItem("isFirstTime", a)
	}

	get isFirstTime() {
		if (localStorage.getItem("isFirstTime") == "false") return false
		else return true
	}

	loadDriveAPI() {
		gapi.auth2.authorize(
			{
				client_id: CLIENT_ID,
				immediate: false,
				scope: SCOPES
			},
			async () => {
				app.isFirstTime = false
				app.ui.hideSignIn()
				await app.initiateClient()
				app.getLibraries()
				console.log("Loaded API")
			}
		)
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

	async getFolders() {
		return await gapi.client.drive.files.list({
			q: `mimeType contains 'folder' and 'root' in parents and not trashed`,
			spaces: "drive",
			fields: "nextPageToken,files(id,name,properties)",
			pageSize: 1000
		})
	}

	/**
	 * Creates a remote library from a Library object
	 * @param {Library} library
	 */
	createLibrary(library) {
		gapi.client.sheets.spreadsheets
			.create(
				{},
				{
					properties: {
						title: library.name
					}
				}
			)
			.then(sheets => {
				gapi.client.drive.files
					.update({
						fileId: sheets.result.spreadsheetId,
						removeParents: "root",
						fields: "id, name, properties",
						resource: { properties: [{ drivestream: "library" }] }
					})
					.then(r => {
						gapi.client.drive.files
							.update({
								fileId: sheets.result.spreadsheetId,
								fields: "id, name, properties",
								resource: { properties: [{ root: library.root }] }
							})
							.then(r => {
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
	updateLibrary(library) {}

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

	getLibraries() {
		const toast = M.toast({
			html: loadingToast(`Fetching libraries...`),
			displayLength: Infinity
		})
		gapi.client.drive.files
			.list({
				q: `properties has {key='drivestream' and value='library'} and trashed = false`,
				spaces: "drive",
				fields: "nextPageToken,files(id,name,properties)",
				pageSize: 1000
			})
			.then(response => {
				this.setLibraries(response.result.files)
				toast.dismiss()
			})
	}

	/**
	 *
	 * @param {*} id
	 * @return {Library}
	 */
	findLibraryById(id) {
		return this.libraries.find(l => {
			return l.id == id
		})
	}

	getLibrary(id) {
		let library = this.findLibraryById(id)

		const toast = M.toast({
			html: loadingToast(`Opening ${library.name}...`),
			displayLength: Infinity
		})

		this.activeLibrary = library
		return gapi.client.sheets.spreadsheets.values
			.get({
				spreadsheetId: library.id,
				range: "A:Z"
			})
			.then(response => {
				toast.dismiss()
				library.mediaItems = response.result.values.map(
					row => new MediaItem(row, library)
				)
				this.ui.emptyMediaItems()
				for (let l of library.mediaItems) this.ui.showMediaItem(l)
			})
	}

	updateLibrary(id) {
		let library = this.findLibraryById(id)
		const toast = M.toast({
			html: loadingToast(`Updating ${library.name}...`)
		})
		library.update()
	}

	refreshMetaLibrary(id) {
		let library = this.findLibraryById(id)
		const toast = M.toast({
			html: loadingToast(`Refreshing ${library.name}...`)
		})
		library.refreshMeta()
	}

	deleteLibrary(id) {
		let library = this.findLibraryById(id)

		const toast = M.toast({
			html: loadingToast(`Deleting ${library.name}...`),
			displayLength: Infinity
		})

		gapi.client.drive.files
			.update({ fileId: library.id, resource: { trashed: true } })
			.then(r => {
				toast.dismiss()
				this.getLibraries()
			})
	}
}
