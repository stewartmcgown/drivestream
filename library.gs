function createLibrary(data) {
  var name = data[0];
  var type = data[1];
  var ids = data[2];
  
  var db = SpreadsheetApp.create(name);
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
  sheet.getRange(1, 11).setValue("Last Watched"); 
  sheet.getRange(1, 12).setValue("Hidden"); 
  
  
  var folder,folders = DriveApp.getFoldersByName("DriveStreamDB");
  if (folders.hasNext()){
    folder = folders.next();
  } else {
    return "";
  }
  
  var dbfile = DriveApp.getFileById(db.getId());
  folder.addFile(dbfile);
  DriveApp.removeFile(dbfile);
  
  dbfile.setDescription(name + "," + type + "," + ids);
  
  return dbfile.getId();  
}

function getLibraries() {
  var folder,folders = DriveApp.getFoldersByName("DriveStreamDB");
   if (folders.hasNext ()){
   folder = folders.next(); 
  } else {
    folder = createDB();
  }
  
  
  // Now we need to get the libraries themselves.
  var libraries = [];
  var files = folder.getFiles();
  
  while (files.hasNext()) {
    var file = files.next();    
    
    if (file.getDescription() == null)
      continue;
    
    var description = file.getDescription().split(",");
    
    var library = {
      name: file.getName(),
      id: file.getId(),
      type: description[1],
      mediafolder: description[2]
    };

    libraries.push(library);
  }
  
  Logger.log(libraries)
  
  return libraries;
}

function getMostRecentLibraryID() {
  var mainDB = SpreadsheetApp.openById(getMainDB().getId()).getActiveSheet();
  var id = mainDB.getRange(mainDB.getLastRow(),4).getValue();
  
  return id;
}

function getLibraryFromID(id) {
  var file = DriveApp.getFileById(id);
  
  var description = file.getDescription().split(",");
    
    var library = {
      name: file.getName(),
      id: file.getId(),
      type: description[1],
      mediafolder: description[2]
    };
   
  return library;
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
    
  var library_sheet = SpreadsheetApp.openById(library.id).getActiveSheet();
  
  var files;
    files = scanFolder(library.mediafolder);
  
  // Time to wipe and restart
  library_sheet.deleteRows(2, library_sheet.getLastRow() - 1);

    for (var j in files) {
      library_sheet.appendRow(files[j]);
    }
  
  refreshMetadata(library.id);
  
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
  var library = SpreadsheetApp.openById(id).getActiveSheet().getDataRange().getValues();
  
  return library; 
}

function hideItem(id,library) {
  var library_sheet = SpreadsheetApp.openById(library).getActiveSheet();
  
  var data = library_sheet.getDataRange().getValues();
  for(var i = 0; i<data.length;i++){
    if(data[i][0] == id){ //[1] because column B
      library_sheet.getRange(i + 1, 12).setValue(true);
    }
  }
  
  return true;
}