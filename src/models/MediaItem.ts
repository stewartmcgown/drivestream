/**
 * Represents an item in a Library. 
 */
export class MediaItem {

    public id: string = '';
    public title: string = '';
    public name: string = '';
    public year: string = '';
    public durationMillis: string = '';
    public width: string = '';
    public height: string = '';
    public size: string = '';

    public poster_path: string = '';
    public description: string = '';

    public libraryId: string = '';
    
    static fromGoogleDriveFile(file: any) {
        // Do mapping here
    }

	/**
	 * Returns a link to the thumbnail
	 *
	 * https://drive.google.com/thumbnail?authuser=0&sz=w546-h585-p-k-nu&id=1F05ZRe390FeklNnveX3I-cTeSPnN7TOyFg
	 */
	getThumbSize(options: { width?: number, height?: number, aspect?: boolean, crop?: boolean }) {
		// Util: Appends parameter to list of parameters
		const append = (s: string, v = 0) => {
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

	getPreviewkUrl() {
		return `https://drive.google.com/file/d/${this.id}/preview`
	}

	get duration() {
		return {
			millis: this.durationMillis,

			formatted: new Date(this.durationMillis)
		}
	}

	getResolution() {
		return {
			height: this.height,
			width: this.width,
			formatted: `${this.width}x${this.height}`
		}
	}

	getPoster(size = 400) {
		if (this.poster_path)
			return `https://image.tmdb.org/t/p/w${size}${this.poster_path}`
		else
			return this.getThumbSize({
				width: size
			})
	}

	get indexableText() {
		return `${this.description} ${this.title} ${this.year}`
	}
}