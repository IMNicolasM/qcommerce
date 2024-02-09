import alert from 'modules/qsite/_plugins/alert'
import helper from 'modules/qsite/_plugins/helper'
import axios from 'axios'
import eCommerceService from 'modules/qcommerce/_services/index'
import remember from 'modules/qsite/_plugins/remember'

export const GET_ORDERS_PENDING = ({ commit, state, dispatch }, Vue) => {
  return new Promise(async (resolve, reject) => {
    let params = { refresh: true, params: { filter: { status: 13 } } }
    eCommerceService.crud.index('apiRoutes.qcommerce.orders', params).then(response => {
      commit('SET_ORDERS_PENDING', response.data)
      Vue.$root.$emit('new-order')
      Vue.$root.$emit('orders-updated')
      resolve(true)
    }).catch(error => {
      console.error('[GET ORDERS ACTION]', error)
      reject(error)
    })
  })
}
