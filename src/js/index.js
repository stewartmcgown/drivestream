import DriveStream from "./DriveStream.js"

window.init = () => {
	window.app = new DriveStream({ container: "#drivestream" })
	app.load()
}
