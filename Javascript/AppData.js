function AppData() {
    this.host = "";
    this.port = "";
    this.nickname = "";
    this.key = "";
    this.leaguePath = "";
    this.executablePath = "";
    this.executableDirectory = "";
    this.isGarena = false;
    this.lastConnectPort = -1;
    this.lastConnectPlayerNum = -1;
}

AppData.prototype.isPathValid = function() {
    var isMac = process.platform === 'darwin';
    var isWindows = process.platform === 'win32';

    if (isWindows) {
        var leaguePath = this.leaguePath;
        if (leaguePath.substr(leaguePath.length - 1) != "\\") {
            leaguePath = leaguePath + "\\";
        }
        var garenaPath = leaguePath;
        leaguePath = leaguePath + "RADS/solutions/lol_game_client_sln/releases/0.0.1.68/deploy/";
        leaguePath = leaguePath.replaceAll('\\', '/');
        garenaPath = garenaPath.replaceAll('\\', '/');
        var leagueExecutable = leaguePath + "League of Legends.exe";
        var garenaExecutable = garenaPath + "League of Legends.exe";

        var fs = require('fs');
        if (fs.existsSync(leagueExecutable)) {
            this.executablePath = leagueExecutable;
            this.isGarena = false;
            this.executableDirectory = leaguePath;
            return true;
        }
        if (fs.existsSync(garenaExecutable)) {
            this.executablePath = garenaExecutable;
            this.isGarena = true;
            this.executableDirectory = garenaPath;
            return true;
        }
    }
    if (isMac) {
        var leaguePath = this.leaguePath;
        if (leaguePath.substr(leaguePath.length - 1) != "\\") {
            leaguePath = leaguePath + "\\";
        }
        leaguePath += "Contents/LoL/";
        leaguePath = leaguePath + "RADS/projects/lol_game_client/releases/0.0.0.151/deploy/LeagueofLegends.app/Contents/MacOS/";
        leaguePath = leaguePath.replaceAll('\\', '/');
        var leagueExecutable = leaguePath + "Leagueoflegends";


        var fs = require('fs');
        if (fs.existsSync(leagueExecutable)) {
            this.executablePath = leagueExecutable;
            this.isGarena = false;
            this.executableDirectory = leaguePath;
            return true;
        }
    }
    return false;
};

AppData.prototype.getLeagueDirectory = function() {
    return this.leaguePath;
};
AppData.prototype.getExecutablePath = function() {
    return this.executablePath;
};
AppData.prototype.getExecutableDirectory = function() {
    return this.executableDirectory;
};