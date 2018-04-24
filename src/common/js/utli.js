function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/*** 对数组进行随机排序
* @author   lipenghui
* @version  1.1.0
* @params   数组
* @return   返回处理后数组
*/
export function shuffle(arr){
    let _arr = arr.slice();
    for(let i = 0; i < _arr.length ; i++){
        let j = getRandomInt(0, i);
        let t = _arr[i];
        _arr[i] = _arr[j];
        _arr[j] = t;
    }
    return _arr;
}



/*** 函数延时操作，节流
* @author   lipenghui
* @version  1.1.0
* @params   function time
* @return   function
*/
export function debounce(func, delay){
    let timer;
    return function(...args) {
        if(timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    }
}