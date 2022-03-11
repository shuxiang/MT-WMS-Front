<template>
  <div>
    <div>
        <a-row>
          <a-col :span="6">
            <a-breadcrumb style="padding:20px 20px 20px 0px;">
              <a-breadcrumb-item >出库作业</a-breadcrumb-item>
              <a-breadcrumb-item title="扫单发运">发运交接</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
          <a-col :span="18">
              <a-button type="primary" @click="scan_ship_dlg()" style="margin:15px 0;">扫单发运</a-button>
          </a-col>
        </a-row>
    </div>


      <a-modal title="明细" :visible="dlg_detail"  @cancel="dlg_detail=false" width="1000px" :footer="null">
        <a-tabs  defaultActiveKey="first">
          <a-tab-pane tab="订单行明细" key="first" >
            <a-table :dataSource="lines" :columns="line_columns" rowKey="id" bordered :pagination="false">
            </a-table>
          </a-tab-pane>
          <a-tab-pane tab="所有已发运明细" key="second">
            <a-table :dataSource="order_ships" :columns="ship_columns" rowKey="id" bordered :pagination="false">
            </a-table>
          </a-tab-pane>
          <a-tab-pane tab="订单信息" key="3">
            <a-list bordered >
              <a-list-item>发货人姓名: {{ order.sender_info.name }}</a-list-item>
              <a-list-item>发货人电话: {{ order.sender_info.tel }}</a-list-item>
              <a-list-item>发货人地址: {{ order.sender_info.address }}</a-list-item>
              <a-list-item>收货人姓名: {{ order.receiver_info.name }}</a-list-item>
              <a-list-item>收货人电话: {{ order.receiver_info.tel }}</a-list-item>
              <a-list-item>收货人地址: {{ order.receiver_info.address }}</a-list-item>
              <a-list-item>计划时间: {{ order.date_planned }}</a-list-item>
              <a-list-item>备注: {{ order.remark }}</a-list-item>
            </a-list>
          </a-tab-pane>
        </a-tabs>
      </a-modal>

      <a-modal title="本次发运明细, 请先 `打印发运单` 再点 `确认发运` " :visible="dlg_ship" @cancel="dlg_ship=false" width="1000px" :footer="null">
        <div>
            <a-table :dataSource="inv_lines" :columns="inv_line_columns" :pagination="false" rowKey="id" bordered>
            </a-table>
        </div>
        <div class="print">
              <div class="barcode"></div>
              <table border="1" cellspacing="0">
                <thead>
                  <tr>
                    <td>货品码</td>
                    <td>条码</td>
                    <td>名称</td>
                    <td>数量</td>
                    <td>供应商</td>
                    <td>质量类型</td>
                    <td>生产日期</td>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in inv_lines"   v-bind:key="item.id">
                    <td>{{ item.sku }}</td>
                    <td>{{ item.barcode }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.qty_able }}</td>
                    <!--<td>{{ item.supplier_code}}</td>-->
                    <td>{{ item.quality_type }}</td>
                    <td>{{ item.product_date }}</td>
                  </tr>
                </tbody>
              </table>
        </div>
        <div class="dialog-footer">
          <a-button type="primary" @click="do_ship(order.erp_order_code)" style="float:right;margin-right:20px;">确定发运</a-button>
          <a-button @click="print_lines()" style="float:right;margin-right:20px;">打印发运单</a-button>
        </div>
      </a-modal>

      <a-modal title="扫单发运, 请先 `打印发运单` 再点 `确认发运` "  :visible="dlg_scan_ship" @cancel="dlg_scan_ship=false" width="1000px" :footer="null">
        <a-tabs defaultActiveKey="first">
          <a-tab-pane tab="扫出库单号" key="first" >
            <a-form :layout="'horizontal'">
              <a-form-item label="出库单单号">
                <a-input :allowClear="true" v-model="erp_order_code" placeholder="必填, 请扫描货品条码" id="c_ol_barcode" @keyup.enter="enter_barcode"></a-input>
              </a-form-item>
            </a-form>
          </a-tab-pane>
          <a-tab-pane tab="明细" key="second">
            <div>
              <a-table :dataSource="inv_lines" :columns="inv_line_columns" :pagination="false" rowKey="id" bordered>
              </a-table>
            </div>
            <div class="print2">
              <div class="barcode2"></div>
              <table border="1" cellspacing="0">
                <thead>
                  <tr>
                    <td>货品码</td>
                    <td>条码</td>
                    <td>名称</td>
                    <td>数量</td>
                    <td>质量类型</td>
                    <td>生产日期</td>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in inv_lines"  v-bind:key="item.id">
                    <td>{{ item.sku }}</td>
                    <td>{{ item.barcode }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.qty_able }}</td>
                    <td>{{ item.quality_type }}</td>
                    <td>{{ item.product_date }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </a-tab-pane>
        </a-tabs>
        <div class="dialog-footer">
          <a-button @click="query_ship()" style="float:right;margin-right:20px;">查询订单</a-button>
          <a-button type="primary" @click="do_ship(erp_order_code)" v-if="has_can_ship_order" style="float:right;margin-right:20px;">确定发运</a-button>
          <a-button @click="print_lines2()" style="float:right;margin-right:20px;">打印发运单</a-button>
        </div>
      </a-modal>

      <a-form layout="inline" v-if="owner_conf.is_enable_search_bar" style="padding-left:15px;background-color:rgb(235,235,235);">
        <a-form-item label="单号" >
          <a-input :allowClear="true"  placeholder="单号" v-model="query.order_code" style="width:160px;"/>
        </a-form-item>
        <a-form-item label="客户">
          <a-auto-complete placeholder="客户" @focus="handle_search_partner()" optionLabelProp="value" :defaultValue="''" @change="handle_search_partner" :backfill="true" v-model="query.partner_code">
            <template slot="dataSource">
                <a-select-option v-for="item in partners" :key="item.code">
                  <strong>{{item.code}} </strong><span class="certain-search-item-count">{{item.name}} {{item.tel}}</span>
                </a-select-option>
            </template>
          </a-auto-complete>
        </a-form-item>
        <a-form-item label="类型">
          <a-select :defaultValue="query.order_type"  v-model="query.order_type" style="width:120px;">
            <a-select-option value="" v-bind:key="''">--所有--</a-select-option>
            <a-select-option :value="item.value" v-for="item in options.stockout_order_type" v-bind:key="item.value">{{item.label}}</a-select-option>
          </a-select> 
        </a-form-item>
        <a-form-item label="状态">
          <a-select :defaultValue="query.state"  v-model="query.state" style="width:120px;">
            <a-select-option value="" v-bind:key="''">--所有--</a-select-option>
            <a-select-option :value="item.value" v-for="item in options.stockout_state" v-bind:key="item.value">{{item.label}}</a-select-option>
          </a-select> 
        </a-form-item>
        <a-form-item label="创建时间">
          <a-date-picker
            v-model="query.create_time1"
            format="YYYY-MM-DD"
            placeholder="start" style="width:120px;"
          /> ~
          <a-date-picker
            v-model="query.create_time2"
            format="YYYY-MM-DD"
            placeholder="end" style="width:120px;"
          />
        </a-form-item>
        <a-form-item>
          <a-button icon="search" @click="search_query">查询</a-button>
        </a-form-item>
      </a-form>

      <a-table :columns="order_columns"  :dataSource="objects"  bordered rowKey="id" :pagination="pagination" @change="table_filter_sort" :scroll="{x:'max-content'}">
        <span slot-scope="text,record" slot="order_code">
          <router-link :to="{ name: 'StockoutOne', params: {order_id: record.id} }">
              {{ record.order_code }}
          </router-link>
        </span>
        <span slot-scope="text,record" slot="partner_code">
          <span>{{ record.partner_name || record.partner_code }}</span>
        </span>
        <span slot-scope="text,record" slot="is_passback">
          <span>{{ translate('stockout_is_passback', record.is_passback) }}</span>
        </span>
        <span slot-scope="text,record" slot="xtype">
          <span>{{ translate('stockout_xtype', record.xtype) }}</span>
        </span>
        <span slot-scope="text,record" slot="order_type">
          <span>{{ translate('stockout_order_type', record.order_type) }}</span>
        </span>
        <span slot-scope="text,record" slot="state">
          <span>{{ translate('stockout_state', record.state) }}</span>
        </span>
        <span slot-scope="text,record" slot="state_alloc">
          <span>{{ translate('stockout_state_alloc', record.state_alloc) }}</span>
        </span>
        <span slot-scope="text,record" slot="state_pick">
          <span>{{ translate('stockout_state_pick', record.state_pick) }}</span>
        </span>
        <span slot-scope="text,record" slot="state_ship">
          <span>{{ translate('stockout_state_ship', record.state_ship) }}</span>
        </span>
        <span slot-scope="text,record,index" slot="action">
<!--             <a-popconfirm
              title="确定要自动分配吗?"
              @confirm="do_quick_alloc_confirm(index,record)"
              okText="确定"
              cancelText="取消"
            >
              <a-button v-if="record.state_alloc!='done'" style="margin-right:10px">自动分配</a-button>
            </a-popconfirm>
            <a-button @click="do_alloc(index, record)" v-if="record.state_alloc!='done'" style="margin-right:10px">手动分配</a-button>
            <a-button @click="do_quick_pick(index, record)" v-if="record.state_pick!='done' && record.state_alloc=='done'" style="margin-right:10px">快速拣货</a-button>-->
            <a-button @click="order_detail(index, record)" style="margin-right:10px">明细</a-button>
            <a-button type="danger" @click="ship_dlg(index, record)" v-if="record.state_pick!='no' && record.state!='done'" style="margin-right:10px">发运</a-button>
            <a-button @click="export_excel(index, record)" style="margin-right:10px">导出</a-button>
        </span>
      </a-table>
  </div>
</template>

<script type="text/javascript" src="<%= BASE_URL %>static/jquery.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/jquery.barcode.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/jquery.print.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/utils.js"></script>
<script>
export default {
  name: 'StockoutShip',
  data () {
    return {
      partners: [], 

      order_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id)}, 
        {title: '单号', key: 'order_code', dataIndex: 'order_code',
          scopedSlots: { customRender: 'order_code'},
        }, 
        //{title: '类型', key: 'xtype', dataIndex: 'xtype', scopedSlots: { customRender: 'xtype' }, filters:this.$store.options['stockout_xtype']},
        {title: '类型', key: 'order_type', dataIndex: 'order_type', scopedSlots: { customRender: 'order_type' }, },
        {title: '状态', key: 'state', dataIndex: 'state', scopedSlots: { customRender: 'state' },},
        {title: '客户', key: 'partner_code', dataIndex: 'partner_code', scopedSlots: {customRender: 'partner_code'}}, 
        {title: '分配', key: 'state_alloc', dataIndex: 'state_alloc', scopedSlots: { customRender: 'state_alloc' }, },
        {title: '拣货', key: 'state_pick', dataIndex: 'state_pick', scopedSlots: { customRender: 'state_pick' },},
        //{title: '发运', key: 'state_ship', dataIndex: 'state_ship', scopedSlots: { customRender: 'state_ship' }, filters:this.$store.options['stockout_state_ship']},
        //{title: '回传', key: 'is_passback', dataIndex: 'is_passback', scopedSlots: { customRender: 'is_passback' }, },
        {title: '创建时间', key: 'create_time', dataIndex: 'create_time', sorter: (a, b)=>(a.create_time>b.create_time),
        },
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' },}
      ],
      line_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', }, 
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '货品名', key: 'name', dataIndex: 'name'}, 
        {title: '预期数量', key: 'qty', dataIndex: 'qty'}, 
        {title: '已分配数', key: 'qty_alloc', dataIndex: 'qty_alloc'}, 
        {title: '已拣货数', key: 'qty_pick', dataIndex: 'qty_pick',  }, 
        {title: '已发运数', key: 'qty_ship', dataIndex: 'qty_ship', }, 
      ],
      inv_line_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id',  rowClassName: 'no-print'}, 
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '货品名', key: 'name', dataIndex: 'name'}, 
        {title: '数量', key: 'qty_able', dataIndex: 'qty_able'}, 
        //{title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code', }, 
        {title: '质量类型', key: 'quality_type', dataIndex: 'quality_type', rowClassName: 'no-print'}, 
        {title: '生产日期', key: 'product_date', dataIndex: 'product_date', rowClassName: 'no-print'}, 
        {title: '过期日期', key: 'expire_date', dataIndex: 'expire_date', rowClassName: 'no-print'}, 
        {title: '批次号', key: 'batch_code', dataIndex: 'batch_code', rowClassName: 'no-print'},
        {title: '单位', key: 'unit', dataIndex: 'unit', }
      ],
      ship_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', }, 
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '货品名', key: 'name', dataIndex: 'name'}, 
        {title: '单位', key: 'unit', dataIndex: 'unit'}, 
        {title: '发运数量', key: 'qty', dataIndex: 'qty'}, 
        {title: '发运时间', key: 'create_time', dataIndex: 'create_time',  }, 
        {title: '操作人', key: 'user_code', dataIndex: 'user_code', }, 
      ],

      objects: [],
      order: {sender_info:{}, receiver_info: {}},
      lines: [],
      order_ships: [],

      has_manager_perm:false,
      dlg_detail: false,
      dlg_ship: false,
      dlg_scan_ship:false,

      // 扫单发运
      has_can_ship_order: false,
      inv_lines:[],
      erp_order_code: '',

      filter: {},
      query: {},
      like_filters: ['partner_code'],
      partner_code_filter_icon: false,
      sort: null,
      create_time_filter_icon:false,
      erp_order_code_filter_icon:false,
      order_code_filter_icon:false,

      current_page: 1,
      page_size: null,
      total_page: null,
      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},
    }
  },
  methods:{
    // 打印发运单
    print_lines(){
      // 增加条形码
      $(".barcode").barcode(this.order.erp_order_code, 'code128', {barWidth: 2, barHeight: 80})
      $('.print').print({
              globalStyles: false,
              mediaPrint: true,
              stylesheet: '/static/print.css',
              noPrintSelector: ".no-print",
              iframe: true,
              append: null,
              prepend: null,
              manuallyCopyFormValues: true,
              deferred: $.Deferred(),
              timeout: 750,
              title: '发运单: '+this.order.erp_order_code,
              doctype: '<!doctype html>'
      })
    },
    print_lines2(){
      // 增加条形码
      $(".barcode2").barcode(this.erp_order_code, 'code128', {barWidth: 2, barHeight: 80})
      $('.print2').print({
              globalStyles: false,
              mediaPrint: true,
              stylesheet: '/static/print.css',
              noPrintSelector: ".no-print",
              iframe: true,
              append: null,
              prepend: null,
              manuallyCopyFormValues: true,
              deferred: $.Deferred(),
              timeout: 750,
              title: '发运单',
              doctype: '<!doctype html>'
      })
    },

    // 导出出库单
    export_excel(index, order){
      var env = this
      var q = {filters: [{name: 'order_code', op: '==', val: order.order_code}]}

      var data = {
          name: '出库单导出.xlsx', 
          xtype: 'export', 
          code: 'export_stockout', 
          func: 'blueprints.auth.tasks.export_stockout:export_stockout', 
          func_name: '出库单导出'}

      this.$http.post('/async/table_export?q='+JSON.stringify(q), data).then(function(resp){
        if(resp.data.status=='success'){
          if (env.$store.owner_conf && env.$store.owner_conf.is_sync_downfile){
            window.open('/async/download/'+resp.data.data.id, "_blank")
          }
          env.$message.success('导出任务创建成功，请到 "数据管理>导入导出" 中查看')
        }else{
          env.$message.error('导出任务创建失败: '+resp.data.msg)
        }
      })
    },
    
    // 扫单发运
    scan_ship_dlg(){
      this.dlg_scan_ship = true
      this.has_can_ship_order = false
      this.inv_lines = []
      $('.barcode2').html('')

      function bf(){
        $('#c_ol_barcode').focus()
      }
      setTimeout(bf, 1);
    },
    // 扫单回车
    enter_barcode(event){
      var env = this
      // load 可发运的PICK库存行
      if (!this.erp_order_code){
        env.$message.error("请扫描出库单号")
        playErr()
        return 
      }
      this.$http.get('/stockout/ship?erp_order_code='+this.erp_order_code).then(function(resp){
        env.inv_lines = resp.data
        if(resp.data.length==0){
          env.$message.error("找不到单子或该单子不可以发运")
          playErr()
        }else{
          env.$message.success("找到单子，可以发运；可以点击明细查看可以发运的货品明细")
          env.has_can_ship_order = true
          playOk()
        }
      })
    },

    // 查询是否存在单子
    query_ship(){
      var env = this
      // load 可发运的PICK库存行
      if (!this.erp_order_code){
        env.$message.error("请扫描出库单号")
        return 
      }
      this.$http.get('/stockout/ship?erp_order_code='+this.erp_order_code).then(function(resp){
        env.inv_lines = resp.data
        if(resp.data.length==0){
          env.$message.error("找不到单子或该单子不可以发运")
        }else{
          env.$message.success("找到单子，可以发运；可以点击明细查看可以发运的货品明细")
          env.has_can_ship_order = true
        }
      })
    },
    // 发运交接
    ship_dlg(index, order){
      var env = this
      this.dlg_ship = true
      this.order = order
      // 清空
      this.inv_lines = []
      // load 可发运的PICK库存行
      this.$http.get('/stockout/ship/'+this.order.id).then(function(resp){
        env.inv_lines = resp.data
      })
    },
    // 确定发运
    do_ship(erp_order_code){
      var env = this
      this.$http.post('/stockout/ship', {'erp_order_code': erp_order_code}).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success("发运交接成功")
          env.dlg_ship = false
          env.dlg_scan_ship = false
          env.search()
        }else{
          env.$message.error("发运交接失败: "+resp.data.msg)
        }
      })
    },

    order_detail(index, order){
      var env = this
      this.order = order
      // load order lines
      this.$http.get('/stockout/alloc/'+order.id).then(function(resp){
        env.lines = resp.data.lines
        env.order.price = resp.data.order.price
      })
      // load order ships
      var q = {
          filters:[{name: 'xtype', op: '==', val: 'ship'}], 
          group_by: [{direction: 'desc', field: 'id'}]
        }
      this.$http.get('/stockout/trans/'+order.id+'?q='+JSON.stringify(q)).then(function(resp){
        for(var i=0;i<resp.data.objects.length;i++){
          var o = resp.data.objects[i]
          o.sku = o['order_line'].sku
          o.barcode = o['order_line'].barcode
          o.name = o['order_line'].name
          o.unit = o['order_line'].unit
        }
        env.order_ships = resp.data.objects
      })
      env.dlg_detail = true
      $('.barcode').html('')
      $('.barcode2').html('')
    },

    // 导入出库单
    import_stockout(){

    },


    // 供应商推荐
    handle_search_partner(val){
      var env = this
      var q = {filters:[{name: 'xtype', op:'ilike', val: 'client'}]}
      if(val){
        q = {filters:[{name: 'xtype', op:'ilike', val: 'client'}, {or: [{name: 'name', op:'ilike', val: val}, {name:'code', op: 'ilike', val: val}]}]}
      }
      this.$http.get('/warehouse/partner?q='+JSON.stringify(q)).then(function(resp){
          env.partners = resp.data.objects
      })
    },
    //end

    // 排序
    orderSort(prop){
      // order prop
      var direction = 'desc'
      var sort = null
      if(prop.prop){
        if(prop.order == "ascending"){
          direction = "asc"
        }
        sort = {field: prop.prop, direction: direction}
      }
      this.sort = sort
      var filters = this.fetch_filter()
      this.load_objects(filters, sort)
    },

    table_filter_sort(pagination, filters, sorter) {
      // var filters = this.fetch_filter()
      var fs = this.fetch_filter(filters)
      if (sorter.field){
        sorter.direction = sorter.order == 'ascend'? 'asc' : 'desc';
      }else{
        sorter = false
      }
      this.pagination = pagination
      this.sort = sorter
      if(this.owner_conf.is_enable_search_bar){
        this.search_query()
      }else{
        this.load_objects(fs, sorter)
      }
    },

    // 格式化，翻译
    translate(key, val){
      if (this.$store.config[key]){
        return this.$store.config[key][val] || val
      }
      return val
    },

    // 搜索
    fetch_filter(filters){
      var flist = [], fs = this.filter;
      var like_filters = this.like_filters || []
      filters = filters || {}
      for(var f1 in filters){
        this.filter[f1] = filters[f1]
      }
      for(var f in fs){
        if(f == 'create_time1' && fs[f]){
          var create_time1 = new Date(fs[f])
          flist.push({name: 'create_time', op:'>=', val: create_time1.format('yyyy-MM-dd')})
        }else if(f == 'create_time2' && fs[f]){
          var create_time2 = new Date(fs[f])
          flist.push({name: 'create_time', op:'<', val: create_time2.addDate(1).format('yyyy-MM-dd')})
        }else if(fs[f] && fs[f] instanceof Array){
          if(fs[f].length>1){
            flist.push({name: f, op: 'in', val: fs[f]})
          }else if(fs[f].length==1){
            if(like_filters.indexOf(f) > -1){
              flist.push({name: f, op: 'like', val: fs[f][0]})
            }else{
              flist.push({name: f, op: '==', val: fs[f][0]})
            }
          }
        }else if(fs[f]){
          if(like_filters.indexOf(f) > -1){
            flist.push({name: f, op: 'like', val: fs[f]})
          }else{
            flist.push({name: f, op: '==', val: fs[f]})
          }
        }
      }
      return flist
    },
    search(){
      var filters = this.fetch_filter()
      this.load_objects(filters, null) // this.sort
    },
    search_query(){
      var env = this
      var filters = []
      for(var q in this.query){
        var v = this.query[q]
        if(q == 'create_time1' && v){
          var create_time1 = new Date(v)
          filters.push({name: 'create_time', op:'>=', val: create_time1.format('yyyy-MM-dd')})
        }else if(q == 'create_time2' && v){
          var create_time2 = new Date(v)
          filters.push({name: 'create_time', op:'<', val: create_time2.addDate(1).format('yyyy-MM-dd')})
        }else if(this.like_filters.indexOf(q) > -1 && v){
          filters.push({name: q, op: 'ilike', val:v})
        }else if(v){
          filters.push({name: q, op: '==', val:v})
        }
      }
      this.load_objects(filters, this.sort)
    },
    // 加载过滤选项
    load_choice(){
      this.options = this.$store.options
    },

    // load data
    load_objects(filters, sort){
      var env = this
      var q = {}
      if (filters){
        q.filters = filters
      }
      if (sort){
        q.order_by = [sort]
      }

      q.page = this.pagination.current
      q.per_page = this.pagination.pageSize
      
      env.$http.get('/stockout/stockout?q='+JSON.stringify(q)).then(function(resp){
        env.objects = resp.data.objects

        env.total_page = resp.data.total_pages
        env.current_page = resp.data.page
        env.page_size = resp.data.per_page
        env.pagination.total = resp.data.num_results
        env.pagination.current = resp.data.page
        env.pagination.pageSize = resp.data.per_page
      })
    },
    // end
  },
  // before render
  created:function() {
    var env = this
    this.owner_conf = this.$store.owner_conf || {}
    // load objects
    this.load_objects()
  },
  // after render
  mounted: function(){
    
    this.load_choice()
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.w135{width: 135px;}
.print{display: none;}
.print2{display: none;}
</style>
