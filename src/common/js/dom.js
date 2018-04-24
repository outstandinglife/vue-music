/*** 判断元素有没有类名
* @author   lipenghui
* @version  1.1.0
* @params   元素  类名
* @return   布尔值
*/
export function hasClass(el, className){
    let reg = new RegExp('(^|\\s)' + className + '(\\s|$)');
    return reg.test(el.className);
}



/*** 给元素添加类名
* @author   lipenghui
* @version  1.1.0
* @params   元素  类名
* @return   null
*/
export function addClass(el, className){
    if(hasClass(el, className)){
        return;
    }
    // 把元素的类名变成空数组
    let newClass = el.className.split('');
    // 把传入的类名添加到空数组里
    newClass.push(className);
    // 把数组变成字符串，设置到元素上
    el.className = newClass.join(' ');
}



/*** 获取元素属性值
* @author   lipenghui
* @version  1.1.0
* @params   元素  属性名 属性值
* @return   没有传入属性值就返回查到的属性值，如果传入了属性值就返回设置传入的属性值
*/
export function getData(el, name, val){
    const prefix = 'data-';
    name = prefix + name;
    if(val){
        // 有属性值就设置元素的属性值
        return el.setAttribute(name, val);
    } else {
        // 没有就获取元素的属性值
        return el.getAttribute(name);
    }
}


let elementStyle = document.createElement('div').style;
let vendor = (() => {
    let transformNames = {
        webkit: 'webkitTransform',
        Moz: 'MozTransform',
        O: 'OTransform',
        ms: 'msTransform',
        standard: 'transform'
    }
    for(let key in transformNames) {
        if(elementStyle[transformNames[key]] !== undefined) {
            return key;
        }
    }
    return false;
})();



/*** 浏览器能力检测
* @author   lipenghui
* @version  1.1.0
* @params   样式属性名
* @return   返回处理后的样式属性名带私有前缀
*/
export function prefixStyle(style){
    if(vendor === false) {
        return false;
    }
    if(vendor === 'standard') {
        return style;
    }
    return vendor + style.charAt(0).toUpperCase() + style.substr(1);
}