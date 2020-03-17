import request from '@/utils/request'

// 查询采购合同列表
export function listContract(query) {
  debugger
  return request({
    url: '/process/contract/list',
    method: 'get',
    params: query
  })
}
//查看单个
export function editLeave(id) {
  return request({
    url: `/process/contract/edit/${id}`,
    method: 'get',
  })
}
// 查询采购合同详细
export function getContract(id) {
  return request({
    url: '/process/contract/' + id,
    method: 'get'
  })
}
//提交申请
export function submitApply(id) {
  return request({
    url: `/process/contract/submitApply`,
    method: 'post',
    params: { id }
  })
}
// 新增采购合同
export function addContract(data) {
  return request({
    url: '/process/contract',
    method: 'post',
    data: data
  })
}

// 修改采购合同
export function updateContract(id) {
  return request({
    url: '/process/contract'+ id,
    method: 'put',
  })
}

// 删除采购合同
export function delContract(id) {
  return request({
    url: '/process/contract/' + id,
    method: 'delete'
  })
}

// 导出采购合同
export function exportContract(query) {
  return request({
    url: '/process/contract/export',
    method: 'get',
    params: query
  })
}

//代办列表
export function taskList(query) {
  return request({
    url: `/process/contract/taskList`,
    method: 'post',
    params: query
  })
}

//弹出审批页面
export function verifyInfo(taskId) {
  return request({
    url: `/process/contract/verifyInfo/${taskId}`,
    method: 'get',
  })
}

//完成审批
export function complete(taskId, data) {
  return request({
    url: `/process/contract/complete/${taskId}`,
    method: 'post',
    params: data
  })
}

