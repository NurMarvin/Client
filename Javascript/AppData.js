class AppData {
    constructor() {
        this.host = "";
        this.port = "";
        this.nickname = "";
        this.key = "";
        this.leaguePath = "";
        this.lang = "";
        this.executablePath = "";
        this.executableDirectory = "";
        this.isGarena = false;
        this.lastConnectPort = -1;
        this.lastConnectPlayerNum = -1;
    };
    isPathValid() {
        var isMac = process.platform === 'darwin';
        var isWindows = process.platform === 'win32';

        if (isWindows) {
            var leaguePath = this.leaguePath;
            if (leaguePath.substr(leaguePath.length - 1) != "\\") {
                leaguePath = leaguePath + "\\";
            }
            leaguePath = leaguePath + "";
            leaguePath = leaguePath.replaceAll('\\', '/');
            var leagueExecutable = leaguePath + "League of Legends.exe";

            var fs = require('fs');
            if (fs.existsSync(leagueExecutable)) {
                this.executablePath = leagueExecutable;
                this.executableDirectory = leaguePath;
                return true;
            }
        }
        if (isMac) {
            var leaguePath = this.leaguePath;
            if (leaguePath.substr(leaguePath.length - 1) != "\\") {
                leaguePath = leaguePath + "\\";
            }
            leaguePath += "Contents/LoL/";
            leaguePath = leaguePath + "";
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
    createIfNotExist() {
        if (!fs.existsSync(this.leaguePath)) {
            fs.mkdirSync(this.leaguePath);
        }
    }
    getLeagueDirectory() {
        return this.leaguePath;
    };
    getExecutablePath() {
        var leaguePath = this.leaguePath;
        this.executablePath = leaguePath + "/League of Legends.exe";
        return this.executablePath;
    };
    getExecutableDirectory() {
        return this.executableDirectory;
    };
};