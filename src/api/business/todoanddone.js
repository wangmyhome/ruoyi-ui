import request from '@/utils/request'

// 待办事项
export function list(limit, query) {
    return request({
        url: '/process/todoitem/list',
        method: 'post',
        params: limit,
        data: query
    })
}

//导出待办事项
export function exportTable() {
    return request({
        url: '/process/todoitem/export',
        method: 'post',
    })
}

// 待办事项
export function doneList(limit, query) {
    return request({
        url: '/process/todoitem/doneList',
        method: 'post',
        params: limit,
        data: query
    })
}

//导出待办事项
export function doneExportTable() {
    return request({
        url: '/process/todoitem/doneExport',
        method: 'post',
    })
}