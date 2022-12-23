/*
       Function to randomly give one of the following and return what was opened by the user
           - Coins
               - Random value from 10-50
           - Player Cards
               - Select from the list and give 10-50 of the selected one
                   - no_of_cards_calixta
                   - no_of_cards_rage
                   - no_of_cards_q2
                   - no_of_cards_looper
                   - no_of_cards_death
                   - no_of_cards_respirator
                   - no_of_cards_stanz
           - Gem
               - Random value from 1 - 3
           - Avatar
               - select one from list of locked artifacts
           - Banner
               - select one from list of locked artifacts
           - Frame
               - select one from list of locked artifacts
       @returns
           {type:string, count/index of artifact:number}
*/
let artifacts: { 'Avatar': [], 'Banner': [], 'Frame': [] } | { [key: string]: any; };
let avatars: number[], borders: number[], banners: number[];


/**
 * Get Artifact info of user from Nakama Database
 * @param  {nkruntime.Context}  ctx the context info for the user
 * @param  {nkruntime.Nakama}   nk  API to access nakama's functions
 * @return {boolean}                returns if the data has been accessed
 */
const getArtifacts = (ctx: nkruntime.Context, nk: nkruntime.Nakama) => {
    let userId = ctx.userId;

    let objectIds: nkruntime.StorageReadRequest[] = [
        { collection: 'inventory', key: 'playerArtifacts', userId },
    ];

    let results: nkruntime.StorageObject[] = [];

    try {
        results = nk.storageRead(objectIds);

        artifacts = results[0].value;

        artifacts['Avatar'].forEach((i: [{
            "gems": number,
            "imageId": string,
            "imageName": string,
            "isUnlocked": boolean
        }]) => {
            i.forEach((j, index) => {
                if (!j.isUnlocked)
                    avatars.push(index);
            })
        });

        artifacts['Banner'].forEach((i: [{
            "gems": number,
            "imageId": string,
            "imageName": string,
            "isUnlocked": boolean
        }]) => {
            i.forEach((j, index) => {
                if (!j.isUnlocked)
                    avatars.push(index);
            })
        });

        artifacts['Frame'].forEach((i: [{
            "gems": number,
            "imageId": string,
            "imageName": string,
            "isUnlocked": boolean
        }]) => {
            i.forEach((j, index) => {
                if (!j.isUnlocked)
                    borders.push(index);
            })
        });
    } catch (error) {
        return JSON.stringify(error);
    }
    return true;
}

function setArtifacts(userId: string, nk: nkruntime.Nakama) {

    let newObjects: nkruntime.StorageWriteRequest[] = [
        { collection: 'inventory', key: 'playerArtifacts', userId, value: artifacts }
    ];

    try {
        nk.storageWrite(newObjects);
    }
    catch(error) {
        return error;
    }
}


/**
 * Choose a random item from items weighted using weights and return the item 
 * @param  {Array<number>}  items   the data from which items should be selected 
 * @param  {Array<number>}  weights to access nakama's functions
 * @return {object}                 returns the item at index choosen randomly
 */
const weighted_random = (items: Array<number>, weights: Array<number>) => {
    let i: number;

    let rand = Math.random() * weights[weights.length - 1]

    for (i = 0; i < weights.length; i++)
        if (weights[i] > rand)
            break;
    return items[i];
};


/**
 * Unlocks a certain amount coins  
 * @param  {nkruntime.Contxt}  ctx   the data from which items should be selected 
 * @param  {nkruntime.Nakama}   nk    to access nakama's functions
 * @return {object}                   returns the unlocked coin amount
 */
function coins(ctx: nkruntime.Context, nk: nkruntime.Nakama) {
    const coinValues: number[] = [10, 15, 20, 25, 30, 35, 40, 45, 50];
    const weight: number[] = [10, 15, 20, 25, 30, 35, 40, 45, 50]

    for (let i = 0; i < weight.length; i++) {
        weight[i] = Math.floor(200 / weight[i]);
        weight[i] += weight[i - 1] || 0;
    }

    // checkCycles(coinValues, weight);

    const unlockedCoins = weighted_random(coinValues, weight);

    return { 'unlockedItem': 'coin', 'count': unlockedCoins };
}

/**
 * Unlocks a certain amount gems  
 * @param  {nkruntime.Contxt}  ctx   the data from which items should be selected 
 * @param  {nkruntime.Nakama}   nk    to access nakama's functions
 * @return {object}                   returns the unlocked gem amount
 */
function gems(ctx: nkruntime.Context, nk: nkruntime.Nakama) {
    const gemsValue: number[] = [1, 2, 3];
    const weight: number[] = [1, 2, 3]

    for (let i = 0; i < weight.length; i++) {
        weight[i] = Math.floor(200 / weight[i]);
        weight[i] += weight[i - 1] || 0;
    }

    const unlockedGems = weighted_random(gemsValue, weight);

    return { 'unlockedItem': 'gem', 'count': unlockedGems };
}
/**
 * Unlocks a certain amount cards of a specific character  
 * @param  {nkruntime.Contxt}  ctx   the data from which items should be selected 
 * @param  {nkruntime.Nakama}   nk    to access nakama's functions
 * @return {object}                   returns the unlocked cards amount along with the character
 */
function cards(ctx: nkruntime.Context, nk: nkruntime.Nakama) {
    const cardValues: number[] = [10, 15, 20, 25, 30, 35, 40, 45, 50];
    const weight: number[] = [10, 15, 20, 25, 30, 35, 40, 45, 50]
    const characters: string[] = [
        "no_of_cards_calixta",
        "no_of_cards_rage",
        "no_of_cards_q2",
        "no_of_cards_looper",
        "no_of_cards_death",
        "no_of_cards_respirator",
        "no_of_cards_stanz"
    ];

    let character: string = characters[Math.floor(Math.random() * characters.length)];
    console.log(character);

    // checkCycles(cardValues, weight);
    return { 'unlockedItem': `'${character}'`, 'count': weighted_random(cardValues, weight) };
}
/**
 * Unlocks an avatar from the unlockable list
 * @param  {nkruntime.Contxt}  ctx   the data from which items should be selected 
 * @param  {nkruntime.Nakama}   nk    to access nakama's functions
 * @return {object}                   returns the unlocked avatar index
 */
function avatar(ctx: nkruntime.Context, nk: nkruntime.Nakama) {

    let unlockedAvatar = avatars[Math.floor(Math.random() * avatars.length)]

    artifacts['Banner'][unlockedAvatar].unlocked = true;

    setArtifacts(ctx.userId, nk);

    return { 'unlockedItem': 'avatar', 'count': unlockedAvatar };
}
/**
 * Unlocks an banner from the unlockable list
 * @param  {nkruntime.Contxt}  ctx   the data from which items should be selected 
 * @param  {nkruntime.Nakama}   nk    to access nakama's functions
 * @return {object}                   returns the unlocked banner index
 */
function banner(ctx: nkruntime.Context, nk: nkruntime.Nakama) {

    let unlockedBanner = banners[Math.floor(Math.random() * banners.length)];

    artifacts['Banner'][unlockedBanner].unlocked = true;

    setArtifacts(ctx.userId, nk);

    return { 'unlockedItem': 'banner', 'count': unlockedBanner };
}
/**
 * Unlocks an frame from the unlockable list
 * @param  {nkruntime.Contxt}  ctx   the data from which items should be selected 
 * @param  {nkruntime.Nakama}   nk    to access nakama's functions
 * @return {object}                   returns the unlocked frame index
 */
function border(ctx: nkruntime.Context, nk: nkruntime.Nakama) {

    let unlockedBorder = borders[Math.floor(Math.random() * borders.length)];

    artifacts['Banner'][unlockedBorder].unlocked = true;

    setArtifacts(ctx.userId, nk);

    return { 'unlockedItem': 'border', 'count': unlockedBorder };
}
/**
 * Unlocks an avatar from the unlockable list
 * @param  {nkruntime.Contxt}  ctx   the data from which items should be selected 
 * @param  {nkruntime.Nakama}  nk    to access nakama's functions
 * @param  {nkruntime.Logger}  logger   used to log data to console
 * @return {string}                   returns the unlocked object
 */
const unlockDeitiesPack: nkruntime.RpcFunction = (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
) => {

    let artifactResults = getArtifacts(ctx, nk)
    if (!artifactResults) {
        return JSON.stringify(artifactResults);
    }

    const funcs: Function[] = [gems, coins, cards, avatar, border, banner];
    let rand: Function = funcs[Math.floor(Math.random() * funcs.length)];

    let unlocked = rand(ctx, nk);
    logger.info(unlocked);

    return JSON.stringify(unlocked);
}
Footer
