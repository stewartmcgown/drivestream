import { sleep } from "../utils/sleep";
import { Config } from "../config";
import { MediaItem } from "../models/MediaItem";
import { Library, LibraryType } from "../models/Library";

export interface MetadataResult {
        type: LibraryType;
        poster_path: string;
        adult: boolean;
        overview: string;
        release_date: string;
        genre_ids: number[];
        id: number;
        original_title: string;
        original_language: string;
        title: string;
        backdrop_path: string;
        popularity: number;
        vote_count: number;
        video: boolean;
        vote_average: number;
}



export interface GetMetadataOptions {
    mediaItem: MediaItem;

    library: Library;

    refresh?: boolean;
}

const PERIOD = 250;
const MAX_REQUESTS = 10;
const SUPPORTED_TYPES: LibraryType[] = ['Movies', 'TV'];

export default class MetadataEngine {

    /**
     * Request counter semaphore
     */
	private requestSemaphore: number = MAX_REQUESTS;
	private requestsInLastPeriod: number = 0
	private lastRequestDate: Date = new Date()

    /**
     * If the engine must wait before it sends the next request
     */
	mustWait() {
		return (
			new Date().getTime() - this.lastRequestDate.getTime() < PERIOD ||
			this.requestSemaphore <= 0
		)
	}

	async getMetadata(options: GetMetadataOptions): Promise<MetadataResult> {
        const { mediaItem, library, refresh } = options;

		if (!mediaItem.name || (mediaItem.description && mediaItem.poster_path && !refresh)) throw new Error()

        if (!SUPPORTED_TYPES.includes(library.type)) throw new Error();
            
		while (this.mustWait()) {
			// avoid ratelimitting from Movie API
			await sleep(PERIOD)
		}

        this.requestSemaphore--;

		let url = `https://api.themoviedb.org/3/search/${library.type.toLowerCase()}?include_adult=false&page=1&query=${
				mediaItem.name
			}&language=en-US&api_key=${Config.tmdbKey}`;

		if (mediaItem.year) url = `${url}&year=${mediaItem.year}`

        this.lastRequestDate = new Date()
        const metadata = await fetch(url).then(r => r.json())
		this.requestSemaphore++

		return metadata?.results?.[0];
	}
}