function MarketPage(appLogic)   {
    this.appLogic = appLogic;

    this.mainDiv = CreateElement({type: 'div', class: 'Login_MainDiv container center-align', elements: [
        CreateElement({type: 'div', text: '', class: 'MainPage_ChampionDiv right-align', elements: [
            CreateElement({type: 'button', text: 'Login', class: 'btn col s3'})
        
        ]}),
        CreateElement({id:"recentlyAdded", type: 'div', text: 'Recently added', class: 'MainPage_ChampionDiv', elements: [

        ]})
    ]});
}

MarketPage.prototype.getDiv = function () {
    return this.mainDiv;
};