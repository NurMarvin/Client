//import { mkdirpSync } from 'fs-extra-p';
const md5File = require('md5-file')
const mkdirp = require('mkdirp');
const path = require('path');
const extract = require('extract-zip')
const jsonfile = require('jsonfile')
const http = require('http');
var fs = require('fs')
var i = 0;
var missingFiles;
var downloadedFiles;
var finished = false;
var neededStuff = [];

// CDN SERVICE DOWNLOAD
/*
    1 - Download files.json
    2 - Compare. If there's no files.json, download 

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
                                    this.downloadedPercentage = CreateElement({ type: 'h2', id: 'DownloadedPercentage' })
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

CDNdownloader.prototype.download = function (neededStuff, usedId) {
    if (neededStuff[usedId]) {
        var options = {
            encoding: 'binary'
        }
        var url = "http://62.4.16.132:3000/" + neededStuff[usedId];
        missingFiles--;
        downloadedFiles++;
        var percentage = (100 * downloadedFiles) / neededStuff.length;
        document.getElementById("DownloadedPercentage").innerHTML = Math.trunc(percentage) + "%"
        console.log("CDN: Downloading " + url)
        var request = http.get(url, function (response) {
            var absolutePath = path.dirname(appLogic.appData.getLeagueDirectory() + "/" + neededStuff[usedId])
            var realAbsolutePath = path.resolve(absolutePath)
            if (!fs.existsSync(absolutePath)) {
                mkdirp.sync(absolutePath)
                //fs.mkdirParent(absolutePath);
            }
            var file = fs.createWriteStream(appLogic.appData.getLeagueDirectory() + "/" + neededStuff[usedId], options);
            response.pipe(file).on('finish', function () {
                if (path.extname(appLogic.appData.getLeagueDirectory() + "/" + neededStuff[usedId]) == '.zip') {
                    extract(appLogic.appData.getLeagueDirectory() + "/" + neededStuff[usedId], { dir: realAbsolutePath }, function (err) {
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
                            CDNdownloader.prototype.finishDownload.call(this)
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
    } else {
        finished = true;
        CDNdownloader.prototype.finishDownload.call(this)
    }
}
CDNdownloader.prototype.finishDownload = function () {
    console.log("CDN: Finished downloading & installing")
    appLogic.showMainPage()
    appLogic.mainPage.changeToLobbyView(true);
}
CDNdownloader.prototype.readFiles = function (isRunRight) {
    if (fs.existsSync(appLogic.appData.getLeagueDirectory() + '/oldFiles.json')) {
        var oldFiles = jsonfile.readFileSync(appLogic.appData.getLeagueDirectory() + '/oldFiles.json');
    }
    var newFiles = jsonfile.readFileSync(appLogic.appData.getLeagueDirectory() + '/files.json');
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
function loop(newFiles, count) {
    document.getElementById("DownloadedPercentage").innerHTML = "Checking files..."
    if (count < newFiles.length) {
        fs.exists(appLogic.appData.getLeagueDirectory() + "/" + newFiles[count].path, function (exist) {
            if (exist) {
                var oldRealFileHash = md5File(appLogic.appData.getLeagueDirectory() + "/" + newFiles[count].path, (err, hash) => {
                    if (newFiles[count].md5 != hash) {
                        neededStuff.push(newFiles[count].path);
                        console.log("CDN: This file needs update " + newFiles[count].path)
                        count++;
                        loop(newFiles, count);
                    } else {
                        console.log("CDN: Already have file " + newFiles[count].path)
                        count++;
                        loop(newFiles, count);
                    }
                })
            } else {
                console.log("CDN: New file " + newFiles[count].path)
                neededStuff.push(newFiles[count].path)
                count++;
                loop(newFiles, count);
            };
        })
    } else {
        missingFiles = neededStuff.length;
        downloadedFiles = 0;
        console.log("CDN: Starting the download...")
        CDNdownloader.prototype.download.call(this, neededStuff, 0)
    }
}
