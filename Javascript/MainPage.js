function MainPage(appLogic) {
    this.appLogic = appLogic;
    this.selectedSkin = 0;
    this.mainDiv = CreateElement({
        type: 'div', class: 'MainPage_MainDiv row', elements: [
            CreateElement({
                type: 'div', class: 'MainPage_LeftSideContainer', elements: [
                    this.onlineBoxDiv = CreateElement({ type: 'div', class: 'MainPage_OnlineBoxDiv' }),
                    this.newsBoxDiv = CreateElement({ type: 'div', class: 'MainPage_NewsBoxDiv' })
                ]
            }),
            this.championDiv = CreateElement({
                type: 'div', class: 'MainPage_LobbyDiv', elements:
                    [
                        CreateElement({
                            type: 'div', class: 'MainPage_LobbyContainer', elements: [
                                this.championDiv = CreateElement({
                                    type: 'div', class: 'MainPage_ChampionDiv row', elements: [
                                        this.championSelectDiv = CreateElement({
                                            type: 'div', class: 'MainPage_ChampionSelectDiv col s10', elements:
                                                [
                                                    this.championSelect = CreateElement({ type: 'select', id: 'championSelect', class: 'MainPage_ChampionSelect icons' }),
                                                ]
                                        }),
                                        this.skinSelectDiv = CreateElement({ type: 'button', id: 'selectSkin', class: 'MainPage_ButtonSelectSkin btn col s2', text: 'Select skin' }),
                                        this.modalSkin = CreateElement({
                                            type: 'div', id: 'modalSkin', class: 'modal modal-fixed-footer', elements: [
                                                this.modalSkinContent = CreateElement({
                                                    type: 'div', class: 'modal-content', elements: [
                                                        CreateElement({ type: 'h4', class: 'center-align', text: 'Select your skin' }),
                                                        this.carouselSkin = CreateElement({ type: 'div', class: 'carousel' })
                                                    ]
                                                }),
                                                this.modalSkinFooter = CreateElement({
                                                    type: 'div', class: 'modal-footer center-align', elements: [
                                                        CreateElement({ type: 'button', class: 'modal-action modal-close waves-effect waves-green btn', text: 'Accept' })
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                (this.lobbyPage = new LobbyPage(this.appLogic)).getDiv()
                            ]
                        }),
                        CreateElement({
                            type: 'div', class: 'MainPage_ChatBox', elements: [
                                this.chatBoxDiv = CreateElement({ type: 'div', class: 'MainPage_ChatBoxDiv' }),
                                this.chatBoxInput = CreateElement({ type: 'input', class: 'MainPage_ChatBoxInput' }),
                            ]
                        }),
                    ]
            }),

        ]
    });
    for (var i = 0; i < ChampionList.length; i++) {
        var element = CreateElement({ type: 'option', class: 'left circle', value: ChampionList[i], text: ChampionList[i], appendTo: this.championSelect });
        element.setAttribute('data-icon', 'http://ddragon.leagueoflegends.com/cdn/4.20.1/img/champion/' + ChampionList[i] + '.png');
    }

    this.championSelect.value = "Ezreal";

    this.chatBoxInput.placeholder = "Type text...";
    this.chatBoxInput.onkeydown = CreateFunction(this, this.chatInputKeyDown);

    /*this.blockingOverlay = CreateElement({type: 'div', class: 'MainPage_BlockOverlay', text: 'Game Console', elements: [
        this.startingGameDiv = CreateElement({type: 'div', class: 'MainPage_StartingGame'}),
        this.exitGameButton = CreateElement({type: 'button', class: 'MainPage_StartingGame_ExitButton',
        text: "Exit Console Screen", onClick: CreateFunction(this, this.setBlockOverlayOff)})
    ]});*/

    this.updateOnlineList();
    this.updateNewsList();
}

MainPage.prototype.addServerLog = function (text) {
    var oldHeight = this.startingGameDiv.scrollHeight;
    window.requestAnimationFrame(CreateFunction(this, function () {
        this.startingGameDiv.innerText += text;
        var newHeight = this.startingGameDiv.scrollHeight;
        this.startingGameDiv.scrollTop += newHeight - oldHeight;
    }));
};
MainPage.prototype.setBlockOverlayOn = function () {
    this.startingGameDiv.innerText = "";
    //this.mainDiv.appendChild(this.blockingOverlay);
};
MainPage.prototype.setBlockOverlayOff = function () {
    this.blockingOverlay.remove();
};

MainPage.prototype.championSelectChange = function () {
    var champion = this.championSelect.value;
    this.selectedSkin = 0;
    this.appLogic.networkManager.sendChampionSelectChange(champion);
    this.skinChange();
    while (this.carouselSkin.hasChildNodes()) {
        this.carouselSkin.removeChild(this.carouselSkin.lastChild);
    }
    for (var i = 0; i < ExtendedChampionsData[this.championSelect.value].skins.length; i++) {
        var element = CreateElement({
            type: 'a', id: 'skin' + i, class: 'carousel-item skin' + (i == 0 ? ' MainPage_ActiveSkin' : ''), elements: [
                CreateElement({ type: 'img', src: 'http://ddragon.leagueoflegends.com/cdn/img/champion/loading/' + this.championSelect.value + '_' + ExtendedChampionsData[this.championSelect.value].skins[i].num + '.jpg' }),
                CreateElement({ type: 'div', class: 'center-align', text: ExtendedChampionsData[this.championSelect.value].skins[i].name })
            ], appendTo: this.carouselSkin
        });
        element.setAttribute('skin', i);
        let mainPage = this;
        $("#skin" + i).click(function () {
            $(".skin").removeClass('MainPage_ActiveSkin');
            $("#skin" + $(this).attr('skin')).addClass('MainPage_ActiveSkin');
            mainPage.selectedSkin = $(this).attr('skin');
            mainPage.skinChange();
        });
    }
    this.carouselSkin.setAttribute('class', 'carousel');
    $('.carousel').carousel({ dist: -30 });
    $('.carousel').carousel('set', 0);
};

MainPage.prototype.skinChange = function () {
    console.log('Change skin to ' + this.selectedSkin);
    this.appLogic.networkManager.sendSkinSelectChange(this.selectedSkin);
};

MainPage.prototype.chatInputKeyDown = function (e) {
    if (e.keyCode == 13) {
        this.appLogic.networkManager.sendChat(this.chatBoxInput.value);
        this.chatBoxInput.value = "";
    }
};

MainPage.prototype.addToChat = function (chat) {
    var oldHeight = this.chatBoxDiv.scrollHeight;
    this.chatBoxDiv.innerText += chat + '\n';
    window.requestAnimationFrame(CreateFunction(this, function () {
        var newHeight = this.chatBoxDiv.scrollHeight;
        this.chatBoxDiv.scrollTop += newHeight - oldHeight;
    }));
};

MainPage.prototype.updateOnlineList = function () {
    while (this.onlineBoxDiv.hasChildNodes()) {
        this.onlineBoxDiv.removeChild(this.onlineBoxDiv.lastChild);
    }
    this.onlineBoxDiv.appendChild(
        CreateElement({
            type: 'div', class: 'MainPage_OnlinePlayerDiv', elements: [
                CreateElement({ type: 'div', class: 'MainPage_OnlinePlayerNameDiv', text: 'Players Online: ' + this.appLogic.networkManager.onlinePlayers.length }),
                this.onlinePlayersCollection = CreateElement({ type: 'ul', class: 'collection' })
            ]
        })
    );
    for (var i = 0; i < this.appLogic.networkManager.onlinePlayers.length; i++) {
        var player = this.appLogic.networkManager.onlinePlayers[i];
        var playerDiv = CreateElement({
            type: 'li', class: 'MainPage_OnlinePlayerDiv collection-item avatar', elements: [
                CreateElement({ type: 'img', src: 'http://ddragon.leagueoflegends.com/cdn/4.20.1/img/champion/' + player.selectedChampion + '.png', class: 'champion-frame' }),
                CreateElement({ type: 'span', class: 'title blue-grey-text truncate', text: player.nickname }),
                CreateElement({ type: 'p', class: ' blue-grey-text text-lighten-4', text: player.id + " | " + player.rank })
            ]
        });
        this.onlinePlayersCollection.appendChild(playerDiv);
    }
};

MainPage.prototype.updateNewsList = function () {
    while (this.newsBoxDiv.hasChildNodes()) {
        this.newsBoxDiv.removeChild(this.newsBoxDiv.lastChild);
    }
    this.newsBoxDiv.appendChild(
        CreateElement({
            type: 'div', class: 'MainPage_OnlinePlayerDiv', elements: [
                CreateElement({ type: 'div', class: 'MainPage_OnlinePlayerNameDiv', text: 'News: ' }),
                this.newsCollection = CreateElement({ type: 'ul', class: 'collection' })
            ]
        })
    );
    var playerDiv = CreateElement({
        type: 'li', class: 'MainPage_OnlinePlayerDiv collection-item avatar', elements: [
            CreateElement({ type: 'img', src: 'http://ddragon.leagueoflegends.com/cdn/4.20.1/img/champion/' + 'Gnar' + '.png', class: 'champion-frame' }),
            CreateElement({ type: 'span', class: 'title blue-grey-text truncate', text: "Welcome to the Alpha!" }),
            CreateElement({ type: 'p', class: ' blue-grey-text text-lighten-4', text: "Remember there can be a lot of issues and bugs. Help us improving the Client reporting bugs in our Discord server." })
        ]
    });
    var playerDiv2 = CreateElement({
        type: 'li', class: 'MainPage_OnlinePlayerDiv collection-item avatar', elements: [
            CreateElement({ type: 'img', src: 'http://ddragon.leagueoflegends.com/cdn/4.20.1/img/champion/' + 'Gnar' + '.png', class: 'champion-frame' }),
            CreateElement({ type: 'span', class: 'title blue-grey-text truncate', text: "Tournaments are here!" }),
            CreateElement({ type: 'p', class: ' blue-grey-text text-lighten-4', text: "The new version 0.2.6 comes with Tournaments and other stuff that you will discover while playing LoM!" })
        ]
    });
    this.newsCollection.appendChild(playerDiv2);
    this.newsCollection.appendChild(playerDiv);
    
};

MainPage.prototype.getDiv = function () {
    return this.mainDiv;
};

var ChampionList = [
    "Blitzcrank",
    "Caitlyn",
    "Ezreal",
    "MissFortune",
    "Lucian",
    "Lulu"
]
var ExtendedChampionsData = {
    "Aatrox": {
        "id": 266,
        "title": "the Darkin Blade",
        "name": "Aatrox",
        "skins": [
            {
                "id": 266000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 266001,
                "num": 1,
                "name": "Justicar Aatrox"
            },
            {
                "id": 266002,
                "num": 2,
                "name": "Mecha Aatrox"
            }
        ],
        "key": "Aatrox"
    },
    "Thresh": {
        "id": 412,
        "title": "the Chain Warden",
        "name": "Thresh",
        "skins": [
            {
                "id": 412000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 412001,
                "num": 1,
                "name": "Deep Terror Thresh"
            },
            {
                "id": 412002,
                "num": 2,
                "name": "Championship Thresh"
            }
        ],
        "key": "Thresh"
    },
    "Tryndamere": {
        "id": 23,
        "title": "the Barbarian King",
        "name": "Tryndamere",
        "skins": [
            {
                "id": 23000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 23001,
                "num": 1,
                "name": "Highland Tryndamere"
            },
            {
                "id": 23002,
                "num": 2,
                "name": "King Tryndamere"
            },
            {
                "id": 23003,
                "num": 3,
                "name": "Viking Tryndamere"
            },
            {
                "id": 23004,
                "num": 4,
                "name": "Demonblade Tryndamere"
            },
            {
                "id": 23005,
                "num": 5,
                "name": "Sultan Tryndamere"
            },
            {
                "id": 23006,
                "num": 6,
                "name": "Warring Kingdoms Tryndamere"
            }
        ],
        "key": "Tryndamere"
    },
    "Gragas": {
        "id": 79,
        "title": "the Rabble Rouser",
        "name": "Gragas",
        "skins": [
            {
                "id": 79000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 79001,
                "num": 1,
                "name": "Scuba Gragas"
            },
            {
                "id": 79002,
                "num": 2,
                "name": "Hillbilly Gragas"
            },
            {
                "id": 79003,
                "num": 3,
                "name": "Santa Gragas"
            },
            {
                "id": 79004,
                "num": 4,
                "name": "Gragas, Esq."
            },
            {
                "id": 79005,
                "num": 5,
                "name": "Vandal Gragas"
            },
            {
                "id": 79006,
                "num": 6,
                "name": "Oktoberfest Gragas"
            },
            {
                "id": 79007,
                "num": 7,
                "name": "Superfan Gragas"
            },
            {
                "id": 79008,
                "num": 8,
                "name": "Fnatic Gragas"
            }
        ],
        "key": "Gragas"
    },
    "Cassiopeia": {
        "id": 69,
        "title": "the Serpent's Embrace",
        "name": "Cassiopeia",
        "skins": [
            {
                "id": 69000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 69001,
                "num": 1,
                "name": "Desperada Cassiopeia"
            },
            {
                "id": 69002,
                "num": 2,
                "name": "Siren Cassiopeia"
            },
            {
                "id": 69003,
                "num": 3,
                "name": "Mythic Cassiopeia"
            },
            {
                "id": 69004,
                "num": 4,
                "name": "Jade Fang Cassiopeia"
            }
        ],
        "key": "Cassiopeia"
    },
    "Ryze": {
        "id": 13,
        "title": "the Rogue Mage",
        "name": "Ryze",
        "skins": [
            {
                "id": 13000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 13001,
                "num": 1,
                "name": "Human Ryze"
            },
            {
                "id": 13002,
                "num": 2,
                "name": "Tribal Ryze"
            },
            {
                "id": 13003,
                "num": 3,
                "name": "Uncle Ryze"
            },
            {
                "id": 13004,
                "num": 4,
                "name": "Triumphant Ryze"
            },
            {
                "id": 13005,
                "num": 5,
                "name": "Professor Ryze"
            },
            {
                "id": 13006,
                "num": 6,
                "name": "Zombie Ryze"
            },
            {
                "id": 13007,
                "num": 7,
                "name": "Dark Crystal Ryze"
            },
            {
                "id": 13008,
                "num": 8,
                "name": "Pirate Ryze"
            }
        ],
        "key": "Ryze"
    },
    "Poppy": {
        "id": 78,
        "title": "the Iron Ambassador",
        "name": "Poppy",
        "skins": [
            {
                "id": 78000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 78001,
                "num": 1,
                "name": "Noxus Poppy"
            },
            {
                "id": 78002,
                "num": 2,
                "name": "Lollipoppy"
            },
            {
                "id": 78003,
                "num": 3,
                "name": "Blacksmith Poppy"
            },
            {
                "id": 78004,
                "num": 4,
                "name": "Ragdoll Poppy"
            },
            {
                "id": 78005,
                "num": 5,
                "name": "Battle Regalia Poppy"
            },
            {
                "id": 78006,
                "num": 6,
                "name": "Scarlet Hammer Poppy"
            }
        ],
        "key": "Poppy"
    },
    "Sion": {
        "id": 14,
        "title": "The Undead Juggernaut",
        "name": "Sion",
        "skins": [
            {
                "id": 14000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 14001,
                "num": 1,
                "name": "Hextech Sion"
            },
            {
                "id": 14002,
                "num": 2,
                "name": "Barbarian Sion"
            },
            {
                "id": 14003,
                "num": 3,
                "name": "Lumberjack Sion"
            },
            {
                "id": 14004,
                "num": 4,
                "name": "Warmonger Sion"
            }
        ],
        "key": "Sion"
    },
    "Annie": {
        "id": 1,
        "title": "the Dark Child",
        "name": "Annie",
        "skins": [
            {
                "id": 1000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 1001,
                "num": 1,
                "name": "Goth Annie"
            },
            {
                "id": 1002,
                "num": 2,
                "name": "Red Riding Annie"
            },
            {
                "id": 1003,
                "num": 3,
                "name": "Annie in Wonderland"
            },
            {
                "id": 1004,
                "num": 4,
                "name": "Prom Queen Annie"
            },
            {
                "id": 1005,
                "num": 5,
                "name": "Frostfire Annie"
            },
            {
                "id": 1006,
                "num": 6,
                "name": "Reverse Annie"
            },
            {
                "id": 1007,
                "num": 7,
                "name": "FrankenTibbers Annie"
            },
            {
                "id": 1008,
                "num": 8,
                "name": "Panda Annie"
            }
        ],
        "key": "Annie"
    },
    "Karma": {
        "id": 43,
        "title": "the Enlightened One",
        "name": "Karma",
        "skins": [
            {
                "id": 43000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 43001,
                "num": 1,
                "name": "Sun Goddess Karma"
            },
            {
                "id": 43002,
                "num": 2,
                "name": "Sakura Karma"
            },
            {
                "id": 43003,
                "num": 3,
                "name": "Traditional Karma"
            },
            {
                "id": 43004,
                "num": 4,
                "name": "Order of the Lotus Karma"
            }
        ],
        "key": "Karma"
    },
    "Nautilus": {
        "id": 111,
        "title": "the Titan of the Depths",
        "name": "Nautilus",
        "skins": [
            {
                "id": 111000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 111001,
                "num": 1,
                "name": "Abyssal Nautilus"
            },
            {
                "id": 111002,
                "num": 2,
                "name": "Subterranean Nautilus"
            },
            {
                "id": 111003,
                "num": 3,
                "name": "AstroNautilus"
            }
        ],
        "key": "Nautilus"
    },
    "Lux": {
        "id": 99,
        "title": "the Lady of Luminosity",
        "name": "Lux",
        "skins": [
            {
                "id": 99000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 99001,
                "num": 1,
                "name": "Sorceress Lux"
            },
            {
                "id": 99002,
                "num": 2,
                "name": "Spellthief Lux"
            },
            {
                "id": 99003,
                "num": 3,
                "name": "Commando Lux"
            },
            {
                "id": 99004,
                "num": 4,
                "name": "Imperial Lux"
            },
            {
                "id": 99005,
                "num": 5,
                "name": "Steel Legion Lux"
            }
        ],
        "key": "Lux"
    },
    "Ahri": {
        "id": 103,
        "title": "the Nine-Tailed Fox",
        "name": "Ahri",
        "skins": [
            {
                "id": 103000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 103001,
                "num": 1,
                "name": "Dynasty Ahri"
            },
            {
                "id": 103002,
                "num": 2,
                "name": "Midnight Ahri"
            },
            {
                "id": 103003,
                "num": 3,
                "name": "Foxfire Ahri"
            },
            {
                "id": 103004,
                "num": 4,
                "name": "Popstar Ahri"
            }
        ],
        "key": "Ahri"
    },
    "Olaf": {
        "id": 2,
        "title": "the Berserker",
        "name": "Olaf",
        "skins": [
            {
                "id": 2000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 2001,
                "num": 1,
                "name": "Forsaken Olaf"
            },
            {
                "id": 2002,
                "num": 2,
                "name": "Glacial Olaf"
            },
            {
                "id": 2003,
                "num": 3,
                "name": "Brolaf"
            },
            {
                "id": 2004,
                "num": 4,
                "name": "Pentakill Olaf"
            }
        ],
        "key": "Olaf"
    },
    "Viktor": {
        "id": 112,
        "title": "the Machine Herald",
        "name": "Viktor",
        "skins": [
            {
                "id": 112000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 112001,
                "num": 1,
                "name": "Full Machine Viktor"
            },
            {
                "id": 112002,
                "num": 2,
                "name": "Prototype Viktor"
            },
            {
                "id": 112003,
                "num": 3,
                "name": "Creator Viktor"
            }
        ],
        "key": "Viktor"
    },
    "Anivia": {
        "id": 34,
        "title": "the Cryophoenix",
        "name": "Anivia",
        "skins": [
            {
                "id": 34000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 34001,
                "num": 1,
                "name": "Team Spirit Anivia"
            },
            {
                "id": 34002,
                "num": 2,
                "name": "Bird of Prey Anivia"
            },
            {
                "id": 34003,
                "num": 3,
                "name": "Noxus Hunter Anivia"
            },
            {
                "id": 34004,
                "num": 4,
                "name": "Hextech Anivia"
            },
            {
                "id": 34005,
                "num": 5,
                "name": "Blackfrost Anivia"
            }
        ],
        "key": "Anivia"
    },
    "Singed": {
        "id": 27,
        "title": "the Mad Chemist",
        "name": "Singed",
        "skins": [
            {
                "id": 27000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 27001,
                "num": 1,
                "name": "Riot Squad Singed"
            },
            {
                "id": 27002,
                "num": 2,
                "name": "Hextech Singed"
            },
            {
                "id": 27003,
                "num": 3,
                "name": "Surfer Singed"
            },
            {
                "id": 27004,
                "num": 4,
                "name": "Mad Scientist Singed"
            },
            {
                "id": 27005,
                "num": 5,
                "name": "Augmented Singed"
            },
            {
                "id": 27006,
                "num": 6,
                "name": "Snow Day Singed"
            }
        ],
        "key": "Singed"
    },
    "Garen": {
        "id": 86,
        "title": "The Might of Demacia",
        "name": "Garen",
        "skins": [
            {
                "id": 86000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 86001,
                "num": 1,
                "name": "Sanguine Garen"
            },
            {
                "id": 86002,
                "num": 2,
                "name": "Desert Trooper Garen"
            },
            {
                "id": 86003,
                "num": 3,
                "name": "Commando Garen"
            },
            {
                "id": 86004,
                "num": 4,
                "name": "Dreadknight Garen"
            },
            {
                "id": 86005,
                "num": 5,
                "name": "Rugged Garen"
            },
            {
                "id": 86006,
                "num": 6,
                "name": "Steel Legion Garen"
            }
        ],
        "key": "Garen"
    },
    "Lissandra": {
        "id": 127,
        "title": "the Ice Witch",
        "name": "Lissandra",
        "skins": [
            {
                "id": 127000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 127001,
                "num": 1,
                "name": "Bloodstone Lissandra"
            },
            {
                "id": 127002,
                "num": 2,
                "name": "Blade Queen Lissandra"
            }
        ],
        "key": "Lissandra"
    },
    "Maokai": {
        "id": 57,
        "title": "the Twisted Treant",
        "name": "Maokai",
        "skins": [
            {
                "id": 57000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 57001,
                "num": 1,
                "name": "Charred Maokai"
            },
            {
                "id": 57002,
                "num": 2,
                "name": "Totemic Maokai"
            },
            {
                "id": 57003,
                "num": 3,
                "name": "Festive Maokai"
            },
            {
                "id": 57004,
                "num": 4,
                "name": "Haunted Maokai"
            },
            {
                "id": 57005,
                "num": 5,
                "name": "Goalkeeper Maokai"
            }
        ],
        "key": "Maokai"
    },
    "Morgana": {
        "id": 25,
        "title": "Fallen Angel",
        "name": "Morgana",
        "skins": [
            {
                "id": 25000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 25001,
                "num": 1,
                "name": "Exiled Morgana"
            },
            {
                "id": 25002,
                "num": 2,
                "name": "Sinful Succulence Morgana"
            },
            {
                "id": 25003,
                "num": 3,
                "name": "Blade Mistress Morgana"
            },
            {
                "id": 25004,
                "num": 4,
                "name": "Blackthorn Morgana"
            },
            {
                "id": 25005,
                "num": 5,
                "name": "Ghost Bride Morgana"
            },
            {
                "id": 25006,
                "num": 6,
                "name": "Victorious Morgana"
            }
        ],
        "key": "Morgana"
    },
    "Evelynn": {
        "id": 28,
        "title": "the Widowmaker",
        "name": "Evelynn",
        "skins": [
            {
                "id": 28000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 28001,
                "num": 1,
                "name": "Shadow Evelynn"
            },
            {
                "id": 28002,
                "num": 2,
                "name": "Masquerade Evelynn"
            },
            {
                "id": 28003,
                "num": 3,
                "name": "Tango Evelynn"
            }
        ],
        "key": "Evelynn"
    },
    "Fizz": {
        "id": 105,
        "title": "the Tidal Trickster",
        "name": "Fizz",
        "skins": [
            {
                "id": 105000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 105001,
                "num": 1,
                "name": "Atlantean Fizz"
            },
            {
                "id": 105002,
                "num": 2,
                "name": "Tundra Fizz"
            },
            {
                "id": 105003,
                "num": 3,
                "name": "Fisherman Fizz"
            },
            {
                "id": 105004,
                "num": 4,
                "name": "Void Fizz"
            }
        ],
        "key": "Fizz"
    },
    "Heimerdinger": {
        "id": 74,
        "title": "the Revered Inventor",
        "name": "Heimerdinger",
        "skins": [
            {
                "id": 74000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 74001,
                "num": 1,
                "name": "Alien Invader Heimerdinger"
            },
            {
                "id": 74002,
                "num": 2,
                "name": "Blast Zone Heimerdinger"
            },
            {
                "id": 74003,
                "num": 3,
                "name": "Piltover Customs Heimerdinger"
            },
            {
                "id": 74004,
                "num": 4,
                "name": "Snowmerdinger"
            },
            {
                "id": 74005,
                "num": 5,
                "name": "Hazmat Heimerdinger"
            }
        ],
        "key": "Heimerdinger"
    },
    "Zed": {
        "id": 238,
        "title": "the Master of Shadows",
        "name": "Zed",
        "skins": [
            {
                "id": 238000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 238001,
                "num": 1,
                "name": "Shockblade Zed"
            },
            {
                "id": 238002,
                "num": 2,
                "name": "SKT T1 Zed"
            }
        ],
        "key": "Zed"
    },
    "Rumble": {
        "id": 68,
        "title": "the Mechanized Menace",
        "name": "Rumble",
        "skins": [
            {
                "id": 68000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 68001,
                "num": 1,
                "name": "Rumble in the Jungle"
            },
            {
                "id": 68002,
                "num": 2,
                "name": "Bilgerat Rumble"
            },
            {
                "id": 68003,
                "num": 3,
                "name": "Super Galaxy Rumble"
            }
        ],
        "key": "Rumble"
    },
    "Mordekaiser": {
        "id": 82,
        "title": "the Master of Metal",
        "name": "Mordekaiser",
        "skins": [
            {
                "id": 82000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 82001,
                "num": 1,
                "name": "Dragon Knight Mordekaiser"
            },
            {
                "id": 82002,
                "num": 2,
                "name": "Infernal Mordekaiser"
            },
            {
                "id": 82003,
                "num": 3,
                "name": "Pentakill Mordekaiser"
            },
            {
                "id": 82004,
                "num": 4,
                "name": "Lord Mordekaiser"
            }
        ],
        "key": "Mordekaiser"
    },
    "Sona": {
        "id": 37,
        "title": "Maven of the Strings",
        "name": "Sona",
        "skins": [
            {
                "id": 37000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 37001,
                "num": 1,
                "name": "Muse Sona"
            },
            {
                "id": 37002,
                "num": 2,
                "name": "Pentakill Sona"
            },
            {
                "id": 37003,
                "num": 3,
                "name": "Silent Night Sona"
            },
            {
                "id": 37004,
                "num": 4,
                "name": "Guqin Sona"
            },
            {
                "id": 37005,
                "num": 5,
                "name": "Arcade Sona"
            }
        ],
        "key": "Sona"
    },
    "KogMaw": {
        "id": 96,
        "title": "the Mouth of the Abyss",
        "name": "Kog'Maw",
        "skins": [
            {
                "id": 96000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 96001,
                "num": 1,
                "name": "Caterpillar Kog'Maw"
            },
            {
                "id": 96002,
                "num": 2,
                "name": "Sonoran Kog'Maw"
            },
            {
                "id": 96003,
                "num": 3,
                "name": "Monarch Kog'Maw"
            },
            {
                "id": 96004,
                "num": 4,
                "name": "Reindeer Kog'Maw"
            },
            {
                "id": 96005,
                "num": 5,
                "name": "Lion Dance Kog'Maw"
            },
            {
                "id": 96006,
                "num": 6,
                "name": "Deep Sea Kog'Maw"
            },
            {
                "id": 96007,
                "num": 7,
                "name": "Jurassic Kog'Maw"
            },
            {
                "id": 96008,
                "num": 8,
                "name": "Battlecast Kog'Maw"
            }
        ],
        "key": "KogMaw"
    },
    "Katarina": {
        "id": 55,
        "title": "the Sinister Blade",
        "name": "Katarina",
        "skins": [
            {
                "id": 55000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 55001,
                "num": 1,
                "name": "Mercenary Katarina"
            },
            {
                "id": 55002,
                "num": 2,
                "name": "Red Card Katarina"
            },
            {
                "id": 55003,
                "num": 3,
                "name": "Bilgewater Katarina"
            },
            {
                "id": 55004,
                "num": 4,
                "name": "Kitty Cat Katarina"
            },
            {
                "id": 55005,
                "num": 5,
                "name": "High Command Katarina"
            },
            {
                "id": 55006,
                "num": 6,
                "name": "Sandstorm Katarina"
            },
            {
                "id": 55007,
                "num": 7,
                "name": "Slay Belle Katarina"
            }
        ],
        "key": "Katarina"
    },
    "Lulu": {
        "id": 117,
        "title": "the Fae Sorceress",
        "name": "Lulu",
        "skins": [
            {
                "id": 117000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 117001,
                "num": 1,
                "name": "Bittersweet Lulu"
            },
            {
                "id": 117002,
                "num": 2,
                "name": "Wicked Lulu"
            },
            {
                "id": 117003,
                "num": 3,
                "name": "Dragon Trainer Lulu"
            },
            {
                "id": 117004,
                "num": 4,
                "name": "Winter Wonder Lulu"
            }
        ],
        "key": "Lulu"
    },
    "Ashe": {
        "id": 22,
        "title": "the Frost Archer",
        "name": "Ashe",
        "skins": [
            {
                "id": 22000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 22001,
                "num": 1,
                "name": "Freljord Ashe"
            },
            {
                "id": 22002,
                "num": 2,
                "name": "Sherwood Forest Ashe"
            },
            {
                "id": 22003,
                "num": 3,
                "name": "Woad Ashe"
            },
            {
                "id": 22004,
                "num": 4,
                "name": "Queen Ashe"
            },
            {
                "id": 22005,
                "num": 5,
                "name": "Amethyst Ashe"
            },
            {
                "id": 22006,
                "num": 6,
                "name": "Heartseeker Ashe"
            }
        ],
        "key": "Ashe"
    },
    "Karthus": {
        "id": 30,
        "title": "the Deathsinger",
        "name": "Karthus",
        "skins": [
            {
                "id": 30000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 30001,
                "num": 1,
                "name": "Phantom Karthus"
            },
            {
                "id": 30002,
                "num": 2,
                "name": "Statue of Karthus"
            },
            {
                "id": 30003,
                "num": 3,
                "name": "Grim Reaper Karthus"
            },
            {
                "id": 30004,
                "num": 4,
                "name": "Pentakill Karthus"
            },
            {
                "id": 30005,
                "num": 5,
                "name": "Fnatic Karthus"
            }
        ],
        "key": "Karthus"
    },
    "Alistar": {
        "id": 12,
        "title": "the Minotaur",
        "name": "Alistar",
        "skins": [
            {
                "id": 12000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 12001,
                "num": 1,
                "name": "Black Alistar"
            },
            {
                "id": 12002,
                "num": 2,
                "name": "Golden Alistar"
            },
            {
                "id": 12003,
                "num": 3,
                "name": "Matador Alistar"
            },
            {
                "id": 12004,
                "num": 4,
                "name": "Longhorn Alistar"
            },
            {
                "id": 12005,
                "num": 5,
                "name": "Unchained Alistar"
            },
            {
                "id": 12006,
                "num": 6,
                "name": "Infernal Alistar"
            },
            {
                "id": 12007,
                "num": 7,
                "name": "Sweeper Alistar"
            }
        ],
        "key": "Alistar"
    },
    "Darius": {
        "id": 122,
        "title": "the Hand of Noxus",
        "name": "Darius",
        "skins": [
            {
                "id": 122000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 122001,
                "num": 1,
                "name": "Lord Darius"
            },
            {
                "id": 122002,
                "num": 2,
                "name": "Bioforge Darius"
            },
            {
                "id": 122003,
                "num": 3,
                "name": "Woad King Darius"
            },
            {
                "id": 122004,
                "num": 4,
                "name": "Dunkmaster Darius"
            }
        ],
        "key": "Darius"
    },
    "Vayne": {
        "id": 67,
        "title": "the Night Hunter",
        "name": "Vayne",
        "skins": [
            {
                "id": 67000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 67001,
                "num": 1,
                "name": "Vindicator Vayne"
            },
            {
                "id": 67002,
                "num": 2,
                "name": "Aristocrat Vayne"
            },
            {
                "id": 67003,
                "num": 3,
                "name": "Dragonslayer Vayne"
            },
            {
                "id": 67004,
                "num": 4,
                "name": "Heartseeker Vayne"
            },
            {
                "id": 67005,
                "num": 5,
                "name": "SKT T1 Vayne"
            }
        ],
        "key": "Vayne"
    },
    "Udyr": {
        "id": 77,
        "title": "the Spirit Walker",
        "name": "Udyr",
        "skins": [
            {
                "id": 77000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 77001,
                "num": 1,
                "name": "Black Belt Udyr"
            },
            {
                "id": 77002,
                "num": 2,
                "name": "Primal Udyr"
            },
            {
                "id": 77003,
                "num": 3,
                "name": "Spirit Guard Udyr"
            }
        ],
        "key": "Udyr"
    },
    "Varus": {
        "id": 110,
        "title": "the Arrow of Retribution",
        "name": "Varus",
        "skins": [
            {
                "id": 110000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 110001,
                "num": 1,
                "name": "Blight Crystal Varus"
            },
            {
                "id": 110002,
                "num": 2,
                "name": "Arclight Varus"
            },
            {
                "id": 110003,
                "num": 3,
                "name": "Arctic Ops Varus"
            }
        ],
        "key": "Varus"
    },
    "Leona": {
        "id": 89,
        "title": "the Radiant Dawn",
        "name": "Leona",
        "skins": [
            {
                "id": 89000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 89001,
                "num": 1,
                "name": "Valkyrie Leona"
            },
            {
                "id": 89002,
                "num": 2,
                "name": "Defender Leona"
            },
            {
                "id": 89003,
                "num": 3,
                "name": "Iron Solari Leona"
            },
            {
                "id": 89004,
                "num": 4,
                "name": "Pool Party Leona"
            }
        ],
        "key": "Leona"
    },
    "Jayce": {
        "id": 126,
        "title": "the Defender of Tomorrow",
        "name": "Jayce",
        "skins": [
            {
                "id": 126000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 126001,
                "num": 1,
                "name": "Full Metal Jayce"
            },
            {
                "id": 126002,
                "num": 2,
                "name": "Debonair Jayce"
            }
        ],
        "key": "Jayce"
    },
    "Syndra": {
        "id": 134,
        "title": "the Dark Sovereign",
        "name": "Syndra",
        "skins": [
            {
                "id": 134000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 134001,
                "num": 1,
                "name": "Justicar Syndra"
            },
            {
                "id": 134002,
                "num": 2,
                "name": "Atlantean Syndra"
            }
        ],
        "key": "Syndra"
    },
    "Pantheon": {
        "id": 80,
        "title": "the Artisan of War",
        "name": "Pantheon",
        "skins": [
            {
                "id": 80000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 80001,
                "num": 1,
                "name": "Myrmidon Pantheon"
            },
            {
                "id": 80002,
                "num": 2,
                "name": "Ruthless Pantheon"
            },
            {
                "id": 80003,
                "num": 3,
                "name": "Perseus Pantheon"
            },
            {
                "id": 80004,
                "num": 4,
                "name": "Full Metal Pantheon"
            },
            {
                "id": 80005,
                "num": 5,
                "name": "Glaive Warrior Pantheon"
            },
            {
                "id": 80006,
                "num": 6,
                "name": "Dragonslayer Pantheon"
            }
        ],
        "key": "Pantheon"
    },
    "Riven": {
        "id": 92,
        "title": "the Exile",
        "name": "Riven",
        "skins": [
            {
                "id": 92000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 92001,
                "num": 1,
                "name": "Redeemed Riven"
            },
            {
                "id": 92002,
                "num": 2,
                "name": "Crimson Elite Riven"
            },
            {
                "id": 92003,
                "num": 3,
                "name": "Battle Bunny Riven"
            },
            {
                "id": 92004,
                "num": 4,
                "name": "Championship Riven"
            },
            {
                "id": 92005,
                "num": 5,
                "name": "Dragonblade Riven"
            }
        ],
        "key": "Riven"
    },
    "Khazix": {
        "id": 121,
        "title": "the Voidreaver",
        "name": "Kha'Zix",
        "skins": [
            {
                "id": 121000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 121001,
                "num": 1,
                "name": "Mecha Kha'Zix"
            },
            {
                "id": 121002,
                "num": 2,
                "name": "Guardian of the Sands Kha'Zix"
            }
        ],
        "key": "Khazix"
    },
    "Corki": {
        "id": 42,
        "title": "the Daring Bombardier",
        "name": "Corki",
        "skins": [
            {
                "id": 42000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 42001,
                "num": 1,
                "name": "UFO Corki"
            },
            {
                "id": 42002,
                "num": 2,
                "name": "Ice Toboggan Corki"
            },
            {
                "id": 42003,
                "num": 3,
                "name": "Red Baron Corki"
            },
            {
                "id": 42004,
                "num": 4,
                "name": "Hot Rod Corki"
            },
            {
                "id": 42005,
                "num": 5,
                "name": "Urfrider Corki"
            },
            {
                "id": 42006,
                "num": 6,
                "name": "Dragonwing Corki"
            },
            {
                "id": 42007,
                "num": 7,
                "name": "Fnatic Corki"
            }
        ],
        "key": "Corki"
    },
    "Azir": {
        "id": 268,
        "title": "the Emperor of the Sands",
        "name": "Azir",
        "skins": [
            {
                "id": 268000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 268001,
                "num": 1,
                "name": "Galactic Azir"
            }
        ],
        "key": "Azir"
    },
    "Caitlyn": {
        "id": 51,
        "title": "the Sheriff of Piltover",
        "name": "Caitlyn",
        "skins": [
            {
                "id": 51000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 51001,
                "num": 1,
                "name": "Resistance Caitlyn"
            },
            {
                "id": 51002,
                "num": 2,
                "name": "Sheriff Caitlyn"
            },
            {
                "id": 51003,
                "num": 3,
                "name": "Safari Caitlyn"
            },
            {
                "id": 51004,
                "num": 4,
                "name": "Arctic Warfare Caitlyn"
            },
            {
                "id": 51005,
                "num": 5,
                "name": "Officer Caitlyn"
            },
            {
                "id": 51006,
                "num": 6,
                "name": "Headhunter Caitlyn"
            }
        ],
        "key": "Caitlyn"
    },
    "Nidalee": {
        "id": 76,
        "title": "the Bestial Huntress",
        "name": "Nidalee",
        "skins": [
            {
                "id": 76000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 76001,
                "num": 1,
                "name": "Snow Bunny Nidalee"
            },
            {
                "id": 76002,
                "num": 2,
                "name": "Leopard Nidalee"
            },
            {
                "id": 76003,
                "num": 3,
                "name": "French Maid Nidalee"
            },
            {
                "id": 76004,
                "num": 4,
                "name": "Pharaoh Nidalee"
            },
            {
                "id": 76005,
                "num": 5,
                "name": "Bewitching Nidalee"
            },
            {
                "id": 76006,
                "num": 6,
                "name": "Headhunter Nidalee"
            }
        ],
        "key": "Nidalee"
    },
    "Kennen": {
        "id": 85,
        "title": "the Heart of the Tempest",
        "name": "Kennen",
        "skins": [
            {
                "id": 85000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 85001,
                "num": 1,
                "name": "Deadly Kennen"
            },
            {
                "id": 85002,
                "num": 2,
                "name": "Swamp Master Kennen"
            },
            {
                "id": 85003,
                "num": 3,
                "name": "Karate Kennen"
            },
            {
                "id": 85004,
                "num": 4,
                "name": "Kennen M.D."
            },
            {
                "id": 85005,
                "num": 5,
                "name": "Arctic Ops Kennen"
            }
        ],
        "key": "Kennen"
    },
    "Galio": {
        "id": 3,
        "title": "the Sentinel's Sorrow",
        "name": "Galio",
        "skins": [
            {
                "id": 3000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 3001,
                "num": 1,
                "name": "Enchanted Galio"
            },
            {
                "id": 3002,
                "num": 2,
                "name": "Hextech Galio"
            },
            {
                "id": 3003,
                "num": 3,
                "name": "Commando Galio"
            },
            {
                "id": 3004,
                "num": 4,
                "name": "Gatekeeper Galio"
            }
        ],
        "key": "Galio"
    },
    "Veigar": {
        "id": 45,
        "title": "the Tiny Master of Evil",
        "name": "Veigar",
        "skins": [
            {
                "id": 45000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 45001,
                "num": 1,
                "name": "White Mage Veigar"
            },
            {
                "id": 45002,
                "num": 2,
                "name": "Curling Veigar"
            },
            {
                "id": 45003,
                "num": 3,
                "name": "Veigar Greybeard"
            },
            {
                "id": 45004,
                "num": 4,
                "name": "Leprechaun Veigar"
            },
            {
                "id": 45005,
                "num": 5,
                "name": "Baron Von Veigar"
            },
            {
                "id": 45006,
                "num": 6,
                "name": "Superb Villain Veigar"
            },
            {
                "id": 45007,
                "num": 7,
                "name": "Bad Santa Veigar"
            },
            {
                "id": 45008,
                "num": 8,
                "name": "Final Boss Veigar"
            }
        ],
        "key": "Veigar"
    },
    "Gnar": {
        "id": 150,
        "title": "the Missing Link",
        "name": "Gnar",
        "skins": [
            {
                "id": 150000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 150001,
                "num": 1,
                "name": "Dino Gnar"
            }
        ],
        "key": "Gnar"
    },
    "Malzahar": {
        "id": 90,
        "title": "the Prophet of the Void",
        "name": "Malzahar",
        "skins": [
            {
                "id": 90000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 90001,
                "num": 1,
                "name": "Vizier Malzahar"
            },
            {
                "id": 90002,
                "num": 2,
                "name": "Shadow Prince Malzahar"
            },
            {
                "id": 90003,
                "num": 3,
                "name": "Djinn Malzahar"
            },
            {
                "id": 90004,
                "num": 4,
                "name": "Overlord Malzahar"
            }
        ],
        "key": "Malzahar"
    },
    "Graves": {
        "id": 104,
        "title": "the Outlaw",
        "name": "Graves",
        "skins": [
            {
                "id": 104000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 104001,
                "num": 1,
                "name": "Hired Gun Graves"
            },
            {
                "id": 104002,
                "num": 2,
                "name": "Jailbreak Graves"
            },
            {
                "id": 104003,
                "num": 3,
                "name": "Mafia Graves"
            },
            {
                "id": 104004,
                "num": 4,
                "name": "Riot Graves"
            },
            {
                "id": 104005,
                "num": 5,
                "name": "Pool Party Graves"
            }
        ],
        "key": "Graves"
    },
    "Vi": {
        "id": 254,
        "title": "the Piltover Enforcer",
        "name": "Vi",
        "skins": [
            {
                "id": 254000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 254001,
                "num": 1,
                "name": "Neon Strike Vi"
            },
            {
                "id": 254002,
                "num": 2,
                "name": "Officer Vi"
            },
            {
                "id": 254003,
                "num": 3,
                "name": "Debonair Vi"
            }
        ],
        "key": "Vi"
    },
    "Kayle": {
        "id": 10,
        "title": "The Judicator",
        "name": "Kayle",
        "skins": [
            {
                "id": 10000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 10001,
                "num": 1,
                "name": "Silver Kayle"
            },
            {
                "id": 10002,
                "num": 2,
                "name": "Viridian Kayle"
            },
            {
                "id": 10003,
                "num": 3,
                "name": "Unmasked Kayle"
            },
            {
                "id": 10004,
                "num": 4,
                "name": "Battleborn Kayle"
            },
            {
                "id": 10005,
                "num": 5,
                "name": "Judgment Kayle"
            },
            {
                "id": 10006,
                "num": 6,
                "name": "Aether Wing Kayle"
            },
            {
                "id": 10007,
                "num": 7,
                "name": "Riot Kayle"
            }
        ],
        "key": "Kayle"
    },
    "Irelia": {
        "id": 39,
        "title": "the Will of the Blades",
        "name": "Irelia",
        "skins": [
            {
                "id": 39000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 39001,
                "num": 1,
                "name": "Nightblade Irelia"
            },
            {
                "id": 39002,
                "num": 2,
                "name": "Aviator Irelia"
            },
            {
                "id": 39003,
                "num": 3,
                "name": "Infiltrator Irelia"
            },
            {
                "id": 39004,
                "num": 4,
                "name": "Frostblade Irelia"
            }
        ],
        "key": "Irelia"
    },
    "LeeSin": {
        "id": 64,
        "title": "the Blind Monk",
        "name": "Lee Sin",
        "skins": [
            {
                "id": 64000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 64001,
                "num": 1,
                "name": "Traditional Lee Sin"
            },
            {
                "id": 64002,
                "num": 2,
                "name": "Acolyte Lee Sin"
            },
            {
                "id": 64003,
                "num": 3,
                "name": "Dragon Fist Lee Sin"
            },
            {
                "id": 64004,
                "num": 4,
                "name": "Muay Thai Lee Sin"
            },
            {
                "id": 64005,
                "num": 5,
                "name": "Pool Party Lee Sin"
            },
            {
                "id": 64006,
                "num": 6,
                "name": "SKT T1 Lee Sin"
            }
        ],
        "key": "LeeSin"
    },
    "Elise": {
        "id": 60,
        "title": "The Spider Queen",
        "name": "Elise",
        "skins": [
            {
                "id": 60000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 60001,
                "num": 1,
                "name": "Death Blossom Elise"
            },
            {
                "id": 60002,
                "num": 2,
                "name": "Victorious Elise"
            }
        ],
        "key": "Elise"
    },
    "Volibear": {
        "id": 106,
        "title": "the Thunder's Roar",
        "name": "Volibear",
        "skins": [
            {
                "id": 106000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 106001,
                "num": 1,
                "name": "Thunder Lord Volibear"
            },
            {
                "id": 106002,
                "num": 2,
                "name": "Northern Storm Volibear"
            },
            {
                "id": 106003,
                "num": 3,
                "name": "Runeguard Volibear"
            }
        ],
        "key": "Volibear"
    },
    "Nunu": {
        "id": 20,
        "title": "the Yeti Rider",
        "name": "Nunu",
        "skins": [
            {
                "id": 20000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 20001,
                "num": 1,
                "name": "Sasquatch Nunu"
            },
            {
                "id": 20002,
                "num": 2,
                "name": "Workshop Nunu"
            },
            {
                "id": 20003,
                "num": 3,
                "name": "Grungy Nunu"
            },
            {
                "id": 20004,
                "num": 4,
                "name": "Nunu Bot"
            },
            {
                "id": 20005,
                "num": 5,
                "name": "Demolisher Nunu"
            },
            {
                "id": 20006,
                "num": 6,
                "name": "TPA Nunu"
            }
        ],
        "key": "Nunu"
    },
    "TwistedFate": {
        "id": 4,
        "title": "the Card Master",
        "name": "Twisted Fate",
        "skins": [
            {
                "id": 4000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 4001,
                "num": 1,
                "name": "PAX Twisted Fate"
            },
            {
                "id": 4002,
                "num": 2,
                "name": "Jack of Hearts Twisted Fate"
            },
            {
                "id": 4003,
                "num": 3,
                "name": "The Magnificent Twisted Fate"
            },
            {
                "id": 4004,
                "num": 4,
                "name": "Tango Twisted Fate"
            },
            {
                "id": 4005,
                "num": 5,
                "name": "High Noon Twisted Fate"
            },
            {
                "id": 4006,
                "num": 6,
                "name": "Musketeer Twisted Fate"
            },
            {
                "id": 4007,
                "num": 7,
                "name": "Underworld Twisted Fate"
            },
            {
                "id": 4008,
                "num": 8,
                "name": "Red Card Twisted Fate"
            }
        ],
        "key": "TwistedFate"
    },
    "Jax": {
        "id": 24,
        "title": "Grandmaster at Arms",
        "name": "Jax",
        "skins": [
            {
                "id": 24000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 24001,
                "num": 1,
                "name": "The Mighty Jax"
            },
            {
                "id": 24002,
                "num": 2,
                "name": "Vandal Jax"
            },
            {
                "id": 24003,
                "num": 3,
                "name": "Angler Jax"
            },
            {
                "id": 24004,
                "num": 4,
                "name": "PAX Jax"
            },
            {
                "id": 24005,
                "num": 5,
                "name": "Jaximus"
            },
            {
                "id": 24006,
                "num": 6,
                "name": "Temple Jax"
            },
            {
                "id": 24007,
                "num": 7,
                "name": "Nemesis Jax"
            },
            {
                "id": 24008,
                "num": 8,
                "name": "SKT T1 Jax"
            }
        ],
        "key": "Jax"
    },
    "Shyvana": {
        "id": 102,
        "title": "the Half-Dragon",
        "name": "Shyvana",
        "skins": [
            {
                "id": 102000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 102001,
                "num": 1,
                "name": "Ironscale Shyvana"
            },
            {
                "id": 102002,
                "num": 2,
                "name": "Boneclaw Shyvana"
            },
            {
                "id": 102003,
                "num": 3,
                "name": "Darkflame Shyvana"
            },
            {
                "id": 102004,
                "num": 4,
                "name": "Ice Drake Shyvana"
            },
            {
                "id": 102005,
                "num": 5,
                "name": "Championship Shyvana"
            }
        ],
        "key": "Shyvana"
    },
    "Kalista": {
        "id": 429,
        "title": "the Spear of Vengeance",
        "name": "Kalista",
        "skins": [
            {
                "id": 429000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 429001,
                "num": 1,
                "name": "Blood Moon Kalista"
            }
        ],
        "key": "Kalista"
    },
    "DrMundo": {
        "id": 36,
        "title": "the Madman of Zaun",
        "name": "Dr. Mundo",
        "skins": [
            {
                "id": 36000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 36001,
                "num": 1,
                "name": "Toxic Dr. Mundo"
            },
            {
                "id": 36002,
                "num": 2,
                "name": "Mr. Mundoverse"
            },
            {
                "id": 36003,
                "num": 3,
                "name": "Corporate Mundo"
            },
            {
                "id": 36004,
                "num": 4,
                "name": "Mundo Mundo"
            },
            {
                "id": 36005,
                "num": 5,
                "name": "Executioner Mundo"
            },
            {
                "id": 36006,
                "num": 6,
                "name": "Rageborn Mundo"
            },
            {
                "id": 36007,
                "num": 7,
                "name": "TPA Mundo"
            }
        ],
        "key": "DrMundo"
    },
    "Diana": {
        "id": 131,
        "title": "Scorn of the Moon",
        "name": "Diana",
        "skins": [
            {
                "id": 131000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 131001,
                "num": 1,
                "name": "Dark Valkyrie Diana"
            },
            {
                "id": 131002,
                "num": 2,
                "name": "Lunar Goddess Diana"
            }
        ],
        "key": "Diana"
    },
    "Brand": {
        "id": 63,
        "title": "the Burning Vengeance",
        "name": "Brand",
        "skins": [
            {
                "id": 63000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 63001,
                "num": 1,
                "name": "Apocalyptic Brand"
            },
            {
                "id": 63002,
                "num": 2,
                "name": "Vandal Brand"
            },
            {
                "id": 63003,
                "num": 3,
                "name": "Cryocore Brand"
            },
            {
                "id": 63004,
                "num": 4,
                "name": "Zombie Brand"
            }
        ],
        "key": "Brand"
    },
    "Sejuani": {
        "id": 113,
        "title": "the Winter's Wrath",
        "name": "Sejuani",
        "skins": [
            {
                "id": 113000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 113001,
                "num": 1,
                "name": "Sabretusk Sejuani"
            },
            {
                "id": 113002,
                "num": 2,
                "name": "Darkrider Sejuani"
            },
            {
                "id": 113003,
                "num": 3,
                "name": "Traditional Sejuani"
            },
            {
                "id": 113004,
                "num": 4,
                "name": "Bear Cavalry Sejuani"
            }
        ],
        "key": "Sejuani"
    },
    "Vladimir": {
        "id": 8,
        "title": "the Crimson Reaper",
        "name": "Vladimir",
        "skins": [
            {
                "id": 8000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 8001,
                "num": 1,
                "name": "Count Vladimir"
            },
            {
                "id": 8002,
                "num": 2,
                "name": "Marquis Vladimir"
            },
            {
                "id": 8003,
                "num": 3,
                "name": "Nosferatu Vladimir"
            },
            {
                "id": 8004,
                "num": 4,
                "name": "Vandal Vladimir"
            },
            {
                "id": 8005,
                "num": 5,
                "name": "Blood Lord Vladimir"
            },
            {
                "id": 8006,
                "num": 6,
                "name": "Soulstealer Vladimir"
            }
        ],
        "key": "Vladimir"
    },
    "Zac": {
        "id": 154,
        "title": "the Secret Weapon",
        "name": "Zac",
        "skins": [
            {
                "id": 154000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 154001,
                "num": 1,
                "name": "Special Weapon Zac"
            }
        ],
        "key": "Zac"
    },
    "Quinn": {
        "id": 133,
        "title": "Demacia's Wings",
        "name": "Quinn",
        "skins": [
            {
                "id": 133000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 133001,
                "num": 1,
                "name": "Phoenix Quinn"
            },
            {
                "id": 133002,
                "num": 2,
                "name": "Woad Scout Quinn"
            }
        ],
        "key": "Quinn"
    },
    "Akali": {
        "id": 84,
        "title": "the Fist of Shadow",
        "name": "Akali",
        "skins": [
            {
                "id": 84000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 84001,
                "num": 1,
                "name": "Stinger Akali"
            },
            {
                "id": 84002,
                "num": 2,
                "name": "Crimson Akali"
            },
            {
                "id": 84003,
                "num": 3,
                "name": "All-star Akali"
            },
            {
                "id": 84004,
                "num": 4,
                "name": "Nurse Akali"
            },
            {
                "id": 84005,
                "num": 5,
                "name": "Blood Moon Akali"
            },
            {
                "id": 84006,
                "num": 6,
                "name": "Silverfang Akali"
            }
        ],
        "key": "Akali"
    },
    "Tristana": {
        "id": 18,
        "title": "the Megling Gunner",
        "name": "Tristana",
        "skins": [
            {
                "id": 18000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 18001,
                "num": 1,
                "name": "Riot Girl Tristana"
            },
            {
                "id": 18002,
                "num": 2,
                "name": "Earnest Elf Tristana"
            },
            {
                "id": 18003,
                "num": 3,
                "name": "Firefighter Tristana"
            },
            {
                "id": 18004,
                "num": 4,
                "name": "Guerilla Tristana"
            },
            {
                "id": 18005,
                "num": 5,
                "name": "Buccaneer Tristana"
            },
            {
                "id": 18006,
                "num": 6,
                "name": "Rocket Girl Tristana"
            }
        ],
        "key": "Tristana"
    },
    "Hecarim": {
        "id": 120,
        "title": "the Shadow of War",
        "name": "Hecarim",
        "skins": [
            {
                "id": 120000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 120001,
                "num": 1,
                "name": "Blood Knight Hecarim"
            },
            {
                "id": 120002,
                "num": 2,
                "name": "Reaper Hecarim"
            },
            {
                "id": 120003,
                "num": 3,
                "name": "Headless Hecarim"
            },
            {
                "id": 120004,
                "num": 4,
                "name": "Arcade Hecarim"
            }
        ],
        "key": "Hecarim"
    },
    "Sivir": {
        "id": 15,
        "title": "the Battle Mistress",
        "name": "Sivir",
        "skins": [
            {
                "id": 15000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 15001,
                "num": 1,
                "name": "Warrior Princess Sivir"
            },
            {
                "id": 15002,
                "num": 2,
                "name": "Spectacular Sivir"
            },
            {
                "id": 15003,
                "num": 3,
                "name": "Huntress Sivir"
            },
            {
                "id": 15004,
                "num": 4,
                "name": "Bandit Sivir"
            },
            {
                "id": 15005,
                "num": 5,
                "name": "PAX Sivir"
            },
            {
                "id": 15006,
                "num": 6,
                "name": "Snowstorm Sivir"
            }
        ],
        "key": "Sivir"
    },
    "Lucian": {
        "id": 236,
        "title": "the Purifier",
        "name": "Lucian",
        "skins": [
            {
                "id": 236000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 236001,
                "num": 1,
                "name": "Hired Gun Lucian"
            },
            {
                "id": 236002,
                "num": 2,
                "name": "Striker Lucian"
            }
        ],
        "key": "Lucian"
    },
    "Rengar": {
        "id": 107,
        "title": "the Pridestalker",
        "name": "Rengar",
        "skins": [
            {
                "id": 107000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 107001,
                "num": 1,
                "name": "Headhunter Rengar"
            },
            {
                "id": 107002,
                "num": 2,
                "name": "Night Hunter Rengar"
            }
        ],
        "key": "Rengar"
    },
    "Warwick": {
        "id": 19,
        "title": "the Blood Hunter",
        "name": "Warwick",
        "skins": [
            {
                "id": 19000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 19001,
                "num": 1,
                "name": "Grey Warwick"
            },
            {
                "id": 19002,
                "num": 2,
                "name": "Urf the Manatee"
            },
            {
                "id": 19003,
                "num": 3,
                "name": "Big Bad Warwick"
            },
            {
                "id": 19004,
                "num": 4,
                "name": "Tundra Hunter Warwick"
            },
            {
                "id": 19005,
                "num": 5,
                "name": "Feral Warwick"
            },
            {
                "id": 19006,
                "num": 6,
                "name": "Firefang Warwick"
            },
            {
                "id": 19007,
                "num": 7,
                "name": "Hyena Warwick"
            }
        ],
        "key": "Warwick"
    },
    "Skarner": {
        "id": 72,
        "title": "the Crystal Vanguard",
        "name": "Skarner",
        "skins": [
            {
                "id": 72000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 72001,
                "num": 1,
                "name": "Sandscourge Skarner"
            },
            {
                "id": 72002,
                "num": 2,
                "name": "Earthrune Skarner"
            },
            {
                "id": 72003,
                "num": 3,
                "name": "Battlecast Alpha Skarner"
            }
        ],
        "key": "Skarner"
    },
    "Malphite": {
        "id": 54,
        "title": "Shard of the Monolith",
        "name": "Malphite",
        "skins": [
            {
                "id": 54000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 54001,
                "num": 1,
                "name": "Shamrock Malphite"
            },
            {
                "id": 54002,
                "num": 2,
                "name": "Coral Reef Malphite"
            },
            {
                "id": 54003,
                "num": 3,
                "name": "Marble Malphite"
            },
            {
                "id": 54004,
                "num": 4,
                "name": "Obsidian Malphite"
            },
            {
                "id": 54005,
                "num": 5,
                "name": "Glacial Malphite"
            },
            {
                "id": 54006,
                "num": 6,
                "name": "Mecha Malphite"
            }
        ],
        "key": "Malphite"
    },
    "Yasuo": {
        "id": 157,
        "title": "the Unforgiven",
        "name": "Yasuo",
        "skins": [
            {
                "id": 157000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 157001,
                "num": 1,
                "name": "High Noon Yasuo"
            },
            {
                "id": 157002,
                "num": 2,
                "name": "PROJECT: Yasuo"
            }
        ],
        "key": "Yasuo"
    },
    "Xerath": {
        "id": 101,
        "title": "the Magus Ascendant",
        "name": "Xerath",
        "skins": [
            {
                "id": 101000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 101001,
                "num": 1,
                "name": "Runeborn Xerath"
            },
            {
                "id": 101002,
                "num": 2,
                "name": "Battlecast Xerath"
            },
            {
                "id": 101003,
                "num": 3,
                "name": "Scorched Earth Xerath"
            }
        ],
        "key": "Xerath"
    },
    "Teemo": {
        "id": 17,
        "title": "the Swift Scout",
        "name": "Teemo",
        "skins": [
            {
                "id": 17000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 17001,
                "num": 1,
                "name": "Happy Elf Teemo"
            },
            {
                "id": 17002,
                "num": 2,
                "name": "Recon Teemo"
            },
            {
                "id": 17003,
                "num": 3,
                "name": "Badger Teemo"
            },
            {
                "id": 17004,
                "num": 4,
                "name": "Astronaut Teemo"
            },
            {
                "id": 17005,
                "num": 5,
                "name": "Cottontail Teemo"
            },
            {
                "id": 17006,
                "num": 6,
                "name": "Super Teemo"
            },
            {
                "id": 17007,
                "num": 7,
                "name": "Panda Teemo"
            }
        ],
        "key": "Teemo"
    },
    "Nasus": {
        "id": 75,
        "title": "the Curator of the Sands",
        "name": "Nasus",
        "skins": [
            {
                "id": 75000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 75001,
                "num": 1,
                "name": "Galactic Nasus"
            },
            {
                "id": 75002,
                "num": 2,
                "name": "Pharaoh Nasus"
            },
            {
                "id": 75003,
                "num": 3,
                "name": "Dreadknight Nasus"
            },
            {
                "id": 75004,
                "num": 4,
                "name": "Riot K-9 Nasus"
            },
            {
                "id": 75005,
                "num": 5,
                "name": "Infernal Nasus"
            }
        ],
        "key": "Nasus"
    },
    "Renekton": {
        "id": 58,
        "title": "the Butcher of the Sands",
        "name": "Renekton",
        "skins": [
            {
                "id": 58000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 58001,
                "num": 1,
                "name": "Galactic Renekton"
            },
            {
                "id": 58002,
                "num": 2,
                "name": "Outback Renekton"
            },
            {
                "id": 58003,
                "num": 3,
                "name": "Bloodfury Renekton"
            },
            {
                "id": 58004,
                "num": 4,
                "name": "Rune Wars Renekton"
            },
            {
                "id": 58005,
                "num": 5,
                "name": "Scorched Earth Renekton"
            },
            {
                "id": 58006,
                "num": 6,
                "name": "Pool Party Renekton"
            }
        ],
        "key": "Renekton"
    },
    "Draven": {
        "id": 119,
        "title": "the Glorious Executioner",
        "name": "Draven",
        "skins": [
            {
                "id": 119000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 119001,
                "num": 1,
                "name": "Soul Reaver Draven"
            },
            {
                "id": 119002,
                "num": 2,
                "name": "Gladiator Draven"
            },
            {
                "id": 119003,
                "num": 3,
                "name": "Primetime Draven"
            }
        ],
        "key": "Draven"
    },
    "Shaco": {
        "id": 35,
        "title": "the Demon Jester",
        "name": "Shaco",
        "skins": [
            {
                "id": 35000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 35001,
                "num": 1,
                "name": "Mad Hatter Shaco"
            },
            {
                "id": 35002,
                "num": 2,
                "name": "Royal Shaco"
            },
            {
                "id": 35003,
                "num": 3,
                "name": "Nutcracko"
            },
            {
                "id": 35004,
                "num": 4,
                "name": "Workshop Shaco"
            },
            {
                "id": 35005,
                "num": 5,
                "name": "Asylum Shaco"
            },
            {
                "id": 35006,
                "num": 6,
                "name": "Masked Shaco"
            }
        ],
        "key": "Shaco"
    },
    "Swain": {
        "id": 50,
        "title": "the Master Tactician",
        "name": "Swain",
        "skins": [
            {
                "id": 50000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 50001,
                "num": 1,
                "name": "Northern Front Swain"
            },
            {
                "id": 50002,
                "num": 2,
                "name": "Bilgewater Swain"
            },
            {
                "id": 50003,
                "num": 3,
                "name": "Tyrant Swain"
            }
        ],
        "key": "Swain"
    },
    "Talon": {
        "id": 91,
        "title": "the Blade's Shadow",
        "name": "Talon",
        "skins": [
            {
                "id": 91000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 91001,
                "num": 1,
                "name": "Renegade Talon"
            },
            {
                "id": 91002,
                "num": 2,
                "name": "Crimson Elite Talon"
            },
            {
                "id": 91003,
                "num": 3,
                "name": "Dragonblade Talon"
            }
        ],
        "key": "Talon"
    },
    "Janna": {
        "id": 40,
        "title": "the Storm's Fury",
        "name": "Janna",
        "skins": [
            {
                "id": 40000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 40001,
                "num": 1,
                "name": "Tempest Janna"
            },
            {
                "id": 40002,
                "num": 2,
                "name": "Hextech Janna"
            },
            {
                "id": 40003,
                "num": 3,
                "name": "Frost Queen Janna"
            },
            {
                "id": 40004,
                "num": 4,
                "name": "Victorious Janna"
            },
            {
                "id": 40005,
                "num": 5,
                "name": "Forecast Janna"
            },
            {
                "id": 40006,
                "num": 6,
                "name": "Fnatic Janna"
            }
        ],
        "key": "Janna"
    },
    "Ziggs": {
        "id": 115,
        "title": "the Hexplosives Expert",
        "name": "Ziggs",
        "skins": [
            {
                "id": 115000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 115001,
                "num": 1,
                "name": "Mad Scientist Ziggs"
            },
            {
                "id": 115002,
                "num": 2,
                "name": "Major Ziggs"
            },
            {
                "id": 115003,
                "num": 3,
                "name": "Pool Party Ziggs"
            },
            {
                "id": 115004,
                "num": 4,
                "name": "Snow Day Ziggs"
            }
        ],
        "key": "Ziggs"
    },
    "Orianna": {
        "id": 61,
        "title": "the Lady of Clockwork",
        "name": "Orianna",
        "skins": [
            {
                "id": 61000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 61001,
                "num": 1,
                "name": "Gothic Orianna"
            },
            {
                "id": 61002,
                "num": 2,
                "name": "Sewn Chaos Orianna"
            },
            {
                "id": 61003,
                "num": 3,
                "name": "Bladecraft Orianna"
            },
            {
                "id": 61004,
                "num": 4,
                "name": "TPA Orianna"
            }
        ],
        "key": "Orianna"
    },
    "Fiora": {
        "id": 114,
        "title": "the Grand Duelist",
        "name": "Fiora",
        "skins": [
            {
                "id": 114000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 114001,
                "num": 1,
                "name": "Royal Guard Fiora"
            },
            {
                "id": 114002,
                "num": 2,
                "name": "Nightraven Fiora"
            },
            {
                "id": 114003,
                "num": 3,
                "name": "Headmistress Fiora"
            }
        ],
        "key": "Fiora"
    },
    "FiddleSticks": {
        "id": 9,
        "title": "the Harbinger of Doom",
        "name": "Fiddlesticks",
        "skins": [
            {
                "id": 9000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 9001,
                "num": 1,
                "name": "Spectral Fiddlesticks"
            },
            {
                "id": 9002,
                "num": 2,
                "name": "Union Jack Fiddlesticks"
            },
            {
                "id": 9003,
                "num": 3,
                "name": "Bandito Fiddlesticks"
            },
            {
                "id": 9004,
                "num": 4,
                "name": "Pumpkinhead Fiddlesticks"
            },
            {
                "id": 9005,
                "num": 5,
                "name": "Fiddle Me Timbers"
            },
            {
                "id": 9006,
                "num": 6,
                "name": "Surprise Party Fiddlesticks"
            },
            {
                "id": 9007,
                "num": 7,
                "name": "Dark Candy Fiddlesticks"
            }
        ],
        "key": "FiddleSticks"
    },
    "Chogath": {
        "id": 31,
        "title": "the Terror of the Void",
        "name": "Cho'Gath",
        "skins": [
            {
                "id": 31000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 31001,
                "num": 1,
                "name": "Nightmare Cho'Gath"
            },
            {
                "id": 31002,
                "num": 2,
                "name": "Gentleman Cho'Gath"
            },
            {
                "id": 31003,
                "num": 3,
                "name": "Loch Ness Cho'Gath"
            },
            {
                "id": 31004,
                "num": 4,
                "name": "Jurassic Cho'Gath"
            },
            {
                "id": 31005,
                "num": 5,
                "name": "Battlecast Prime Cho'Gath"
            }
        ],
        "key": "Chogath"
    },
    "Rammus": {
        "id": 33,
        "title": "the Armordillo",
        "name": "Rammus",
        "skins": [
            {
                "id": 33000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 33001,
                "num": 1,
                "name": "King Rammus"
            },
            {
                "id": 33002,
                "num": 2,
                "name": "Chrome Rammus"
            },
            {
                "id": 33003,
                "num": 3,
                "name": "Molten Rammus"
            },
            {
                "id": 33004,
                "num": 4,
                "name": "Freljord Rammus"
            },
            {
                "id": 33005,
                "num": 5,
                "name": "Ninja Rammus"
            },
            {
                "id": 33006,
                "num": 6,
                "name": "Full Metal Rammus"
            }
        ],
        "key": "Rammus"
    },
    "Leblanc": {
        "id": 7,
        "title": "the Deceiver",
        "name": "LeBlanc",
        "skins": [
            {
                "id": 7000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 7001,
                "num": 1,
                "name": "Wicked LeBlanc"
            },
            {
                "id": 7002,
                "num": 2,
                "name": "Prestigious LeBlanc"
            },
            {
                "id": 7003,
                "num": 3,
                "name": "Mistletoe LeBlanc"
            },
            {
                "id": 7004,
                "num": 4,
                "name": "Ravenborn LeBlanc"
            }
        ],
        "key": "Leblanc"
    },
    "Soraka": {
        "id": 16,
        "title": "the Starchild",
        "name": "Soraka",
        "skins": [
            {
                "id": 16000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 16001,
                "num": 1,
                "name": "Dryad Soraka"
            },
            {
                "id": 16002,
                "num": 2,
                "name": "Divine Soraka"
            },
            {
                "id": 16003,
                "num": 3,
                "name": "Celestine Soraka"
            },
            {
                "id": 16004,
                "num": 4,
                "name": "Reaper Soraka"
            }
        ],
        "key": "Soraka"
    },
    "Zilean": {
        "id": 26,
        "title": "the Chronokeeper",
        "name": "Zilean",
        "skins": [
            {
                "id": 26000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 26001,
                "num": 1,
                "name": "Old Saint Zilean"
            },
            {
                "id": 26002,
                "num": 2,
                "name": "Groovy Zilean"
            },
            {
                "id": 26003,
                "num": 3,
                "name": "Shurima Desert Zilean"
            },
            {
                "id": 26004,
                "num": 4,
                "name": "Time Machine Zilean"
            }
        ],
        "key": "Zilean"
    },
    "Nocturne": {
        "id": 56,
        "title": "the Eternal Nightmare",
        "name": "Nocturne",
        "skins": [
            {
                "id": 56000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 56001,
                "num": 1,
                "name": "Frozen Terror Nocturne"
            },
            {
                "id": 56002,
                "num": 2,
                "name": "Void Nocturne"
            },
            {
                "id": 56003,
                "num": 3,
                "name": "Ravager Nocturne"
            },
            {
                "id": 56004,
                "num": 4,
                "name": "Haunting Nocturne"
            },
            {
                "id": 56005,
                "num": 5,
                "name": "Eternum Nocturne"
            }
        ],
        "key": "Nocturne"
    },
    "Jinx": {
        "id": 222,
        "title": "the Loose Cannon",
        "name": "Jinx",
        "skins": [
            {
                "id": 222000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 222001,
                "num": 1,
                "name": "Mafia Jinx"
            }
        ],
        "key": "Jinx"
    },
    "Yorick": {
        "id": 83,
        "title": "the Gravedigger",
        "name": "Yorick",
        "skins": [
            {
                "id": 83000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 83001,
                "num": 1,
                "name": "Undertaker Yorick"
            },
            {
                "id": 83002,
                "num": 2,
                "name": "Pentakill Yorick"
            }
        ],
        "key": "Yorick"
    },
    "Urgot": {
        "id": 6,
        "title": "the Headsman's Pride",
        "name": "Urgot",
        "skins": [
            {
                "id": 6000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 6001,
                "num": 1,
                "name": "Giant Enemy Crabgot"
            },
            {
                "id": 6002,
                "num": 2,
                "name": "Butcher Urgot"
            },
            {
                "id": 6003,
                "num": 3,
                "name": "Battlecast Urgot"
            }
        ],
        "key": "Urgot"
    },
    "MissFortune": {
        "id": 21,
        "title": "the Bounty Hunter",
        "name": "Miss Fortune",
        "skins": [
            {
                "id": 21000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 21001,
                "num": 1,
                "name": "Cowgirl Miss Fortune"
            },
            {
                "id": 21002,
                "num": 2,
                "name": "Waterloo Miss Fortune"
            },
            {
                "id": 21003,
                "num": 3,
                "name": "Secret Agent Miss Fortune"
            },
            {
                "id": 21004,
                "num": 4,
                "name": "Candy Cane Miss Fortune"
            },
            {
                "id": 21005,
                "num": 5,
                "name": "Road Warrior Miss Fortune"
            },
            {
                "id": 21006,
                "num": 6,
                "name": "Mafia Miss Fortune"
            },
            {
                "id": 21007,
                "num": 7,
                "name": "Arcade Miss Fortune"
            }
        ],
        "key": "MissFortune"
    },
    "MonkeyKing": {
        "id": 62,
        "title": "the Monkey King",
        "name": "Wukong",
        "skins": [
            {
                "id": 62000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 62001,
                "num": 1,
                "name": "Volcanic Wukong"
            },
            {
                "id": 62002,
                "num": 2,
                "name": "General Wukong"
            },
            {
                "id": 62003,
                "num": 3,
                "name": "Jade Dragon Wukong"
            },
            {
                "id": 62004,
                "num": 4,
                "name": "Underworld Wukong"
            }
        ],
        "key": "MonkeyKing"
    },
    "Blitzcrank": {
        "id": 53,
        "title": "the Great Steam Golem",
        "name": "Blitzcrank",
        "skins": [
            {
                "id": 53000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 53001,
                "num": 1,
                "name": "Rusty Blitzcrank"
            },
            {
                "id": 53002,
                "num": 2,
                "name": "Goalkeeper Blitzcrank"
            },
            {
                "id": 53003,
                "num": 3,
                "name": "Boom Boom Blitzcrank"
            },
            {
                "id": 53004,
                "num": 4,
                "name": "Piltover Customs Blitzcrank"
            },
            {
                "id": 53005,
                "num": 5,
                "name": "Definitely Not Blitzcrank"
            },
            {
                "id": 53006,
                "num": 6,
                "name": "iBlitzcrank"
            },
            {
                "id": 53007,
                "num": 7,
                "name": "Riot Blitzcrank"
            }
        ],
        "key": "Blitzcrank"
    },
    "Shen": {
        "id": 98,
        "title": "Eye of Twilight",
        "name": "Shen",
        "skins": [
            {
                "id": 98000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 98001,
                "num": 1,
                "name": "Frozen Shen"
            },
            {
                "id": 98002,
                "num": 2,
                "name": "Yellow Jacket Shen"
            },
            {
                "id": 98003,
                "num": 3,
                "name": "Surgeon Shen"
            },
            {
                "id": 98004,
                "num": 4,
                "name": "Blood Moon Shen"
            },
            {
                "id": 98005,
                "num": 5,
                "name": "Warlord Shen"
            },
            {
                "id": 98006,
                "num": 6,
                "name": "TPA Shen"
            }
        ],
        "key": "Shen"
    },
    "Braum": {
        "id": 201,
        "title": "the Heart of the Freljord",
        "name": "Braum",
        "skins": [
            {
                "id": 201000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 201001,
                "num": 1,
                "name": "Dragonslayer Braum"
            }
        ],
        "key": "Braum"
    },
    "XinZhao": {
        "id": 5,
        "title": "the Seneschal of Demacia",
        "name": "Xin Zhao",
        "skins": [
            {
                "id": 5000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 5001,
                "num": 1,
                "name": "Commando Xin Zhao"
            },
            {
                "id": 5002,
                "num": 2,
                "name": "Imperial Xin Zhao"
            },
            {
                "id": 5003,
                "num": 3,
                "name": "Viscero Xin Zhao"
            },
            {
                "id": 5004,
                "num": 4,
                "name": "Winged Hussar Xin Zhao"
            },
            {
                "id": 5005,
                "num": 5,
                "name": "Warring Kingdoms Xin Zhao"
            }
        ],
        "key": "XinZhao"
    },
    "Twitch": {
        "id": 29,
        "title": "the Plague Rat",
        "name": "Twitch",
        "skins": [
            {
                "id": 29000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 29001,
                "num": 1,
                "name": "Kingpin Twitch"
            },
            {
                "id": 29002,
                "num": 2,
                "name": "Whistler Village Twitch"
            },
            {
                "id": 29003,
                "num": 3,
                "name": "Medieval Twitch"
            },
            {
                "id": 29004,
                "num": 4,
                "name": "Gangster Twitch"
            },
            {
                "id": 29005,
                "num": 5,
                "name": "Vandal Twitch"
            }
        ],
        "key": "Twitch"
    },
    "MasterYi": {
        "id": 11,
        "title": "the Wuju Bladesman",
        "name": "Master Yi",
        "skins": [
            {
                "id": 11000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 11001,
                "num": 1,
                "name": "Assassin Master Yi"
            },
            {
                "id": 11002,
                "num": 2,
                "name": "Chosen Master Yi"
            },
            {
                "id": 11003,
                "num": 3,
                "name": "Ionia Master Yi"
            },
            {
                "id": 11004,
                "num": 4,
                "name": "Samurai Yi"
            },
            {
                "id": 11005,
                "num": 5,
                "name": "Headhunter Master Yi"
            }
        ],
        "key": "MasterYi"
    },
    "Taric": {
        "id": 44,
        "title": "the Gem Knight",
        "name": "Taric",
        "skins": [
            {
                "id": 44000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 44001,
                "num": 1,
                "name": "Emerald Taric"
            },
            {
                "id": 44002,
                "num": 2,
                "name": "Armor of the Fifth Age Taric"
            },
            {
                "id": 44003,
                "num": 3,
                "name": "Bloodstone Taric"
            }
        ],
        "key": "Taric"
    },
    "Amumu": {
        "id": 32,
        "title": "the Sad Mummy",
        "name": "Amumu",
        "skins": [
            {
                "id": 32000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 32001,
                "num": 1,
                "name": "Pharaoh Amumu"
            },
            {
                "id": 32002,
                "num": 2,
                "name": "Vancouver Amumu"
            },
            {
                "id": 32003,
                "num": 3,
                "name": "Emumu"
            },
            {
                "id": 32004,
                "num": 4,
                "name": "Re-Gifted Amumu"
            },
            {
                "id": 32005,
                "num": 5,
                "name": "Almost-Prom King Amumu"
            },
            {
                "id": 32006,
                "num": 6,
                "name": "Little Knight Amumu"
            },
            {
                "id": 32007,
                "num": 7,
                "name": "Sad Robot Amumu"
            }
        ],
        "key": "Amumu"
    },
    "Gangplank": {
        "id": 41,
        "title": "the Saltwater Scourge",
        "name": "Gangplank",
        "skins": [
            {
                "id": 41000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 41001,
                "num": 1,
                "name": "Spooky Gangplank"
            },
            {
                "id": 41002,
                "num": 2,
                "name": "Minuteman Gangplank"
            },
            {
                "id": 41003,
                "num": 3,
                "name": "Sailor Gangplank"
            },
            {
                "id": 41004,
                "num": 4,
                "name": "Toy Soldier Gangplank"
            },
            {
                "id": 41005,
                "num": 5,
                "name": "Special Forces Gangplank"
            },
            {
                "id": 41006,
                "num": 6,
                "name": "Sultan Gangplank"
            }
        ],
        "key": "Gangplank"
    },
    "Trundle": {
        "id": 48,
        "title": "the Troll King",
        "name": "Trundle",
        "skins": [
            {
                "id": 48000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 48001,
                "num": 1,
                "name": "Lil' Slugger Trundle"
            },
            {
                "id": 48002,
                "num": 2,
                "name": "Junkyard Trundle"
            },
            {
                "id": 48003,
                "num": 3,
                "name": "Traditional Trundle"
            }
        ],
        "key": "Trundle"
    },
    "Kassadin": {
        "id": 38,
        "title": "the Void Walker",
        "name": "Kassadin",
        "skins": [
            {
                "id": 38000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 38001,
                "num": 1,
                "name": "Festival Kassadin"
            },
            {
                "id": 38002,
                "num": 2,
                "name": "Deep One Kassadin"
            },
            {
                "id": 38003,
                "num": 3,
                "name": "Pre-Void Kassadin"
            },
            {
                "id": 38004,
                "num": 4,
                "name": "Harbinger Kassadin"
            }
        ],
        "key": "Kassadin"
    },
    "Velkoz": {
        "id": 161,
        "title": "the Eye of the Void",
        "name": "Vel'Koz",
        "skins": [
            {
                "id": 161000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 161001,
                "num": 1,
                "name": "Battlecast Vel'Koz"
            }
        ],
        "key": "Velkoz"
    },
    "Zyra": {
        "id": 143,
        "title": "Rise of the Thorns",
        "name": "Zyra",
        "skins": [
            {
                "id": 143000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 143001,
                "num": 1,
                "name": "Wildfire Zyra"
            },
            {
                "id": 143002,
                "num": 2,
                "name": "Haunted Zyra"
            },
            {
                "id": 143003,
                "num": 3,
                "name": "SKT T1 Zyra"
            }
        ],
        "key": "Zyra"
    },
    "Nami": {
        "id": 267,
        "title": "the Tidecaller",
        "name": "Nami",
        "skins": [
            {
                "id": 267000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 267001,
                "num": 1,
                "name": "Koi Nami"
            },
            {
                "id": 267002,
                "num": 2,
                "name": "River Spirit Nami"
            }
        ],
        "key": "Nami"
    },
    "JarvanIV": {
        "id": 59,
        "title": "the Exemplar of Demacia",
        "name": "Jarvan IV",
        "skins": [
            {
                "id": 59000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 59001,
                "num": 1,
                "name": "Commando Jarvan IV"
            },
            {
                "id": 59002,
                "num": 2,
                "name": "Dragonslayer Jarvan IV"
            },
            {
                "id": 59003,
                "num": 3,
                "name": "Darkforge Jarvan IV"
            },
            {
                "id": 59004,
                "num": 4,
                "name": "Victorious Jarvan IV"
            },
            {
                "id": 59005,
                "num": 5,
                "name": "Warring Kingdoms Jarvan IV"
            },
            {
                "id": 59006,
                "num": 6,
                "name": "Fnatic Jarvan IV"
            }
        ],
        "key": "JarvanIV"
    },
    "Ezreal": {
        "id": 81,
        "title": "the Prodigal Explorer",
        "name": "Ezreal",
        "skins": [
            {
                "id": 81000,
                "num": 0,
                "name": "default"
            },
            {
                "id": 81001,
                "num": 1,
                "name": "Nottingham Ezreal"
            },
            {
                "id": 81002,
                "num": 2,
                "name": "Striker Ezreal"
            },
            {
                "id": 81003,
                "num": 3,
                "name": "Frosted Ezreal"
            },
            {
                "id": 81004,
                "num": 4,
                "name": "Explorer Ezreal"
            },
            {
                "id": 81005,
                "num": 5,
                "name": "Pulsefire Ezreal"
            },
            {
                "id": 81006,
                "num": 6,
                "name": "TPA Ezreal"
            },
            {
                "id": 81007,
                "num": 7,
                "name": "Debonair Ezreal"
            }
        ],
        "key": "Ezreal"
    }
}