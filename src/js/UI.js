import Components from "./Components"
import DriveStream from "./DriveStream"
import Library from "./Library"
import loadingToast from "./Toasts/LoadingToast"
import HashRouter from "./HashRouter"
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
		this.enableHash()
	}

	enableHash() {
		const router = new HashRouter(this.drivestream)
		router.setDefaultRoute(this.drivestream.getLibrary.bind(this.drivestream))
	}

	setEvents() {
		M.AutoInit()
		document.querySelector("#nav-search").addEventListener("keyup", e => {
			;[...document.querySelectorAll(".mediaItem")].forEach(f =>
				f.dataset.indexableText
					.toLowerCase()
					.includes(e.target.value.toLowerCase())
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
				target.innerHTML = ""
				response.result.items.forEach(f => {
					target.innerHTML += `
						<label>
        					<input type="radio" name="folder-group" class="with-gap" value="${
										f.id
									}" />
        					<span>${f.title}</span>
      					</label>
					`
				})
			})
		})

		const idElement = document.querySelector("#newLibraryRoot")
		const nameElement = document.querySelector("#newLibraryName")
		document.querySelectorAll("[type=radio]").forEach(el => {
			el.addEventListener("change", f => {
				idElement.value = f.target.value
				nameElement.value = f.target.parentElement.querySelector(
					"span"
				).innerText
			})
		})

		document.querySelector("#createLibrary").addEventListener("click", e => {
			const name = document.querySelector("#newLibraryName").value
			const type = document.querySelector("#newLibraryType").value
			const root = document.querySelector("#newLibraryRoot").value

			this.drivestream.createLibrary({
				name,
				type,
				root
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
		const e = Components.mediaItem(mediaItem)
		this.containers.media.append(e)

		e.addEventListener("click", e => {
			const element = document.querySelector("#play")
			element.innerHTML = ""
			const instance = M.Modal.getInstance(element)
			instance.open()

			this.drivestream.getDownloadURL(mediaItem).then(url => {
				const video = document.createElement("video")
				video.src = url
				video.controls = true
				element.append(video)
			})
		})
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
