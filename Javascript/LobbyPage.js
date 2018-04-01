function LobbyPage(appLogic) {
    this.appLogic = appLogic;
    this.mainDiv = CreateElement({type: 'div', class: 'LobbyPage_MainDiv row', elements: [
        this.lobbyListDiv = CreateElement({type: 'div', class: 'LobbyPage_LobbyListDiv col s3', elements: [
            CreateElement({type: 'div', class: 'LobbyPage_LobbyListItem', text: 'Lobbies'}),
            CreateElement({type: 'div', class: 'LobbyPage_CreateLobbyButtonDiv', elements: [
                CreateElement({type: 'button', text: 'Create', class: 'LobbyPage_CreateLobbyButton btn', onClick: CreateFunction(this, this.createLobbyButton)}),
                CreateElement({type: 'button', text: 'Tournament', class: 'LobbyPage_CreateLobbyButton btn', onClick: CreateFunction(this, this.createTournamentButton)})
            ]}),
            this.createLobbyDiv = CreateElement({type: 'div', class: 'LobbyPage_ContainerLobbyCollection', elements: [
                this.lobbyCollectionDiv = CreateElement({type: 'div', class: 'LobbyPage_LobbyCollectionDiv collection'})
            ]}),
        ]}),
        
        this.lobbyViewDiv = CreateElement({type: 'div', class: 'LobbyPage_LobbyViewDiv col s9', elements: [
            this.noLobbyDiv = CreateElement({type: 'div', class: 'LobbyPage_NoLobbySelectedDiv valign-wrapper', elements: [
                this.noLobbyDiv = CreateElement({type: 'h3', class: 'LobbyPage_NoLobbySelectedText valign center', text: 'Please select or create a lobby.', elements: [
                    CreateElement({type: 'br'}),
                    CreateElement({type: 'img', src: 'assets/poro_sad.png'}),
                ]})
            ]})
        ]}),
    ]});

    this.lobbies = [];
}

LobbyPage.prototype.startGame = function(lobbyID) {
    this.appLogic.networkManager.sendStartGame(lobbyID);
};

LobbyPage.prototype.createLobbyButton = function() {
    var name = prompt("Enter name of the new lobby: ", "");

    if (name != null) {
        this.appLogic.networkManager.sendCreateLobby(name);
    }
};

LobbyPage.prototype.createTournamentButton = function() {
    var key = prompt("Enter Tournament game key: ", "");

    if (key != null) {
        this.appLogic.networkManager.sendJoinTournament(key);
    }
};
LobbyPage.prototype.lobbyClicked = function(lobby) {
    if (lobby.id == this.appLogic.networkManager.selfLobbyID) return;
    this.appLogic.networkManager.sendEnterLobby(lobby.id);
};

LobbyPage.prototype.updateSelfDisplay = function(hasStartedGame) {
    var selectedLobbyID = this.appLogic.networkManager.selfLobbyID;

    //Set all lobbies to not selected
    for (var i = 0; i < this.lobbies.length; i++) {
        this.lobbies[i].setSidebarSelected(false);
    }

    var lobby = this.getLobbyForID(selectedLobbyID);
    if (lobby == null) {
        while (this.lobbyViewDiv.hasChildNodes()) {
            this.lobbyViewDiv.removeChild(this.lobbyViewDiv.lastChild);
        }
        this.lobbyViewDiv.appendChild(this.noLobbyDiv);
    } else {
        while (this.lobbyViewDiv.hasChildNodes()) {
            this.lobbyViewDiv.removeChild(this.lobbyViewDiv.lastChild);
        }
        this.lobbyViewDiv.appendChild(lobby.getDiv());
        lobby.setSidebarSelected(true);
    }
};

LobbyPage.prototype.updateLobbyList = function(lobbies) {
    //[{id: lobby.id, name: lobby.name, blueSide: [id], redSide: [id]]
    for (var i = 0; i < lobbies.length; i++) {
        var lobby = this.addLobby(lobbies[i]['id'], lobbies[i]['name']);
        lobby.blueSide = lobbies[i]['blueSide'];
        lobby.redSide = lobbies[i]['redSide'];
        lobby.gameServerRepository =  lobbies[i]['gameServerRepository'];
        lobby.updateDisplay();
    }
};

LobbyPage.prototype.addLobby = function(id, name) {
    var lobby = new Lobby(this);
    lobby.id = id;
    lobby.name = name;
    this.lobbies.push(lobby);

    lobby.updateDisplay();

    this.lobbyCollectionDiv.appendChild(lobby.getSidebarDiv());

    return lobby;
};

LobbyPage.prototype.removeLobby = function(id) {
    var lobby = this.getLobbyForID(id);
    this.lobbies.splice(this.lobbies.indexOf(lobby), 1);
    lobby.getSidebarDiv().remove();
};

LobbyPage.prototype.leaveLobby = function () {
    this.appLogic.networkManager.sendLeaveLobby();
};

LobbyPage.prototype.updateLobby = function(id, name, blueSide, redSide, gameServerRepository) {
    var lobby = this.getLobbyForID(id);
    if (lobby == null) return;
    lobby.name = name;
    lobby.blueSide = blueSide;
    lobby.redSide = redSide;
    lobby.gameServerRepository = gameServerRepository;
    lobby.updateDisplay();
};

LobbyPage.prototype.updateLobbyPlayer = function(playerID) {
    for (var i = 0; i < this.lobbies.length; i++) {
        if (this.lobbies[i].hasPlayerWithID(playerID)) {
            this.lobbies[i].updateDisplay();
        }
    }
};

LobbyPage.prototype.switchPlayerSide = function(playerID, lobbyID) {
    this.appLogic.networkManager.sendSwitchPlayerSide(playerID, lobbyID);
};

LobbyPage.prototype.getDiv = function() {
    return this.mainDiv;
};

LobbyPage.prototype.getLobbyForID = function(id) {
    for (var i = 0; i < this.lobbies.length; i++) {
        var lobby = this.lobbies[i];
        if (lobby.id == id) return lobby;
    }
    return null;
};


function Lobby(lobbyPage) {
    this.lobbyPage = lobbyPage;
    this.id = -1;
    this.name = "";
    this.blueSide = [];
    this.redSide = [];
    this.gameServerRepository = 0;
    this.mainDiv = CreateElement({type: 'div', class: 'LobbyPage_Lobby_MainDiv', elements: [
        this.lobbyHeaderDiv = CreateElement({type: 'div', class: 'LobbyPage_Lobby_HeaderDiv valign-wrapper', elements: [
            this.titleDiv = CreateElement({type: 'h4', class: 'LobbyPage_Lobby_TitleDiv col s5 valign'}),
            this.exitButton = CreateElement({
                        type: 'button', class: 'LobbyPage_Lobby_StartButton btn col s3 valign',
                        text: 'Leave Lobby', onClick: CreateFunction(this, function () { this.lobbyPage.leaveLobby(); })
            }),
            this.startButton = CreateElement({type: 'button', class: 'LobbyPage_Lobby_StartButton btn col s3 valign',
                text: 'Start Game', onClick: CreateFunction(this, function(){this.lobbyPage.startGame(this.id);})}),
        ]}),
        this.teamsDiv = CreateElement({type: 'div', class: 'LobbyPage_Lobby_MainDiv', elements: [
            this.blueSideDiv = CreateElement({type: 'div', class: 'LobbyPage_Lobby_BlueSideDiv collection'}),
            this.redSideDiv = CreateElement({type: 'div', class: 'LobbyPage_Lobby_RedSideDiv collection'}),
        ]}),
        /*this.test11 = CreateElement({type: 'video', src: 'assets/11.mkv'}),
        this.test10 = CreateElement({type: 'video', src: 'assets/10.mkv'}),
        this.test12 = CreateElement({type: 'video', src: 'assets/12.mkv'})*/
    ]});

    /*this.test11.setAttribute('autoplay', '');
    this.test11.setAttribute('loop', '');
    this.test10.setAttribute('autoplay', '');
    this.test10.setAttribute('loop', '');
    this.test12.setAttribute('autoplay', '');
    this.test12.setAttribute('loop', '');*/

    this.sideBarDisplayDiv = CreateElement({type: 'a', class: 'LobbyPage_Lobby_SidebarDisplayDiv collection-item', elements:[
        this.sideBarDisplayTitleDiv = CreateElement({type: 'div', class: 'LobbyPage_Lobby_SidebarDisplayTitleDiv'}),
        this.sideBarDisplayPlayersDiv = CreateElement({type: 'div', class: 'LobbyPage_Lobby_SidebarDisplayPlayersDiv'})
    ]});

    this.sideBarDisplayDiv.onclick = CreateFunction(this, function(){
        this.lobbyPage.lobbyClicked(this);
    });

    for (var i = 0; i < lobbyPage.appLogic.gameServerRepositories.length; i++) {
        var text = lobbyPage.appLogic.gameServerRepositories[i]['repository'] + '-' + lobbyPage.appLogic.gameServerRepositories[i]['branch'];
    }
}


Lobby.prototype.hasPlayerWithID = function(playerID) {
    for (var i = 0; i < this.blueSide.length; i++) {
        if (this.blueSide[i] == playerID) return true;
    }
    for (var i = 0; i < this.redSide.length; i++) {
        if (this.redSide[i] == playerID) return true;
    }
    return false;
};

Lobby.prototype.updateDisplay = function() {
    this.titleDiv.innerText = this.name;

    while (this.blueSideDiv.hasChildNodes()) {
        this.blueSideDiv.removeChild(this.blueSideDiv.lastChild);
    }
    while (this.redSideDiv.hasChildNodes()) {
        this.redSideDiv.removeChild(this.redSideDiv.lastChild);
    }

    var playerSwitchSides = CreateFunction(this, function(playerID){
        this.lobbyPage.switchPlayerSide(playerID, this.id);
    });

    for (var i = 0; i < this.blueSide.length; i++) {
        (function(i){
            var playerID = this.blueSide[i];
            var player = this.lobbyPage.appLogic.networkManager.getPlayerByID(playerID);
            var div = CreateElement({type: 'div', class: 'LobbyPage_Lobby_PlayerItemDiv collection-item avatar', elements: [
                CreateElement({type: 'img', src: 'http://ddragon.leagueoflegends.com/cdn/4.20.1/img/champion/' + player.selectedChampion + '.png', class: 'champion-frame'}),
                CreateElement({type: 'span', class: 'title blue-grey-text truncate', text: player.nickname}),
                CreateElement({type: 'p', class: 'LobbyPage_Lobby_PlayerItemIDDiv blue-grey-text text-lighten-4', text: player.id}),
                CreateElement({type: 'button', class: 'LobbyPage_Lobby_PlayerItemMoveRightDiv btn-small secondary-content', text: '>', onClick: CreateFunction(this, function(){playerSwitchSides(playerID);})})
            ]});
            this.blueSideDiv.appendChild(div);
        }).call(this, i);
    }
    for (var i = 0; i < this.redSide.length; i++) {
        (function(i){
            var playerID = this.redSide[i];
            var player = this.lobbyPage.appLogic.networkManager.getPlayerByID(playerID);
            var div = CreateElement({type: 'div', class: 'LobbyPage_Lobby_PlayerItemDiv collection-item avatar', elements: [
                CreateElement({type: 'img', src: 'http://ddragon.leagueoflegends.com/cdn/4.20.1/img/champion/' + player.selectedChampion + '.png', class: 'champion-frame'}),
                CreateElement({type: 'span', class: 'title blue-grey-text truncate', text: player.nickname}),
                CreateElement({type: 'p', class: 'LobbyPage_Lobby_PlayerItemIDDiv blue-grey-text text-lighten-4', text: player.id}),
                CreateElement({type: 'button', class: 'LobbyPage_Lobby_PlayerItemMoveLeftDiv btn-small secondary-content', text: '<', onClick: CreateFunction(this, function(){playerSwitchSides(playerID);})})
            ]});
            this.redSideDiv.appendChild(div);
        }).call(this, i);
    }

    this.sideBarDisplayTitleDiv.innerText = "("+this.id+")" + " " + this.name;
    this.sideBarDisplayPlayersDiv.innerText = "Players: " + (this.redSide.length + this.blueSide.length);
};

Lobby.prototype.setSidebarSelected = function(selected) {
    if (selected) {
        this.sideBarDisplayDiv.className = "LobbyPage_Lobby_SidebarDisplayDiv collection-item active";
    } else {
        this.sideBarDisplayDiv.className = "LobbyPage_Lobby_SidebarDisplayDiv collection-item";
    }
};

Lobby.prototype.getSidebarDiv = function() {
    return this.sideBarDisplayDiv;
}

Lobby.prototype.getDiv = function() {
    return this.mainDiv;
};
