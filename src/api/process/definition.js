import request from '@/utils/request'

// 查询生成表数据
export function listTable(query) {
    return request({
        url: '/process/definition/list',
        method: 'post',
        params: query
    })
}

// 部署process
export function upload(data) {
    return request({
        url: '/process/definition/upload',
        method: 'post',
        data: data
    })
}

// 删除表数据
export function delTable(tableIds) {
    return request({
        url: '/process/definition/remove',
        method: 'post',
        params: { ids: tableIds }
    })
}

// 导出表数据
export function exportTable() {
    return request({
        url: '/process/definition/export',
        method: 'post'
    })
}
