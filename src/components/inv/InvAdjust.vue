<template>
  <div>

    <div>
        <a-row>
          <a-col :span="12">
            <a-breadcrumb style="padding:20px 20px 20px 20px;">
              <a-breadcrumb-item >仓库管理</a-breadcrumb-item>
              <a-breadcrumb-item title="调整单由盘点单生成；可以调整库存的数量">调整单</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
        </a-row>
    </div>


    <a-modal title="调整单明细" :visible="dlg_detail" width="1200px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_detail=false">
      <a-table bordered :dataSource="lines" :columns="line_columns" :pagination="false" rowKey="id">
          <span slot="qty_diff" slot-scope="text,record">
            <a-input :allowClear="true" v-model="record.qty_diff" placeholder="调整值" title="盘点多了是正数，少了是负数"  :disabled="object.state!='create'" style="width:80px;"></a-input>
          </span>
          <span slot="quality_type" slot-scope="text,record">
            <span>{{ translate('good_quality_type', record.quality_type) }}</span>
          </span>
        </a-table>
        <div class="dialog-footer">
          <a-button @click="do_update()" v-if="object.state=='create'" style="float:right;margin-left:20px;">确定修改</a-button>
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

      <a-table :dataSource="objects" :columns="object_columns" bordered rowKey="id" :pagination="pagination" @change="table_filter_sort" :scroll="{x:'max-content'}">
        <span slot="state" slot-scope="text,record">
          <span>{{ translate('inv_do_state', record.state) }}</span>
        </span>
        <span slot="action" slot-scope="text,record,index">
            <a-button @click="do_order( index, record)"  v-if="record.state=='create'" >执行调整</a-button>
            <a-button @click="order_detail( index, record)"  style="margin-left:10px">明细</a-button>
        </span>
      </a-table>

  </div>
</template>

<script>
export default {
  name: 'InvAdjust',
  data () {
    return {
      objects: [],
      lines: [],
      object: {},
      new_lines_keys: [],
      
      object_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id)}, 
        {title: '调整单号', key: 'series_code', dataIndex: 'series_code', 
        }, 
        {title: '状态', key: 'state', dataIndex: 'state', scopedSlots: { customRender: 'state' }, },
        {title: '盘点单号', key: 'count_series_code', dataIndex: 'count_series_code'}, 
        {title: '创建时间', key: 'create_time', dataIndex: 'create_time', 
        },
        {title: '操作时间', key: 'update_time', dataIndex: 'update_time'}, 
        {title: '操作人', key: 'user_code', dataIndex: 'user_code', },
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' },}
      ],

      line_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id',  }, 
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '货品名称', key: 'name', dataIndex: 'name'}, 
        {title: '库位', key: 'location_code', dataIndex: 'location_code'}, 
        {title: '容器', key: 'lpn', dataIndex: 'lpn',  }, 
        {title: '调前数', key: 'qty_before', dataIndex: 'qty_before'}, 
        {title: '调后数', key: 'qty_after', dataIndex: 'qty_after', scopedSlots: { customRender: 'qty_after' }}, 
        {title: '差值', key: 'qty_diff', dataIndex: 'qty_diff', scopedSlots: { customRender: 'qty_diff' }}, 
        //{title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code', }, 
        {title: '生产日期', key: 'product_date', dataIndex: 'product_date', rowClassName: 'no-print'}, 
        {title: '批次号', key: 'batch_code', dataIndex: 'batch_code', rowClassName: 'no-print'}, 
        {title: '质量', key: 'quality_type', dataIndex: 'quality_type', rowClassName: 'no-print', scopedSlots: { customRender: 'quality_type' }},
      ],

      dlg_detail:false,
      has_manager_perm:false,

      filter: {},
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
    cancel_order(){
      var env = this
      this.$http.post('/inv/adjust/cancel/'+this.object.series_code).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('取消成功');
          env.dlg_detail = false
          env.load_objects()
        }else{
          env.$message.error('取消失败: '+resp.data.msg)
        }
      })
    },

    // 修改
    do_update(){
      var env = this
      this.$http.put('/inv/adjust', this.lines).then(function(resp){
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
      this.$http.post('/inv/adjust/exec/'+order.series_code).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('调整成功')
          env.load_objects()
        }else{
          env.$message.error('调整失败: '+resp.data.msg)
        }
      })
    },

    // 明细 
    order_detail(index, order){
      var env = this
      this.dlg_detail = true
      this.object = order
      this.new_lines_keys = []
      var q = {filters: [{name: 'series_code', op: '==', val: order.series_code}]}
      env.$http.get('/inv/adjust?q='+JSON.stringify(q)).then(function(resp){
        env.lines = resp.data.objects
      })
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
      this.load_objects(fs, sorter)
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
      
      env.$http.get('/inv/adjust?q='+JSON.stringify(q)).then(function(resp){
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
