import DriveStream from "./DriveStream";

export default class HashRouter {
    /**
     * Create a hash router
     * @param {DriveStream} drivestream 
     */
    constructor(drivestream) {
        this.drivestream = drivestream
        this.routes = {}
        window.location.hash = ""
        window.addEventListener("hashchange", (e) => this.handleRoute(window.location.hash.substr(1)))
    }

    handleRoute(path) {
        this.routes.default(path)
    }

    /**
     * The default callback for the router
     * @param {Function} f 
     */
    setDefaultRoute(f) {
        this.routes.default = f
    }

    /**
     * 
     * @param {Route} route 
     */
    registerRoute(route) {

    }
}