import request from '@/utils/request'

// 查询表数据
export function listTable(query) {
    return request({
        url: '/process/group/list',
        method: 'post',
        params: query
    })
}

// 添加表数据
export function add(data) {
    return request({
        url: 'process/group/add',
        method: 'post',
        data: data
    })
}

// 修改表数据
export function editTable(id) {
    return request({
        url: `/process/group/edit/${id}`,
        method: 'get'
    })
}

// 更新表数据
export function update(data) {
    return request({
        url: 'process/group/edit',
        method: 'post',
        data: data
    })
}

// 删除表数据
export function delTable(tableIds) {
    return request({
        url: '/process/group/remove',
        method: 'post',
        params: { ids: tableIds }
    })
}

// 导出表数据
export function exportTable() {
    return request({
        url: '/process/group/export',
        method: 'post'
    })
}

// 获取所有表数据(不分页)
export function all() {
    return request({
        url: '/process/group/all',
        method: 'get'
    })
}