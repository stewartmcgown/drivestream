import MediaItem from "./MediaItem"

/**
 * A library of dynamic, reusable components
 */
export default class Components {
	static signIn(message = "Sign in with Google") {
		return `
        <div class="sign-in-container">
        <div class="sign-in-inner">
            <a class="button sign-in" href="#" onclick="gapi.load('client:auth2', app.loadDriveAPI)">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 48 48"><defs><path id="a" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/></defs><clipPath id="b"><use xlink:href="#a" overflow="visible"/></clipPath><path clip-path="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z"/><path clip-path="url(#b)" fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z"/><path clip-path="url(#b)" fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z"/><path clip-path="url(#b)" fill="#4285F4" d="M48 48L17 24l-4-3 35-10z"/></svg>
             ${message}
            </a>

            <a class="privacy-policy" href="privacy.html" target="blank">Privacy Policy</a>
            </div>
            </div>
        `
	}

	/**
	 *
	 * @param {MediaItem} media
	 */
	static mediaItem(media) {
		const e = document.createElement("div")
		e.classList.add("mediaItem")
		e.dataset["indexableText"] = media.indexableText

		e.innerHTML = `
                <a href="${media.playbackUrl}" class="card-url" target="_blank">
                    <div class="card vertical media-card" id="${media.id}">
                        <div class="card-image">
                            <img src="${media.poster}" class="media-image">
                        </div>
                        <div class="card-content">
                            <span class="card-title">${media.name}</span>
                            <span class="year">${media.year}</span>
                            <span class="duration">${
															media.duration.formatted
														}</span>
                        </div>
                    </div>
                </a>
            `
		return e
	}

	static library(library) {
		return `
                   <div class="card"> 
                     <div class="card-content" 
                       <span class="card-title">${library.name}</span> 
                     </div> 
                      <div class="card-action"> 
                       <a href="#${library.id}" data-library-id="${
			library.id
		}" data-library-name="${library.name}" class="openLibrary">Open</a> 
                       <a href="#" data-library-id="${
													library.id
												}" data-library-name="${
			library.name
		}" class="updateLibrary">Update</a> 
                       <a href="#" data-library-id="${library.id}" 
                        data-library-name="${library.name}"
                        class="refreshMetaLibrary">Refresh Metadata</a> 
                         <a href="#" data-library-id="${library.id}" 
                        data-library-name="${library.name}"
                        class="deleteLibrary">Delete</a>
                      </div> 
                    </div> 
            `
	}
}
