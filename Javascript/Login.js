function Login(appLogic) {
    this.appLogic = appLogic;
    this.mainDiv = CreateElement({type: 'div', class: 'Login_MainDiv container center-align', elements: [
        CreateElement({type: 'div', text: 'League Path', class: 'Login_Label'}),
        this.leaguePathInput = CreateElement({type: 'input', class: 'Login_PathInput input-text'}),
        CreateElement({type: 'div', text: 'Nickname', class: 'Login_Label'}),
        this.nicknameInput = CreateElement({type: 'input', class: 'Login_NameInput input-text'}),
        CreateElement({type: 'div', text: 'Key (Only if you have one)', class: 'Login_Label'}),
        this.keyInput = CreateElement({type: 'input', class: 'Login_KeyInput input-text'}),
        this.loginButton = CreateElement({type: 'button', text: 'Login', class: 'Login_Button waves-effect waves-light btn-large'
            , onClick: CreateFunction(this, this.loginButtonClicked)})
    ]});
    var isWindows = process.platform === 'win32';
    var isMac = process.platform === 'darwin';
    if (isWindows) {
        this.leaguePathInput.placeholder = 'C:\/League-of-Legends-4-20\/';
    }
    if (isMac) {
        this.leaguePathInput.placeholder = '\/League of Legends.app';
    }

    if (localStorage.getItem("path") != undefined && localStorage.getItem("path") != "") {
        this.leaguePathInput.value = localStorage.getItem("path");
    }
    if (localStorage.getItem("name") != undefined && localStorage.getItem("name") != "") {
        this.nicknameInput.value = localStorage.getItem("name");
    }
    if (localStorage.getItem("key") != undefined && localStorage.getItem("key") != "") {
        this.keyInput.value = localStorage.getItem("key");
    }
}
Login.prototype.loginButtonClicked = function() {

    this.appLogic.appData.host = "62.4.16.132";
    this.appLogic.appData.leaguePath = this.leaguePathInput.value;
    this.appLogic.appData.nickname = this.nicknameInput.value;
    this.appLogic.appData.key = this.keyInput.value;
    this.appLogic.appData.port = "7777";
    localStorage.setItem("host", "62.4.16.132");
    localStorage.setItem("path", this.leaguePathInput.value);
    localStorage.setItem("name", this.nicknameInput.value);
    localStorage.setItem("port", "7777");
    localStorage.setItem("key", this.keyInput.value);

    if (this.leaguePathInput.value.length <= 0) {
        alert("Type in League Path");
        return;
    }
    if (this.nicknameInput.value.length > 16) {
        alert("Your nickname is too long");
        return;
    }
    if (this.nicknameInput.value.length <= 0) {
        alert("Type in Nickname (It can be anything)");
        return;
    }
    console.log(this.nicknameInput.value.length)
    if (!this.appLogic.appData.isPathValid()) {
        alert("Invalid League of Legends path");
        return;
    }

    this.loginButton.disabled = true;

    this.appLogic.networkManager.connectToServer();


};

Login.prototype.getDiv = function() {
    return this.mainDiv;
};