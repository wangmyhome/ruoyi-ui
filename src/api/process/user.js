import request from '@/utils/request'

// 获取所有表数据(不分页)
export function all() {
    return request({
        url: '/process/user/all',
        method: 'get'
    })
}

// 查询表数据
export function listTable(query) {
    return request({
        url: '/process/user/list',
        method: 'post',
        params: query
    })
}

// 添加表数据
export function add(data) {
    return request({
        url: 'process/user/add',
        method: 'post',
        data: data
    })
}

// 修改表数据
export function editTable(id) {
    return request({
        url: `/process/user/edit/${id}`,
        method: 'get'
    })
}

// 更新表数据
export function update(data) {
    return request({
        url: 'process/user/edit',
        method: 'post',
        data: data
    })
}

// 删除表数据
export function delTable(tableIds) {
    return request({
        url: '/process/user/remove',
        method: 'post',
        params: { ids: tableIds }
    })
}

// 导出表数据
export function exportTable() {
    return request({
        url: '/process/user/export',
        method: 'post'
    })
}

// 查询未加入的用户列表
export function systemUserList(query) {
    return request({
        url: '/process/user/systemUserList',
        method: 'post',
        params: query
    })
}