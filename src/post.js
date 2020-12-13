/**
 * 
 * @param {String} url 
 * @param {JSON} data 
 */

export default async function postData(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'same-origin', // no-cors, *cors, same-origin
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return response;
}