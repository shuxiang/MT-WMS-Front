<template>
  <div>

    <div>
        <a-breadcrumb style="padding:20px 20px 20px 0px;">
          <a-breadcrumb-item >出库作业</a-breadcrumb-item>
          <a-breadcrumb-item title="扫货品条码，输入货品数量进行拣货">扫条码出库</a-breadcrumb-item>
        </a-breadcrumb>
    </div>

      <a-modal title="扫货品条码出库" :visible="dlg_scan" width="1000px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_scan=false">
        <a-input :allowClear="true" v-model="current_barcode" id="current_barcode" @pressEnter="add_barcode" placeholder="请输入条码/物料号" style="margin-bottom:10px;width:400px;" />
        <a-table bordered :dataSource="lines" :columns="barcode_columns" :pagination="false" rowKey="id">
        </a-table>
        <div class="dialog-footer">
          <a-button type="primary"  @click="do_check_pick()" style="float:right;margin-right:20px;">确定出库</a-button>
        </div>
      </a-modal>


      <a-modal title="扫RFID/二维码出库" :visible="dlg_scan_rfid" width="1000px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_scan_rfid=false">
        <a-modal width="800px"  :title="rfid_title" :visible="dlg_rfid_list" :footer="null" @cancel="dlg_rfid_list=false">
          <a-input :allowClear="true" v-model="current_rfid" id="current_rfid" @pressEnter="add_rfid" placeholder="请输入RFID或二维码" style="margin-bottom:10px;width:400px;" />
          <a-button type="primary" @click="add_rfid" style="float:right;" >添加</a-button>
          <a-button type="primary" @click="del_rfid_specify" style="float:right;margin-right:10px;" >删除</a-button>
          <a-table :dataSource="rfid_line.rfid_list" :columns="rfid_list_columns" rowKey="rfid" bordered :pagination="false">
            <span slot="rfid" slot-scope="text,record">
              <span>{{ record.rfid }}</span>
            </span>
            <span slot="action" slot-scope="text,record,index">
              <a-button type="primary" @click="del_rfid(index,record)" >删除</a-button>
            </span>
          </a-table>
        </a-modal>
        <a-input :allowClear="true" v-model="current_rfid2" id="current_rfid2" @pressEnter="add_rfid2" placeholder="请输入RFID或二维码" style="margin-bottom:10px;width:400px;" />
        <a-table bordered :dataSource="lines" :columns="rfid_columns" :pagination="false" rowKey="id">
          <span slot="action" slot-scope="text,record,index">
            <a-button type="primary" @click="scan_rfid(index,record)">扫RFID</a-button>
          </span>
        </a-table>
        <div class="dialog-footer">
          <a-button @click="do_putout_rfid()" style="float:right;" type="primary">确定出库</a-button>
          <a-button @click="dlg_scan_rfid=false" style="float:right;margin-right:20px;">取消</a-button>
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
            <!--<a-button @click="scan_dlg_rfid(index, record)"  v-if="record.state_pick!='done' && (record.state_alloc=='done' || record.state_alloc=='part')" style="margin-right:10px;">扫RFID/二维码</a-button>-->
            <a-button type="danger" @click="scan_dlg(index, record)"  v-if="record.state_pick!='done' && (record.state_alloc=='done' || record.state_alloc=='part')" style="margin-right:10px;">扫条码</a-button>
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
  name: 'StockoutScanBarcode',
  data () {
    return {
      partners: [],

      order_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id)}, 
        {title: '单号', key: 'order_code', dataIndex: 'order_code',
          scopedSlots: {customRender: 'order_code'},
        }, 
        //{title: '类型', key: 'xtype', dataIndex: 'xtype', scopedSlots: { customRender: 'xtype' }, filters:this.$store.options['stockout_xtype']},
        {title: '类型', key: 'order_type', dataIndex: 'order_type', scopedSlots: { customRender: 'order_type' }, },
        {title: '状态', key: 'state', dataIndex: 'state', scopedSlots: { customRender: 'state' }, },
        {title: '客户', key: 'partner_code', dataIndex: 'partner_code', scopedSlots: {customRender: 'partner_code'}}, 
        {title: '分配', key: 'state_alloc', dataIndex: 'state_alloc', scopedSlots: { customRender: 'state_alloc' },},
        {title: '拣货', key: 'state_pick', dataIndex: 'state_pick', scopedSlots: { customRender: 'state_pick' },},
        //{title: '发运', key: 'state_ship', dataIndex: 'state_ship', scopedSlots: { customRender: 'state_ship' }, filters:this.$store.options['stockout_state_ship']},
        //{title: '回传', key: 'is_passback', dataIndex: 'is_passback', scopedSlots: { customRender: 'is_passback' }, },
        {title: '创建时间', key: 'create_time', dataIndex: 'create_time', sorter: (a, b)=>(a.create_time>b.create_time),
        },
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' },}
      ],
      rfid_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '名称', key: 'name', dataIndex: 'name'}, 
        {title: '分配数', key: 'qty_alloc', dataIndex: 'qty_alloc'}, 
        {title: '已出数', key: 'qty_pick', dataIndex: 'qty_pick'}, 
        {title: 'RFID数', key: 'qty_rfid', dataIndex: 'qty_rfid', scopedSlots: { customRender: 'qty_rfid' }}, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: {customRender: 'action'}},
      ],
      rfid_list_columns: [
        {title: 'RFID', key: 'rfid', dataIndex: 'rfid'}, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: {customRender: 'action'}},
      ],
      barcode_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '名称', key: 'name', dataIndex: 'name'}, 
        {title: '分配数', key: 'qty_alloc', dataIndex: 'qty_alloc'}, 
        {title: '已出数', key: 'qty_pick', dataIndex: 'qty_pick'}, 
        {title: '条码数', key: 'qty_barcode', dataIndex: 'qty_barcode', scopedSlots: { customRender: 'qty_barcode' }}, 
      ],

      objects: [],
      order: {sender_info:{}, receiver_info: {}},
      current_rfid: '',
      current_rfid2: '',
      current_barcode: '',
      rfid_title: 'RFID明细',

      has_manager_perm:false,
      dlg_scan: false,
      dlg_scan_rfid:false,
      dlg_rfid_list: false,

      // 扫ｒｆｉｄ出库
      lines: [],
      rfid_line: {},

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

    // rfid =============
    do_putout_rfid(){
      var env = this, data = []

      for(var i=0;i<this.lines.length;i++){
        var line = this.lines[i]
        if(line.qty_rfid>0){
          data.push({rfid_list: line.rfid_list2, barcode:line.barcode, qty:line.rfid_list2.length, line_id:line.id})
        }
      }
      this.$http.post('/stockout/check_pick/rfid/'+this.order.id, {lines: data,}).then(function(resp){
        if(resp.data.status=='success'){
          env.dlg_scan_rfid = false
          env.$message.success('出库成功')
        }else{
          env.$message.error(resp.data.msg)
        }
      })
    },
    scan_dlg_rfid(index, order){
      this.dlg_scan_rfid = true
      this.order = order

      function bf(){
        $('#current_rfid2').focus()
      }
      setTimeout(bf, 1);

      var env = this
      if(order.state_pick=='done'){
        env.$message.warning('该单已经发货完成，不能再出库！')
        return
      }else if(!(order.state_alloc=='done' || order.state_alloc=='part')){
        env.$message.warning('该单尚未分配库存，不能出库！')
        return
      }
      // load order aloc lines
      this.$http.get('/stockout/'+order.id+'/line').then(function(resp){
        var exp_lines = []
        for(var i=0; i < resp.data.lines.length; i++){
          var line = resp.data.lines[i]
          line.rfid_list = []
          line.rfid_list2 = []
          line.qty_expect = line.qty_alloc - line.qty_pick
          line.qty_rfid = 0
          if(line.qty_expect > 0){
            exp_lines.push(line)
          }
        }
        // 赋值后，对对象进行修改，可能会导致数据无法正常绑定的问题; 所以，先对数据进行修改，在赋值给环境
        env.lines = exp_lines
        env.order = resp.data
      })
    },
    scan_rfid(index, rfid_line){
      this.dlg_rfid_list = true
      this.rfid_line = rfid_line
      this.current_rfid = ''
      this.rfid_title = rfid_line.sku+ ' ' + rfid_line.name + ' 预出数: '+rfid_line.qty_expect + ' 当前RFID数: '+rfid_line.rfid_list2.length

      function bf(){
        $('#current_rfid').focus()
      }
      setTimeout(bf, 1);
    },
    del_rfid(index, rfid){
      this.rfid_line.rfid_list.splice(index, 1)
      this.rfid_line.rfid_list2.splice(index, 1)
      this.rfid_line.qty_rfid = this.rfid_line.rfid_list2.length
    },
    del_rfid_specify(){
      var index = this.rfid_line.rfid_list2.indexOf(this.current_rfid)
      if(index >= 0){
        this.rfid_line.rfid_list2.splice(index, 1)
        this.rfid_line.rfid_list.splice(index, 1)
        this.rfid_line.qty_rfid = this.rfid_line.rfid_list2.length
      }
    },
    add_rfid(){
      if(this.rfid_line.rfid_list2.length >= this.rfid_line.qty_expect){
        this.$message.warning('RFID数量已经等于预出数量！')
        playErr()
      }
      else if(this.current_rfid && this.rfid_line.rfid_list2.indexOf(this.current_rfid) < 0){
        this.rfid_line.rfid_list.push({rfid:this.current_rfid})
        this.rfid_line.rfid_list2.push(this.current_rfid)
        this.rfid_line.qty_rfid = this.rfid_line.rfid_list2.length
        this.current_rfid = ''
        playOk()
      }
    },
    add_rfid2(){
      var env = this
      if(this.current_rfid2==''){
        playErr()
        return
      }
      this.$http.get('/inv/rfid?rfid='+this.current_rfid2).then(function(resp){
        var ok = false
        if(resp.data.status=='success'){
          var rfid = resp.data.data
          for(var i=0;i<env.lines.length;i++){
            if(env.lines[i].barcode==rfid.barcode){
              // console.log(env.lines[i])
              env.rfid_line = env.lines[i]
              env.current_rfid = env.current_rfid2
              env.add_rfid()
              ok = true
              env.current_rfid2 = ''
              env.$message.success('OK')
              playOk()
            }
          }

        }
        if (!ok){
          env.$message.error('未找到该RFID/二维码')
          env.current_rfid2 = ''
          playErr()
        }
      })
    },
    // end rfid =============

    // barcode ==============
    scan_dlg(index, order){
      this.dlg_scan = true
      this.order = order
      function bf(){
        $('#current_barcode').focus()
      }
      setTimeout(bf, 1);

      var env = this
      if(order.state_pick=='done'){
        env.$message.warning('该单已经发货完成，不能再出库！')
        return
      }else if(!(order.state_alloc=='done' || order.state_alloc=='part')){
        env.$message.warning('该单尚未分配库存，不能出库！')
        return
      }
      // load order aloc lines
      this.$http.get('/stockout/'+order.id+'/line').then(function(resp){
        var exp_lines = []
        for(var i=0; i < resp.data.lines.length; i++){
          var line = resp.data.lines[i]
          line.qty_expect = line.qty_alloc - line.qty_pick
          line.qty_barcode = 0
          if(line.qty_expect > 0){
            exp_lines.push(line)
          }
        }
        // 赋值后，对对象进行修改，可能会导致数据无法正常绑定的问题; 所以，先对数据进行修改，在赋值给环境
        env.lines = exp_lines
        env.order = resp.data
      })
    },
    // 扫码动作
    add_barcode(){
      var env = this
      for(var i=0;i<env.lines.length;i++){
        var line = env.lines[i]
        if (line.barcode!=env.current_barcode){
          continue
        }
        if(line.qty_barcode>=line.qty_expect){
          env.$message.error('该货品出库数量已经足额!')
          playErr()
          return
        }else{
          line.qty_barcode += 1
          env.current_barcode = ''
          playOk()
          return
        }
      }
      env.$message.warning('该货品不属于这个订单')
      playErr()
    },
    // 扫码入库
    do_check_pick(){
      var env = this
      var xlines = []
      // 保存到后端
      var xlines = []
      var data = {erp_order_code: this.order.erp_order_code, lines: xlines}
      for(var i=0;i<this.lines.length;i++){
        // // {barcode, location:None, qty, rfid_list}
        var line = this.lines[i]
        if(line.qty_barcode > 0){
          xlines.push({barcode:line.barcode, qty:line.qty_barcode})
        }
      }
      this.$http.post('/stockout/check_pick', data).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('出库成功')
          // reload objects
          env.dlg_scan = false
          env.load_objects()
        }else{
          env.$message.error(resp.data.msg)
        }
      })
    },
    // end barcode ==============

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
    // common ============
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
    // end common ============

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
</style>
