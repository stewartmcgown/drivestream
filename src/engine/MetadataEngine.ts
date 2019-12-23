import { sleep } from "../utils/sleep";
import { Config } from "../config";

const PERIOD = 250;
const MAX_REQUESTS = 10;

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

	/**
	 *
	 * @param {MediaItem} mediaItem
	 */
	async getMetadata(mediaItem, refresh = false) {
		if (!mediaItem.name) return

		if (mediaItem.description && mediaItem.poster_path && !refresh)
			// Skip if already has metadata
			return

		while (this.mustWait()) {
			// avoid ratelimitting from Movie API
			await sleep(PERIOD)
		}

		this.requestSemaphore--;

		let url = `https://api.themoviedb.org/3/search/movie?include_adult=false&page=1&query=${
				mediaItem.name
			}&language=en-US&api_key=${Config.tmdbKey}`;

		if (mediaItem.year) url = `${url}&year=${mediaItem.year}`

        this.lastRequestDate = new Date()
        const metadata = await fetch(url).then(r => r.json())
		this.requestSemaphore++

		if (!metadata?.results?.[0]) return;

		console.log(metadata.results[0])

		mediaItem.setMetadata(metadata.results[0])
	}
}