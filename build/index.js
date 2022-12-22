"use strict";
var InitModule = function (ctx, logger, nk, initializer) {
    initializer.registerMatchmakerMatched(matchmakerMatched);
    initializer.registerRpc("getServerIp", getServerIp); // getting server ip
    initializer.registerAfterAuthenticateEmail(afterCreate); //For the Player wallet initilization
    initializer.registerRpc("updateWallet", updateWallet); //For the Player wallet update
    //initializer.registerRpc("updateplayerdata",updateplayerdata); //For the player Data Gameover
    logger.info("Custom RPC Registered");
};
//Update Player Wallet as Custom registerRpc
var updateWallet = function (ctx, logger, nk, payload // {\"artifact\": \"playerBanner\", \"index\": 3, \"coinsToRemove\" : 10}","rpc_id":"updatewallet"}
) {
    var user_id = ctx.userId; // Unique ID of the user
    var parsedPayload = JSON.parse(payload); // Parsing the payload sent from the user
    var artifact = parsedPayload["artifact"]; // the name of the artifact to be unlocked
    var index = parsedPayload["index"]; // the index inside the artifact that has been unlocked
    var status = { status: true, coinChange: 0 };
    var objectIds = [
        {
            collection: "inventory",
            key: "playerArtifacts",
            userId: user_id,
        },
    ];
    var results = [];
    results = nk.storageRead(objectIds);
    results.forEach(function (o) {
        var storageArtifact = o.value;
        var coinChange = -storageArtifact[artifact][index]["coins"];
        status.coinChange = coinChange;
        var changeset = { coins: coinChange };
        var metadata = {
            Unlock_Item: String(artifact) + " at index: " + String(index),
        }; // logging what the player unlocked
        var result;
        result = nk.walletUpdate(user_id, changeset, metadata, true); //update the wallet
        storageArtifact[artifact][index]["isUnlocked"] = true; // set the artifact as unlocked
        var newStorageArtifact = [
            {
                // new object to update the player's artifact
                collection: "inventory",
                key: "playerArtifacts",
                userId: user_id,
                value: storageArtifact,
            },
        ];
        nk.storageWrite(newStorageArtifact); // update storage to set new updated index values
    });
    return JSON.stringify(status);
};
/*
//Update Player Data at Gameover as registerRpc
let updateplayerdata: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string // { PLayer stats - player stats Attribute : Value to update}","rpc_id":"updateplayerdata" }
)=> {
  let user_id = ctx.userId;

  let parsedPayload: { playerstat: string; value: number } = JSON.parse(payload); // Parsing the payload sent from the user
  let playerstat: string = parsedPayload["playerstat"]; // Player stats Attribute to be update
  let value: number = parsedPayload["value"]; // the value to update

  let status = { status: true, valueChange: 0 };

   let objectIds: nkruntime.StorageReadRequest[] = [
    {
      collection: "statistics",
      key: "playerStats",
      userId: user_id,
    },
  ];
  let results: nkruntime.StorageObject[] = [];
  results = nk.storageRead(objectIds);
  results.forEach((o) => {
    let storagestats = o.value;

    let valueChange = -storagePlayerstats[playerstat][value]["value"];
    status.valueChange = valueChange;
    let changeset = { value: valueChange };
    let metadata = {
      Update_player_attribute: String(playerstat) + "  " + String(value),
    }; // logging

    // set the artifact as unlocked
    let newStorageArtifact: nkruntime.StorageWriteRequest[] = [
      {
        // new object to update the players Attribute
        collection: "statistics",
        key: "playerStats",
        userId: user_id,
        value: playerStatsInventory,
      },
    ];
    nk.storageWrite(newStorageArtifact); // update storage to set new update values
  });
  return JSON.stringify(status);
};

*/
var matchmakerMatched = function (ctx, logger, nk, matchedUsers) {
    logger.info('Matchmaking succesful');
    logger.info("Matched players ".concat(matchedUsers[0].presence.username, " & ").concat(matchedUsers[1].presence.username));
    return nk.matchCreate('getServerIp');
};
var getServerIp = function (ctx, logger, nk) { return JSON.stringify({ ip: "127.0.0.1" }); };
//call at Authentications e-mail success
var afterCreate = function (ctx, logger, nk, data, req) {
    if (data.created) {
        var user_id = ctx.userId;
        logger.info("Player wallet Initilization");
        //Player wallet
        var changeset = {
            coins: 10,
            gems: 10,
            no_of_cards_rage: 5,
            no_of_cards_death: 3,
            no_of_cards_calixta: 10,
            no_of_cards_q2: 4,
            no_of_cards_looper: 2,
            no_of_cards_stanely: 6,
            no_of_cards_kiddu: 9,
            no_of_cards_respirator: 11,
        };
        var metadata = {
            gameResult: "Initilization",
        };
        try {
            var result = nk.walletUpdate(user_id, changeset, metadata, false);
        }
        catch (error) {
            logger.info("error");
        }
        //Player Artifacts
        logger.info("Player Artifacts Initilization");
        var artifactsInventory = '{"playerAvatar":[{"coins":1,"imageId":"avatar1","imageName":"imageName1","isUnlocked":false},{"coins":1,"imageId":"avatar2","imageName":"imageName2","isUnlocked":false},{"coins":1,"imageId":"avatar3","imageName":"imageName3","isUnlocked":false},{"coins":1,"imageId":"avatar4","imageName":"imageName4","isUnlocked":false},{"coins":1,"imageId":"avatar5","imageName":"imageName5","isUnlocked":false},{"coins":1,"imageId":"avatar6","imageName":"imageName6","isUnlocked":false},{"coins":1,"imageId":"avatar7","imageName":"imageName7","isUnlocked":false}],"playerBanner":[{"coins":1,"imageId":"banner1","imageName":"imageName1","isUnlocked":false},{"coins":1,"imageId":"banner2","imageName":"imageName2","isUnlocked":false},{"coins":1,"imageId":"banner3","imageName":"imageName3","isUnlocked":false},{"coins":1,"imageId":"banner4","imageName":"imageName4","isUnlocked":false},{"coins":1,"imageId":"banner5","imageName":"imageName5","isUnlocked":false},{"coins":1,"imageId":"banner6","imageName":"imageName6","isUnlocked":false},{"coins":1,"imageId":"Anim_Banner1","imageName":"imageName1","isUnlocked":false},{"coins":1,"imageId":"Anim_Banner2","imageName":"imageName2","isUnlocked":false},{"coins":1,"imageId":"Anim_Banner3","imageName":"imageName3","isUnlocked":false},{"coins":1,"imageId":"Anim_Banner4","imageName":"imageName4","isUnlocked":false},{"coins":1,"imageId":"Anim_Banner5","imageName":"imageName5","isUnlocked":false},{"coins":1,"imageId":"Anim_Banner6","imageName":"imageName6","isUnlocked":false}],"playerFrame":[{"coins":1,"imageId":"frame1","imageName":"imageName1","isUnlocked":false},{"coins":1,"imageId":"frame2","imageName":"imageName2","isUnlocked":false},{"coins":1,"imageId":"frame3","imageName":"imageName3","isUnlocked":false},{"coins":1,"imageId":"frame4","imageName":"imageName4","isUnlocked":false},{"coins":1,"imageId":"frame5","imageName":"imageName5","isUnlocked":false},{"coins":1,"imageId":"frame6","imageName":"imageName1","isUnlocked":false},{"coins":1,"imageId":"frame7","imageName":"imageName2","isUnlocked":false},{"coins":1,"imageId":"frame8","imageName":"imageName3","isUnlocked":false},{"coins":1,"imageId":"Anim_Frame1","imageName":"imageName1","isUnlocked":false},{"coins":1,"imageId":"Anim_Frame2","imageName":"imageName2","isUnlocked":false},{"coins":1,"imageId":"Anim_Frame3","imageName":"imageName3","isUnlocked":false},{"coins":1,"imageId":"Anim_Frame4","imageName":"imageName4","isUnlocked":false},{"coins":1,"imageId":"Anim_Frame5","imageName":"imageName5","isUnlocked":false},{"coins":1,"imageId":"Anim_Frame6","imageName":"imageName6","isUnlocked":false},{"coins":1,"imageId":"Anim_Frame7","imageName":"imageName7","isUnlocked":false}]}';
        var equippedArtifacts = '{"avatar": 0,"banner": 0,"frame": 0}';
        var playerArtifacts = [
            {
                collection: "inventory",
                key: "playerArtifacts",
                userId: user_id,
                value: JSON.parse(artifactsInventory),
            },
            {
                collection: "inventory",
                key: "equippedArtifacts",
                userId: user_id,
                value: JSON.parse(equippedArtifacts),
            },
        ];
        try {
            nk.storageWrite(playerArtifacts);
        }
        catch (error) {
            logger.info("error");
        }
        //Player Stats
        logger.info("Player Stats Initilization");
        var playerStatsInventory = {
            kills: 1,
            death: 1,
            gamemodewins: 1,
            mvp: 1,
            kd: 1.0,
            mostplayedcharacter: 1,
            consecutivewin: 1,
        };
        var playerStats = [
            {
                collection: "statistics",
                key: "playerStats",
                userId: user_id,
                value: playerStatsInventory,
            },
        ];
        try {
            nk.storageWrite(playerStats);
        }
        catch (error) {
            logger.info("error");
        }
    }
    else
        return; // if account is not new return
};
