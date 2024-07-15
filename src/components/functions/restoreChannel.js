/**
 * Initializes the client by connecting the user using the provided client and cookies objects.
 *
 * @async
 * @function
 * @param {Object} clientObj - The client object to initialize.
 * @param {Object} cookiesObj - The cookies object containing user information.
 * @returns {Promise<void>} A promise that resolves when the client is successfully initialized.
 * @throws Will throw an error if the client connection fails.
 */
async function initClient(clientObj, cookiesObj) {
    try{
        const storedToken = cookiesObj.get("token");
        await clientObj.connectUser({
            id: cookiesObj.get("userID"),
            name: cookiesObj.get("playerName"),
            playerNumber: cookiesObj.get("playerNumber"),
        }, storedToken);

    }catch(error){
        console.error(error.message)
    }
} 

/**
 * Initializes a channel by either restoring an existing channel or returning null if no channel ID is provided.
 *
 * @async
 * @function
 * @param {Object} clientObj - The client object to initialize the channel with.
 * @param {string|null} channelID - The ID of the channel to restore. If null, no channel will be restored.
 * @returns {Promise<Object|null>} A promise that resolves to the channel object if a channel ID is provided, or null otherwise.
 * @throws Will throw an error if channel restoration fails.
 */
async function initChannel(clientObj, channelID) {
    let channel;

    if(channelID){
        channel = clientObj.channel("messaging", channelID);
        await channel.watch();
    }else{
        channel = null;
    }
    
    return channel;
} 
   
/**
 * Restores a channel by first initializing the client and then initializing the channel.
 *
 * @async
 * @function
 * @param {Object} clientObj - The client object to initialize the channel with.
 * @param {Object} cookiesObj - The cookies object containing user information.
 * @param {string|null} channelID - The ID of the channel to restore. If null, no channel will be restored.
 * @returns {Promise<Object|null>} A promise that resolves to the restored channel object, or null if no channel ID is provided.
 * @throws Will throw an error if the client initialization or channel restoration fails.
 */
export async function restoreChannel(clientObj, cookiesObj, channelID){
    await initClient(clientObj,cookiesObj)
    const channel = await initChannel(clientObj, channelID);
    return channel;
}