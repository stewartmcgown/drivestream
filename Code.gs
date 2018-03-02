function doGet() {
  return HtmlService
    .createTemplateFromFile('main')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle("DriveStream")
}

function getThumb(id) {  
  var pageToken;
  result = Drive.Files.get({
    fileId: id,
  });
  
  var data = {id:"id", thumb:result.thumbnailLink};
  
  Logger.log(data);
  return data;
  
  }

function changeLibrary(id) {
  var library = SpreadsheetApp.open(getLibraryFromID(id)).getActiveSheet();
  
}

function scanFolder(baseId) {  
  var ext = ["mp4","avi","mkv"];
  var files = []; // ID, TITLE, DURATION(ms), width, HEIGHT, THUMBlink, FILESIZE
  
  // First get any folders
  var query1 = "'"+ baseId +"' in parents and mimeType = 'application/vnd.google-apps.folder'";
  var pageToken1;
  
  var result1 = Drive.Files.list({
      q: query1,
      pageToken: pageToken1
  }); 
  
 var pageToken,query,result,count;
  count = parseInt(Object.keys(result1.items).length);
  Logger.log(Object.keys(result1.items).length);
 for (var j = 0; j <=  count; j++) { // for every child folder we found
  for (var i in ext) {
   if (j == count) { 
     query = "'" +baseId+"' in parents and fileExtension = '" + ext[i] +"'";
   } else {
     query = "'" +result1.items[j].id+"' in parents and fileExtension = '" + ext[i] +"'";
   }
   
   result = Drive.Files.list({
      q: query,
      pageToken: pageToken
   })
    if (result.items[0] != null) { 
     for (var t in result.items) {
      if (result.items[t].videoMediaMetadata == null) { continue; }
       
       
       files.push([result.items[t].id,getTitle(result.items[t].title),result.items[t].videoMediaMetadata.durationMillis,result.items[t].videoMediaMetadata.width,result.items[t].videoMediaMetadata.height,result.items[t].thumbnailLink,result.items[t].fileSize,getYear(result.items[t].title)])
      Logger.log(getYear(result.items[t].title)); // Actually the most beautiful thing
     } // end t
    }
   } // end i
 } // j
  
  return files;
 }

function refreshMetadata(library) {
  
  library = getLibraryFromID(library);
  
  library = SpreadsheetApp.openById(library.getId());
  
  var data = library.getDataRange().getValues();
  var sheet = library.getActiveSheet();
 
  for (var i = 1; i < data.length; i++){
   var metadata = movieAPIRequest(data[i][1],data[i][7]);
    if (metadata == null) { continue }
    
    sheet.getRange(i + 1,10).setValue(downloadPoster(metadata.poster_path,data[i][0]));
    sheet.getRange(i + 1,9).setValue(metadata.overview);
  }
}

function downloadPoster(link,id) {
  
  var folder = DriveApp.getFoldersByName("DriveStreamDB").next();
  folder = folder.getFoldersByName("posters").next();
  
  var poster = UrlFetchApp.fetch('https://image.tmdb.org/t/p/w154' + link);
  
  Logger.log(poster.getHeaders());
  
  //Logger.log(poster.getContent());
    
  poster = folder.createFile(poster).setName(id + '_poster.jpg');
  
  return "https://drive.google.com/uc?export=download&id=" + poster.getId();
}

function doRequest() {
     
     
     
    }

function getDirectLink(id) {
  var pageToken1;
  var request = Drive.Files.list({
    q:"'0B1aXJXlAP0eZN0lGdkNyWTNVOTQ' in parents", //folder ID
    pageToken: pageToken1
  });

  Logger.log(request);
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
    Logger.log("Unable to load metadata for " + title);
    return;
  }
  Logger.log("Loaded metadata for " + title);
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



function createLibrary(data) {
  var name = data[0];
  var type = data[1];
  var ids = data[2];
  
  // --- get id of library
  var file,files = DriveApp.getFilesByName("DriveStreamDB");
   if (files.hasNext ()){
   file = files.next(); 
  } else {
    return "";
  }
  
  var mainDB = SpreadsheetApp.openById(file.getId()).getActiveSheet();
  var id = mainDB.getLastRow() + 1;
  // ---
  
  var db = SpreadsheetApp.create("DriveStreamDB_" + id);
  var sheet = db.getActiveSheet();
    
  // Set out library information
  sheet.getRange(1, 1).setValue("File ID");
  sheet.getRange(1, 2).setValue("Name");
  sheet.getRange(1, 3).setValue("Runtime(ms)");
  sheet.getRange(1, 4).setValue("Width");
  sheet.getRange(1, 5).setValue("Height");
  sheet.getRange(1, 6).setValue("Thumbnail");
  sheet.getRange(1, 7).setValue("Size");
  sheet.getRange(1, 8).setValue("Year");
  sheet.getRange(1, 9).setValue("Description");
  sheet.getRange(1, 10).setValue("Poster");
  
  // Finally, update main DB and tidy up.
  
  var isUpdating = false;
  
  mainDB.appendRow([name,type,ids.toString(),id,isUpdating]);
  
  var folder,folders = DriveApp.getFoldersByName("DriveStreamDB");
  if (folders.hasNext()){
    folder = folders.next();
  } else {
    return "";
  }
  
  var dbfile = DriveApp.getFileById(db.getId());
  folder.addFile(dbfile);
  DriveApp.removeFile(dbfile);
  
  return id;  
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
  
  var db = SpreadsheetApp.create("DriveStreamDB");
  var sheet = db.getActiveSheet();
  sheet.getRange(1, 1).setValue("ID");
  sheet.getRange(1, 2).setValue("Name");
  sheet.getRange(1, 3).setValue("Type");
  
  var file = DriveApp.getFileById(db.getId());
  DriveApp.removeFile(file);
  folder.addFile(file);
  
  Logger.log(file.getId);
  
  return file;
}



function isTimeUp_(start) {
  var now = new Date();
  return now.getTime() - start.getTime() > 300000; // 5 minutes
}

function downloadMovie(id) {
  var authToken = ScriptApp.getOAuthToken();
  Logger.log(authToken);
  

    var option = {
      headers : {
            Authorization: "OAuth "+ authToken
      }   
    }

    var url = "https://drive.google.com/uc?export=download&id=0B1aXJXlAP0eZcDdSeDVwbm9NQTQ";
    var response = UrlFetchApp.fetch(url, option).getContentText()
    response = JSON.parse(response);

    for (var key in response){
      Logger.log(key);
    }
}

function getToken() {
  Logger.log(ScriptApp.getOAuthToken());
 return ScriptApp.getOAuthToken();
}


/* 
Example function that limits execution to certain time.

function myFunction() {
  
  var threads = getThread(1);
  var start = new Date();
  
  for (var t in threads) {
    
    if (isTimeUp_(start)) {
      Logger.log("Time up");
      break;
    }
    
    // Process the thread otherwise    
    var messages = threads[t].getMessages();
    
  }
  
}

*/