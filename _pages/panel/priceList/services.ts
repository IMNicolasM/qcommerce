import baseService from '@imagina/qcrud/_services/baseService'
import {PriceList} from '@imagina/qcommerce/_pages/panel/priceList/interface'

export default {
  getCategories(refresh = false, params = {}): Promise<PriceList> {
    return new Promise((resolve, reject) => {
      const requestParams = {refresh, params}
      //Request
      baseService.index('apiRoutes.qcommerce.categories', requestParams).then(response => {
        resolve(response)
      }).catch(error => reject(error))
    })
  }
}
