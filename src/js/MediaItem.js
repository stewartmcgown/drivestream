class MediaItem {
    /**
     * Creates a media item
     * @param {google.drive.File} file Drive file
     */
    constructor(file) {
        this.id = file.id
        this.fileName = file.name
        this.videoMediaMetadata_ = file.videoMediaMetadata
        this.thumb = file.thumbnailLink
        this.size = file.fileSize
    }

    get year() {
        let patt = /[^0-9](19|20)[0-9]{2}[^0-9]/, 
            match = patt.exec(this.fileName)

        if (match == null) return null
        else return match[0].split('.').join('')
    }

    get title() {
        let name = this.fileName.split('.').join(' '), 
            patt = /[^0-9](19|20)[0-9]{2}[^0-9]/, 
            match = patt.exec(name)
        if (match)
            return name.substr(0, match.index)
        else
            return null
    }

    get duration() {
        return {
            millis: this.videoMediaMetadata_.durationMillis,
            formatted: Utils.millisToDate(this.videoMediaMetadata_.durationMillis)
        }
    }

    get resolution() {
        return {
            height: this.videoMediaMetadata_.height,
            width: this.videoMediaMetadata_.width,
            formatted: `${this.videoMediaMetadata_.width}x${this.videoMediaMetadata_.height}`
        }
    }


}