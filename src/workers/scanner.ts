
export const onInstalled = () => {

}

/**
 * This service worker scans for files changed in the Google Drive account 
 * of the user.
 */
export const initScanner = () => {
    addEventListener('install', onInstalled)
}
