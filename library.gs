function getLibraries() {
  var file,files = DriveApp.getFilesByName("DriveStreamDB");
   if (files.hasNext ()){
   file = files.next(); 
  } else {
    createDB();
    return "";
  }
  
  // Now we need to get the libraries themselves.
  var libraries = SpreadsheetApp.openById(file.getId()).getActiveSheet().getDataRange().getValues();
    
  return libraries;
}

function getMostRecentLibraryID() {
  var mainDB = SpreadsheetApp.openById(getMainDB().getId()).getActiveSheet();
  var id = mainDB.getRange(mainDB.getLastRow(),4).getValue();
  
  return id;
}

function getLibraryFromID(id) {
  var file,files = DriveApp.getFilesByName("DriveStreamDB_"+id);
   if (files.hasNext ()){
   file = files.next(); 
  } else {
    throw "No library matching that ID";
  }
  
   
  return file;
}

function getLibraryFoldersFromID(id) {
  var file,files = DriveApp.getFilesByName("DriveStreamDB");
  if (files.hasNext ()){
    file = files.next(); 
  } else {
    return "";
  }
  
  var ids = SpreadsheetApp.openById(file.getId()).getActiveSheet().getRange(id,3).getValue();
  var ida = ids.split(","); 
  
  return ida;
}

function getTitle(name) {
    name = name.split('.').join(' ');
    var patt = /[^0-9](19|20)[0-9]{2}[^0-9]/;
    var match = patt.exec(name);
    if (match) {
    var name = name.substr(0,match.index);
    
    }
    
    return name;    
}

function getYear(name) {  
  var patt = /[^0-9](19|20)[0-9]{2}[^0-9]/;
  var match = patt.exec(name);
  
  if (match == null) { return; }
  
  var year = match[0].split('.').join('');
  return year;
}

function scanLibrary(id) {
  var library = getLibraryFromID(id);
  var ids = getLibraryFoldersFromID(id);
  //var mainDB = getMainDB();
  
  var libraryS = SpreadsheetApp.openById(library.getId()).getActiveSheet();
  //var mainS = SpreadsheetApp.openById(library.getId()).getActiveSheet();
  
  var files;
  for (var i in ids) {
    files = scanFolder(ids[i]);
    for (var j in files) {
      libraryS.appendRow(files[j]);
    }
  }
  
  refreshMetadata(id);
  
  // This has to be resumable!
  //var start = new Date();
  
  /*var currentFolder;
  for (var i in ids) {
    Logger.log(ids[i]);*/
    
    /*if (isTimeUp_(start)) {
      Logger.log("Execution stopping...");
      break;
    }*/
    
    // Process the thread otherwise    
    /*currentFolder = DriveApp.getFolderById(ids[i]);
    
    recurse(ids[i]);
    
    var videos = ["video/x-matroska","video/mp4","video/avi"];
    for (var v in videos) {
     var videos = currentFolder.getFilesByType(videos[v]);
     while (videos.hasNext()) {
      var video = videos.next();
      Logger.log(video.getName());
     }
    }
  }*/
  
}

function testMime() {
 Logger.log(DriveApp.getFileById("0B1aXJXlAP0eZb005bHpHak1IZzA").getMimeType()); 
}

function getMainDB() {
  var file,files = DriveApp.getFilesByName("DriveStreamDB");
   if (files.hasNext ()){
   file = files.next(); 
  } else {
    return "";
  }
  
  return file;
}

function createTimeDrivenTriggers() {
  // Trigger every 6 hours.
  ScriptApp.newTrigger('myFunction')
      .timeBased()
      .everyHours(6)
      .create();
}

function openLibrary(id) {
  var library = SpreadsheetApp.openById(getLibraryFromID(id).getId()).getActiveSheet().getDataRange().getValues();
  
  return library; 
}
