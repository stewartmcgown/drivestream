import { ParserInstance } from "../utils/parser";
import { msToTime } from "../utils/msToTime";
import { MetadataResult } from "../engine";

/**
 * Represents an item in a Library. 
 */
export class MediaItem {

    public id: string = '';
    public title: string = '';
    public fileName: string = '';
    public year: string = '';
    public videoMediaMetadata: {
        durationMillis?: string;
        height?: number;
        width?: number;
    } = {}
    public size: number = 0;

    public poster_path: string = '';
    public description: string = '';

    public libraryId: string = '';
    
    static fromGoogleDriveFile(file: gapi.client.drive.File): MediaItem {
        const item = new MediaItem();
        item.id = file.id!;
        item.fileName = file.name!;
        item.videoMediaMetadata = file.videoMediaMetadata!;
        const { title, year } = ParserInstance.parse(item.fileName);
        item.title = title;
        item.year = year;
        item.size = Number.parseInt(file.size!);

        return item;
    }

	/**
	 * Returns a link to the thumbnail
	 *
	 * https://drive.google.com/thumbnail?sz=w546-h585-p-k-nu&id=1F05ZRe390FeklNnveX3I-cTeSPnN7TOyFg
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

	getPreviewUrl() {
		return `https://drive.google.com/file/d/${this.id}/preview`
	}

	get duration() {
		return {
			millis: this.videoMediaMetadata.durationMillis!,

			formatted: msToTime(Number.parseInt(this.videoMediaMetadata.durationMillis!))
		}
	}

	getResolution() {
		return {
			height: this.videoMediaMetadata.height,
			width: this.videoMediaMetadata.width,
			formatted: `${this.videoMediaMetadata.width}x${this.videoMediaMetadata.height}`
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
    
    updateMetadata(metadata: MetadataResult) {
        this.description = metadata.overview;
        this.poster_path = metadata.poster_path;
        this.title = metadata.title;
    }
}