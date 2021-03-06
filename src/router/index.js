import Vue from 'vue'

import Router from 'vue-router'
Vue.use(Router)

import HelloWorld from '@/components/HelloWorld'
import Dash from '@/components/dash/Dash'

// order

import StockinQuick from '@/components/stockin/StockinQuick'
import StockinScan from '@/components/stockin/StockinScan'
import StockinScanBarcode from '@/components/stockin/StockinScanBarcode'
import StockinScanRFID from '@/components/stockin/StockinScanRFID'
import StockinOne from '@/components/stockin/StockinOne'
import StockinList from '@/components/stockin/StockinList'
import StockinTransfer from '@/components/stockin/StockinTransfer'

import StockoutHandle from '@/components/stockout/StockoutHandle'
import StockoutScan from '@/components/stockout/StockoutScan'
import StockoutScanBarcode from '@/components/stockout/StockoutScanBarcode'
import StockoutScanRFID from '@/components/stockout/StockoutScanRFID'
import StockoutShip from '@/components/stockout/StockoutShip'
import StockoutOne from '@/components/stockout/StockoutOne'
import StockoutList from '@/components/stockout/StockoutList'
import StockoutMerge from '@/components/stockout/StockoutMerge'
import StockoutMergeOne from '@/components/stockout/StockoutMergeOne'
import StockoutTransfer from '@/components/stockout/StockoutTransfer'

// inv
import InvQuery from '@/components/inv/InvQuery'
import InvWarn from '@/components/inv/InvWarn'
import InvReplenish from '@/components/inv/InvReplenish'
import InvMove from '@/components/inv/InvMove'
import InvAdjust from '@/components/inv/InvAdjust'
import InvCount from '@/components/inv/InvCount'
import InvRfid from '@/components/inv/InvRfid'
import InvRfidQuery from '@/components/inv/InvRfidQuery'
import InvFreeze from '@/components/inv/InvFreeze'

// warehouse
import Warehouse from '@/components/warehouse/Warehouse'
import Workarea from '@/components/warehouse/Workarea'
import Area from '@/components/warehouse/Area'
import Location from '@/components/warehouse/Location'
import Partner from '@/components/warehouse/Partner'
import Category from '@/components/warehouse/Category'
import Good from '@/components/warehouse/Good'
import GoodMap from '@/components/warehouse/GoodMap'
import Share from '@/components/warehouse/Share'

// system model
import User from '@/components/system/User'
import UserCenter from '@/components/system/UserCenter'
import Company from '@/components/system/Company'
import Config from '@/components/system/Config'
import SystemConfig from '@/components/system/SystemConfig'
import Setting from '@/components/system/Setting'
// ext
import AsyncQuery from '@/components/system/AsyncQuery'


// finance
import FinanceSummary from '@/components/finance/FinanceSummary'
import FinanceList from '@/components/finance/List'
import FinanceRecv from '@/components/finance/Recv'
import FinancePay from '@/components/finance/Pay'


import MoneyAccount from '@/components/finance/MoneyAccount'

import StatStockin from '@/components/finance/StatStockin'
import StatStockout from '@/components/finance/StatStockout'


export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    // dashboard
    {
      path: '/dash',//'/dash',
      name: 'Dash',
      component: Dash,
    },
    
    // -------- stock in -----
    {
      path: '/stockin/one/:order_id/sale/:sale_id',
      name: 'StockinOneSale',
      component: StockinOne
    },
    {
      path: '/stockin/one/:order_id/produce/:produce_id',
      name: 'StockinOneProduce',
      component: StockinOne
    },
    {
      path: '/stockin/one/:order_id/purchase/:purchase_id',
      name: 'StockinOnePurchase',
      component: StockinOne
    },
    {
      path: '/stockin/one/:order_id',
      name: 'StockinOne',
      component: StockinOne
    },
    {
      path: '/stockin/StockinList',
      name: 'StockinList',
      component: StockinList
    },
    {
      path: '/stockin/StockinTransfer',
      name: 'StockinTransfer',
      component: StockinTransfer
    },
    // ????????????
    {
      path: '/stockin/quick',
      name: 'StockinQuick',
      component: StockinQuick
    },
    // ????????????
    {
      path: '/stockin/scan',
      name: 'StockinScan',
      component: StockinScan
    },
    // ???????????????
    {
      path: '/stockin/scan/barcode',
      name: 'StockinScanBarcode',
      component: StockinScanBarcode
    },
    // ???RFID??????
    {
      path: '/stockin/scan/rfid',
      name: 'StockinScanRFID',
      component: StockinScanRFID
    },

    // -------- stock out -------
    {
      path: '/stockout/one/:order_id/sale/:sale_id',
      name: 'StockoutOneSale',
      component: StockoutOne
    },
    {
      path: '/stockout/one/:order_id/produce/:produce_id',
      name: 'StockoutOneProduce',
      component: StockoutOne
    },
    {
      path: '/stockout/one/:order_id/purchase/:purchase_id',
      name: 'StockoutOnePurchase',
      component: StockoutOne
    },
    {
      path: '/stockout/one/:order_id',
      name: 'StockoutOne',
      component: StockoutOne
    },
    {
      path: '/stockout/StockoutList',
      name: 'StockoutList',
      component: StockoutList
    },
    {
      path: '/stockout/StockoutTransfer',
      name: 'StockoutTransfer',
      component: StockoutTransfer
    },
    // ???????????????
    {
      path: '/stockout/handle',
      name: 'StockoutHandle',
      component: StockoutHandle
    },

    // ????????????
    {
      path: '/stockout/scan',
      name: 'StockoutScan',
      component: StockoutScan
    },

    // ???????????????
    {
      path: '/stockout/scan/barcode',
      name: 'StockoutScanBarcode',
      component: StockoutScanBarcode
    },

    // ???rfid??????
    {
      path: '/stockout/scan/rfid',
      name: 'StockoutScanRFID',
      component: StockoutScanRFID
    },

    // ????????????
    {
      path: '/stockout/ship',
      name: 'StockoutShip',
      component: StockoutShip
    },
    // ??????
    {
      path: '/stockout/merge/one/:order_id',
      name: 'StockoutMergeOne',
      component: StockoutMergeOne
    },
    {
      path: '/stockout/StockoutMerge',
      name: 'StockoutMerge',
      component: StockoutMerge
    },

    // ------- inv query ---------
    // ????????????
    {
      path: '/inv/query',
      name: 'InvQuery',
      component: InvQuery
    },
    // ????????????
    {
      path: '/inv/warn',
      name: 'InvWarn',
      component: InvWarn
    },
    {
      path: '/inv/freeze',
      name: 'InvFreeze',
      component: InvFreeze
    },
    {
      path: '/inv/replenish',
      name: 'InvReplenish',
      component: InvReplenish
    },
    // ???????????????
    {
      path: '/inv/rfid',
      name: 'InvRfid',
      component: InvRfid
    },
    {
      path: '/inv/InvRfidQuery',
      name: 'InvRfidQuery',
      component: InvRfidQuery
    },
    // ???????????????
    {
      path: '/inv/move',
      name: 'InvMove',
      component: InvMove
    },
    // ?????????
    {
      path: '/inv/adjust',
      name: 'InvAdjust',
      component: InvAdjust
    },
    // ?????????
    {
      path: '/inv/count',
      name: 'InvCount',
      component: InvCount
    },

    // -------- warehouse --------
    // ????????????
    {
      path: '/warehouse/warehouse',
      name: 'Warehouse',
      component: Warehouse
    },

    // ?????????
    {
      path: '/warehouse/workarea',
      name: 'Workarea',
      component: Workarea
    },
    // ??????
    {
      path: '/warehouse/area',
      name: 'Area',
      component: Area
    },
    // ??????
    {
      path: '/warehouse/location',
      name: 'Location',
      component: Location
    },
    // ????????????
    {
      path: '/warehouse/partner',
      name: 'Partner',
      component: Partner
    },
    // ??????
    {
      path: '/warehouse/category',
      name: 'Category',
      component: Category
    },
    // ??????
    {
      path: '/warehouse/good',
      name: 'Good',
      component: Good
    },
    // ????????????
    {
      path: '/warehouse/goodmap',
      name: 'GoodMap',
      component: GoodMap
    },
    // ?????????
    {
      path: '/warehouse/share',
      name: 'Share',
      component: Share
    },

    // -------- async --------
    // query import
    {
      path: '/async/query',
      name: 'AsyncQuery',
      component: AsyncQuery
    },

    // -------- system --------
    {
      path: '/system/user',
      name: 'User',
      component: User
    },
    {
      path: '/system/UserCenter',
      name: 'UserCenter',
      component: UserCenter
    },
    {
      path: '/system/company',
      name: 'Company',
      component: Company
    },
    {
      path: '/system/config',
      name: 'Config',
      component: Config
    },
    {
      path: '/system/sysconfig',
      name: 'SystemConfig',
      component: SystemConfig
    },
    {
      path: '/system/setting',
      name: 'Setting',
      component: Setting
    },

    // ?????? finance ------
    {
      path: '/finance/FinanceSummary',
      name: 'FinanceSummary',
      component: FinanceSummary
    },
    {
      path: '/finance/FinanceList',
      name: 'FinanceList',
      component: FinanceList
    },
    {
      path: '/finance/FinanceRecv',
      name: 'FinanceRecv',
      component: FinanceRecv
    },
    {
      path: '/finance/FinancePay',
      name: 'FinancePay',
      component: FinancePay
    },

    {
      path: '/finance/stat/stockin',
      name: 'StatStockin',
      component: StatStockin
    },
    {
      path: '/finance/stat/stockout',
      name: 'StatStockout',
      component: StatStockout
    },
    {
      path: '/finance/MoneyAccount',
      name: 'MoneyAccount',
      component: MoneyAccount
    },
  ]
})
