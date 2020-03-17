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
export function updateContract(data) {
  return request({
    url: '/process/contract',
    method: 'put',
    data: data
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
