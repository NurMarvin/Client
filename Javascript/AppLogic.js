const remote = require('electron').remote;

let appLogic;
window.onload = function () {
    appLogic = new AppLogic();
};

class AppLogic {
    constructor() {
        AnimationTimer.startAnimationLoop();
        this.createUI();

        this.appData = new AppData();
        this.networkManager = new NetworkManager(this);
        this.loginPage = new Login(this);
        this.mainPage = new MainPage(this);
        this.cdnDownloader = new CDNdownloader(this);

        this.gameServerRepositories = [];

        this.showLoginPage();

        //Delay to avoid flashing of the top bar
        window.requestAnimationFrame(function () {
            window.setTimeout(function () {
                window.requestAnimationFrame(function () {
                    remote.getCurrentWindow().show();
                });
            }, 500);
        });
    };
    createUI() {
        this.mainDiv = CreateElement({
            type: 'div', class: 'AppLogic_MainDiv', elements: [
                this.navbar = CreateElement({
                    type: 'nav', class: 'AppLogic_Navbar nav-wrapper row', elements: [
                        this.titleDiv = CreateElement({
                            type: 'div', class: 'col s3 left-align', elements: [
                                CreateElement({ type: 'span', class: 'brand-logo', text: 'League of Memories' })
                            ]
                        }),
                        this.center = CreateElement({
                            type: 'div', class: 'col s6 center-align', elements: [
                                this.tabNav = CreateElement({
                                    type: 'div', elements: [
                                        this.playButton = CreateElement({ type: 'button', class: 'AppLogic_NavButtonSelected', text: 'Play' }),
                                        this.masteriesButton = CreateElement({ type: 'button', class: 'AppLogic_NavButton', text: 'Masteries' }),
                                        this.runesButton = CreateElement({ type: 'button', class: 'AppLogic_NavButton', text: 'Runes' }),
                                        this.settingsButton = CreateElement({ type: 'button', class: 'AppLogic_NavButton', text: 'Settings' })
                                    ]
                                }),
                            ]
                        }),
                        this.rightNav = CreateElement({
                            type: 'div', class: 'col s3 right-align', elements: [
                                this.minimize = CreateElement({ type: 'span', id: 'min-btn', class: 'fa fa-window-minimize AppLogic_Button' }),
                                this.maximize = CreateElement({ type: 'span', id: 'max-btn', class: 'fa fa-window-maximize AppLogic_Button' }),
                                this.close = CreateElement({ type: 'span', id: 'close-btn', class: 'fa fa-window-close AppLogic_Button' })
                            ]
                        })
                    ]
                }),
                this.goldBarDiv = CreateElement({ type: 'div', class: 'AppLogic_GoldBar' }),
                this.viewDiv = CreateElement({ type: 'div', class: 'AppLogic_ViewDiv' })
            ]
        });
        document.body.appendChild(this.mainDiv);

        document.getElementById("min-btn").addEventListener("click", function (e) {
            var window = remote.getCurrentWindow();
            window.minimize();
        });

        document.getElementById("max-btn").addEventListener("click", function (e) {
            var window = remote.getCurrentWindow();
            if (!window.isMaximized()) {
                window.maximize();
            } else {
                window.unmaximize();
            }
        });

        document.getElementById("close-btn").addEventListener("click", function (e) {
            var window = remote.getCurrentWindow();
            window.close();
        });
    };
    connectedToServer() {
        //Send nickname
        this.networkManager.sendNickname();
        this.networkManager.sendKey(this.appData.key);
    };
    loggedIn() {
        //Hide login page, show main page, 
        this.loginPage.getDiv().remove();
        this.showMainPage();
        this.mainPage.addToChat("Connected to server as " + this.appData.nickname);
        this.mainPage.addToChat("Please use official Discord chat to report bugs or contact us");
    }
    failWhileLogin() {
        alert("Something went wrong while trying to login. Did you write your password well?")
    }
    showLoginPage() {
        this.loginPage.loginButton.disabled = false;
        this.viewDiv.appendChild(this.loginPage.getDiv());
    };
    showMainPage() {
        this.viewDiv.appendChild(this.mainPage.getDiv());
        var mainPage = this.mainPage;
        //For materialize
        $(document).ready(function () {
            $('select').material_select();
            $('.modal').modal();
            $('#selectSkin').on('click', function (e) {
                $('#modalSkin').modal('open');
                $('.carousel').carousel({ dist: -30 });
                $('.carousel').carousel('set', mainPage.selectedSkin);
            });
            $('#championSelect').on('change', function (e) {
                mainPage.championSelectChange();
            });
            mainPage.championSelectChange();
        });
    };
    launchLeagueOfLegends(port, playerNum) {
        this.appData.lastConnectPort = port;
        this.appData.lastConnectPlayerNum = playerNum;

        console.log("Starting league with path: " + this.appData.getLeagueDirectory());
        console.log("with executable: " + this.appData.getExecutablePath());

        console.log("Arguments: " + this.appData.host + " " + port + " 17BLOhi6KZsTtldTsizvHg== " + playerNum);

        const spawn = require('child_process').spawn;
        var isMac = process.platform === 'darwin';
        var isWindows = process.platform === 'win32';
        if (isMac) {
            var executeCommand = "riot_launched=true ./Leagueoflegends 8394 LoLLauncher \"\" \"" + this.appData.host + " " + port + " 17BLOhi6KZsTtldTsizvHg== " + playerNum + "\"";

            console.log("Launched command: " + executeCommand);

            var exec = require('child_process').exec;
            exec(executeCommand, {
                cwd: this.appData.getExecutableDirectory()
            });
        }
        if (isWindows) {
            const game = spawn('cmd', ['/c', 'start', "", this.appData.getExecutablePath(), "8394", "LoLLauncher.exe", "", this.appData.host + " " + port + " 17BLOhi6KZsTtldTsizvHg== " + playerNum], { cwd: this.appData.getLeagueDirectory() });

        }
    };
};
