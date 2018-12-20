import Parser from "parse-torrent-title"
import { millisToDate } from "./Utils"
export default class MediaItem {
	/**
	 * Creates a media item
	 * @param {google.drive.File} file Drive file OR a row
	 */
	constructor(file, library) {
		let a = file.constructor === Array

		if (!file.videoMediaMetadata) file.videoMediaMetadata = {}

		this.id = a ? file[0] : file.id
		this.name = a ? file[1] : MediaItem.getTitle(file.title)
		this.durationMillis = a
			? Number.parseInt(file[2])
			: file.videoMediaMetadata.durationMillis
		this.width = a ? Number.parseInt(file[4]) : file.videoMediaMetadata.width
		this.height = a ? Number.parseInt(file[3]) : file.videoMediaMetadata.height
		this.size = a ? file[5] : file.fileSize
		this.year_ = a ? file[6] : MediaItem.getYear(file.title)
		this.poster_path = a ? file[7] : undefined
		this.description = a ? file[8] : undefined

		this.library = library
		/*this.videoMediaMetadata_ = a ? {
            durationMillis: Number.parseInt(file[2]),
            height: Number.parseInt(file[3]),
            width: Number.parseInt(file[4])
        } : file.videoMediaMetadata */
	}

	static getYear(title) {
		if (this.year_) return this.year_

		return Parser.parse(title).year
	}

	/**
	 * Where did titleparser go??
	 * @param {} title
	 */
	static getTitle(title) {
		if (this.title_) return this.title_

		return Parser.parse(title).title
	}

	get year() {
		if (this.year_) return this.year_
		else return ""
	}

	get title() {
		if (this.title_) return this.title_
		else return this.name
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
			if (params.length > 0) params += "-"

			params += s

			if (v) params += v
		}

		let params = ""

		if (options.crop && !options.height) options.height = options.width

		options.width && append("w", Math.floor(options.width))
		options.height && append("h", Math.floor(options.height))
		options.crop && append("p-k-nu")
		options.aspect && append("no")

		return `https://drive.google.com/thumbnail?authuser=0&id=${
			this.id
		}&sz=${params}`
	}

	get playbackUrl() {
		return `https://drive.google.com/file/d/${this.id}/preview`
	}

	get duration() {
		return {
			millis: this.durationMillis,

			formatted: millisToDate(this.durationMillis)
		}
	}

	get resolution() {
		return {
			height: this.height,
			width: this.width,
			formatted: `${this.width}x${this.height}`
		}
	}

	get poster() {
		return this.getPoster(400)
	}

	getPoster(size = 400) {
		if (this.poster_path)
			return `https://image.tmdb.org/t/p/w${size}${this.poster_path}`
		else
			return this.getThumbSize({
				width: size
			})
	}

	/**
	 *
	 * @param {Object} metadata
	 */
	setMetadata(metadata) {
		this.metadata_ = metadata

		this.poster_path = metadata.poster_path
		this.description = metadata.overview
		this.title_ = metadata.title

		app.ui.updateMediaItem(this)

		this.library.updateRemoteItem(this)
	}

	/**
	 * A drivestream database row is as follows:
	 *
	 * ID Name Duration Width Height Size Year Poster Description
	 *
	 */
	toRow() {
		return [
			this.id,
			this.title,
			this.duration.millis,
			this.resolution.width,
			this.resolution.height,
			this.size,
			this.year,
			this.poster_path,
			this.description
		]
	}

	get indexableText() {
		return `${this.description} ${this.title} ${this.year}`
	}
}
