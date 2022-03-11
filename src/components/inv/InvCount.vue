<template>
  <div>

    <div>
        <a-row>
          <a-col :span="6">
            <a-breadcrumb style="padding:20px 20px 20px 0px;">
              <a-breadcrumb-item >仓库管理</a-breadcrumb-item>
              <a-breadcrumb-item title="盘点现有库存，用来生成调整单">盘点单</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
          <a-col :span="18">
            <a-select :defaultValue="''" style="width: 120px;margin-left:10px;"  v-model="new_order.area" placeholder="选择库区">
              <a-select-option :value="'ALL'" v-bind:key="'ALL'">全仓盘点</a-select-option>
              <a-select-option :value="item.code" v-for="item in areas" v-bind:key="item.code">{{item.name}}</a-select-option>
            </a-select>
            <a-input :allowClear="true" v-model="new_order.location_code" placeholder="库位码，选填" title="库位吗"  style="margin-top:15px;width:120px;margin-left:10px;"></a-input>
            <a-input :allowClear="true" v-model="new_order.sku" placeholder="货品码，选填" title="货品码" style="margin-top:15px;width:120px;margin-left:10px;"></a-input>
            <a-button @click="new_count_order()" style="margin:15px 0;margin-left:10px;" type="primary">生成盘点单</a-button>
            <a-button @click="create_order()" style="margin:15px 0;margin-left:10px;" type="primary">新建盘点单</a-button>
          </a-col>
        </a-row>
    </div>

      <a-modal title="新建订单" :visible="dlg_new" width="1200px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_new=false">
        <div>
          <a-input :allowClear="true" v-model="current_good" id="current_good" @pressEnter="search_good" placeholder="货品码/条码/名称" style="margin-bottom:10px;width:400px;" />
          <a-button @click="search_good" style="margin-left:5px;margin-right:5px;" >搜索</a-button>
        </div>
        <h4 style="display:block;font-weight:bold;">搜索结果：</h4>
        <a-table bordered :dataSource="new_goods" :columns="new_good_columns" :pagination="false" rowKey="id" v-if="new_goods.length > 0" :scroll="{y: 500 }">
          <span slot="qty_real" slot-scope="text,record">
              <a-input :allowClear="true" v-model="record.qty_real" placeholder="盘点数量" style="width: 120px"></a-input>
          </span>
          <span slot="action" slot-scope="text,record,index">
              <a-button @click="add_order_line(index, record)" style="float:right;" >添加</a-button>
          </span>
        </a-table>
        <br/>
        <h4 style="display:block;font-weight:bold;">已选订单行：</h4>
        <a-table bordered :dataSource="new_lines" :columns="new_line_columns" :pagination="false" rowKey="id" :scroll="{y: 500 }">
          <span slot="qty_real" slot-scope="text,record">
              <a-input :allowClear="true" v-model="record.qty_real" placeholder="盘点数量" style="width: 120px"></a-input>
          </span>
          <span slot="price" slot-scope="text,record">
              <a-input :allowClear="true" v-model="record.price" placeholder="价格" style="width: 120px"></a-input>
          </span>
          <span slot="action" slot-scope="text,record,index">
              <a-button @click="del_order_line(index, record)" style="float:right;" >删除</a-button>
          </span>
        </a-table>
        <div class="dialog-footer">
          <a-popconfirm
              title="确定要创建新订单吗?"
              @confirm="do_submit()"
              okText="确定"
              cancelText="取消"
            >
              <a-button style="float:right;">提交</a-button>
          </a-popconfirm>
        </div>
      </a-modal>

      <a-modal title="盘点单明细" :visible="dlg_detail" width="1200px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_detail=false">
        <a-table bordered :dataSource="lines" :columns="line_columns" :pagination="false" rowKey="id">
          <span slot="qty_real" slot-scope="text,record">
              <a-input :allowClear="true" v-model="record.qty_real" placeholder="盘点的真实数量"  :disabled="object.state!='create'"></a-input>
          </span>
          <span slot="quality_type" slot-scope="text,record">
            <span>{{ translate('good_quality_type', record.quality_type) }}</span>
          </span>
          <span slot="location_code" slot-scope="text,record">
            <span>
              <span v-if="record.id>0">{{ record.location_code }}</span>
              <span v-if="!record.id||record.id<0">
                <a-auto-complete placeholder="库位码" @focus="fetch_locations(record)" @select="select_location" 
                optionLabelProp="value" :defaultValue="'STAGE'" @change="handle_search_location" 
                :backfill="true" :disabled="object.state!='create'">
                  <template slot="dataSource">
                      <a-select-option v-for="item in locations" :key="item.value">
                        <strong>{{item.value}} </strong><span class="certain-search-item-count"> 库存{{ item.qty }}, 总库存{{item.qty_total}}</span>
                      </a-select-option>
                  </template>
                </a-auto-complete>
              </span>
            </span>
          </span>
          <span slot="sku" slot-scope="text,record">
            <span>
              <span v-if="record.id>0">{{ record.sku }}</span>
              <span v-if="!record.id||record.id<0">
                <a-auto-complete placeholder="货品" @focus="fetch_good(record)" @select="select_good" 
                optionLabelProp="value" :defaultValue="''" @change="handle_search_good" 
                :backfill="true" :disabled="object.state!='create'">
                  <template slot="dataSource">
                      <a-select-option v-for="item in new_goods" :key="item.code">
                        <strong>{{item.code}} </strong><span class="certain-search-item-count">{{item.name}}</span>
                      </a-select-option>
                  </template>
                </a-auto-complete>
              </span>
            </span>
          </span>
        </a-table>
        <div class="print">
              <div class="barcode"></div>
              <table border="1" cellspacing="0">
                <thead>
                  <tr>
                    <td>货品码</td>
                    <td>条码</td>
                    <td>名称</td>
                    <td>库位</td>
                    <td>库存数</td>
                    <td>盘点数</td>
                    <td>容器</td>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in lines" v-bind:key="item.id">
                    <td>{{ item.sku }}</td>
                    <td>{{ item.barcode }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.location_code }}</td>
                    <td>{{ item.qty }}</td>
                    <td>{{ item.qty_real }}</td>
                    <td>{{ item.lpn }}</td>
                  </tr>
                </tbody>
              </table>
        </div>
        <div class="dialog-footer">
          <a-button @click="print_lines()" style="float:right;margin-left:20px;">打印</a-button>
          <a-button @click="do_update()" v-if="object.state=='create'" type="primary" style="float:right;margin-left:20px;">确定修改</a-button>
          <a-button @click="add_line()" style="float:right;margin-left:20px;" v-if="object.state=='create'">增加一行</a-button>
          <a-popconfirm
                title="确定要取消吗?"
                @confirm="cancel_order()"
                okText="确定"
                cancelText="取消"
              >
                <a-button v-if="object.state!='cancel' && object.state!='done'" style="float:right;margin-left:20px;" type="primary">取消</a-button>
              </a-popconfirm>
        </div>
      </a-modal>

      <a-form layout="inline" v-if="owner_conf.is_enable_search_bar" style="padding-left:15px;background-color:rgb(235,235,235);">
        <a-form-item label="单号" >
          <a-input :allowClear="true"  placeholder="单号" v-model="query.order_code" style="width:160px;"/>
        </a-form-item>
        <a-form-item label="状态">
          <a-select :defaultValue="query.state"  v-model="query.state" style="width:120px;" :allowClear="true">
            <a-select-option value="" v-bind:key="''">--所有--</a-select-option>
            <a-select-option :value="item.value" v-for="item in options.inv_do_state" v-bind:key="item.value">{{item.label}}</a-select-option>
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

      <a-table :dataSource="objects" :columns="object_columns" bordered rowKey="id" :pagination="pagination" @change="table_filter_sort" :scroll="{x:'max-content'}">
        <span slot="action" slot-scope="text,record,index">
            <a-popconfirm
                title="你确定要执行盘点单? 执行调整后, 库存将变更."
                @confirm="do_order(index, record)"
                okText="确定"
                cancelText="取消" v-if="record.state=='create' && ($store.has_manager_perm || $store.vr_manager)"
              >
                <a-button type="danger">执行调整</a-button>
            </a-popconfirm>

            <a-button @click="order_detail( index, record)"  style="margin-left:10px">明细</a-button>
            <a-button @click="export_excel( index, record)"  style="margin-left:10px">导出</a-button>
        </span>
        <span slot="state" slot-scope="text,record">
          <span>{{ translate('inv_do_state', record.state) }}</span>
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
  name: 'InvCount',
  data () {
    return {
      objects: [],
      lines: [],
      object: {},
      areas: [],
      new_lines_keys: [],

      line: {},
      locations:[],
      locations_dict:{},

      new_goods: [],
      current_good: '',
      current2: {},

      object_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id)}, 
        {title: '单号', key: 'series_code', dataIndex: 'series_code', 
        }, 
        {title: '状态', key: 'state', dataIndex: 'state', scopedSlots: { customRender: 'state' }, },
        // {title: '调整单号', key: 'adjust_series_code', dataIndex: 'adjust_series_code'}, 
        {title: '创建时间', key: 'create_time', dataIndex: 'create_time', 
        },
        {title: '操作时间', key: 'update_time', dataIndex: 'update_time'}, 
        {title: '操作人', key: 'user_code', dataIndex: 'user_code', },
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' },}
      ],

      line_columns: [
        //{title: 'ID', key: 'id', dataIndex: 'id',  }, 
        {title: '货品码', key: 'sku', dataIndex: 'sku', scopedSlots: { customRender: 'sku' }}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '货品名称', key: 'name', dataIndex: 'name'}, 
        {title: '库位', key: 'location_code', dataIndex: 'location_code', scopedSlots: { customRender: 'location_code' }}, 
        {title: '锁定库存数', key: 'qty_alloc', dataIndex: 'qty_alloc'}, 
        {title: '库存数', key: 'qty', dataIndex: 'qty'}, 
        {title: '盘点数', key: 'qty_real', dataIndex: 'qty_real', scopedSlots: { customRender: 'qty_real' }}, 
        {title: '容器', key: 'lpn', dataIndex: 'lpn',  }, 
        ///{title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code', }, 
        //{title: '生产日期', key: 'product_date', dataIndex: 'product_date', rowClassName: 'no-print'}, 
        //{title: '批次号', key: 'batch_code', dataIndex: 'batch_code', rowClassName: 'no-print'}, 
        //{title: '质量', key: 'quality_type', dataIndex: 'quality_type', rowClassName: 'no-print', scopedSlots: { customRender: 'quality_type' }},
      ],

      new_order: {},

      // new order
      order_new: {},
      dlg_new: false,
      new_goods:[],
      new_good_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '货品名', key: 'name', dataIndex: 'name'}, 
        {title: '库位', key: 'location_code', dataIndex: 'location_code', scopedSlots: {customRender: 'location_code'}},
        {title: '库存数量', key: 'qty', dataIndex: 'qty', scopedSlots: {customRender: 'qty'}},
        {title: '盘点数量', key: 'qty_real', dataIndex: 'qty_real', scopedSlots: {customRender: 'qty_real'}},
        {title: '单位', key: 'unit', dataIndex: 'unit', }, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: {customRender: 'action'}}, 
      ],
      new_lines: [],
      new_line_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '货品名', key: 'name', dataIndex: 'name'}, 
        {title: '库位', key: 'location_code', dataIndex: 'location_code', scopedSlots: {customRender: 'location_code'}},
        {title: '库存数量', key: 'qty', dataIndex: 'qty', scopedSlots: {customRender: 'qty'}},
        {title: '盘点数量', key: 'qty_real', dataIndex: 'qty_real', scopedSlots: {customRender: 'qty_real'}},
        {title: '单位', key: 'unit', dataIndex: 'unit', }, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: {customRender: 'action'}}, 
      ],
      new_lines_ids: [],
      current_good: '',
      current_order_type: '',
      partner_code: '',

      dlg_detail:false,
      has_manager_perm:false,

      filter: {},
      query: {},
      like_filters: ['series_code'],
      sort: null,
      create_time_filter_icon: false,
      series_code_filter_icon: false,

      current_page: 1,
      page_size:20,
      total_page:0,
      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},
    }
  },
  methods:{
    //------  新建单子 -------
    create_order(){
      this.dlg_new = true
      this.current_good = ''
      this.new_goods = []
      this.new_lines = []
      this.new_lines_ids = []
      this.current_order_type = 'normal'
      this.partner_code = ''
      function bf(){
        $('#current_good').focus()
      }
      setTimeout(bf, 1);
    },
    del_order_line(index, line){
      this.new_lines.splice(index, 1)
      this.new_lines_ids.splice(index, 1)
    },
    add_order_line(index, line){
      if (line.qty){
        if(this.new_lines_ids.indexOf(line.sku) >= 0){
          this.$message.warning('已经添加过该货品了')
        }else{
          var new_line = JSON.parse(JSON.stringify(line))
          new_line.price = new_line.now_price
          new_line.id = undefined
          this.new_lines.push(new_line)
          this.new_lines_ids.push(line.sku)
        }
      }else{
        this.$message.warning('请输入数量')
      }
    },
    do_submit(){
      var env = this
      if(env.new_lines.length < 1){
        env.$message.warning('请添加订单行！')
        return 
      }

      this.order_new.lines = env.new_lines
      var env = this
      this.$http.post('/inv/count/create_lines', this.order_new).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('创建盘点单成功, 单号: '+ resp.data.data.series_code)
          env.search()
          env.dlg_new = false
        }else{
          env.$message.error('创建盘点单失败: '+resp.data.msg)
        }
      })
    },
    search_good(){
      var env = this
      if(this.current_good){
        var q = {filters:[{name: 'sku', op: 'ilike', val: this.current_good}]}
        this.$http.get('/inv/inv?without_batch=true&q='+JSON.stringify(q)).then(function(resp){
          env.new_goods = resp.data.objects
        })
      }
      this.current_good = ''
    },
    //------ end 新建单子 -------

    randint(N,M){
      return parseInt(Math.random() * (M - N + 1) +  N)*-1
    },

    // fetch good
    fetch_good(record){
      var env = this
      env.current2 = record
      this.$http.get('/inv/good?qtype=&q=').then(function(resp){
          env.new_goods = resp.data
      })
    },
    select_good(val, option){
      var good = {}
      for(var i=0;i<this.new_goods.length;i++){
        var it = this.new_goods[i]
        if(it.sku==val){
          good.barcode = it.barcode
          good.name = it.name
        }
      }
      this.current2.barcode = good.barcode
      this.current2.name = good.name
      return this.current2.sku = val
    },
    handle_search_good(val){
      var env = this
      if(!val){
        return
      }
      this.$http.get('/inv/good?qtype=&q='+val).then(function(resp){
          env.new_goods = resp.data
      })
    },
    //end fetch good

    // 新库位推荐
    fetch_locations(line){
      var env = this
      var lineid = line.id
      this.line = line
      if(!line || !line.sku){
        return 'STAGE'
      }
      if (!env.locations_dict[lineid] || env.locations_dict[lineid].length == 0){
        this.$http.get('/stockin/recommend/location/sku/'+this.line.sku).then(function(resp){
          env.locations_dict[lineid] = resp.data
          env.locations = resp.data
        })
      }
      this.locations = this.locations_dict[lineid]
    },
    select_location(val, option){
      // old
      // this.line.location = row.value
      return this.line.location_code = val
    },
    handle_search_location(val){
      var env = this
      var lineid = this.line.id
      if(!this.line || !this.line.sku){
        return 'STAGE'
      }
      this.$http.get('/stockin/recommend/location/sku/'+this.line.sku+'?q='+val).then(function(resp){
          env.locations_dict[lineid] = resp.data
          env.locations = resp.data
      })
    },
    // end

    cancel_order(){
      var env = this
      this.$http.post('/inv/count/cancel/'+this.object.series_code).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('取消成功');
          env.dlg_detail = false
          env.load_objects()
        }else{
          env.$message.error('取消失败: '+resp.data.msg)
        }
      })
    },

    // 打印订单行
    print_lines(){
      // 增加条形码
      $(".barcode").barcode(this.object.series_code, 'code128', {barWidth: 2, barHeight: 80})
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
              title: '盘点单: '+this.object.series_code,
              doctype: '<!doctype html>'
      })
    },
    // 导出盘点单
    export_excel(index, order){
      var env = this
      var q = {filters: [{name: 'series_code', op: '==', val: order.series_code}]}

      var data = {
          name: '盘点单导出.xlsx', 
          xtype: 'export', 
          code: 'export_invcount', 
          func: 'blueprints.auth.tasks.export_inv:export_invcount', 
          func_name: '盘点单导出'}

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
    // 生成盘点单，可以按库位盘点，货品潘带你
    new_count_order(){
      var env = this
      if((!this.new_order.area) && (!this.new_order.sku) && (!this.new_order.location_code)){
        env.$message.error('库区, 货品码或库位码，至少填一个才能生成盘点单')
        return
      }else{
        this.$http.post('/inv/count', this.new_order).then(function(resp){
          if(resp.data.status=='success'){
            env.$message.success('创建盘点单成功, 单号: '+ resp.data.data.series_code)
            env.search()
          }else{
            env.$message.error('创建盘点单失败: '+resp.data.msg)
          }
        })
      }
    },

    add_line(){
      var env = this
      var line = {id:this.randint(1000,9999), sku:'', barcode:'', name:'', location_code: 'STAGE', qty_alloc:0, qty: 0, qty_real:0, lpn:''}
      env.lines.push(line)
    },

    // 修改
    do_update(){
      var env = this
      this.$http.put('/inv/count?series_code='+this.object.series_code, this.lines).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('修改成功')
          env.lines = resp.data.lines
          env.dlg_detail = false
        }else{
          env.$message.error('修改失败: '+resp.data.msg)
        }
      })
    },
    // 执行
    do_order(index, order){
      var env = this
      this.$http.post('/inv/count/to_adjust/'+order.series_code+'/exec').then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success("盘点单执行调整库存成功!")
          env.load_objects()
        }else{
          env.$message.error("盘点单执行调整库存失败: "+resp.data.msg)
        }
      })
    },

    // 明细 
    order_detail(index, order){
      var env = this
      this.dlg_detail = true
      this.new_lines_keys = []
      this.object = order
      var q = {filters: [{name: 'series_code', op: '==', val: order.series_code}]}
      env.$http.get('/inv/count?q='+JSON.stringify(q)).then(function(resp){
        env.lines = resp.data.objects
      })
      $('.barcode').html('')
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
            flist.push({name: f, op: '==', val: fs[f][0]})
          }
        }else if(fs[f]){
          flist.push({name: f, op: '==', val: fs[f]})
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
      q.group_by = [{field: 'series_code'}]

      q.page = this.pagination.current
      q.per_page = this.pagination.pageSize
      
      env.$http.get('/inv/count?q='+JSON.stringify(q)).then(function(resp){
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
    // load orders
    this.load_objects()
    // load areas
    this.$http.get('/warehouse/area').then(function(resp){
      env.areas = resp.data.objects
    })
  },
  // after render
  mounted: function(){
    
    this.load_choice()
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.w135{width: 137px;}
.print{display: none;}
</style>
