import Components from "./Components"
require("../sass/drivestream.scss")

export default class UI {
	constructor(drivestream) {
		this.drivestream = drivestream
		this.containers = {
			loading: $("#drivestream .loading"),
			libraries: $("#drivestream .libraries"),
			media: $("#drivestream .mediaItems")
		}

		this.setEvents()
	}

	setEvents() {
		/*document.querySelector("#nav-search").addEventListener("keyup", e => {
			const container = document.querySelector(".mediaItems")
			const items = Object.freeze([...document.querySelectorAll(".media-card")])
			container.innerHTML = ""
			const filtered = items.forEach(f =>
				f.innerText.includes(e.target.value) ? container.append(f) : null
			)
		})*/
	}

	showSignIn() {
		this.containers.loading.html(Components.signIn())
	}

	hideSignIn() {
		this.containers.loading.remove()
	}

	showLibraryScan() {
		this.containers.loading.html(Components.scanLibraryButton())
	}

	showLibraries() {
		this.containers.libraries.empty()
		for (let library of this.drivestream.libraries) {
			this.containers.libraries.append(Components.library(library))
		}

		let that = this

		$("a.openLibrary").on("click", function() {
			that.drivestream.getLibrary($(this).attr("data-library-id"))
		})

		$("a.updateLibrary").on("click", function() {
			that.drivestream.updateLibrary($(this).attr("data-library-id"))
		})

		$("a.refreshMetaLibrary").on("click", function() {
			that.drivestream.refreshMetaLibrary($(this).attr("data-library-id"))
		})

		$("a.deleteLibrary").on("click", function() {
			that.drivestream.deleteLibrary($(this).attr("data-library-id"))
		})
	}

	emptyMediaItems() {
		this.containers.media.empty()
	}

	/**
	 *
	 * @param {MediaItem} mediaItem
	 */
	showMediaItem(mediaItem) {
		if (mediaItem.name == "") return

		this.containers.media.append(Components.mediaItem(mediaItem))
	}

	updateMediaItem(mediaItem) {
		let card = document.getElementById(mediaItem.id)

		card.getElementsByTagName("img")[0].src = mediaItem.getPoster(400)
		card.getElementsByClassName("card-title")[0].innerHTML = mediaItem.title
	}

	/**
	 *
	 * @param {Library} library
	 */
	setScanning(library) {
		this.containers.libraries
			.find(`#${library.id}`)
			.find(".updateLibrary")
			.html("Loading")
	}
}
