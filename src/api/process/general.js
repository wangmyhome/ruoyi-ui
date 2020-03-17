import request from '@/utils/request'

export function getHistory(query) {
    return request({
        url: '/process/general/listHistory',
        method: 'post',
        params: query
    })
}