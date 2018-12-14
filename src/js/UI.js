import Components from "./Components"
import DriveStream from "./DriveStream"
import Library from "./Library"
require("../sass/drivestream.scss")
require("./materialize.js")

export default class UI {
	/**
	 *
	 * @param {DriveStream} drivestream
	 */
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
		M.AutoInit()
		document.querySelector("#nav-search").addEventListener("keyup", e => {
			;[...document.querySelectorAll(".mediaItem")].forEach(f =>
				f.innerHTML.toLowerCase().includes(e.target.value.toLowerCase())
					? (f.style.display = "block")
					: (f.style.display = "none")
			)
		})

		document.querySelector("[data-action]").addEventListener("click", e => {
			const element = document.getElementById(e.target.dataset.action)
			const instance = M.Modal.getInstance(element)
			instance.open()

			this.drivestream.getFolders().then(response => {
				const target = element.querySelector(".folders")
				response.result.files.forEach(f => {
					target.innerHTML += `
						<label>
        					<input type="radio" name="folder-group" class="with-gap" value="${
										f.id
									}" />
        					<span>${f.name}</span>
      					</label>
					`
				})
			})

			element.querySelector("#createLibrary").addEventListener("click", e => {
				const name = element.querySelector("#newLibraryName").value
				const type = element.querySelector("#newLibraryType").value
				const id = element.querySelector("[type=radio]:checked").value

				this.drivestream.createLibrary({
					name,
					type,
					root: id
				})
			})
		})
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
