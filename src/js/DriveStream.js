import MetadataEngine from "./MetadataEngine"
import Library from "./Library"
import MediaItem from "./MediaItem"
import UI from "./UI"
import { API_KEY, CLIENT_ID } from "../../credentials.js"
import loadingToast from "./Toasts/LoadingToast"

export const DISCOVERY_DOCS = [
	"https://www.googleapis.com/discovery/v1/apis/drive/v2/rest",
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
			fields: "nextPageToken,items(id,title,properties)",
			pageSize: 1000
		})
	}

	/**
	 * Creates a remote library from a Library object
	 * @param {Library} library
	 */
	createLibrary(library) {
		const toast = M.toast({
			html: loadingToast(`Creating Library '${library.name}'...`),
			displayLength: Infinity
		})
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
						fields: "id, title, properties",
						resource: {
							properties: [
								{
									key: "drivestream",
									value: "library",
									visibility: "PUBLIC"
								}
							]
						}
					})
					.then(r => {
						gapi.client.drive.files
							.update({
								fileId: sheets.result.spreadsheetId,
								fields: "id, title, properties",
								resource: {
									properties: [
										{
											key: "root",
											value: library.root,
											visibility: "PUBLIC"
										}
									]
								}
							})
							.then(r => {
								toast.dismiss()
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
				q: `properties has { key='drivestream' and value='library' and visibility='PUBLIC' } and trashed = false`,
				spaces: "drive",
				fields: "nextPageToken,items(id,title,properties)",
				pageSize: 1000
			})
			.then(response => {
				this.setLibraries(response.result.items)
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
		if (!library) return

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
			.trash({
				fileId: library.id
			})
			.then(r => {
				toast.dismiss()
				this.getLibraries()
			})
	}

	/**
	 * Get the download URL of a file
	 * @param {MediaItem} mediaItem
	 */
	getDownloadURL(mediaItem) {
		return new Promise((resolve, reject) =>
			gapi.client.drive.files
				.get({
					fileId: mediaItem.id,
					fields: "downloadUrl"
				})
				.then(r => {
					let d = r.result.downloadUrl
					resolve(d.substr(0, d.length - 8))
				})
		)
	}
}
