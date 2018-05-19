//import { mkdirpSync } from 'fs-extra-p';
const md5File = require('md5-file')
const mkdirp = require('mkdirp');
const path = require('path');
const extract = require('extract-zip')
const jsonfile = require('jsonfile')
const http = require('http');
var fs = require('fs')
var i = 0;
var finished = false;
var neededStuff = [];

// CDN SERVICE DOWNLOAD
/*
    1 - Download files.json
    2 - Compare. If there's no files.json, download 

*/

/**
 * The auto-updater of the Client
 * @constructor
 * @param {any} appLogic - The appLogic
 */
function CDNdownloader(appLogic) {
    this.appLogic = appLogic;
    this.mainDiv = CreateElement({
        type: 'div', class: 'LobbyPage_MainDiv row', elements: [
            this.lobbyViewDiv = CreateElement({
                type: 'div', class: 'LobbyPage_LobbyViewDiv col s9', elements: [
                    this.noLobbyDiv = CreateElement({
                        type: 'div', class: 'LobbyPage_NoLobbySelectedDiv valign-wrapper', elements: [
                            this.noLobbyDiv = CreateElement({
                                type: 'h3', class: 'LobbyPage_NoLobbySelectedText valign center', text: 'Please, take a sit and wait while we update your game.', elements: [
                                    CreateElement({ type: 'br' }),
                                    CreateElement({ type: 'img', src: 'assets/poro_sad.png' }),
                                ]
                            })
                        ]
                    })
                ]
            }),
        ]
    });
}

CDNdownloader.prototype.getDiv = function () {
    return this.mainDiv;
};

/**
 * This function will download a file
 * @function
 * @param {array} neededStuff - Array containing the path of the files to be downloaded
 * @param {number} usedId - 
 */
CDNdownloader.prototype.download = function (neededStuff, usedId) {
    var options = {
        encoding: 'binary'
    }
    var url = "http://localhost:3000/" + neededStuff[usedId];
    console.log(url)
    var request = http.get(url, function (response) {
        var absolutePath = path.dirname("./files/" + neededStuff[usedId])
        var realAbsolutePath = path.resolve(absolutePath)
        console.log(realAbsolutePath)
        if (!fs.existsSync(absolutePath)) {
            mkdirp.sync(absolutePath)
            //fs.mkdirParent(absolutePath);
        }
        var file = fs.createWriteStream("./files/" + neededStuff[usedId], options);
        response.pipe(file).on('finish', function () {
            if (path.extname("./files/" + neededStuff[usedId]) == '.zip') {
                extract("./files/" + neededStuff[usedId], { dir: realAbsolutePath }, function (err) {
                    // extraction is complete. make sure to handle the err
                    if (err) {
                        console.log("CDN: Problem with " + neededStuff[usedId])
                        console.log(err)
                    }
                    usedId++
                    if (usedId < neededStuff.length) {
                        CDNdownloader.prototype.download.call(this, neededStuff, usedId)
                    } else {
                        finished = true;
                    }
                    file.on("error", function (err) {
                        console.log("CDN: Error: " + err);
                    })
                })
            }
        });
    })
    request.on("error", function (err) {
        console.log("CDN: Error: " + err);
    })
    if (finished) {
        console.log("CDN: Finished downloading & installing")
        this.appLogic.mainPage.changeToLobbyView(true);
    }
}
/**
 * Reads oldFiles.json (if exist) and files.json
 * @function
 * @param {boolean} isRunRight 
 */
CDNdownloader.prototype.readFiles = function (isRunRight) {
    console.log("corrio")
    if (fs.existsSync('oldFiles.json')) {
        var oldFiles = jsonfile.readFileSync('oldFiles.json');
    }
    var newFiles = jsonfile.readFileSync('files.json');
    var count = 0;
    loop(newFiles, 0)
    /*for (newFile in newFiles) {
        for (oldFile in oldFiles) {
            if (newFile == oldFile) {
                fs.exists('./files/' + oldFile, function (exist) {
                    if (exist) {
                        console.log("CDN: Checking new version")
                        var oldRealFileHash = md5File.sync("./files/" + oldFile);
                        if (newFiles[newFile].md5 != oldRealFileHash) {
                            neededStuff.push(newFile);
                            console.log("CDN: This file needs update")
                        }
                    } else {
                        console.log("CDN: New file")
                        neededStuff.push(newFile)
                    }
                })
                if (fs.existsSync("./files/" + oldFile)) {
                    console.log("CDN: Checking new version")
                    var oldRealFileHash = md5File.sync("./files/" + oldFile);
                    if (newFiles[newFile].md5 != oldRealFileHash) {
                        neededStuff.push(newFile);
                        console.log("CDN: This file needs update")
                    }
                } else {
                    console.log("CDN: New file")
                    neededStuff.push(newFile);
                }

            }
        }
    }*/
}

/**
 * Loop between all the files and check their hash
 * @function
 * @param {any} newFiles
 * @param {number} count
 */
function loop(newFiles, count){
    if (count < newFiles.length){
        fs.exists('./files/' + newFiles[count].path, function (exist) {
            if (exist) {
                console.log("CDN: Checking new version")
                var oldRealFileHash = md5File("./files/" + newFiles[count].path, (err, hash) => {
                    if (err) throw err
                    if (newFiles[count].md5 != hash) {
                        neededStuff.push(newFiles[count].path);
                        console.log("CDN: This file needs update " + newFiles[count].path)
                        count++;
                        loop(newFiles, count);
                    } else {
                        count++;
                        loop(newFiles, count);
                    }
                })
            } else {
                console.log("CDN: New file " + newFiles[count])
                neededStuff.push(newFiles[count].path)
                count++;
                loop(newFiles, count);
            };
        })
    } else {
        console.log("CDN: Starting the download...")
        CDNdownloader.prototype.download.call(this, neededStuff, 0)
    }
}
