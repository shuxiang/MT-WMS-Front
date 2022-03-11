<template>
  <div>
    <div>
      <a-row>
        <a-col :span="6">
          <a-breadcrumb style="padding:20px 20px 20px 0px;">
            <a-breadcrumb-item >仓库管理</a-breadcrumb-item>
            <a-breadcrumb-item title="可以区分批次查询或者合并批次查询; 批次按（库位，货品码）进行合并，合并批次后，显示的批次属性没有意义">库存查询</a-breadcrumb-item>
          </a-breadcrumb>
        </a-col>
        <a-col :span="18">
          <!--<a-checkbox v-model="without_batch" style="margin:15px 0;line-height:32px;margin-left:10px;">合并批次</a-checkbox>-->
          <a-popconfirm title="确定要冻结这些库存吗?" @confirm="do_submit_freeeze()" okText="确定" cancelText="取消" 
          style="margin:15px 0;line-height:32px;margin-left:20px;">
            <a-button type="primary">冻结</a-button>
          </a-popconfirm>
          <a-popconfirm title="确定要解冻这些库存吗?" @confirm="do_submit_unfreeeze()" okText="确定" cancelText="取消" 
          style="margin:15px 0;line-height:32px;margin-left:20px;"
          v-if="owner_conf.is_enable_inv_unfreeze"
          >
            <a-button type="primary">解冻</a-button>
          </a-popconfirm>
          <a-button @click="export_excel()" style="margin:15px 0;margin-left:20px;">导出</a-button>
        </a-col>
      </a-row>
    </div>

      <a-form layout="inline" v-if="owner_conf.is_enable_search_bar" style="padding-left:15px;background-color:rgb(235,235,235);">
        <a-form-item label="条码">
          <a-input :allowClear="true"  placeholder="条码" v-model="query.barcode" />
        </a-form-item>
        <a-form-item label="货码">
          <a-input :allowClear="true"  placeholder="货码" v-model="query.code"/>
        </a-form-item>
        <a-form-item label="名称">
          <a-input :allowClear="true"  placeholder="名称"  v-model="query.name" />
        </a-form-item>
        <a-form-item label="库位">
          <a-input :allowClear="true"  placeholder="库位"  v-model="query.location_code" />
        </a-form-item>
        <a-form-item>
          <a-button icon="search" @click="search_query">查询</a-button>
        </a-form-item>
      </a-form>

        <a-table width="100%" :columns="inv_columns"  :dataSource="objects"  bordered rowKey="id" :pagination="pagination" @change="table_filter_sort" :scroll="{x:'max-content'}" :row-selection="{selectedRowKeys:invid_list, onChange: selection_inv }">
          <span slot-scope="text,record" slot="product_date"><!-- 似乎无效 -->
            <span>{{ record.product_date }}</span>
          </span>
        </a-table>
  </div>
</template>

<script>
export default {
  name: 'InvFreeze',
  data () {
    return {
      inv_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id)}, 
        {title: '货品码', key: 'sku', dataIndex: 'sku', sorter: (a, b)=>(a.sku > b.sku), 
          scopedSlots: {customRender: 'sku', },
        }, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode', sorter: (a, b)=>(a.barcode > b.barcode), 
          scopedSlots: {customRender: 'barcode', },
        }, 
        {title: '名称', key: 'name', dataIndex: 'name', scopedSlots: {customRender: 'name',},
        }, 
        {title: '库位', key: 'location_code', dataIndex: 'location_code', sorter: (a, b)=>(a.location_code-b.location_code), 
          scopedSlots: {customRender: 'location_code', },
        }, 
        {title: '数量', key: 'qty', dataIndex: 'qty', sorter: (a, b)=>(a.qty-b.qty)}, 
        {title: '锁定数', key: 'qty_alloc', dataIndex: 'qty_alloc'}, 
        {title: '可用数', key: 'qty_able', dataIndex: 'qty_able', sorter: (a, b)=>(a.qty_able-b.qty_able)}, 
        {title: '冻结数', key: 'qty_freeze', dataIndex: 'qty_freeze', sorter: (a, b)=>(a.qty_freeze-b.qty_freeze)}, 
        {title: '货类码', key: 'category_code', dataIndex: 'category_code'}, 
        {title: '单位', key: 'unit', dataIndex: 'unit'}, 
        {title: '规格', key: 'spec', dataIndex: 'spec'}, 
        {title: '批次号', key: 'batch_code', dataIndex: 'batch_code', scopedSlots: { customRender: 'batch_code' }, },
        {title: '质量', key: 'quality_type', dataIndex: 'quality_type', scopedSlots: { customRender: 'quality_type' }, },
        {title: '容器', key: 'lpn', dataIndex: 'lpn',}, 
        {title: '库区', key: 'area_code', dataIndex: 'area_code',},
        //{title: '工作区码', key: 'workarea_code', dataIndex: 'workarea_code',}
        {title: '入库日期', key: 'stockin_date', dataIndex: 'stockin_date',},
        {title: '来源单号', key: 'refin_order_code', dataIndex: 'refin_order_code',},
        {title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code', }, 
        {title: '生产日期', key: 'product_date', dataIndex: 'product_date', scopedSlots: { customRender: 'product_date' }, sorter: (a, b)=>(a.product_date > b.product_date)},
      ],
      objects: [],

      dlg_freeze: false,
      invid_list:[],

      has_manager_perm:false,

      filter: {},
      query: {},
      sort: null,
      without_batch: false,
      sku_filter_icon: false,
      barcode_filter_icon:false,
      location_code_filter_icon:false,
      name_filter_icon:false,
      like_filters: ['code', 'name', 'barcode', 'location_code'],

      current_page: 1,
      page_size:20,
      total_page:0,
      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},
    }
  },
  methods:{
    // selection
    selection_inv(selectedRowKeys, selectedRows){
      var env = this
      this.invid_list = selectedRowKeys
    },

    // 提交冻结
    do_submit_freeeze(){
      var env = this
      if(env.invid_list.length>0){
        this.$http.post('/inv/freeze/do', {inv_list:env.invid_list}).then(function(resp){
          if(resp.data.status=='success'){
            env.invid_list = []
            env.dlg_freeze = false
            env.load_objects()
            env.$message.success('冻结成功')
          }else{
            env.$message.error('冻结失败：'+resp.data.msg)
          }
        })
      }else{
        if(env.invid_list.length==0){
          env.$message.warning('请先选择要冻结的库存行')
        }
      }
    },

    // 解冻
    do_submit_unfreeeze(){
      var env = this
      if(env.invid_list.length>0){
        this.$http.post('/inv/freeze/undo', {inv_list:env.invid_list}).then(function(resp){
          if(resp.data.status=='success'){
            env.invid_list = []
            env.dlg_freeze = false
            env.load_objects()
            env.$message.success('解冻成功')
          }else{
            env.$message.error('解冻失败：'+resp.data.msg)
          }
        })
      }else{
        if(env.invid_list.length==0){
          env.$message.warning('请先选择要解冻的库存行')
        }
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
        if(this.like_filters.indexOf(q) > -1){
          filters.push({name: q, op: 'ilike', val:this.query[q]})
        }else{
          filters.push({name: q, op: '==', val:this.query[q]})
        }
      }
      this.load_objects(filters, this.sort)
    },

    // 导出
    export_excel(){
      var filters = this.fetch_filter()
      var env = this
      var q = {}

      if (filters){
        q.filters = filters
      }
      if (this.without_batch){
        q.without_batch = true
      }

      var data = {
          name: '库存导出.xlsx', 
          xtype: 'export', 
          code: 'export_inv', 
          func: 'blueprints.auth.tasks.export_inv:export_inv', 
          func_name: '库存导出'}

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
      if (this.without_batch){
        q.without_batch = true
        // this.without_batch = false
      }
      q.page = this.pagination.current
      q.per_page = this.pagination.pageSize
      
      env.$http.get('/inv/inv?q='+JSON.stringify(q)).then(function(resp){
        env.objects = resp.data.objects
        env.without_batch = resp.data.without_batch

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
