<template>
  <div id="showOrderPage">
    <!--page actions-->
    <div class="box box-auto-height q-mb-md">
      <page-actions @refresh="init" :exclude-actions="['export']" :extra-actions="extraPageActions"
                    :title="`${$tr($route.meta.title)} #${ orderId.toString().padStart(5, '0')}`"/>
    </div>

    <!--Dynamic blocks-->
    <div id="dynamicBlocksContent" class="row q-col-gutter-md" v-if="order.id">
      <div v-for="(col, keyCol) in informationBlocks" :key="keyCol" class="col-12 col-md-6">
        <div v-for="(block, keyBlock) in col" :key="keyBlock" class="box box-auto-height q-mb-md">
          <!--Title-->
          <div class="box-title">
            <q-icon v-if="block.icon" :name="block.icon"/>
            {{ block.title }}
          </div>
          <q-separator class="q-my-sm"/>
          <!--Values-->
          <q-list>
            <q-item v-for="(item, index) in block.values" :key="index" class="q-px-none">
              <q-item-section>
                <q-item-label>{{ item.label }}</q-item-label>
                <q-item-label caption v-html="item.value"/>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </div>

    <!--Products List-->
    <div id="orderItemsContent" class="box box-auto-height q-mb-md">
      <!--Product list-->
      <q-table v-bind="tableConfig.props">
        <!-- Custom column -->
        <!-- Custom column -->
        <template v-slot:body-cell-title="props">
          <q-td :props="props" :title="props.value">
            {{ props.value }}
            <div v-if="props.row.category" class="text-blue-grey">
              {{props.row.category.title}}
            </div>
          </q-td>
        </template>
        <template v-slot:body-cell-productOptionsLabel="props">
          <q-td :props="props">
            <div style="max-width: 250px; white-space: normal">
              {{ props.value }}
              <div v-if="props.row.details" class="cart-product-details">
                <b class="text-grey">{{ props.row.details }}</b>
              </div>
            </div>
          </q-td>
        </template>
        <!--Custom columns-->
        <template v-slot:body-cell="props">
          <!-- actions columns -->
          <q-td v-if="props.col.name == 'actions'" :props="props">
            <btn-menu :actions="tableConfig.actions" :action-data="props.row"/>
          </q-td>
          <!--Default columns-->
          <q-td v-else :props="props" :title="props.value">
            {{ props.value }}
          </q-td>
        </template>
      </q-table>
      <!--Rate product-->
      <master-modal v-model="modalRating.show" :title="$tr('isite.cms.label.rating')" :loading="modalRating.loading">
        <!--Product Info-->
        <div class="box box-auto-height q-mb-md">
          <b class="text-blue-grey q-mr-sm">{{ $tr('isite.cms.label.product') }}:</b>
          {{ modalRating.item.title }}
        </div>
        <!--Rating form-->
        <dynamic-form v-if="!modalRating.loading" v-bind="form.rating" @sent="modalRating.show = false; init()"/>
      </master-modal>
    </div>

    <!--Actions-->
    <div class="row q-col-gutter-md q-mb-md">
      <!-- Buy Again -->
      <div class="col-12" v-if="order.buyAgainUrl">
        <q-btn class="full-width" :label="$tr('icommerce.cms.label.buyAgain')"
               :href="order.buyAgainUrl" target="_blank" outline color="primary"
               icon="fal fa-box-dollar" no-caps/>
      </div>
      <!--Status info-->
      <div class="col-12 col-md-6">
        <!--Tracking info-->
        <div id="trackingOrderStatusContent" class="box box-auto-height">
          <div class="box-title">
            {{ $tr('icommerce.cms.orderHistory') }}
          </div>
          <q-separator class="q-mt-sm q-mb-md"/>
          <!--timeline-->
          <q-timeline color="info" class="q-mb-none">
            <q-timeline-entry v-for="(item, keyItem) in timeLine" :key="keyItem" :title="item.title"
                              :subtitle="item.subtitle" :body="item.body"/>
          </q-timeline>
        </div>
        <!--Form status-->
        <div class="box q-mt-md" v-if="canEditOrder">
          <div class="box-title">
            {{ $tr('icommerce.cms.newStatus') }}
          </div>
          <q-separator class="q-mt-sm q-mb-md"/>
          <dynamic-form v-bind="form.status" @sent="init()" :key="statusFormKey"/>
        </div>
      </div>
      <!--Chat-->
      <div class="col-12 col-md-6" v-if="conversation">
        <div class="box">
          <div class="box-title">{{ $trp('isite.cms.label.message') }}</div>
          <q-separator class="q-mt-sm q-mb-md"/>
          <advance-chat :room-id="conversation.id"/>
        </div>
      </div>
    </div>

    <!--inner-loading-->
    <inner-loading :visible="loading"/>
  </div>
</template>

<script>
import orderStatusHistory from 'modules/qcommerce/_components/admin/orders/orderStatusHistory';
import orderItems from 'modules/qcommerce/_components/frontend/orders/orderItems';
import addStatusOrder from 'modules/qcommerce/_components/admin/orders/addStatusOrder'
import advanceChat from 'modules/qchat/_components/advancedChat'

export default {
  components: {
    orderItems,
    orderStatusHistory,
    addStatusOrder,
    advanceChat
  },
  mounted() {
    this.init()
  },
  data() {
    return {
      loading: false,
      order: {
        customer: {
          fullName: ''
        },
        items: [],
      },
      modalRating: {
        loading: false,
        show: false,
        item: false,
        itemRating: false
      },
      conversation: false,
      statusFormKey: this.$uid()
    }
  },
  computed: {
    //Return extra actions
    extraPageActions() {
      return [
        {
          label: this.$tr('icommerce.cms.label.buyAgain'),
          props: {
            icon: 'fal fa-box-dollar',
            label: this.$tr('icommerce.cms.label.buyAgain'),
            href: this.order.buyAgainUrl,
            target: '_blank'
          },
          vIf: this.order.buyAgainUrl ? true : false
        },
        {
          label: this.$tr('isite.cms.label.print'),
          props: {
            icon: 'fa-light fa-print'
          },
          action: this.printScreen
        }
      ]
    },
    //Return settings to use
    settings() {
      return {
        showReviewsProduct: (config('app.mode') == 'iadmin') ? false :
            parseInt(this.$getSetting('icommerce::showReviewsProduct') || 0),
        chatByOrderEnable: parseInt(this.$getSetting('icommerce::chatByOrderEnable') || 0)
      }
    },
    //Return orderID
    orderId() {
      return this.$clone(this.$route.params.id)
    },
    //return information block by columns
    informationBlocks() {
      //instance cols number
      let formColNumber = 2
      //instance response with cols number
      let response = Array(formColNumber).fill(0).map((_, i) => []);
      //Instance informationBlocks from order and add last block with totals data
      let informationBlocks = [...this.$clone(this.order.informationBlocks || []), {
        title: 'Total',
        values: [
          {
            label: this.$tr('icommerce.cms.subtotal'),
            value: `$${this.$n(this.order.total - this.order.shippingAmount)}`
          },
          {
            label: this.$tr('icommerce.cms.shipping'),
            value: `$${this.$n(parseFloat(this.order.shippingAmount))}`
          },
          {
            label: this.$tr('icommerce.cms.form.total'),
            value: `$${this.$n(this.order.total)}`
          }
        ]
      }]

      //split blocks in cols
      let posColumn = 0
      informationBlocks.forEach(block => {
        response[posColumn].push(block)
        posColumn = (posColumn >= (formColNumber - 1)) ? 0 : (posColumn + 1)
      })

      //response
      return response
    },
    //Table order items config
    tableConfig() {
      //instance response
      let response = {
        props: {
          rows: this.order.items,
          pagination: {rowsPerPage: 0},
          class: 'no-shadow',
          hideBottom: true,
          columns: [
            {name: 'id', label: 'ID', field: 'productId', align: 'left'},
            {name: 'title', label: this.$tr('isite.cms.form.product'), field: 'title', align: 'left'},
            {
              name: 'productOptionsLabel',
              label: this.$trp('isite.cms.label.option'),
              field: 'productOptionsLabel',
              align: 'left'
            },
            {name: 'sku', label: 'SKU', field: 'reference', align: 'left'},
            {name: 'quantity', label: this.$tr('isite.cms.label.quantity'), field: 'quantity', align: 'left'},
            {
              name: 'price', label: this.$tr('isite.cms.label.price'), field: 'price', align: 'center',
              format: val => `$${this.$n(val || 0)}`
            },
            {
              name: 'total', label: 'Total', field: 'total', align: 'center',
              format: val => `$${this.$n(val || 0)}`
            },
          ]
        },
        actions: []
      }

      //Add rating action
      if (this.settings.showReviewsProduct) {
        response.actions.push({
          label: this.$tr('isite.cms.label.rate'),
          icon: 'fas fa-check',
          action: (item) => {
            this.getProductRating(item)
          }
        })
      }

      //Addd actions column
      if (response.actions.length)
        response.props.columns.push({name: 'actions', label: this.$tr('isite.cms.form.actions'), align: 'right'},)

      //response
      return response
    },
    //validate if can edit order
    canEditOrder() {
      return ((config('app.mode') == 'iadmin') && this.$hasAccess('icommerce.orders.edit')) ? true : false
    },
    //Edit order status form
    form() {
      //Get itemRatingComments
      let itemRatingComments = this.modalRating.itemRating?.comments || []

      //Response
      return {
        status: {
          formType: 'grid',
          sendTo: {
            apiRoute: 'apiRoutes.qcommerce.orderStatusHistory',
            extraData: {orderId: this.orderId}
          },
          blocks: [{
            fields: {
              status: {
                value: null,
                type: 'select',
                required: true,
                props: {
                  label: `${this.$tr('isite.cms.form.status')}*`
                },
                loadOptions: {
                  apiRoute: 'apiRoutes.qcommerce.orderStatus'
                }
              },
              notify: {
                value: '0',
                type: 'select',
                required: true,
                props: {
                  label: 'Notificar al Cliente*',
                  options: [
                    {label: this.$tr('isite.cms.label.yes'), value: 1},
                    {label: this.$tr('isite.cms.label.no'), value: 0},
                  ]
                }
              },
              comment: {
                value: null,
                type: 'input',
                colClass: 'col-12',
                props: {
                  label: this.$tr('isite.cms.form.comment'),
                  type: 'textarea',
                  rows: "3"
                }
              }
            }
          }]
        },
        rating: {
          formType: 'grid',
          noActions: this.modalRating.itemRating ? true : false,
          sendTo: {
            apiRoute: 'apiRoutes.qcommerce.ratings',
            extraData: {
              userId: this.$store.state.quserAuth.userId,
              rateableId: this.modalRating.item?.productId || null,
              rateableType: 'Modules\\Icommerce\\Entities\\Product'
            }
          },
          blocks: [{
            fields: {
              rating: {
                value: this.modalRating.itemRating?.rating || 3,
                type: 'rating',
                required: true,
                colClass: 'col-12',
                props: {
                  label: `${this.$tr('isite.cms.label.rating')}*`,
                  readonly: this.modalRating.itemRating ? true : false
                },
                loadOptions: {
                  apiRoute: 'apiRoutes.qcommerce.orderStatus'
                }
              },
              comment: {
                value: itemRatingComments[0]?.comment || null,
                type: 'input',
                colClass: 'col-12',
                fakeFieldName: 'comment',
                props: {
                  label: this.$tr('isite.cms.form.comment'),
                  type: 'textarea',
                  rows: "3",
                  readonly: this.modalRating.itemRating ? true : false
                }
              },
              mediasMulti: {
                value: {},
                type: 'media',
                colClass: 'col-12',
                fakeFieldName: 'comment',
                fieldItemId: itemRatingComments[0]?.id || null,
                props: {
                  label: this.$trp('isite.cms.form.image'),
                  zone: 'gallery',
                  entity: "Modules\\Icomments\\Entities\\Comment",
                  entityId: itemRatingComments[0]?.id || null,
                  accept: 'images',
                  directUpload: true,
                  maxFiles: 6,
                  readonly: this.modalRating.itemRating ? true : false,
                  disk: 'rateable'
                }
              },
            }
          }]
        }
      }
    },
    //Return order status history
    timeLine() {
      return !this.order.histories ? [] : this.order.histories.map(item => {
        return {
          title: item.status.title,
          subtitle: this.$trd((item.created_at || item.createdAt), {type: 'long'}),
          body: item.comment || null
        }
      }).reverse()
    }
  },
  methods: {
    init() {
      this.getData(true)
      this.statusFormKey = this.$uid()
    },
    //get data
    getData(refresh) {
      return new Promise(async (resolve, reject) => {
        this.loading = true
        await Promise.all([
          this.getOrder(refresh),
          this.getChatConversation(refresh)
        ])
        this.loading = false
      })
    },
    //Get order data
    getOrder(refresh) {
      return new Promise((resolve, reject) => {
        //Request params
        let requestParams = {
          refresh: refresh,
          params: {include: 'shippingDepartment,shippingCountry,customer.addresses,customer.fields,orderItems.category'}
        }
        //Request
        this.$crud.show('apiRoutes.qcommerce.orders', this.orderId, requestParams).then(response => {
          this.order = response.data
          resolve(response.data)
        }).catch(error => {
          this.$apiResponse.handleError(error, () => {
            resolve(error)
          })
        })
      })
    },
    //get chateable
    getChatConversation(refresh) {
      return new Promise((resolve, reject) => {
        //Validate if request chat
        if (!this.settings.chatByOrderEnable) return resolve(true)

        //Request Params
        let requestParams = {
          refresh: refresh,
          params: {
            filter: {field: 'entity_id', entity_type: 'Modules\\Icommerce\\Entities\\Order'}
          }
        }
        //request
        this.$crud.show('apiRoutes.qchat.conversations', this.orderId, requestParams).then(response => {
          this.conversation = this.$clone(response.data)
          resolve(response.data)
        }).catch(error => {
          this.$apiResponse.handleError(error, () => {
            resolve(error)
          })
        })
      })
    },
    //rate order item
    getProductRating(item) {
      return new Promise((resolve, reject) => {
        //Set data to modal
        this.modalRating.loading = true
        this.modalRating.item = item
        this.modalRating.show = true

        //request params
        let requestParams = {
          refresh: true,
          params: {
            include: 'comments',
            filter: {
              field: 'rateable_id',
              userId: this.$store.state.quserAuth.userId,
              rateableType: 'Modules\\Icommerce\\Entities\\Product'
            }
          }
        }
        //request
        this.$crud.show('apiRoutes.qcommerce.ratings', item.productId, requestParams).then(response => {
          this.modalRating.itemRating = this.$clone(response.data)
          this.modalRating.loading = false
        }).catch(error => {
          this.$apiResponse.handleError(error, () => {
            this.modalRating.loading = false
          })
        })
      })
    },
    //print
    printScreen() {
      print();
    },
  }
}
</script>

<style lang="scss">
#trackingOrderStatusContent {
  .q-timeline__entry {
    .q-timeline__subtitle {
      text-transform: none;
      margin: 0px;
    }

    .q-timeline__content {
      font-size: 12px;
      color: $grey-7;

      .q-timeline__title {
        font-size: 13px;
        margin: 0px;
        font-weight: bold;
        color: $grey-8;
      }
    }
  }

  #orderItemsContent {
    thead {
      th {
        color: $blue-grey;
        font-weight: bold;
        font-size: 15px;
      }
    }
  }
}

  @media print {
#masterPanelHeader,
#masterDrawers,
    #masterDrawers1,
#masterDrawers2,
#masterFooter,
#menuMaster,
    #pageActionscomponent .actions-content {
      display: none;
    }

    .q-page-container {
      padding: 0 !important;
    }
  }

</style>
