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
    // 快速入库
    {
      path: '/stockin/quick',
      name: 'StockinQuick',
      component: StockinQuick
    },
    // 扫码入库
    {
      path: '/stockin/scan',
      name: 'StockinScan',
      component: StockinScan
    },
    // 新扫码入库
    {
      path: '/stockin/scan/barcode',
      name: 'StockinScanBarcode',
      component: StockinScanBarcode
    },
    // 扫RFID入库
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
    // 出库单处理
    {
      path: '/stockout/handle',
      name: 'StockoutHandle',
      component: StockoutHandle
    },

    // 扫码拣货
    {
      path: '/stockout/scan',
      name: 'StockoutScan',
      component: StockoutScan
    },

    // 新扫码拣货
    {
      path: '/stockout/scan/barcode',
      name: 'StockoutScanBarcode',
      component: StockoutScanBarcode
    },

    // 扫rfid拣货
    {
      path: '/stockout/scan/rfid',
      name: 'StockoutScanRFID',
      component: StockoutScanRFID
    },

    // 扫单发运
    {
      path: '/stockout/ship',
      name: 'StockoutShip',
      component: StockoutShip
    },
    // 合单
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
    // 库存查询
    {
      path: '/inv/query',
      name: 'InvQuery',
      component: InvQuery
    },
    // 库存告警
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
    // 生成唯一码
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
    // 移库、上架
    {
      path: '/inv/move',
      name: 'InvMove',
      component: InvMove
    },
    // 调整单
    {
      path: '/inv/adjust',
      name: 'InvAdjust',
      component: InvAdjust
    },
    // 盘点单
    {
      path: '/inv/count',
      name: 'InvCount',
      component: InvCount
    },

    // -------- warehouse --------
    // 仓库查询
    {
      path: '/warehouse/warehouse',
      name: 'Warehouse',
      component: Warehouse
    },

    // 工作区
    {
      path: '/warehouse/workarea',
      name: 'Workarea',
      component: Workarea
    },
    // 库区
    {
      path: '/warehouse/area',
      name: 'Area',
      component: Area
    },
    // 库位
    {
      path: '/warehouse/location',
      name: 'Location',
      component: Location
    },
    // 合作伙伴
    {
      path: '/warehouse/partner',
      name: 'Partner',
      component: Partner
    },
    // 货类
    {
      path: '/warehouse/category',
      name: 'Category',
      component: Category
    },
    // 货品
    {
      path: '/warehouse/good',
      name: 'Good',
      component: Good
    },
    // 货品配料
    {
      path: '/warehouse/goodmap',
      name: 'GoodMap',
      component: GoodMap
    },
    // 共享仓
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

    // 财务 finance ------
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
