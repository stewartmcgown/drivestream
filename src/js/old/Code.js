function getThumb(id) {  
  var result = Drive.Files.get(id);
  
  var data = {id:id, thumb:result.thumbnailLink};
  
  console.log(data);
  return data;
  
  }

function changeLibrary(id) {
  var library = SpreadsheetApp.open(getLibraryFromID(id)).getActiveSheet();
}

function downloadPoster(link,id) {
  
  var folder = DriveApp.getFoldersByName("DriveStreamDB").next();
  folder = folder.getFoldersByName("posters").next();
  
  var poster = UrlFetchApp.fetch('https://image.tmdb.org/t/p/w154' + link);
  
  console.log(poster.getHeaders());
  
  //console.log(poster.getContent());
    
  poster = folder.createFile(poster).setName(id + '_poster.jpg');
  
  return "https://drive.google.com/uc?export=download&id=" + poster.getId();
}

function getDirectLink(id) {
  var pageToken1;
  var request = Drive.Files.list({
    q:"'0B1aXJXlAP0eZN0lGdkNyWTNVOTQ' in parents", //folder ID
    pageToken: pageToken1
  });

  console.log(request);
}
                


function movieAPIRequest(title, year) {
  if (year == null) { year = "" }
  
  var url = "https://api.themoviedb.org/3/search/movie?include_adult=false&page=1&query="+title+"&language=en-US&api_key=42e5714f80280415f205eca7e2cb61dd&year=" + year;
    
    var options = {
    "async": true,
    "crossDomain": true,
    "method": "GET",
    "headers": {},
    "data": "{}"
    }

  Utilities.sleep(250);
      
  var response = JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
  if (response.total_results == 0) { 
    console.log("Unable to load metadata for " + title);
    return;
  }
  console.log("Loaded metadata for " + title);
  return response.results[0];
}

function listRootFolders() {
  var root = DriveApp.getRootFolder();
  var folders = root.getFolders();
  var results = new Array;
  
  while (folders.hasNext()) {
    var folder = folders.next();
    results.push([folder.getName(), folder.getId()]);
  }
  
  return results;
}

function createDB() {
  var folder,folders = DriveApp.getFoldersByName("DriveStreamDB");
  if (folders.hasNext()){
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder("DriveStreamDB");
    folder.createFolder("posters");
    DriveApp.removeFolder(folder);
  }
  
  return folder;
}

function isTimeUp_(start) {
  var now = new Date();
  return now.getTime() - start.getTime() > 300000; // 5 minutes
}

function downloadMovie(id) {
  var authToken = ScriptApp.getOAuthToken();
  console.log(authToken);
  

    var option = {
      headers : {
            Authorization: "OAuth "+ authToken
      }   
    }

    var url = "https://drive.google.com/uc?export=download&id=0B1aXJXlAP0eZcDdSeDVwbm9NQTQ";
    var response = UrlFetchApp.fetch(url, option).getContentText()
    response = JSON.parse(response);

    for (var key in response){
      console.log(key);
    }
}

function getToken() {
  console.log(ScriptApp.getOAuthToken());
 return ScriptApp.getOAuthToken();
}

function getDownload(id) {
  var download_url = Drive.Files.get(id).downloadUrl
  return download_url.substring(0,download_url.length - 8);
}

function getDownloadtest(){
  console.log(getDownload("1AHknRJt3ta96iH_SVXhSlxHNOZ1VC65S6A")) 
}

function updateWatchedTime(library, id) {
  
}