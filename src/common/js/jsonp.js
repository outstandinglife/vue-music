import originJsonp from 'jsonp';


/*** 请求数据
* @author lipenghui
* @version 1.1.0
* @params 请求地址  请求参数
* @return 请求返回的数据
*/
export default function jsonp(url, data, option){
    url += (url.indexOf('?') < 0 ? '?' : '&') + param(data);
    return new Promise((resolve, reject) => {
        originJsonp(url, option, (err, data) => {
            if(!err){
                resolve(data);
            } else {
                reject(err);
            }
        });
    });
};

/*** url拼接参数
* @author lipenghui
* @version 1.1.0
* @param 要拼接的参数
* @return 拼接好的参数
*/
export function param(data){
    let params = '';
    for(var k in data){
        let value = data[k] !== undefined ? data[k] : '';
        params += '&' + k + '=' + encodeURIComponent(value);
    }
    return params ? params.substring(1) : '';
}