<template>
  <div id="panelPriceList" class="q-pa-md relative-position">
    <!--Page Actions-->
    <div class="q-mb-md box box-auto-height">
      <page-actions :title="$tr($route.meta.title)" :extra-actions="extraActions" @search="searchPriceList"
                    :expires-in="expiresIn" @refresh="refreshData(true)" :exclude-actions="excludeActions" />
    </div>

    <div class="row col-12 q-col-gutter-md" v-if="infoRedirect.show">
      <dynamic-field v-for="(field, name) in infoRedirect.fields" :key="name"
                     :field="field" class="col-12" />
    </div>

    <div id="print">
      <div class="text-center show-print custom-logo custom-border">
        <img id="logoPriceList" height="100" :src="store.getMediaSetting('isite::logo1').path">
      </div>
      <!--Content-->
      <div class="relative-position q-mt-md price-list row">
        <template v-if="!loading">
          <div v-for="(categories, key) in priceLists" :key="key" :class="`q-px-xs col-12 col-md-${col}`">
            <div v-for="priceList in categories" :key="priceList.id" class="q-mt-md">
              <div class="text-center show-print title">
                <a :href="priceList.url"
                   target="_blank">{{ priceList.title }}</a>
              </div>
              <q-toolbar class="bg-primary text-white no-print">
                <q-toolbar-title class="text-body1">{{ priceList.title }}</q-toolbar-title>
              </q-toolbar>

              <q-list bordered>
                <q-item v-for="product in priceList.ownProducts" :key="product.id" class="q-py-none" clickable
                        tag="a" :href="product.url" target="_blank">
                  <q-item-section>
                    <q-item-label class="text-body2">{{ product.name }}</q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-item-label class="text-blue-grey text-weight-bold" caption>${{ $trn(parseInt(product.userPrice || product.price || 0)) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </template>

        <!--Loading-->
        <inner-loading :visible="loading" />
      </div>

      <div class="row show-print footer-print">
        <div v-for="(contact, key) of contactData" :key="key" class="q-mr-md">
          <p>{{ contact.label }}:</p>
          <ul>
            <li v-for="data of contact.data">
              {{ data }}
            </li>
          </ul>
        </div>
      </div>
    </div>

  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import controller from 'src/modules/qcommerce/_pages/panel/priceList/controller';

export default defineComponent({
  props: {},
  components: {},
  setup(props, { emit }) {
    return controller(props, emit);
  }
});
</script>
<style lang="scss">
#panelPriceList {
  .show-print {
    display: none;
  }

  .pageActionsPrice {
    z-index: 999;
  }

  .q-toolbar {
    border-radius: 5px 5px 0 0;
    min-height: 0;
  }

  .q-list--bordered {
    border-radius: 0 0 5px 5px;
  }

  .q-item {
    min-height: 0;
    padding-top: 6px;
    padding-bottom: 6px;
  }

  .price-list {
    min-height: 30vh;
  }
}
</style>
