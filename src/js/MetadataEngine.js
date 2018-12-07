import { sleep } from "./Utils"

export default class MetadataEngine {
	constructor() {
		this.activeRequests = 0
		this.requestsInLastPeriod = 0
		this.lastRequestDate = new Date()
	}

	get PERIOD() {
		return 250
	} // 40 requests per 10000 milliseconds
	get MAX_REQUESTS() {
		return 10
	}

	get needsRateLimited() {
		return (
			new Date().getTime() - this.lastRequestDate.getTime() < this.PERIOD ||
			this.activeRequests >= this.MAX_REQUESTS
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

		while (this.needsRateLimited) {
			// avoid ratelimitting from Movie API
			await sleep(this.PERIOD)
		}

		this.activeRequests++

		let url = `https://api.themoviedb.org/3/search/movie?include_adult=false&page=1&query=${
				mediaItem.name
			}&language=en-US&api_key=42e5714f80280415f205eca7e2cb61dd`,
			request = new XMLHttpRequest(),
			metadata

		if (mediaItem.year) url = `${url}&year=${mediaItem.year}`

		request.open("GET", url, false) // false for synchronous request

		this.lastRequestDate = new Date()
		request.send(null)
		this.activeRequests--

		metadata = JSON.parse(request.responseText)

		if (!metadata.results) return
		if (!metadata.results[0]) return

		console.log(metadata.results[0])

		mediaItem.setMetadata(metadata.results[0])
	}
}
