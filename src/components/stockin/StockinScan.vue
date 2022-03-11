<template>
  <div>
    <div>
        <a-breadcrumb style="padding:20px 20px 20px 0px;">
          <a-breadcrumb-item >入库作业</a-breadcrumb-item>
          <a-breadcrumb-item title="使用扫码入库，扫取货品条码，填写收货数量，默认收入·STAGE·库位，确认入库后，直接增加库存记录">扫条码入库</a-breadcrumb-item>
        </a-breadcrumb>
    </div>


      <a-modal title="订单行入库" :visible="dlg_putin" width="1000px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_putin=false">
        <a-table bordered :dataSource="lines" :columns="putin_columns" :pagination="false" rowKey="id">
          <span slot="qty_receive" slot-scope="text,record">
            <a-input :allowClear="true" placeholder="输入数量" v-model="record.qty_receive" style="width:80px;"/>
          </span>
          <span slot="location" slot-scope="text,record">
            <a-auto-complete placeholder="库位码" @focus="fetch_locations(record)" @select="select_location" optionLabelProp="value" :defaultValue="record.location_code || 'STAGE'">
              <template slot="dataSource">
                  <a-select-option v-for="item in locations" :key="item.value">
                    <strong>{{item.value}} </strong><span class="certain-search-item-count"> 库存{{ item.qty }}, 总库存{{item.qty_total}}</span>
                  </a-select-option>
              </template>
            </a-auto-complete>
          </span>
          <span slot="lpn" slot-scope="text,record">
            <a-input :allowClear="true" placeholder="可不填" v-model="record.lpn" style="width:80px;"/>
          </span>
        </a-table>
        <div class="dialog-footer">
          <a-button @click="do_putin()" style="float:right;" type="primary">确定入库</a-button>
          <a-button @click="dlg_putin=false" style="float:right;margin-right:20px;">取消</a-button>
        </div>
      </a-modal>

      <a-modal title="入库单明细" :visible="dlg_detail" @cancel="dlg_detail=false" width="1200px" :footer="null">
        <a-tabs defaultActiveKey="1" @change="load_order_trans">
          <a-tab-pane tab="订单行明细" key="1">
            <a-table bordered :dataSource="lines" :columns="line_columns" :pagination="false" rowKey="id">
              <span slot-scope="text,record" slot="qty_not">
                <span>{{ record.qty - record.qty_real }}</span>
              </span>
            </a-table>
            <div class="print">
              <table border="0" cellspacing="0">
                <thead>
                  <tr><td style="text-align:center;font-size:30px;margin-bottom:20px;" colspan="3" class="nb">入库单</td></tr>
                  <tr>
                    <td class="nb mr-20">
                      供应商名称电话: 
                      <span>{{ partner.name }}</span> 
                      <span>{{ partner.tel || partner.phone }}</span> 
                      <span>{{ partner.company_name }}</span></td>
                    <td class="nb">No: {{ order.order_code }}</td>
                    <td class="nb">业务日期: {{ date_fmt(order.create_time) }}</td>
                  </tr>
                </thead>
              </table>
              <table border="1" cellspacing="0">
                <thead>
                  <tr>
                    <td>货品码</td>
                    <td>名称</td>
                    <td>数量</td>
                    <td>单位</td>
                    <td>单价</td>
                    <td>金额</td>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in lines" v-bind:key="item.id">
                    <td>{{ item.sku }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.qty }}</td>
                    <td>{{ item.unit }}</td>
                    <td>¥{{ mfmt(item.price) }}</td>
                    <td>¥{{ mfmt(item.price*item.qty) }}</td>
                    <!--
                    <td>{{ item.qty_real }}</td>
                    <td>{{ item.qty - item.qty_real }}</td>
                    -->
                  </tr>
                  <tr><td colspan="6">是否付款: {{ pay_state }}</td>
                  </tr>
                  <tr><td colspan="6">备注: {{ order.remark }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="dialog-footer">
              <a-button @click="print_lines()" style="float:right;">打印</a-button>
            </div>
          </a-tab-pane>
          <a-tab-pane tab="入库记录" key="2" forceRender>
            <a-table bordered :dataSource="trans" :columns="trans_columns" rowKey="id">
            </a-table>
            <div class="print2">
              <div class="barcode2"></div>
              <table border="1" cellspacing="0">
                <thead>
                  <tr>
                    <td>货品码</td>
                    <td>条码</td>
                    <td>名称</td>
                    <td>预期数</td>
                    <td>已收数</td>
                    <td>库位</td>
                    <td>容器</td>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in trans" v-bind:key="item.id">
                    <td>{{ item.sku }}</td>
                    <td>{{ item.barcode }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.qty }}</td>
                    <td>{{ item.qty_real }}</td>
                    <td>{{ item.location_code }}</td>
                    <td>{{ item.lpn }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="dialog-footer">
              <a-button @click="print_inlines()" style="float:right;">打印入库记录</a-button>
            </div>
          </a-tab-pane>
          <a-tab-pane tab="订单信息" key="3">
            <a-list bordered >
              <a-list-item>
                <label class="input-label">发货人姓名</label>
                <a-input :allowClear="true" v-model="order.sender_info.name" :disabled="order.state!='create'" style="width:800px;"></a-input>
              </a-list-item>
              <a-list-item>
                <label class="input-label">发货人电话</label>
                <a-input :allowClear="true" v-model="order.sender_info.tel" :disabled="order.state!='create'" style="width:800px;"></a-input>
              </a-list-item>
              <a-list-item>
                <label class="input-label">发货人地址</label>
                <a-input :allowClear="true" v-model="order.sender_info.address" :disabled="order.state!='create'" style="width:800px;"></a-input>
              </a-list-item>
              <a-list-item>
                <label class="input-label">收货人姓名</label>
                <a-input :allowClear="true" v-model="order.receiver_info.name" :disabled="order.state!='create'" style="width:800px;"></a-input>
              </a-list-item>
              <a-list-item>
                <label class="input-label">收货人电话</label>
                <a-input :allowClear="true" v-model="order.receiver_info.tel" :disabled="order.state!='create'" style="width:800px;"></a-input>
              </a-list-item>
              <a-list-item>
                <label class="input-label">收货人地址</label>
                <a-input :allowClear="true" v-model="order.receiver_info.address" :disabled="order.state!='create'" style="width:800px;"></a-input>
              </a-list-item>
              <a-list-item>
                <label class="input-label">计划时间</label>
                <a-date-picker v-model="order.date_planned2" :disabled="order.state!='create'" style="width:160px;"></a-date-picker>
              </a-list-item>
              <a-list-item>
                <label class="input-label">备注</label>
                <a-input :allowClear="true" v-model="order.remark" :disabled="order.state!='create'" style="width:800px;"></a-input>
              </a-list-item>
            </a-list>
            <a-button type="primary" @click="update_order_info()" style="float:right;margin-top:10px;" v-if="order.state=='create'">更新订单信息</a-button>
          </a-tab-pane>
        </a-tabs>
      </a-modal>

      <a-modal title="扫码入库" :visible="dlg_scan" width="1000px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_scan=false">
        <a-tabs  defaultActiveKey="first">
          <a-tab-pane tab="扫码" key="first" >
            <a-form :layout="'horizontal'">
              <a-form-item label="货品条码" :label-col="{span:4}" :wrapper-col="{span:14}">
                <a-input :allowClear="true" v-model="order_line.barcode" placeholder="必填, 请扫描货品条码" id="c_ol_barcode"  @pressEnter="enter_barcode"></a-input>
              </a-form-item>
              <a-form-item label="货品名称" :label-col="{span:4}" :wrapper-col="{span:14}">
                <span><strong>{{order_line.name}}</strong></span>
              </a-form-item>
              <a-form-item label="货品数量" :label-col="{span:4}" :wrapper-col="{span:14}">
                <a-input :allowClear="true" v-model="order_line.qty" ref="c_ol_qty" id="c_ol_qty"  placeholder="必填，必须大于0"></a-input>
              </a-form-item>
              <!-- <a-form-item label="收货库位" :label-col="{span:4}" :wrapper-col="{span:14}">
                <a-input :allowClear="true" v-model="order_line.location" placeholder="必填，请扫描库位条码"></a-input>
              </a-form-item> -->
              <a-form-item label="收货库位" :label-col="{span:4}" :wrapper-col="{span:14}">
                <a-auto-complete placeholder="库位码" @focus="fetch_locations(order_line)" @select="select_location" optionLabelProp="value" v-model="order_line.location" :defaultValue="order_line.location_code || 'STAGE'">
                  <template slot="dataSource">
                      <a-select-option v-for="item in locations" :key="item.value">
                        <strong>{{item.value}} </strong><span class="certain-search-item-count"> 库存{{ item.qty }}, 总库存{{item.qty_total}}</span>
                      </a-select-option>
                  </template>
                </a-auto-complete>
              </a-form-item>
              <a-form-item label="收货容器" :label-col="{span:4}" :wrapper-col="{span:14}">
                <a-input :allowClear="true" v-model="order_line.lpn" placeholder="可不填"></a-input>
              </a-form-item>
            </a-form>
          </a-tab-pane>
          <a-tab-pane tab="明细" key="second">
            <a-table :dataSource="order_lines" :columns="scan_columns" rowKey="id" bordered :pagination="false">
            </a-table>
          </a-tab-pane>
        </a-tabs>
        <div class="dialog-footer">
          <a-button  @click="do_scan()" style="float:right;">下一个货品</a-button>
          <a-button type="primary"  @click="do_check_putin()" style="float:right;margin-right:20px;">提 交</a-button>
        </div>
      </a-modal>

      <a-form layout="inline" v-if="owner_conf.is_enable_search_bar" style="padding-left:15px;background-color:rgb(235,235,235);">
        <a-form-item label="单号" >
          <a-input :allowClear="true"  placeholder="单号" v-model="query.order_code" style="width:160px;"/>
        </a-form-item>
        <a-form-item label="供应商">
          <a-auto-complete placeholder="供应商" @focus="handle_search_partner()" optionLabelProp="value" :defaultValue="''" @change="handle_search_partner" :backfill="true" v-model="query.partner_code">
            <template slot="dataSource">
                <a-select-option v-for="item in partners" :key="item.code">
                  <strong>{{item.code}} </strong><span class="certain-search-item-count">{{item.name}} {{item.tel}}</span>
                </a-select-option>
            </template>
          </a-auto-complete>
        </a-form-item>
        <a-form-item label="类型">
          <a-select :defaultValue="query.xtype"  v-model="query.xtype" style="width:120px;">
            <a-select-option value="" v-bind:key="''">--所有--</a-select-option>
            <a-select-option :value="item.value" v-for="item in options.stockin_xtype" v-bind:key="item.value">{{item.label}}</a-select-option>
          </a-select> 
        </a-form-item>
        <a-form-item label="状态">
          <a-select :defaultValue="query.state"  v-model="query.state" style="width:120px;">
            <a-select-option value="" v-bind:key="''">--所有--</a-select-option>
            <a-select-option :value="item.value" v-for="item in options.stockin_state" v-bind:key="item.value">{{item.label}}</a-select-option>
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

      <a-table :columns="object_columns"  :dataSource="objects"  bordered rowKey="id" :pagination="pagination" @change="table_filter_sort" :scroll="{x:'max-content'}">
        <span slot-scope="text,record" slot="order_code">
          <router-link :to="{ name: 'StockinOne', params: {order_id: record.id} }">
              {{ record.order_code }}
          </router-link>
        </span>
        <span slot-scope="text,record" slot="partner_code">
          <span>{{ record.partner_name || record.partner_code }}</span>
        </span>
        <span slot-scope="text,record" slot="is_passback">
          <span>{{ translate('stockin_is_passback', record.is_passback) }}</span>
        </span>
        <span slot-scope="text,record" slot="xtype">
          <span>{{ translate('stockin_xtype', record.xtype) }}</span>
        </span>
        <span slot-scope="text,record" slot="order_type">
          <span>{{ translate('stockin_order_type', record.order_type) }}</span>
        </span>
        <span slot-scope="text,record" slot="state">
          <span>{{ translate('stockin_state', record.state) }}</span>
        </span>
        <span slot-scope="text,record,index" slot="action">
            <a-button type="danger" @click="scan_dlg(index, record)"  v-if="record.state=='create' || record.state=='part'" style="margin-right:10px">扫条码</a-button>
            <!-- <a-button @click="putin_dlg(index, record)" v-if="record.state=='create' || record.state=='part'" style="margin-right:10px">入库</a-button> -->
            <a-button @click="order_detail( index, record)" style="margin-right:10px" >明细</a-button>
            <a-button @click="export_excel( index, record)" style="margin-right:10px">导出</a-button>
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
  name: 'StockinScan',
  data () {
    return {
      partners: [],
      scan_columns:[
        {title: '货品条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '收货数量', key: 'qty', dataIndex: 'qty'}, 
        {title: '收货库位', key: 'location', dataIndex: 'location'}, 
        {title: '收货容器', key: 'lpn', dataIndex: 'lpn'}, 
      ],
      object_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id)}, 
        {title: '单号', key: 'order_code', dataIndex: 'order_code',
          scopedSlots: { customRender: 'order_code'},
        }, 
        {title: '类型', key: 'xtype', dataIndex: 'xtype', scopedSlots: { customRender: 'xtype' }, },
        {title: '状态', key: 'state', dataIndex: 'state', scopedSlots: { customRender: 'state' }, },
        {title: '供应商', key: 'partner_code', dataIndex: 'partner_code', scopedSlots: {customRender: 'partner_code'}}, 
        //{title: '回传', key: 'is_passback', dataIndex: 'is_passback', scopedSlots: { customRender: 'is_passback' }, },
        {title: '创建时间', key: 'create_time', dataIndex: 'create_time', 
          scopedSlots: {filterDropdown: 'create_time_filter_dropdown',filterIcon:"create_time_filter_icon"},
          onFilter: (value, record) => value,
        },
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' },}
      ],
      line_columns: [
        //{title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id), rowClassName: 'no-print'}, 
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '名称', key: 'name', dataIndex: 'name'}, 
        {title: '预期数', key: 'qty', dataIndex: 'qty'}, 
        {title: '已收数', key: 'qty_real', dataIndex: 'qty_real'}, 
        {title: '未收数', key: 'qty_not', dataIndex: 'qty_not', scopedSlots: { customRender: 'qty_not' }}, 
        //{title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code', }, 
        {title: '价格', key: 'price', dataIndex: 'price',}, 
        // {title: '质量类型', key: 'quality_type', dataIndex: 'quality_type', rowClassName: 'no-print'}, 
        // {title: '生产日期', key: 'product_date', dataIndex: 'product_date', rowClassName: 'no-print'}, 
        // {title: '过期日期', key: 'expire_date', dataIndex: 'expire_date', rowClassName: 'no-print'}, 
        // {title: '批次号', key: 'batch_code', dataIndex: 'batch_code', rowClassName: 'no-print'},
        {title: '单位', key: 'unit', dataIndex: 'unit', }
      ],
      putin_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '名称', key: 'name', dataIndex: 'name'}, 
        {title: '预期数', key: 'qty', dataIndex: 'qty'}, 
        {title: '已收数', key: 'qty_real', dataIndex: 'qty_real'}, 
        {title: '收取数', key: 'qty_receive', dataIndex: 'qty_receive', scopedSlots: { customRender: 'qty_receive' }}, 
        {title: '收取库位', key: 'location', dataIndex: 'location', scopedSlots: {customRender: 'location'}}, 
        {title: '收取容器', key: 'lpn', dataIndex: 'lpn', scopedSlots: {customRender: 'lpn'}}, 
      ],
      trans_columns: [
        //{title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id), }, 
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '名称', key: 'name', dataIndex: 'name'}, 
        {title: '预期数', key: 'qty', dataIndex: 'qty'}, 
        {title: '已收数', key: 'qty_real', dataIndex: 'qty_real'}, 
        {title: '库位', key: 'location_code', dataIndex: 'location_code',  }, 
        {title: '容器', key: 'lpn', dataIndex: 'lpn', }, 
        {title: '操作人', key: 'user_code', dataIndex: 'user_code',}, 
        {title: '操作时间', key: 'create_time', dataIndex: 'create_time', }, 
      ],

      objects: [],
      order: {sender_info:{}, receiver_info: {}},
      partner: {},
      pay_state: '',
      lines: [],
      trans: [],

      dlg_putin: false,
      dlg_scan: false,
      dlg_detail: false,
      putin_title: '入库',
      has_manager_perm:false,

      locations_dict: {},
      locations: [],

      // 扫单入库
      order_lines:[],
      order_line: {qty:1, location:'STAGE'},

      filter: {},
      query: {},
      like_filters: ['partner_code'],
      partner_code_filter_icon: false,
      sort: null,
      create_time_filter_icon:false,
      erp_order_code_filter_icon:false,
      order_code_filter_icon:false,

      current_page: 1,
      page_size:20,
      total_page:0,
      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},
    }
  },
  methods:{
    update_order_info(){
      var env = this
      this.order.date_planned = new Date(this.order.date_planned2).format('yyyy-MM-dd')
      this.$http.post('/stockin/stockin/info', this.order).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('更新成功')
          env.search()
        }else{
          env.$message.error('更新失败:'+resp.data.msg)
        }
        
      })
    },
    
    // 打印订单行
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
              title: '入库单: '+this.order.erp_order_code,
              doctype: '<!doctype html>'
      })
    },
    // 打印入库单入库记录
    print_inlines(){
      // 增加条形码
      $(".barcode2").barcode(this.order.erp_order_code, 'code128', {barWidth: 2, barHeight: 80})
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
              title: '入库记录: '+this.order.erp_order_code,
              doctype: '<!doctype html>'
      })
    },
    // 查询入库单行
    enter_barcode(event){
      var env = this
      // console.log(env.order_line)
      this.$http.post('/stockin/'+this.order.id+'/line', env.order_line).then(function(resp){
        if (resp.data.status=='success'){
          // console.log(resp.data)
          env.order_line.id = resp.data.data.id
          env.order_line.qty = resp.data.data.qty - resp.data.data.qty_real
          env.order_line.name = resp.data.data.name
          env.order_line.location = env.order_line.location_code = resp.data.data.location_code
          // 光标跳到数量填写
          $('#c_ol_qty').focus();
          playOk()
        }else{
          env.order_line.id = 0
          env.order_line.qty = 1
          env.order_line.name = '~~该订单没找到这个货品条码~~'
          playErr()
        }
      })

    },

    // 导出入库单
    export_excel(index, order){
      var env = this
      var q = {filters: [{name: 'order_code', op: '==', val: order.order_code}]}

      var data = {
          name: '入库单导出.xlsx', 
          xtype: 'export', 
          code: 'export_stockin', 
          func: 'blueprints.auth.tasks.export_stockin:export_stockin', 
          func_name: '入库单导出'}

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

    // 供应商推荐
    handle_search_partner(val){
      var env = this
      var q = {filters:[{name: 'xtype', op:'ilike', val: 'supplier'}]}
      if(val){
        q = {filters:[{name: 'xtype', op:'ilike', val: 'supplier'}, {or: [{name: 'name', op:'ilike', val: val}, {name:'code', op: 'ilike', val: val}]}]}
      }
      this.$http.get('/warehouse/partner?q='+JSON.stringify(q)).then(function(resp){
          env.partners = resp.data.objects
      })
    },
    //end

    // 新库位推荐
    fetch_locations(line){
      var env = this
      var lineid = line.id
      if(lineid <= 0){
        this.locations = []
        return
      }
      this.line = line
      if ((!env.locations_dict[lineid] || env.locations_dict[lineid].length == 0) && lineid){
        this.$http.get('/stockin/recommend/location/'+lineid).then(function(resp){
          env.locations_dict[lineid] = resp.data
          env.locations = resp.data
        })
      }
      this.locations = this.locations_dict[lineid]
    },
    select_location(val, option){
      // old
      // this.line.location = row.value
      return this.line.location = val
    },
    // end

    // 订单入库
    dlg_close(){
      this.dlg_putin = false
    },

    putin_dlg(index, order){
      var env = this
      if(!(order.state == 'create' || order.state == 'part')){
        env.$message.warning('该单已经收货完成，不能再收货！')
        return
      }
      this.dlg_putin = true
      this.order = order

      this.$http.get('/stockin/putin/'+order.id).then(function(resp){
        for(var i=0; i < resp.data.lines.length; i++){
          var line = resp.data.lines[i]
          line.qty_receive = (line.qty - line.qty_real)
          line.location = line.location_code || line.location || 'STAGE'
        }
        // 赋值后，对对象进行修改，可能会导致数据无法正常绑定的问题; 所以，先对数据进行修改，在赋值给环境
        env.lines = resp.data.lines
      })
    },

    // 扫单入库
    scan_dlg(index, order){
      this.dlg_scan = true
      this.order = order
      // 清空
      this.order_lines = []
      this.order_line = {qty:1, location:'STAGE'}
      function bf(){
        $('#c_ol_barcode').focus()
      }
      setTimeout(bf, 1);
    },
    // 暂时保存当前扫的货品
    do_scan(){
      var env = this
      if(this.order_line.qty*1 > 0 && this.order_line.barcode && this.order_line.location && this.order_line.name !="~~该订单没找到这个货品条码~~"){
          this.order_lines.push(this.order_line)
          this.order_line = {qty:1, location:'STAGE'}
      }else{
          //this.$message.error('请填写必须的数据')
      }
      $('#c_ol_barcode').focus()
    },
    // 提交复核的订单行
    do_check_putin(){
      var env = this
      // 最后一条别漏了
      this.do_scan()
      // 保存到后端
      if(this.order_lines.length==0){
        env.$message.warning('请扫描条码或货码')
        return
      }
      // console.log(this.order_lines)
      var data = {erp_order_code: this.order.erp_order_code, lines: this.order_lines}
      this.$http.post('/stockin/check', data).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('入库成功')
          // reload objects
          env.dlg_scan = false
          env.load_objects()
        }else{
          env.$message.error(resp.data.msg)
        }
      })
    },

    // 入库
    do_putin(){
      var env = this
      var data = []
      for(var i=0; i < env.lines.length; i++){
        var line = env.lines[i]
        if (line.qty_receive > 0 && line.location){
          data.push({line_id: line.id, location: line.location, lpn: line.lpn, qty: line.qty_receive*1})
        }
      }
      if (data.length > 0){
        var json = {lines: data}
        this.$http.post('/stockin/putin/'+this.order.id, json).then(function(resp){
            //[{line_id, qty, location, lpn=''}...]
            if(resp.data.status!='success'){
              env.$message.error(resp.data.msg)
            }else{
              env.$message.success('入库成功')
              // reload lines
              env.load_lines()
              // reload objects
              env.load_objects()
            }
        })
      }else{
        env.$message.error('请填写数据')
      }
    },

    // 订单明细
    order_detail(index, order){
      var env = this
      env.order = order
      env.lines = []
      env.trans = []
      env.$http.get('/stockin/putin/'+order.id).then(function(resp){
        env.lines = resp.data.lines
        env.partner = resp.data.partner
        env.pay_state = resp.data.pay_state
      })
      this.dlg_detail = true
      this.load_order_trans(2)
      this.order.date_planned2 = this.order.date_planned ? this.$moment(this.order.date_planned) : null
      $('.barcode').html('')
    },
    // 加载入库记录
    load_order_trans(tab, event){
      var env = this
      if((tab.name=='second' || tab=="2") && env.trans.length == 0){
        this.$http.get('/stockin/trans/'+this.order.id+'?q={"limit":1000}').then(function(resp){
          env.trans = resp.data.objects
        })
      }
    },

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
      
      env.$http.get('/stockin/stockin?q='+JSON.stringify(q)).then(function(resp){
        env.objects = resp.data.objects

        env.total_page = resp.data.total_pages
        env.current_page = resp.data.page
        env.page_size = resp.data.per_page
        env.pagination.total = resp.data.num_results
        env.pagination.current = resp.data.page
        env.pagination.pageSize = resp.data.per_page
      })
    },
    load_lines(){
      var env = this
      env.$http.get('/stockin/putin/'+env.order.id).then(function(resp){
        env.lines = resp.data.lines
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
.input-label{width:100px;line-height: 32px;}
</style>
