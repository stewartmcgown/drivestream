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