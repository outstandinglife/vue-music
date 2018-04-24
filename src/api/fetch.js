import axios from 'axios';
export default function fetch(url = '') {
    return new Promise((resolve, reject) => {
        axios.get(url)
            .then(response => {
                resolve(response);
            })
            .catch((error) => {
                console.log(error);
                reject(error)
            })
    })
}