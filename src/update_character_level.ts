function returnCharacterCards(hero: string): string {
  switch (hero) {
    case "calixta":
      return "no_of_cards_calixta";
    case "death":
      return "no_of_cards_death";
    case "rage":
      return "no_of_cards_rage";
    case "looper":
      return "no_of_cards_looper";
    default:
      return "";
  }
}
let update_characterlevel_wallet: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string // "{\"hero\":\"%s\"}" ,"rpc_id":"update_characterlevel_wallet"}
) => {
  let user_id = ctx.userId; // Unique ID of the user

  let parsedPayload: { hero: string } = JSON.parse(payload);
  let hero: string = parsedPayload["hero"].toLowerCase();

  let current_character_levels;
  let current_character_level;

  let character_level;

  let objectIds: nkruntime.StorageReadRequest[] = [
    {
      collection: "character_inventory",
      key: "current_character_level",
      userId: user_id,
    },
    {
      collection: "character_inventory",
      key: "character_level",
      userId: user_id,
    },
  ];

  let results: nkruntime.StorageObject[] = []; // store result of storage read here

  try {
    // get the results from the storage read
    results = nk.storageRead(objectIds);


    // check the keys to the corresponding result index
    if (results[0].key == "current_character_level") {
      current_character_levels = results[0].value;
      current_character_level  = current_character_levels[hero];

      character_level = results[1].value[hero];
    }else{
      current_character_levels = results[1].value;
      current_character_level  = current_character_levels[hero];

      character_level = results[0].value[hero];
    }

    // assign a var to hold the current character level value.
    let character_level_values: {
      cards: number;
      level: number;
      coins: number;
    } = character_level[current_character_level - 1];

    // create the change set to update the database.
    let changeset = {
      //updating coins and cards.
      coins: -character_level_values.coins, 
      [returnCharacterCards(hero)]: -character_level_values.cards,
    };

    logger.info(JSON.stringify(changeset));

    if (current_character_level == character_level.length) {// check if the current character is at max level.
      return JSON.stringify({ status: "Max" }); 
    } else {
      // if character is not max level then upgrade 
      current_character_levels[hero] += 1;
      let walletUpdate: nkruntime.WalletUpdate[] = [
        {
          userId: user_id,
          changeset: changeset,
        },
      ];

      let characterLevelUpdate: nkruntime.StorageWriteRequest[] = [
        {
          collection: "character_inventory",
          key: "current_character_level",
          userId: user_id,
          value: current_character_levels,
        },
      ];

      let walletUpdateResult: nkruntime.WalletUpdateResult[];
      
      try {
        walletUpdateResult = nk.walletsUpdate(walletUpdate); // update the wallet

        nk.storageWrite(characterLevelUpdate); // write the updated character level data

        logger.info(JSON.stringify({ status: `upgraded ${hero}` }));

        return JSON.stringify({ status: "upgraded" });

      } catch (error: any) {
        let Error  = {
          "message": error.message,
          "code": error.code
        }
        logger.error(JSON.stringify(Error));
        return JSON.stringify(Error)
      }
    }
  } catch (error: any) {
    let Error  = {
      "message": error.message,
      "code": error.code
    }
    logger.error(JSON.stringify(Error));
    return JSON.stringify(Error);
  }
};
