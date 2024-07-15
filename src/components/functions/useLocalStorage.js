import { stringify, parse } from 'flatted';

/**
 * Custom hook to manage localStorage operations for a specific key.
 *
 * @returns {Object} An object with methods to interact with localStorage.
 * @returns {function} setItem - Sets a value in localStorage.
 * @returns {function} getItem - Retrieves a value from localStorage.
 * @returns {function} removeItem - Removes an item from localStorage.
 */
export const useLocalStorage = () => {
     /**
     * Sets a value in localStorage for the specified key.
     * @param {string} keyStr - The key for the localStorage item.
     * @param {*} stateValue - The value to store. It will be stringified before saving.
     */
    const setItem = (keyStr, stateValue) => {
        try{
            window.localStorage.setItem(keyStr, stringify(stateValue))  
        }catch(error){
            console.error(error.message)
        }
    };
    /**
     * Retrieves a value from localStorage for the specified key.
     * @param {string} keyStr - The key for the localStorage item.
     * @returns {*} The parsed value from localStorage. Returns undefined if the key does not exist or an error occurs.
     */
    const getItem = (keyStr) => {
        try{
            const item = window.localStorage.getItem(keyStr);
            return item ? parse(item) : null   
                
        }catch(error){
            console.error(error.message)
        }
    };
    /**
     * Removes the item from localStorage for the specified key.
     * @param {string} keyStr - The key for the localStorage item.
     */
    const removeItem = (keyStr) => {
        try{
            window.localStorage.removeItem(keyStr);
        }catch(error){
            console.error(error.message)
        }
    }; 

    const clearLocalStorage = () => {
        try{
            window.localStorage.clear();
        }catch(error){
            console.error(error.message)
        }
    };
    return { setItem, getItem, removeItem, clearLocalStorage };
};