/**
 * 金额千分位转换，适用超长金额，避免js精度问题
 * @param {string} value  字符串金额
 * @param {number} decimalPlaces  小数位，小数位不足时补0，默认保留两位：2
 * 
 * mofify 1: 解决转换千分位时，字符串金额整数部分与元数据整数部分不一致问题。
 *           原因：进行最后一次字符串切分时，计算保留的算法出错，导致截取失败，当字符串金额位数恰好未3的倍数时，无此问题。
 *           解决方案：修改算法，最后一次截取时，先算出整数部分与3倍数的的差值。
 *                    如：字符串长度为：7，截取2次后，字符串长度剩余：1。
 *                    转换算法：7 - （ 2 * 千分位长度） = 最后剩余的字符长度
 * mofify 2: 解决小数位进位导致，转换后的字符串金额与实际金额不符问题。
 *           原因：当小数位满足向个位进位时导致。
 *           解决方案：当小数位满足进位条件后，
 *                   先判断整数部分是否全部时9，如果整数部分全是9时，整数部分直接改为10000...。如：99.99进位后值为：100.00
 *                   当整数部分不全部为9时，先找到最后一个不为9的数字，进行进位处理。如：99899.99进位的值：99900.00
 *                     
 */

function format(value, decimalPlaces) {
    if (decimalPlaces === undefined || decimalPlaces === null || decimalPlaces === '') {
        decimalPlaces = 2;
    }
    var symbol = '';
    var isCarrt = false;
    var firstChar = value.substr(0, 1);
    if (!(/\d/.test(firstChar))) {
        value = value.substr(1, value.length - 1);
        symbol = firstChar;
    }

    if (value.indexOf('.') >= 0) {
        var _arr = value.split('.')
        var integer = _arr[0];
        var decimal = _arr[1];

        //小数位处理
        if (decimalPlaces > 0) {
            if (decimal.length > decimalPlaces) {
                var decimalNext = decimal.substr(decimalPlaces, 1);
                if (decimalNext >= 5) {
                    var realValue = decimal.substr(0, decimalPlaces);
                    decimal = (Number(realValue) + 1).toString();
                    if (decimal.length > decimalPlaces) {
                        isCarrt = true;
                        decimal = decimal.substr(1, decimalPlaces);

                    }
                } else {
                    decimal = decimal.substr(0, decimalPlaces);
                }
            }
            if (decimal.length < decimalPlaces) {
                var decimalDiff = decimalPlaces - decimal.length;
                for (var i = 0; i < decimalDiff; i++) {
                    decimal += '0';
                }
            }
        }
        //整数位处理
        integer = integerHandle(integer, isCarrt);

        if (decimalPlaces == 0) {
            return Number(integer) > 0 ? symbol + integer : integer;
        } else {
            return symbol + integer + '.' + decimal;
        }
    } else {
        return integerHandle(value);
    }
}

function integerHandle(integer, isCarrt) {
    var realValue = '';
    // 判断是否需要进位
    if (isCarrt) {
        // 判断是否整数位是否全部是9 
        if (/[0-8]+/.test(integer)) {
            var i = 0;
            for (let index = (integer.length - 1); index >= 0; index--) {
                if (integer[index] != 9) {
                    i = index;
                    break;
                }
            }
            // 取出需要进位的数字
            var char = integer.substr(i);
            var beforeChar = integer.substr(0, i);
            integer = beforeChar + (Number(char) + 1);
        } else {
            var rValue = '1';
            for (let index = 0; index < integer.length; index++) {
                rValue += '0';
            }
            integer = rValue;
        }
    }

    if (Number(integer) > 0) {
        var subNum = Math.ceil(integer.length / 3);
        for (var i = 1; i <= subNum; i++) {
            var subChars = '';
            if (i < subNum) {
                subChars = integer.substr(Number('-' + (i * 3)), 3);
            } else {
                if ((i * 3) == integer.length) {
                    subChars = integer.substr(Number('-' + (i * 3)), 3);
                } else {
                    var subDiff = integer.length - ((i - 1) * 3);
                    subChars = integer.substr(Number('-' + (i * 3)), subDiff);
                }
            }
            realValue = ',' + subChars + realValue;
        }
        realValue = realValue.substr(1, realValue.length - 1);
    } else {
        realValue = '0';
    }
    return realValue;
}

var a = format('8495779404.030');//format('11234567890123456789.874', 9);
//var a = format('219661430.996');//format('11234567890123456789.874', 9);
//var a = format('998.996');//format('11234567890123456789.874', 9);
console.log(a);


