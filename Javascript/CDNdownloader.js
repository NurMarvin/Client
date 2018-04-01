// CDN SERVICE DOWNLOAD
/*
    1 - Download files.json
    2 - Compare. If there's no files.json, download 

*/
//var md5File = require('md5-file')
var i = 0;

function CDNdownloader(appLogic) {
}
/*function readFiles() {
    var neededStuff = [];
    var oldFiles = jsonfile.readFileSync('oldFiles.json');
    var newFiles = jsonfile.readFileSync('files.json');
    for (newFile in newFiles) {
        for (oldFile in oldFiles) {
            if (newFile == oldFile) {
                /*if (fs.existsSync("./files/" + oldFile)) {
                    var oldRealFileHash = md5File.sync("./files/" + oldFile);
                    if (newFiles[newFile].md5 != oldRealFileHash) {
                        neededStuff.push(newFile);
                    }
                } else {*/
                    //neededStuff.push(newFile);
                //}
                /*
            }
        }
    }
    i = 0;
    console.log("Starting the download...")
    download(neededStuff)
}
function download(neededStuff) {
    var options = {
        encoding: null
    }
    var file = fs.createWriteStream("./files/" + neededStuff[i], options);
    var url = "http://localhost:3000/" + neededStuff[i];
    console.log(url)
    var request = http.get(url, function (response) {
        response.pipe(file);
        i++;
        if (i <= neededStuff.length){
            download(neededStuff)
        }
    });
}
function downloadAll() {

}

var http = require('http');
var fs = require('fs-extra');
var jsonfile = require('jsonfile');
var path = "./files.json"
if (fs.existsSync(path)) {
    fs.copySync('files.json', 'oldFiles.json');
    fs.unlinkSync('files.json');
    var file = fs.createWriteStream("files.json");
    var request = http.get("http://localhost:3000/files.json", function (response) {
        response.pipe(file);
        file.on('finish', function () {
            readFiles();
        })
    });
} else {
    var file = fs.createWriteStream("files.json");
    var request = http.get("http://localhost:3000/files.json", function (response) {
        response.pipe(file);
        downloadAll();
    });
}*/
