/**
 * 通用js方法封装处理
 * Copyright (c) 2019 ruoyi
 */

const baseURL = process.env.VUE_APP_BASE_API

// 日期格式化
export function parseTime(time, pattern) {
    if (arguments.length === 0 || !time) {
        return null
    }
    const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
    let date
    if (typeof time === 'object') {
        date = time
    } else {
        if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
            time = parseInt(time)
        }
        if ((typeof time === 'number') && (time.toString().length === 10)) {
            time = time * 1000
        }
        date = new Date(time)
    }
    const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay()
    }
    const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key]
            // Note: getDay() returns 0 on Sunday
        if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
        if (result.length > 0 && value < 10) {
            value = '0' + value
        }
        return value || 0
    })
    return time_str
}
// 用户状态格式化
export function parseUserStatus(status) {
    if ("0" === status) return "启用";
    if ("1" === status) return "未启用";
    return "未知的参数";
}

// 表单重置
export function resetForm(refName) {
    if (this.$refs[refName]) {
        this.$refs[refName].resetFields();
    }
}

// 添加日期范围
export function addDateRange(params, dateRange) {
    var search = params;
    search.beginTime = "";
    search.endTime = "";
    if (null != dateRange && '' != dateRange) {
        search.beginTime = this.dateRange[0];
        search.endTime = this.dateRange[1];
    }
    return search;
}

// 回显数据字典
export function selectDictLabel(datas, value) {
    var actions = [];
    Object.keys(datas).map((key) => {
        if (datas[key].dictValue == ('' + value)) {
            actions.push(datas[key].dictLabel);
            return false;
        }
    })
    return actions.join('');
}

// 通用下载方法
export function download(fileName) {
    window.location.href = baseURL + "/common/download?fileName=" + encodeURI(fileName) + "&delete=" + true;
}

// 字符串格式化(%s )
export function sprintf(str) {
    var args = arguments,
        flag = true,
        i = 1;
    str = str.replace(/%s/g, function() {
        var arg = args[i++];
        if (typeof arg === 'undefined') {
            flag = false;
            return '';
        }
        return arg;
    });
    return flag ? str : '';
}

// 转换字符串，undefined,null等转化为""
export function praseStrEmpty(str) {
    if (!str || str == "undefined" || str == "null") {
        return "";
    }
    return str;
}

/**
 * 计算出相差天数
 * @param secondSub
 */
export function formatTotalDateSub(secondSub) {
    var days = Math.floor(secondSub / (24 * 3600)); // 计算出小时数
    var leave1 = secondSub % (24 * 3600); // 计算天数后剩余的毫秒数
    var hours = Math.floor(leave1 / 3600); // 计算相差分钟数
    var leave2 = leave1 % (3600); // 计算小时数后剩余的毫秒数
    var minutes = Math.floor(leave2 / 60); // 计算相差秒数
    var leave3 = leave2 % 60; // 计算分钟数后剩余的毫秒数
    var seconds = Math.round(leave3);
    return days + " 天 " + hours + " 时 " + minutes + " 分 " + seconds + ' 秒';
}

/**
 * 计算时间差，单位秒
 * @param startDateStr
 * @param endDateStr
 */
export function calcTotalSecond(startDateStr, endDateStr) {
    var date1 = new Date(startDateStr); // 开始时间
    var date2 = new Date(endDateStr); // 结束时间
    var timeSub = date2.getTime() - date1.getTime(); // 时间差毫秒
    return timeSub / 1000;
}