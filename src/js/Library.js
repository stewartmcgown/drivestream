import MediaScanner from "./MediaScanner"
import { sleep, getPropFromKey } from "./Utils"

export default class Library {
	/**
	 * Creates a library object
	 * @param {object} options
	 */
	constructor(options, drivestream) {
		this.id = options.id
		this.name = options.title
		this.type = options.type
		this.root = getPropFromKey(options.properties, "root")
		if (!this.root) {
			console.log(this.root)
			console.log(options.properties)
			console.log(getPropFromKey(options.properties, "root"))
		}

		/** @type {Array.<MediaItem>} */
		this.mediaItems = []
		this.pushQueue = []
		this.pushCount = 0
		this.lastPush = null

		this.drivestream = drivestream

		this.scanner = new MediaScanner(this, this.drivestream)

		this.SHEET_EXPIRY = 100000
	}

	update() {
		this.drivestream.ui.setScanning(this)
		this.scanner.scan()
	}

	updateMediaItems() {
		this.mediaItems = this.scanner.mediaItems.filter(i =>
			this.mediaItems.every(r => r.id != i.id)
		)

		let payload = this.mediaItems.map(m => m.toRow())
		gapi.client.sheets.spreadsheets.values
			.batchUpdate({
				spreadsheetId: this.id,
				resource: {
					valueInputOption: "RAW",
					data: [
						{
							range: "A:Z",
							values: payload
						}
					]
				}
			})
			.then(r => console.log(r))
	}

	/**
	 * Push changes from a mediaItem to the database
	 * @param {MediaItem} mediaItem
	 */
	updateRemoteItem(mediaItem) {
		// Get the row containing the media item
		this.getRemoteSheet().then(response => {
			if (response.result.error) {
				sleep(500).then(r => this.updateRemoteItem(mediaItem))
			} else {
				let selected =
					response.result.values.findIndex(mediaItems => {
						return mediaItems[0] == mediaItem.id
					}) + 1 // Accounts for row/sheet incompatibility

				this.pushToRange([mediaItem.toRow()], `A${selected}:Z${selected}`)
			}
		})
	}

	async getRemoteSheet() {
		if (!this.cachedSheet || !this.sheetFetchedDate) {
			return this.doRemoteSheetRequest()
		} else if (
			new Date().getTime() - this.sheetFetchedDate.getTime() >
			this.SHEET_EXPIRY
		) {
			return this.doRemoteSheetRequest()
		} else {
			return this.cachedSheet
		}
	}

	doRemoteSheetRequest() {
		return gapi.client.sheets.spreadsheets.values
			.get({
				spreadsheetId: this.id,
				range: "A:Z"
			})
			.then(response => {
				this.cachedSheet = response
				this.sheetFetchedDate = new Date()
				return response
			})
	}

	pushToRange(values, range) {
		let body = {
			values: values
		}

		gapi.client.sheets.spreadsheets.values
			.update({
				spreadsheetId: this.id,
				range: range,
				valueInputOption: "RAW",
				resource: body
			})
			.then(response => {
				var result = response.result
				console.log(`${result.updatedCells} cells updated.`)
			})
	}

	/**
	 * Handles queue of write to sheet.
	 * If
	 */
	async pushQueue() {
		if (!this.lastPush) this.lastPush = new Date() // Handle null lastpush
		while (new Date().getTime() - this.lastPush.getTime() < 100000) {
			// while not 100s elapsed since most recent push
			await sleep(100)
		}

		let params = {
			spreadsheetId: "my-spreadsheet-id" // TODO: Update placeholder value.
		}

		let batchUpdateValuesRequestBody = {
			// How the input data should be interpreted.
			valueInputOption: "RAW",

			// The new values to apply to the spreadsheet.
			data: []

			// TODO: Add desired properties to the request body.
		}

		let request = gapi.client.sheets.spreadsheets.values.batchUpdate(
			params,
			batchUpdateValuesRequestBody
		)
		request.then(
			function(response) {
				// TODO: Change code below to process the `response` object:
				console.log(response.result)
			},
			function(reason) {
				console.error("error: " + reason.result.error.message)
			}
		)
	}

	refreshMeta() {
		for (let m of this.mediaItems) {
			this.drivestream.metadataEngine.getMetadata(m)
		}
	}
}
