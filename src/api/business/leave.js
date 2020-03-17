import request from '@/utils/request'

export function leaveList(limit, query) {
    return request({
        url: '/process/leave/list',
        method: 'post',
        params: limit,
        data: query
    })
}

export function addLeave(data) {
    return request({
        url: '/process/leave/add',
        method: 'post',
        data: data
    })
}

export function delLeave(id) {
    return request({
        url: '/process/leave/remove',
        method: 'post',
        params: { ids: id }
    })
}

export function editLeave(id) {
    return request({
        url: `/process/leave/edit/${id}`,
        method: 'get',
    })
}

export function updLeave(data) {
    return request({
        url: '/process/leave/edit',
        method: 'post',
        data: data
    })
}

export function submitApply(id) {
    return request({
        url: `/process/leave/submitApply`,
        method: 'post',
        params: { id }
    })
}

export function taskList(query) {
    return request({
        url: `/process/leave/taskList`,
        method: 'post',
        params: query
    })
}

export function verifyInfo(taskId) {
    return request({
        url: `/process/leave/verifyInfo/${taskId}`,
        method: 'get',
    })
}

export function complete(taskId, data) {
    debugger
    console.log(data)
    return request({
        url: `/process/leave/complete/${taskId}`,
        method: 'post',
        params: data
    })
}

export function taskDoneList(query) {
    return request({
        url: `/process/leave/taskDoneList`,
        method: 'post',
        params: query
    })
}
