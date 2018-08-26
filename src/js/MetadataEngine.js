class MetadataEngine {
    constructor(mediaItem) {
        this.mediaItem = mediaItem
    }

    getMetadata() {
        year ? year : "" // Fix null year

        let url = `https://api.themoviedb.org/3/search/movie?include_adult=false&page=1&query=${title}&language=en-US&api_key=42e5714f80280415f205eca7e2cb61dd&year=${year}`,
        response = JSON.parse(UrlFetchApp.fetch(url, options).getContentText());

        if (response.total_results == 0) {
            console.log(`Unable to load metadata for ${this.title}`);
            return;
        }

        console.log(response.results[0])
    }
}