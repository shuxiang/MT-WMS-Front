<template>
  <div>

    <div>
        <a-row>
          <a-col :span="6">
            <a-breadcrumb style="padding:20px 20px 20px 0px;">
              <a-breadcrumb-item >仓库管理</a-breadcrumb-item>
              <a-breadcrumb-item title="移库单操作；将库存从一个库位移动到另一个库位">移库单</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
          <a-col :span="18">
            <a-button @click="new_order()" type="primary" style="margin:15px 0;margin-left:10px;">新建</a-button>
          </a-col>
        </a-row>
    </div>


      <a-modal title="移库单明细" :visible="dlg_detail" width="1200px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_detail=false">
        <a-table bordered :dataSource="lines" :columns="line_columns" :pagination="false" rowKey="id">
          <span slot="qty" slot-scope="text,record">
            <a-input :allowClear="true" v-model="record.qty" placeholder="移库数量"  :disabled="object.state!='create'" style="width:80px;"></a-input>
          </span>
          <span slot="quality_type" slot-scope="text,record">
            <span>{{ translate('good_quality_type', record.quality_type) }}</span>
          </span>
          <span slot="dest_location_code" slot-scope="text,record">
            <a-auto-complete placeholder="库位码" @focus="fetch_locations(record)" optionLabelProp="value" @change="handle_search_location" :backfill="true" v-model="record.dest_location_code">
              <template slot="dataSource">
                  <a-select-option v-for="item in locations" :key="item.value">
                    <strong>{{item.value}} </strong><span class="certain-search-item-count"> 库存{{ item.qty }}, 总库存{{item.qty_total}}</span>
                  </a-select-option>
              </template>
            </a-auto-complete>
          </span>
          <span slot="dest_lpn" slot-scope="text,record">
            <a-input :allowClear="true" v-model="record.dest_lpn" placeholder="目标容器, 可不填" style="width:100px;"></a-input>
          </span>

          <span slot="action" slot-scope="text,record,index">
            <a-popconfirm
              title="确定要删除吗?"
              @confirm="del_order_line(index, record)"
              okText="确定"
              cancelText="取消"  v-if="object.state=='create'"
            >
              <a-button type="primary">删除</a-button>
            </a-popconfirm>
          </span>
        </a-table>
        <div class="dialog-footer">
          <a-button @click="do_move_out()" type="primary" v-if="object.state=='create'" style="float:right;margin-left:20px;">开始移库</a-button>
          <a-button @click="do_move_in()" type="primary" v-if="object.state=='doing'" style="float:right;margin-left:20px;">完成移库</a-button>
          <a-button @click="do_update()" type="primary" v-if="object.state=='create'" style="float:right;margin-left:20px;">确定修改</a-button>
          <a-button @click="print_lines()" style="float:right;margin-left:20px;">打印移库单</a-button>
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

      <a-modal title="新建移库单" :visible="dlg_new" width="1200px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_new=false">
        <div>
          <a-input :allowClear="true" v-model="current_good" ref="current_good" id="current_good" @pressEnter="search_inv" placeholder="货品码/条码/名称" style="margin-bottom:10px;width:400px;" />
          <a-button @click="search_inv" style="margin-left:5px;margin-right:5px;" >搜索</a-button>
          <h4 style="display:block;font-weight:bold;">搜索结果：</h4>
          <a-table bordered :dataSource="new_invs" :columns="new_good_columns" rowKey="id" v-if="new_invs.length > 0" 
              :pagination="pagination2" @change="table_filter_sort2">
            <span slot="qty_move" slot-scope="text,record">
                <a-input :allowClear="true" v-model="record.qty_move" placeholder="移库数量" style="width: 120px"></a-input>
            </span>
            <!--
            <span slot="supplier_code" slot-scope="text,record">
              <span>
                <a-select :defaultValue="record.supplier_code" style="width: 120px"  v-model="record.supplier_code" :disabled="'disabled'">
                  <a-select-option value="" v-bind:key="''">无供应商信息</a-select-option>
                  <a-select-option :value="item.code" v-for="item in suppliers" v-bind:key="item.code">{{item.name}}</a-select-option>
                </a-select>
              </span>
            </span>-->
            <span slot="unit" slot-scope="text,record">
                <a-input :allowClear="true" v-model="record.unit" placeholder="单位" style="width: 120px"></a-input>
            </span>
            <span slot="action" slot-scope="text,record,index">
                <a-button @click="add_order_line(index, record)" type="primary" style="float:right;" >添加</a-button>
            </span>
          </a-table>
        </div>
        <br/>
        <h4 style="display:block;font-weight:bold;">已选订单行：</h4>
        <a-table bordered :dataSource="new_lines" :columns="new_line_columns" :pagination="false" rowKey="key" :scroll="{y: 500, x:'max-content'}">
          <span slot="qty" slot-scope="text,record">
            <a-input :allowClear="true" v-model="record.qty" placeholder="移库数量" style="width:100px;"></a-input>
          </span><!--
          <span slot="location_code" slot-scope="text,record">
            <a-input :allowClear="true" v-model="record.location_code" placeholder="源库位" style="width:100px;"></a-input>
          </span>--><!--
          <span slot="dest_location_code" slot-scope="text,record">
            <a-input :allowClear="true" v-model="record.dest_location_code" placeholder="目标库位" style="width:150px;"></a-input>
          </span>
          -->
          <span slot="dest_location_code" slot-scope="text,record">
            <!--<a-input :allowClear="true" placeholder="库位码" v-model="record.location" style="width:120px;"/>-->
            <a-auto-complete placeholder="库位码" @focus="fetch_locations(record)" @select="select_location" optionLabelProp="value" :defaultValue="record.dest_location_code||''" @change="handle_search_location" :backfill="true" :allowClear="true" v-model="record.dest_location_code">
              <template slot="dataSource">
                  <a-select-option v-for="item in locations" :key="item.value">
                    <strong>{{item.value}} </strong><span class="certain-search-item-count"> 库存{{ item.qty }}, 总库存{{item.qty_total}}</span>
                  </a-select-option>
              </template>
            </a-auto-complete>
          </span>
          <!--
          <span slot="lpn" slot-scope="text,record">
            <a-input :allowClear="true" v-model="record.lpn" placeholder="源容器" style="width:100px;"></a-input>
          </span>-->
          <span slot="dest_lpn" slot-scope="text,record">
            <a-input :allowClear="true" v-model="record.dest_lpn" placeholder="目标容器, 可不填" style="width:100px;"></a-input>
          </span>

          <span slot="action" slot-scope="text,record,index">
              <a-button type="primary" @click="del_order_line(index, record)">删除</a-button>
          </span>
        </a-table>
        <div class="dialog-footer">
          <a-popconfirm
              title="确定要创建新移库单吗?"
              @confirm="do_create()"
              okText="确定"
              cancelText="取消"
            >
              <a-button style="float:right;" type="primary">提交移库单</a-button>
          </a-popconfirm>
          <a-button @click="do_auto()" style="margin-right:20px;float:right;" type="primary">推荐库位</a-button>
        </div>
      </a-modal>

      <div class="print">
            <table border="1" cellspacing="0">
              <thead>
                <tr>
                  <td>货品码</td>
                  <td>条码</td>
                  <td>名称</td>
                  <td>原库位</td>
                  <td>原容器</td>
                  <td>移库数量</td>
                  <td>目标库位</td>
                  <td>目标容器</td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in lines" v-bind:key="item.id">
                  <td>{{ item.sku }}</td>
                  <td>{{ item.barcode }}</td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.location_code }}</td>
                  <td>{{ item.lpn }}</td>
                  <td>{{ item.qty }}</td>
                  <td>{{ item.dest_location_code }}</td>
                  <td>{{ item.dest_lpn }}</td>
                </tr>
              </tbody>
            </table>
      </div>

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
        <span slot="state" slot-scope="text,record">
          <span>{{ translate('inv_move_state', record.state) }}</span>
        </span>
        <span slot="move_type" slot-scope="text,record">
          <span>{{ translate('inv_move_type', record.move_type) }}</span>
        </span>

        <span slot="stockin_order_code" slot-scope="text,record">
            <router-link :to="{ name: 'StockinOne', params: { order_id: record.stockin_order_code }}" v-if="record.stockin_order_code">
                {{record.stockin_order_code}}
            </router-link>
        </span>

        <span slot="action" slot-scope="text,record,index">
            <!--<a-button @click="do_order( index, record)"  v-if="record.state=='create'" type="primary">快速移库</a-button>-->
            <a-popconfirm
              title="确定要快速移库吗?"
              @confirm="do_order(index, record)"
              okText="确定"
              cancelText="取消"  v-if="record.state=='create' && owner_conf.is_enable_fast_invmove"
            >
              <a-button type="danger">快速移库</a-button>
            </a-popconfirm>

            <a-button @click="order_detail( index, record)"  style="margin-left:10px">明细</a-button>
            <a-button @click="export_excel( index, record)"  style="margin-left:10px">导出</a-button>
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
  name: 'InvMove',
  data () {
    return {
      suppliers:[],
      objects: [],
      lines: [],
      new_lines: [],
      new_lines_keys: [],
      object: {},
      owner_conf: {},

      object_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id)}, 
        {title: '移库单号', key: 'series_code', dataIndex: 'series_code', 
        }, 
        {title: '关联入库单', key: 'stockin_order_code', dataIndex: 'stockin_order_code', scopedSlots: { customRender: 'stockin_order_code' },},
        {title: '状态', key: 'state', dataIndex: 'state', scopedSlots: { customRender: 'state' }, },
        {title: '类型', key: 'move_type', dataIndex: 'move_type', scopedSlots: { customRender: 'move_type' }, },
        {title: '创建时间', key: 'create_time', dataIndex: 'create_time', 
        },
        {title: '操作时间', key: 'update_time', dataIndex: 'update_time'}, 
        {title: '操作人', key: 'user_code', dataIndex: 'user_code', },
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' },}
      ],
      current_good: '',
      new_invs:[],

      line_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id',  }, 
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '货品名称', key: 'name', dataIndex: 'name'}, 
        {title: '库位', key: 'location_code', dataIndex: 'location_code'}, 
        {title: '目标库位', key: 'dest_location_code', dataIndex: 'dest_location_code', scopedSlots: { customRender: 'dest_location_code' }}, 
        {title: '容器', key: 'lpn', dataIndex: 'lpn',  }, 
        {title: '目标容器', key: 'dest_lpn', dataIndex: 'dest_lpn', scopedSlots: { customRender: 'dest_lpn' }}, 
        {title: '移库数量', key: 'qty', dataIndex: 'qty', scopedSlots: { customRender: 'qty' }}, 
        //{title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code',  }, 
        //{title: '生产日期', key: 'product_date', dataIndex: 'product_date', rowClassName: 'no-print'}, 
        //{title: '批次号', key: 'batch_code', dataIndex: 'batch_code', rowClassName: 'no-print'}, 
        //{title: '质量', key: 'quality_type', dataIndex: 'quality_type', rowClassName: 'no-print', scopedSlots: { customRender: 'quality_type' }},
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' },}
      ],

      new_line_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku', scopedSlots: { customRender: 'sku' }}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '货品名称', key: 'name', dataIndex: 'name'}, 
        {title: '库位', key: 'location_code', dataIndex: 'location_code', scopedSlots: { customRender: 'location_code' }}, 
        {title: '移库数量', key: 'qty', dataIndex: 'qty', scopedSlots: { customRender: 'qty' }}, 
        {title: '目标库位', key: 'dest_location_code', dataIndex: 'dest_location_code', scopedSlots: { customRender: 'dest_location_code' }}, 
        {title: '容器', key: 'lpn', dataIndex: 'lpn',  scopedSlots: { customRender: 'lpn' }}, 
        {title: '目标容器', key: 'dest_lpn', dataIndex: 'dest_lpn',  scopedSlots: { customRender: 'dest_lpn' }}, 
        // {title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code',  }, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' },}
      ],

      new_good_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '货品名', key: 'name', dataIndex: 'name'}, 
        //{title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code', scopedSlots: {customRender: 'supplier_code'}}, 
        {title: '库位', key: 'location_code', dataIndex: 'location_code', scopedSlots: { customRender: 'location_code' }}, 
        {title: '可用数量', key: 'qty_able', dataIndex: 'qty_able', scopedSlots: {customRender: 'qty_able'}},
        {title: '移库数量', key: 'qty_move', dataIndex: 'qty_move', scopedSlots: {customRender: 'qty_move'}},
        {title: '单位', key: 'unit', dataIndex: 'unit', }, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: {customRender: 'action'}}, 
      ],

      dlg_detail:false,
      dlg_new: false,
      has_manager_perm:false,

      locations_dict: {},
      locations: [],
      line: {},

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

      pagination2: {defaultPageSize:5, pageSize: 5, current: 1, total: 20, showSizeChanger: false, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},
    }
  },
  methods:{
    // 删除移库单行
    del_order_line(index, record){
      var env = this
      if(record.id){
        this.$http.delete('/inv/move/'+record.id).then(function(resp){
          if(resp.data.status=='success'){
            env.$message.success('删除成功')
            env.lines.splice(index, 1)
            if(env.lines.length==0){
              env.dlg_detail = false
              env.load_objects()
            }
          }else{
            env.$message.error(resp.data.msg)
          }
        })
      }else{
        this.new_lines.splice(index, 1)
      }
    },
    // 新建移库单
    add_order_line(index, record){
      var key = record.sku+record.location_code+record.lpn
      if (this.new_lines_keys.indexOf(key) < 0){
        var line = {inv_id:record.id, qty: record.qty_move, sku:record.sku, name:record.name, barcode:record.barcode, 
          location_code:record.location_code, lpn:record.lpn, key:key, dest_location_code:'', dest_lpn:''}
        this.new_lines.push(line)
        this.new_lines_keys.push(key)
      }else{
        this.$message.warning('已经添加过了')
      }
    },
    // 搜索库存
    search_inv(e, page){
      var env = this
      if(this.current_good){
        var q = {per_page: 5, filters:[{'or':[{name: 'sku', op:'ilike', val: this.current_good}, {name: 'barcode', op:'ilike', val: this.current_good}, {name: 'name', op:'ilike', val: this.current_good}]}]}
        q.page = page || 1
        this.$http.get('/inv/inv?q='+JSON.stringify(q)).then(function(resp){
          env.new_invs = resp.data.objects

          env.pagination2.total = resp.data.num_results
          env.pagination2.current = resp.data.page
          env.pagination2.pageSize = resp.data.per_page
        })
      }
    },

    table_filter_sort2(pagination, filters, sorter) {
      this.pagination2 = pagination
      this.search_inv(null, pagination.current)
    },

    new_order(){
      var env = this
      this.dlg_new = true
      this.new_lines = []
      this.new_lines_keys = []
      function bf(){
        env.$refs.current_good.focus()
      }
      setTimeout(bf, 1);
    },
    do_create(){
      var env = this
      for(var i=0;i<this.new_lines.length;i++){
        var line = this.new_lines[i]
        if (!line.dest_location_code && line.location_code!='STAGE'){
          line.dest_location_code = 'STAGE'
        }
        if(!line.dest_location_code || line.location_code == line.dest_location_code){
          env.$message.error('目标库位不能为空, 不能和源库位一样')
          return false
        }
        if(!line.qty){
          env.$message.error('请填写移库数量')
          return false
        }
      }
      // submit
      this.$http.post('/inv/move', this.new_lines).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('创建移库单成功')
          env.load_objects()
          env.dlg_new = false
        }else{
          env.$message.error('创建移库单失败: '+resp.data.msg)
        }
      })
    },
    // 修改
    do_update(){
      var env = this
      this.$http.put('/inv/move', this.lines).then(function(resp){
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
      this.$http.post('/inv/move/exec/'+order.series_code).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('移库成功', 3)
          env.load_objects()
        }else{
          env.$message.error('移库失败: '+resp.data.msg, 3)
        }
      })
    },

    // 推荐库位
    do_auto(){
      var env = this
      this.$http.post('/inv/move/autolocation?type=movein_inv', env.new_lines).then(function(resp){
          if(resp.data.status=='success'){
            var loc_dict = resp.data.loc_dict
            for(var i=0;i<env.new_lines.length;i++){
              var line = env.new_lines[i]
              line.dest_location_code = loc_dict[i+""] || line.dest_location_code || 'STAGE'
            }
          }else{
            env.$message.error(resp.data.msg)
          }
      })
    },

    // 移出
    do_move_out(){
      var env = this
      this.$http.post('/inv/move/exec_out/'+this.object.series_code).then(function(resp){
        if(resp.data.status=='success'){
          env.dlg_detail = false
          env.$message.success('开始移库成功', 3)
          env.load_objects()
        }else{
          env.$message.error('开始移库失败: '+resp.data.msg, 3)
        }
      })
    },
    // 移入
    do_move_in(){
      var env = this
      this.$http.post('/inv/move/exec_in/'+this.object.series_code).then(function(resp){
        if(resp.data.status=='success'){
          env.dlg_detail = false
          env.$message.success('完成移库成功', 3)
          env.load_objects()
        }else{
          env.$message.error('完成移库失败: '+resp.data.msg, 3)
        }
      })
    },

    cancel_order(){
      var env = this
      this.$http.post('/inv/move/cancel/'+this.object.series_code).then(function(resp){
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
              title: '移库单: '+this.object.series_code,
              doctype: '<!doctype html>'
      })
    },
    // 导出移库单
    export_excel(index, order){
      var env = this
      var q = {filters: [{name: 'series_code', op: '==', val: order.series_code}]}

      var data = {
          name: '移库单导出.xlsx', 
          xtype: 'export', 
          code: 'export_invmove', 
          func: 'blueprints.auth.tasks.export_inv:export_invmove', 
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

    // 明细 
    order_detail(index, order){
      var env = this
      this.new_invs = []
      this.dlg_detail = true
      this.object = order
      this.new_lines_keys = []

      var q = {filters: [{name: 'series_code', op: '==', val: order.series_code}]}
      env.$http.get('/inv/move?q='+JSON.stringify(q)).then(function(resp){
        env.lines = resp.data.objects
      })
    },

    // 新库位推荐
    fetch_locations(line){
      var env = this
      var lineid = line.id
      this.line = line
      if ((lineid && (!env.locations_dict[lineid] || env.locations_dict[lineid].length == 0)) || !lineid){
        this.$http.get('/stockin/recommend/location/sku/'+line.sku+'/'+line.location_code).then(function(resp){
          env.locations_dict[lineid] = resp.data
          env.locations = resp.data
        })
      }
      this.locations = this.locations_dict[lineid]
    },
    select_location(val, option){
      // old
      // this.line.location = row.value
      // return this.line.location = val
      return this.line.dest_location_code = val
    },
    handle_search_location(val){
      var env = this
      var lineid = this.line.id
      this.$http.get('/stockin/recommend/location/sku/'+this.line.sku+'/'+this.line.location_code+'?q='+val).then(function(resp){
          env.locations_dict[lineid] = resp.data
          env.locations = resp.data
      })
    },
    // end

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

    // 分页
    handlePageChange(page){
      this.current_page = page
      this.search()
    },

    // 格式化，翻译
    fmt(row, col, val, index){
      var trans = this.$store.config
      if(col.columnKey){
        if(trans[col.columnKey]){
          return trans[col.columnKey][val] || val
        }
        return val
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
      
      env.$http.get('/inv/move?q='+JSON.stringify(q)).then(function(resp){
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
</style>
