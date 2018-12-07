export default class Utils {
	/**
	 * Convert a number of milliseconds into a human readable
	 * format.
	 *
	 * @see https://stackoverflow.com/a/37168679/1255271
	 *
	 * @param {number} millis
	 */
	static millisToDate(millis) {
		let seconds = (millis / 1000).toFixed(0),
			minutes = Math.floor(seconds / 60),
			hours = ""
		if (minutes > 59) {
			hours = Math.floor(minutes / 60)
			hours = hours >= 10 ? hours : "0" + hours
			minutes = minutes - hours * 60
			minutes = minutes >= 10 ? minutes : "0" + minutes
		}

		seconds = Math.floor(seconds % 60)
		seconds = seconds >= 10 ? seconds : "0" + seconds
		if (hours != "") return hours + ":" + minutes + ":" + seconds
		return minutes + ":" + seconds
	}
}
