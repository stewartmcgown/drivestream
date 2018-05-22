function scanFolder(baseId) {  
  var ext = ["mp4","avi","mkv"];
  var files = []; // ID, TITLE, DURATION(ms), width, HEIGHT, THUMBlink, FILESIZE
  
  // First get any folders
  var folderquery = "'"+ baseId +"' in parents and mimeType = 'application/vnd.google-apps.folder'";
  var foldertoken;
  
  var folders = Drive.Files.list({
      q: folderquery,
      pageToken: foldertoken,
      maxResults: 1000,
      orderBy: 'title'
  }); 
   
  var pageToken,query,result,count;
  count = Object.keys(folders.items).length;
  Logger.log("Subfolders:" + count);
  
 for (var j = 0; j <=  count; j++) { // for every child folder we found
  for (var i in ext) {
   if (j == count) { 
     query = "'" +baseId+"' in parents and fileExtension = '" + ext[i] +"'";
   } else {
     query = "'" +folders.items[j].id+"' in parents and fileExtension = '" + ext[i] +"'";
   }
   
   result = Drive.Files.list({
      q: query,
      pageToken: pageToken,
      maxResults: 1000,
      orderBy: 'title'
   })
    if (result.items[0] != null) { 
     for (var t in result.items) {
      if (result.items[t].videoMediaMetadata == null) { continue; }
       
       
       files.push([result.items[t].id,getTitle(result.items[t].title),
                   result.items[t].videoMediaMetadata.durationMillis,
                   result.items[t].videoMediaMetadata.width,
                   result.items[t].videoMediaMetadata.height,
                   result.items[t].thumbnailLink,
                   result.items[t].fileSize,
                   getYear(result.items[t].title)]);
     } // end t
    }
   } // end i
 } // j
  
  Logger.log("Media Files total: " + files.length)
  
  return files;
 }

function refreshMetadata(id) {
    
  librarysheet = SpreadsheetApp.openById(id);
  
  var data = librarysheet.getDataRange().getValues();
  var sheet = librarysheet.getActiveSheet();
 
  for (var i = 1; i < data.length; i++){
   var metadata = movieAPIRequest(data[i][1],data[i][7]);
    if (metadata == null) { continue }
    
    sheet.getRange(i + 1, 2).setValue(metadata.title);
    sheet.getRange(i + 1,10).setValue(metadata.poster_path);//downloadPoster(metadata.poster_path,data[i][0]));
    sheet.getRange(i + 1,9).setValue(metadata.overview);
  }
}