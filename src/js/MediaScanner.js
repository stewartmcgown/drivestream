import { sleep } from "./Utils"
import MediaItem from "./MediaItem"
import Library from "./Library"

/**
 * Scans a folder for media files and organises them appropriately
 */
export default class MediaScanner {
	/**
	 *
	 * @param {string} id Id of root folder
	 * @param {string} type Type of media
	 * @param {Library} library A library
	 */
	constructor(library, drivestream) {
		this.root = library.root
		this.type = library.type

		this.library = library
		this.drivestream = drivestream

		this.activeRequests = 0
		this.queuedRequests = 0
		this.isScanning_ = false
		/** @type {MediaItem} */
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
			//toast({content: `Finished scanning ${this.type} library in ${this.root}`})
			this.library.updateMediaItems()
		}
	}

	/**
	 *
	 * @param {MediaItem} mediaItem
	 */
	addMediaItem(mediaItem) {
		this.mediaItems.push(mediaItem)
		this.library.updateMediaItems()
	}

	scan() {
		this.isScanning = true

		//this.ui.setScanning({})

		this.recusriveListFolder(this.root)
	}

	processMediaFileList(list) {
		for (let m of list) {
			if (m.mimeType == "application/vnd.google-apps.folder") {
				this.recusriveListFolder(m.id)
			} else if (
				m.mimeType.includes("video/") &&
				!this.UNSUPPORTED_FILE_TYPES.includes(m.mimeType) &&
				m.videoMediaMetadata
			) {
				this.addMediaItem(new MediaItem(m, this.library))
			}
		}
	}

	printUnsupportedMimeTypes() {
		let s = ""
		for (let i = 0, mime; (mime = this.UNSUPPORTED_FILE_TYPES[i]); i++) {
			if (s.length > 0) s += " "

			s += `mimeType contains '${mime}'`

			if (i != this.UNSUPPORTED_FILE_TYPES.length - 1) s += " or"
		}
		return s
	}

	async recusriveListFolder(root, nextPageToken) {
		this.isScanning = true
		while (this.activeRequests >= 3) {
			this.queuedRequests++
			await sleep(250)
			this.queuedRequests--
		}

		this.activeRequests++

		await this.drivestream
			.initiateClient()
			.then(() =>
				gapi.client.drive.files.list({
					q: `'${root}' in parents and not (${this.printUnsupportedMimeTypes()}) and (mimeType contains 'video/' or mimeType contains 'application/vnd.google-apps.folder') and not (title contains 'sample')`,
					spaces: "drive",
					fields:
						"nextPageToken,items(id,title,fileSize,mimeType,videoMediaMetadata,thumbnailLink)",
					pageToken: nextPageToken,
					pageSize: this.PAGE_SIZE
				})
			)
			.then(response => {
				this.activeRequests--

				if (response.result.error) {
					this.recusriveListFolder(root, nextPageToken)
				} else if (response.result.items) {
					this.processMediaFileList(response.result.items)

					if (response.result.nextPageToken) {
						this.recusriveListFolder(root, response.result.nextPageToken)
					} else if (
						!response.result.nextPageToken &&
						this.activeRequests == 0 &&
						this.queuedRequests == 0
					)
						this.isScanning = false
				}
			})
	}
}
