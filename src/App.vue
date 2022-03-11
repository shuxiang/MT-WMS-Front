<template>
<a-config-provider :locale="locale">
<div id="app">
  <a-modal title="选择租户" :visible="dlg_tenant" @ok="load_tenant()" @cancel="dlg_tenant=false">
    <a-form :model="tenant">
      <a-form-item  label="仓库：" >
        <a-radio-group defaultValue="default" v-model="tenant.warehouse_code">
          <a-radio-button :value="wh.code" v-for="wh in warehouses" :key="wh.code">{{wh.name}}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item  label="货主：" >
        <a-radio-group defaultValue="default" v-model="tenant.owner_code">
          <a-radio-button :value="on.code"  v-for="on in owners" :key="on.code">{{on.name}}</a-radio-button>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>

  <a-layout id="components-layout-demo-custom-trigger">
    <a-layout-sider :trigger="null" collapsible v-model="collapsed" :style="{ overflow: 'hidden', height: '100vh', position: 'fixed', left: 0 }"  class="sidebar">
      <div class="logo">
        <router-link :to="{ name: 'Dash' }">
          <span>
            <div class="ico-text">
              <a-icon type="home" v-if="collapsed"/>
              <span v-if="!collapsed">{{ tenant.warehouse_name || 'MT-WMS' }}</span>
            </div>
          </span>
        </router-link>
      </div>
      <div class="a-scroll">
      <a-menu mode="inline" theme="dark" :openKeys="openKeys" :inlineCollapsed="collapsed" @openChange="onOpenChange" :class="collapsed? 'collapsed-menu': null">

          <a-sub-menu key="menu1" v-if="(!owner_conf.is_old_menu) && (v_roles.vr_manager || v_roles.vr_stock || vmenus.m_stock)">
            <span slot="title"><a-icon type="shopping-cart" /><span>仓库管理</span></span>
            <a-menu-item key="menu1-1" v-if="v_roles.vr_manager || v_roles.vr_stock || vmenus.m_inv_stockin"><router-link :to="{ name: 'StockinList' }">入库单</router-link></a-menu-item>
            <a-menu-item key="menu1-2" v-if="v_roles.vr_manager || v_roles.vr_stock || vmenus.m_inv_stockout"><router-link :to="{ name: 'StockoutList' }">出库单</router-link></a-menu-item>
            <a-menu-item key="menu1-21" v-if="owner_conf.is_enable_stockout_merge && (v_roles.vr_manager || v_roles.vr_stock || vmenus.m_inv_merge)"><router-link :to="{ name: 'StockoutMerge' }">波次出库</router-link></a-menu-item>
            <a-menu-item key="menu1-3" v-if="v_roles.vr_manager || v_roles.vr_stock || vmenus.m_inv_query"><router-link :to="{ name: 'InvQuery' }">库存查询</router-link></a-menu-item>
            <a-menu-item key="menu1-3-1" v-if="v_roles.vr_manager || v_roles.vr_stock || vmenus.m_inv_query"><router-link :to="{ name: 'InvRfidQuery' }">唯一码库存</router-link></a-menu-item>
            <a-menu-item key="menu1-4" v-if="owner_conf.is_enable_inv_warn && (v_roles.vr_manager || v_roles.vr_stock || vmenus.m_inv_warn)"><router-link :to="{ name: 'InvWarn' }">库存预警</router-link></a-menu-item>
            <a-menu-item key="menu1-7" v-if="owner_conf.is_enable_inv_freeze"><router-link :to="{ name: 'InvFreeze' }">库存冻结</router-link></a-menu-item>
            <a-menu-item key="menu3-3" v-if="owner_conf.is_enable_inv_warn && (v_roles.vr_manager || v_roles.vr_stock || vmenus.m_inv_replenish)"><router-link :to="{ name: 'InvReplenish' }">库位补货</router-link></a-menu-item>
            <a-menu-item key="menu1-5" v-if="v_roles.vr_manager || v_roles.vr_stock || vmenus.m_inv_move"><router-link :to="{ name: 'InvMove' }">移库单</router-link></a-menu-item>
            <a-menu-item key="menu1-6" v-if="v_roles.vr_manager || v_roles.vr_stock || vmenus.m_inv_count"><router-link :to="{ name: 'InvCount' }">盘点单</router-link></a-menu-item>
            <a-menu-item key="menu1-8" v-if="v_roles.vr_manager || v_roles.vr_stock || vmenus.m_transfer_out"><router-link :to="{ name: 'StockoutTransfer' }">调拨出库</router-link></a-menu-item>
            <a-menu-item key="menu1-9" v-if="v_roles.vr_manager || v_roles.vr_stock || vmenus.m_transfer_in"><router-link :to="{ name: 'StockinTransfer' }">调拨入库</router-link></a-menu-item>
          </a-sub-menu>
          
          <a-sub-menu key="menu1" v-if="(owner_conf.is_old_menu) && (v_roles.vr_manager || v_roles.vr_stock || vmenus.m_stock)">
            <span slot="title"><a-icon type="shopping-cart" /><span>入库作业</span></span>
            <a-menu-item key="menu1-1" v-if="owner_conf.is_enable_quick_in"><router-link :to="{ name: 'StockinQuick' }">快捷入库</router-link></a-menu-item>
            <a-menu-item key="menu1-2" v-if="owner_conf.is_scan_batch_barcode"><router-link :to="{ name: 'StockinScan' }">扫条码入库</router-link></a-menu-item>
            <a-menu-item key="menu1-4" v-if="owner_conf.is_scan_each_barcode"><router-link :to="{ name: 'StockinScanBarcode' }">逐个扫条码入库</router-link></a-menu-item>
            <a-menu-item key="menu1-3" v-if="owner_conf.is_scan_rfid"><router-link :to="{ name: 'StockinScanRFID' }">扫RFID入库</router-link></a-menu-item>
          </a-sub-menu>

          <a-sub-menu key="demo4" v-if="(v_roles.vr_manager || v_roles.vr_stock || vmenus.m_stock)">
              <span slot="title"><a-icon type="database" />
                <span v-if="!owner_conf.is_old_menu">仓库基础信息</span>
                <span v-if="owner_conf.is_old_menu">仓库管理</span>
              </span>
              <a-menu-item key="demo4-1" v-if="(has_manager_perm || v_roles.vr_manager)">
                <router-link :to="{ name: 'Warehouse' }">仓库</router-link>
              </a-menu-item>
              <a-menu-item key="demo4-3" v-if="v_roles.vr_manager || v_roles.vr_stock || vmenus.m_stock_area"><router-link :to="{ name: 'Area' }">库区</router-link></a-menu-item>
              <a-menu-item key="demo4-31" v-if="v_roles.vr_manager || v_roles.vr_stock || vmenus.m_stock_workarea"><router-link :to="{ name: 'Workarea' }">工作区</router-link></a-menu-item>
              <a-menu-item key="demo4-4" v-if="v_roles.vr_manager || v_roles.vr_stock || vmenus.m_stock_location"><router-link :to="{ name: 'Location' }">库位</router-link></a-menu-item>
              <a-menu-item key="demo4-5" v-if="v_roles.vr_manager || v_roles.vr_stock || vmenus.m_stock_category"><router-link :to="{ name: 'Category' }">货类</router-link></a-menu-item>
              <a-menu-item key="demo4-6" v-if="v_roles.vr_manager || v_roles.vr_stock || vmenus.m_stock_good"><router-link :to="{ name: 'Good' }">货品</router-link></a-menu-item>
              <a-menu-item key="demo4-8" v-if="v_roles.vr_manager || v_roles.vr_stock || vmenus.m_stock_rfid_gen"><router-link :to="{ name: 'InvRfid' }">生成唯一码</router-link></a-menu-item>
          </a-sub-menu>

          <a-sub-menu key="demo7" v-if="owner_conf.is_enable_finance && (has_manager_perm || v_roles.m_finance || vmenus.m_finance)">
              <span slot="title"><a-icon type="dollar" /><span>财务信息</span></span>
              <!--
              <a-menu-item key="demo7-1-0" v-if="v_roles.vr_manager || v_roles.vr_finance || vmenus.m_finance_accont"><router-link :to="{ name: 'MoneyAccount' }">收款账户</router-link></a-menu-item>
              -->
              <a-menu-item key="demo7-1" v-if="v_roles.vr_manager || v_roles.vr_finance || vmenus.m_finance_list"><router-link :to="{ name: 'FinanceList' }">所有费用</router-link></a-menu-item>
              <a-menu-item key="demo7-2" v-if="v_roles.vr_manager || v_roles.vr_finance || vmenus.m_finance_recv"><router-link :to="{ name: 'FinanceRecv' }">应收账款</router-link></a-menu-item>
              <a-menu-item key="demo7-3" v-if="v_roles.vr_manager || v_roles.vr_finance || vmenus.m_finance_pay"><router-link :to="{ name: 'FinancePay' }">应付账款</router-link></a-menu-item>
              <a-menu-item key="demo7-4" v-if="v_roles.vr_manager || v_roles.vr_finance || vmenus.m_finance_summary">
                <router-link :to="{ name: 'FinanceSummary' }">客户款项汇总</router-link>
              </a-menu-item>
          </a-sub-menu>

          <a-sub-menu key="demo5" v-if="(has_normal_perm || vmenus.m_data)">
            <span slot="title"><a-icon type="schedule" /><span>数据管理</span></span>
            <a-menu-item key="demo5-3" v-if="has_normal_perm || vmenus.m_data_async">
              <router-link :to="{ name: 'AsyncQuery' }">导入导出</router-link>
            </a-menu-item>
            <a-menu-item key="demo5-4" v-if="v_roles.vr_stock || vmenus.m_data_stockin"><router-link :to="{ name: 'StatStockin' }">入库单统计</router-link></a-menu-item>
            <a-menu-item key="demo5-5" v-if="v_roles.vr_stock || vmenus.m_data_stockout"><router-link :to="{ name: 'StatStockout' }">出库单统计</router-link></a-menu-item>
          </a-sub-menu>

          <a-sub-menu key="demo9">
              <span slot="title"><a-icon type="setting" /><span>系统管理</span></span>
              <a-menu-item key="demo9-1" v-if="(has_normal_perm || vmenus.m_system_partner)">
                <router-link :to="{ name: 'Partner' }"><a-Icon type="idcard" />合作伙伴</router-link>
              </a-menu-item>
              <a-menu-item key="demo9-2" v-if="(has_admin_perm)">
                <router-link :to="{ name: 'Company' }"><a-Icon type="crown" />公司管理</router-link>
              </a-menu-item>
              <a-menu-item key="demo9-3" v-if="has_manager_perm || vmenus.m_system_user">
                <router-link :to="{ name: 'User' }"><a-Icon type="team" />用户管理</router-link>
              </a-menu-item>
              <a-menu-item key="demo9-4">
                <router-link :to="{ name: 'UserCenter' }"><a-Icon type="user" />个人中心</router-link>
              </a-menu-item>
              <a-menu-item key="demo9-6" v-if="(has_manager_perm || $store.vr_manager) && owner_conf.is_enable_setting">
                <router-link :to="{ name: 'Setting' }" ><a-Icon type="setting" />系统配置</router-link>
              </a-menu-item>
          </a-sub-menu>
      </a-menu>
      </div>
    </a-layout-sider>
    <a-layout :style="collapsed ? { marginLeft: '80px' } : { marginLeft: '200px' }">
      <a-layout-header style="background: #fff; padding: 0">
        <a-icon class="icon-trigger" :type="collapsed ? 'menu-unfold': 'menu-fold'" @click="() => (collapsed = !collapsed)" height="4" v-if="owner_conf.is_enable_simple_mode"/>
        <a-menu mode="horizontal" theme="light" style="float:right;height:64px;line-height:64px;">
          <a-sub-menu style="float:right;">
            <span slot="title" class="submenu-title-wrapper">
              <!-- <img src="/static/img/dl_yhm.png" style="margin-top:-6px;"/> -->
              <span style="font-size:18px;">&nbsp;&nbsp;{{user.code}}</span>
            </span>
            <a-menu-item index="demo8-2">
              <router-link :to="{ name: 'UserCenter' }"><a-Icon type="user" />个人中心</router-link>
            </a-menu-item>
            <a-menu-item key="logout"><a href="/auth/logout" ><a-icon type="logout" />退出登录</a></a-menu-item>
          </a-sub-menu>
          <a-menu-item key="tenant" style="float:right;" @click="dlg_tenant=true">
            仓库：{{tenant.warehouse_code}} 货主：{{tenant.owner_code}}
          </a-menu-item>
          <a-menu-item key="pda" style="float:right;">
            <a href="/pda" target="_blank"><a-icon type="mobile" theme="filled" :style="{ fontSize: '18px', color: '#bbb' }"/><strong>PDA</strong></a>
          </a-menu-item>
          <a-menu-item key="crm" style="float:right;" v-if="owner_conf.enable_crm">
            <a href="/crm" target="_blank"><a-icon type="book" theme="filled" :style="{ fontSize: '18px', color: '#bbb' }"/><strong>CRM</strong></a>
          </a-menu-item>
        </a-menu>
      </a-layout-header>
      <a-layout-content style="{ margin: '24px 16px', padding: '24px', background: '#fff', minHeight: '280px' }">
        <div id="container">
          <router-view/>
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>

  <a-drawer title="客服在线支持" placement="right" :closable="true" :visible="is_show_support" @close="is_show_support=false" >
    <p v-for="(qq,idx) in qq_list"  v-bind:key="'qq'+idx"><a :href="'tencent://message/?uin='+ qq +'&Site=&Menu=yes'">QQ客服{{ idx+1 }}(QQ: {{ qq }} )</a></p>
    <p v-for="(wx,idx) in wx_list"  v-bind:key="'wx'+idx">WX客服{{ idx+1 }}(WX: {{ wx }} )</p>
  </a-drawer>
  <a style="position:fixed;bottom: 80px; right:10px;width:77px;height:22px;display:block;z-index:666;" href="javascript:;" @click="do_load_unit('qq_list');do_load_unit('wx_list');is_show_support=true">
    <img src="/static/img/qq.gif" />
  </a>
  <a-back-top />

</div>
</a-config-provider>
</template>

<script>
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN';
// common config whatever
var __config = {
  // workzone
  origin_order_state: {create: "新单", done: "完成", cancel: "已取消", doing:"进行中"},
  origin_order_xtype: {sale: "销售单", purchase: "采购单"},
  // finance
  money_xtype: {stockin:"入库单",stockout:"出库单",
    express:"运费/物流快递",
    salary:"工资",eat:"吃饭",live:"住宿",trip:"差旅",car:"打车",invoice:"发票",other:"其它",
  },
  money_come: {income: "收入", outcome: '支出'},
  money_state: {create: "新单", doing: "进行中", done: '完成', cancel: '已取消', 'partdone': '终账'},
  // aysnc
  async_state: {'done':"完成", 'doing':"进行中", 'fail':"失败"},
  async_xtype: {'import':"导入", 'export':"导出"},
  // stockin
  sub_in_type: {},
  stockin_is_passback:  {false: "未回传", true: "已回传"},
  pay_type_list:{'线上支付':'线上支付', '挂账':'挂账', '预付款':'预付款', '代收货款':'代收货款'},
  // 'purchase', 'return', 'transfer', 'consign', 'custom', 'produce'
  stockin_xtype: {'purchase':"采购入库", 'return':"退库入库", 'transfer':"调拨入库", 'consign':"交易入库", 
      'produce': '生产成品入库', 'custom':"自定义入库",
      material_return: '退料入库', fix: '维修返回入库',
      borrow: '借用归还入库', normal: '普通入库',
      coop: '协作退还入库', produce_return: '生产配料退回',
    },
  stockin_state: {'create':"新单", 'part':"部分入库", 'all':"全部入库", 'done':"完成", 'cancel':"已取消"},
  // location work type
  location_work_type: {'':'所有工作区', 'default': '默认工作区', 'QC': '质检工作区', 'RECV': '收货工作区', 'SEND': '拆零发货工作区'},
  // auth
  au_partner_xtype: {'owner':"货主", 'express':"快递/物流", 'client':"客户", 'supplier': '供应商', 'client_supplier': '客户&供应商'},
  au_partner_stype: {'inner':"内采", 'purchase':"外采",},
  au_user_state: {'ban':'禁用', 'delete':'删除', 'on':'正常'},
  // config
  conf_code: {translation: '翻译', overcharge: '超收设置', partalloc: '部分分配', alloc_rule: '分配优先规则', print_rule: '打印规则', 
      close_when_pick: '拣货后关闭出库单', 
      enable_inv_warn: '启用库存告警', 
      enable_inv_freeze: '启用库存冻结', 
      enable_inv_unfreeze: '启用库存解冻', 
      enable_lpn: '启用容器', 
      scan_each_barcode: '逐个扫条码出库', scan_batch_barcode: '扫条码出库', scan_rfid: '扫RFID出库', 
      enable_quick_in: '快速入库', enable_quick_pick: '快速拣货', 
      enable_setting: '显示系统配置菜单',
      sync_downfile: '启用同步方式下载文件', alloc_location: '要分配的库位',
      enable_fast_invmove: '启用快速移库',
      selection: '选项列表',
      enable_simple_mode: '启用简洁模式',
      enable_stockout_merge: '启用波次出库',
      enable_search_good_500: '搜索货品大量返回',
      auto_location_rules: '入库库位自动选择顺序',
      enable_out_barcode: '启用扫条码出库',
      enable_out_each_barcode: '启用逐个扫条码出库',
      enable_out_rfid: '启用扫RFID出库',
      rfid_price_type: '码单价格模式',
      enable_madan: '启用码单',
    },
  conf_subcode: {stockin_order_type: '自定义入库订单类型', stockout_order_type: '自定义出库订单类型', 
      overcharge: '超收设置', partalloc: '部分分配', alloc_rule: '分配优先规则', print_rule: '打印规则',
      close_when_pick: '拣货后关闭出库单', 
      enable_inv_warn: '启用库存告警', 
      enable_inv_freeze: '启用库存冻结', 
      enable_inv_unfreeze: '启用库存解冻', 
      enable_lpn: '启用容器',
      scan_each_barcode: '逐个扫条码出库', scan_batch_barcode: '扫条码出库', scan_rfid: '扫RFID出库', 
      enable_quick_in: '快速入库', enable_quick_pick: '快速拣货', 
      enable_setting: '显示系统配置菜单',
      sync_downfile: '启用同步方式下载文件', alloc_location: '要分配的库位',
      enable_fast_invmove: '启用快速移库',
      qq_list: '客服QQ列表',
      enable_simple_mode: '启用简洁模式',
      enable_stockout_merge: '启用波次出库',
      enable_search_good_500: '搜索货品大量返回',
      auto_location_rules: '入库库位自动选择顺序',
      enable_out_barcode: '启用扫条码出库',
      enable_out_each_barcode: '启用逐个扫条码出库',
      enable_out_rfid: '启用扫RFID出库',
      rfid_price_type: '码单价格模式',
      enable_madan: '启用码单',
    },
  // warehouse 
  wh_area_xtype: {'storage':"存储区", 'temp':"临时区", 'piece':"零散区", 'bad':"坏品区", 'return':"退库区", 'repair':"维修区"},
  wh_location_priority: {'L1':"1级", 'L2':"2级", 'L3':"3级", 'L4':"4级", 'L5':"5级"},
  // good
  good_quality_type: {'ZP':"正品", 'CC':"次品", 'DJ':"冻结", 'ZT':"在途"},
  // inv
  inv_xtype: {'stockin':"入库单", 'stockout':"出库单", 'inv_move':"移库单", 'inv_adjust':"调整单", 'inv_transfer':"转移单"},
  inv_do_state: {'create':"新单", 'done':"完成", 'cancel':"已取消"},
  inv_move_state: {'create':"新单", doing: "进行中", 'done':"完成", 'cancel':"已取消"},
  inv_move_type: {system: '系统', user: '用户', replenish: '补货', onshelf: '上架'},
  // stockout
  sub_out_type: {},
  stockout_is_passback: {false: "未回传", true: "已回传"},
  stockout_state: {create: "新单", done: "完成", cancel: "已取消", doing:"进行中"},
  stockout_state_alloc: {no:"未分配", part:"部分分配", done:"分配完"},
  stockout_state_pick: {no:"未拣货", part:"部分拣货", done:"拣货完"},
  stockout_state_ship: {no:"未发运", part:"部分发运", done:"发运完"},
  stockout_trans_xtype: {'alloc':"分配", 'pick':"拣货", 'ship':"发运", 'unalloc':"取消分配", 'unpick':"取消拣货"},
  stockout_order_type: {'sale': '销售出库', 'produce': '生产配料出库', return: '退货出库', coop: '协作出库', 
    normal: '普通出库', material_pick: '领料出库', custom: '自定义出库',
    fix: '维修出库', scrap: '报废出库', borrow: '借用出库', transfer: '调拨出库', consign: '交易出库',
  },
  print_state: {true: '已打印', false: '未打印'},
  // menus
  menus:{
    m_inv: '仓库管理', m_stock: '仓库基础信息', m_finance: '财务信息', m_data:'数据管理', m_system: '系统管理',
    m_inv_stockin: '仓库管理>入库单', m_inv_stockout: '仓库管理>出库单', m_inv_merge: '仓库管理>波次出库', m_inv_query: '仓库管理>库存查询', m_inv_warn: '仓库管理>库存告警', m_inv_replenish: '仓库管理>库位补货', m_inv_move: '仓库管理>移库单', m_inv_count: '仓库管理>盘点单', 
      m_transfer_out: '仓库管理>调拨出库', m_transfer_in: '仓库管理>调拨入库', 
    m_stock_warehouse: '仓库基础信息>仓库', m_stock_area: '仓库基础信息>库区', m_stock_workarea: '仓库基础信息>工作区', m_stock_location: '仓库基础信息>库位', m_stock_category: '仓库基础信息>货类', m_stock_good: '仓库基础信息>货品', m_stock_rfid_gen: '仓库基础信息>生成唯一码', 
    m_finance_accont: '收款账户', m_finance_list: '财务信息>所有费用', m_finance_recv: '财务信息>应收账款', m_finance_pay: '财务信息>应付账款', m_finance_salary: '财务信息>工资单', m_finance_summary: '财务信息>客户款项汇总',
    m_data_stockin: '数据管理>入库单统计', m_data_stockout: '数据管理>出库单统计', m_data_async: '导入导出', 
    m_system_partner: '系统管理>合作伙伴', m_system_user: '系统管理>用户管理', m_system_setting: '系统管理>系统配置',
  },
  vroles: {boss:'老板', manager:'管理员', finance:'财务', stock:'仓库', },
}

export default {
  name: 'app',
  data: function() {
    return {
      locale: zhCN,
      collapsed: false,
      is_show_support: false,
      has_manager_perm: false,
      has_admin_perm: false,
      has_normal_perm: false,

      dlg_tenant: false,

      company: {},
      owners: [],
      warehouses:[],
      tenant: {},

      v_roles: {},
      vmenus: {},

      owner_conf: {
        enable_erp:false,
        express_on: 'off',
        is_close_when_pick: true, 
        is_enable_finance: false,
        is_enable_inv_warn: false,
        is_enable_inv_freeze: false,
        is_enable_inv_unfreeze: false,
        is_enable_lpn: false,
        is_enable_quick_in: false,
        is_enable_quick_pick: false,
        is_enable_out_barcode: true,
        is_enable_out_each_barcode: true,
        is_enable_out_rfid: true,
        is_enable_part_pick: false,
        is_scan_each_barcode: false,
        is_scan_batch_barcode: false,
        is_enable_setting: false,
        is_sync_downfile: false,
        is_enable_fast_invmove: false,
        is_enable_search_bar: true,
        is_enable_simple_mode: false,
        is_enable_stockout_merge: false,
      },
      user: {'code': ''},
      qq_list: [],
      wx_list:[],

      rootSubmenuKeys: ['menu1', 'menu2', 'menu3', 'demo4', 'demo5', 'demo6', 'demo7', 'demo8', 'demo9'],
      openKeys: [],
    }
  },
  methods: {
    do_load_unit(selection){
      var env = this
      this.$http.get('/warehouse/selection/'+selection).then(function(resp){
        if(resp.data.status=='success'){
          if(selection=='qq_list'){
            env.qq_list = resp.data.units
          }
          if(selection=='wx_list'){
            env.wx_list = resp.data.units
          }
        }
      })
    },
    // 收缩菜单
    onOpenChange(openKeys) {
      const latestOpenKey = openKeys.find(key => this.openKeys.indexOf(key) === -1);
      if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
        this.openKeys = openKeys;
      } else {
        this.openKeys = latestOpenKey ? [latestOpenKey] : [];
      }
    },

    // 选择菜单
    handleSelect(key, keyPath) {
        //console.log(key, keyPath);
    },

    // 选择租户
    load_tenant(){
      var env = this
      this.$http.post('/auth/current_tenant', this.tenant).then(function(resp){
        // load owner and warehouse
        env.company = resp.data.company
        env.$store.company = env.company
        env.owners = resp.data.owners
        env.warehouses = resp.data.warehouses
        env.tenant = resp.data.tenant
        env.$store.tenant = env.tenant
        env.owner_conf = resp.data.owner_conf
        env.$store.owner_conf = env.owner_conf
        env.dlg_tenant = false
        console.log('current tenant======>')
        console.log(env.tenant)
        console.log('current owner_conf======>')
        console.log(env.owner_conf)
        // just to index page
        if(env.$router.history.current.path!='/'){
          env.$router.push({path:'/'})
        }
      })
    },
  },
  beforeCreate: function() {
  },
  created: function(){
    var store = this.$store, env = this;
    // load current user
    this.$http.get('/auth/current_user').then(function(resp){
      var user = resp.data
      store.need_change_pwd = user.need_change_pwd
      env.user = resp.data
      console.log('current user======>')
      console.log(env.user)
      // perm
      env.has_admin_perm = (user.roles.indexOf("admin") > -1)
      env.has_manager_perm = (user.roles.indexOf("manager") > -1) || env.has_admin_perm
      env.has_normal_perm = (user.roles.indexOf("normal") > -1) || env.has_manager_perm

      store.has_manager_perm = env.has_manager_perm
      store.has_admin_perm = env.has_admin_perm
      store.has_normal_perm = env.has_normal_perm

      store.vroles = env.user.vroles
      env.v_roles = env.user.v_roles
      if(env.v_roles.vr_boss || env.has_manager_perm){
        env.v_roles.vr_manager = true
      }
      store.vmenus = env.user.vmenus
      env.vmenus = store.vmenus

      // 老板boss 管理员manager 财务finance 仓库stock
      store.vr_boss = env.user.vroles.indexOf('boss') > -1
      store.vr_manager = env.user.vroles.indexOf('manager') > -1  || store.vr_boss || env.has_manager_perm
      store.vr_finance = env.user.vroles.indexOf('finance') > -1
      store.vr_stock = env.user.vroles.indexOf('stock') > -1
    })

    // load current tenant
    this.load_tenant()

    
    
    // 下拉列表选项与翻译
    var options = {}
    for(var k in __config){
      options[k] = []
      for(var j in __config[k]){
        options[k].push({value:j, label:__config[k][j], text:__config[k][j]})
      }
    }
    this.$store.config = __config
    this.$store.options = options // options includes config
    this.$store.suppliers = []
    this.$store.clients = []
    this.$store.partners = []

    // load translation
    this.$http.get('/auth/translation?q={"per_page":100}').then(function(resp){
      store.translation = resp.data
      // load translation from db config
      for(var k in resp.data){
        // load config from db config
        store.config[k] = store.config[k] || {}
        // store.config[k] = resp.data[k]
        // load options from db config
        store.options[k] = store.options[k] || []
        for(var j in resp.data[k]){
          store.config[k][j] = resp.data[k][j] // must config then options
          store.options[k].push({value:j, label:__config[k][j], text:__config[k][j]})
        }
      }
    })

    console.log('current host======>')
    console.log(this.$store.baseURL)
  },
  watch: {
    $route(to, from){
    },
  },
    
}
</script>
<style>
.icon-trigger svg{height:64px;width:25px;line-height:64px;color:#aaaaaa;}
tbody{background-color:white;}
.red{color:red;}
.green{color:green;}
.gold{color:gold;}
.bold-tb td{font-weight:800 !important;}
.bg-tc{background-color:#fff2df;}

.h-tb, .h-tb2{border:1px solid #ccc;width:100%;}
.h-tb td{padding:20px;border: 1px solid #ddd;font-size:16px;}
.h-tb2 td{padding:6px;border: 1px solid #ddd;font-size:15px;}
</style>
<style scoped>
.logo{height:64px;line-height:64px;background-color:white;margin-top:-10px;font-weight:bold;}
#container{padding-left:20px;min-height:800px;}
.sidebar{background-image:url('/static/img/dark.png');}
.ico-text{color:white;font:微软雅黑,italic 2.5em Georgia,serif;height:64px;line-height:64px;background-color:#414E6B;text-align:center;margin:10px 0;font-weight:700;font-size: 2.5em;}
.ico-text:hover{background-color:white;color:#4c4781;}

.a-scroll{width:100%;height:95%;overflow:scroll;}
.a-scroll::-webkit-scrollbar {width : 7px; height: 1px;}
.a-scroll::-webkit-scrollbar-thumb {border-radius: 7px; box-shadow: inset 0 0 7px rgba(0, 0, 0, 0.2); background: #4f6088;}
.a-scroll::-webkit-scrollbar-track {box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);border-radius: 7px;background: transparent;}
</style>
