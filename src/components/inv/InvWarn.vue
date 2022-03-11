<template>
  <div>
    <div>
        <a-row>
          <a-col :span="6">
            <a-breadcrumb style="padding:20px 20px 20px 0px;">
              <a-breadcrumb-item >仓库管理</a-breadcrumb-item>
              <a-breadcrumb-item title="所有库位的可用库存数加起来, 小于货品设定的`最低库存`或大于货品设定的`最高库存`, 则会产生告警">库存预警</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
          <a-col :span="18">
            <a-button @click="export_by_filter()" style="margin:15px 0;margin-left:10px;">导出</a-button>
          </a-col>
        </a-row>
    </div>
    <div>
      <a-tabs defaultActiveKey="1" @change="change_tab">
        <a-tab-pane tab="高库存告警" key="1"></a-tab-pane>
        <a-tab-pane tab="低库存告警" key="2" forceRender></a-tab-pane>
      </a-tabs>

        <a-table width="100%" :columns="inv_columns"  :dataSource="objects"  bordered rowKey="id" :pagination="pagination" @change="table_filter_sort" :rowClassName="new_goods_class" :scroll="{x:'max-content'}">
          <span slot-scope="text,record" slot="product_date"><!-- 似乎无效 -->
            <span>{{ record.product_date }}</span>
          </span>
        </a-table>

    </div>
  </div>
</template>

<script>
export default {
  name: 'InvWarn',
  data () {
    return {
      inv_columns: [
        // {title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id)}, 
        {title: '货品码', key: 'sku', dataIndex: 'sku', sorter: (a, b)=>(a.sku > b.sku), 
          scopedSlots: {customRender: 'sku', },
        }, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode', sorter: (a, b)=>(a.barcode > b.barcode), 
          scopedSlots: {customRender: 'barcode', },
        }, 
        {title: '货品名称', key: 'name', dataIndex: 'name', scopedSlots: {customRender: 'name', },
        }, 
        {title: '可用数量', key: 'qty_real', dataIndex: 'qty_real', }, 
        {title: '告警数量', key: 'qty_warn', dataIndex: 'qty_warn', }, 
        /*
        {title: '锁定数', key: 'qty_alloc', dataIndex: 'qty_alloc'}, 
        {title: '可用数', key: 'qty_able', dataIndex: 'qty_able', sorter: (a, b)=>(a.qty_able-b.qty_able)}, 
        {title: '货类码', key: 'category_code', dataIndex: 'category_code'}, 
        {title: '单位', key: 'unit', dataIndex: 'unit'}, 
        {title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code', }, 
        {title: '生产日期', key: 'product_date', dataIndex: 'product_date', scopedSlots: { customRender: 'product_date' }, sorter: (a, b)=>(a.product_date > b.product_date)},
        {title: '批次号', key: 'batch_code', dataIndex: 'batch_code', scopedSlots: { customRender: 'batch_code' }, },
        {title: '质量', key: 'quality_type', dataIndex: 'quality_type', scopedSlots: { customRender: 'quality_type' }, },
        {title: '容器', key: 'lpn', dataIndex: 'lpn',}, 
        {title: '库区码', key: 'area_code', dataIndex: 'area_code',},
        {title: '工作区码', key: 'workarea_code', dataIndex: 'workarea_code',}
        */
      ],
      objects: [],
      tab: '1',

      has_manager_perm:false,

      filter: {},
      sort: null,
      without_batch: true,
      sku_filter_icon: false,
      barcode_filter_icon:false,
      location_code_filter_icon:false,
      name_filter_icon: false,
      like_filters: ['code', 'name', 'barcode'],

      current_page: 1,
      page_size:20,
      total_page:0,
      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},
    }
  },
  methods:{
    new_goods_class(record, index){
      return 'red-tb-row'
    },
    change_tab(tab, event){
      var env = this
      if(tab.name=='second' || tab=="2"){
        env.tab = '2'
        env.load_objects()
      }else{
        env.tab = '1'
        env.load_objects()
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
      this.load_objects(fs, sorter)
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

    export_by_filter(){
      var env = this
      var q = {}
      var filters = this.fetch_filter()
      var sort = this.sort

      if (filters){
        q.filters = filters
      }
      if (sort){
        q.order_by = [sort]
      }
      q.tab = env.tab
      var name = env.tab == '2'? '低库存告警.xlsx' : '高库存告警.xlsx'

      var data = {
          name: name, 
          xtype: 'export', 
          code: 'export_invwarn', 
          func: 'blueprints.auth.tasks.export_invwarn:export_invwarn', 
          func_name: '入库单导出'}

      this.$http.post('/async/table_export?q='+JSON.stringify(q), data).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('导出任务创建成功，请到 "数据管理>导入导出" 中查看', 3)
          if (env.$store.owner_conf && env.$store.owner_conf.is_sync_downfile){
            window.open('/async/download/'+resp.data.data.id, "_blank")
          }
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
        this.without_batch = false
      }
      q.page = this.pagination.current
      q.per_page = this.pagination.pageSize
      
      var url = '/inv/warn/high?q='
      if (env.tab == '2'){
        url = '/inv/warn/low?q='
      }
      env.$http.get(url+JSON.stringify(q)).then(function(resp){
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
