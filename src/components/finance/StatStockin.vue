<template>
  <div>
    <div>
        <a-row>
          <a-col :span="6">
            <a-breadcrumb style="padding:20px 20px 20px 0px;">
              <a-breadcrumb-item >数据管理</a-breadcrumb-item>
              <a-breadcrumb-item title=""><router-link :to="{ name: 'StatStockin' }">入库单统计</router-link></a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
          <a-col :span="18">
          </a-col>
        </a-row>
    </div>

    <a-modal :title="'明细'" :visible="dlg_detail" width="1000px" :footer="null" :keyboard="false" @cancel="dlg_detail=false">
      <a-table bordered :dataSource="detail_list" :columns="detail_columns" :pagination="false" rowKey="id" :scroll="{x:'max-content'}">
        <span slot='supplier_code'  slot-scope="text,record">{{ record.partner_name||record.partner_code }}</span>
      </a-table>
    </a-modal>

    <a-form layout="inline" style="padding-left:15px;background-color:rgb(235,235,235);">
      <a-form-item label="货品名称"  prop="qstr">
        <a-input placeholder="货品名称" v-model="summary.qstr"></a-input>
      </a-form-item>
      <a-form-item label="时间类型"  prop="time_type">
        <a-select :defaultValue="summary.time_type" style="width: 160px"  v-model="summary.time_type" >
          <a-select-option value="" v-bind:key="''">--选择时间类型--</a-select-option>
          <a-select-option :value="item.value" v-for="item in time_type_dict" v-bind:key="item.value">{{item.label}}</a-select-option>
        </a-select> 
      </a-form-item>
      <a-form-item label="时间范围"  prop="month" >
        <a-date-picker v-model="summary.date1" :format="'YYYY-MM-DD'" placeholder="开始时间"  style="width:120px;"/> -
        <a-date-picker v-model="summary.date2" :format="'YYYY-MM-DD'" placeholder="结束时间"  style="width:120px;"/>
      </a-form-item> 
      <a-form-item label="订单类型"  prop="order_type">
        <a-select :defaultValue="summary.order_type" style="width: 160px"  v-model="summary.order_type" >
          <a-select-option value="" v-bind:key="''">--选择订单类型--</a-select-option>
          <a-select-option :value="item.value" v-for="item in $store.options.stockin_xtype" v-bind:key="item.value">{{item.label}}</a-select-option>
        </a-select> 
      </a-form-item>
      <a-form-item label="分组规则"  prop="group_by">
        <a-select :defaultValue="summary.group_by" style="width: 160px"  v-model="summary.group_by" >
          <a-select-option value="" v-bind:key="''">--选择订单类型--</a-select-option>
          <a-select-option :value="item.value" v-for="item in group_dict" v-bind:key="item.value">{{item.label}}</a-select-option>
        </a-select> 
      </a-form-item>
      <a-form-item prop="action">
        <a-button @click="load_objects" style="margin-right:15px;">查询</a-button>
        <a-button @click="export_objects">导出</a-button>
      </a-form-item>
    </a-form>

    <h3 style="padding-left:20px;">总额: ¥{{ mfmt(amount) }} </h3>
    <a-table :dataSource="objects" :columns="object_columns" bordered rowKey="id" :pagination="pagination" @change="table_filter_sort" v-if="objects.length>0" :scroll="{x:'max-content'}">
      <span slot-scope="text,record" slot="price">
        <span>¥{{ mfmt(record.price) }}</span>
      </span>
      <span slot-scope="text,record,index" slot="action">
        <span><a-button @click="load_detail(index,record)">明细</a-button></span>
      </span>
    </a-table>

  </div>
</template>

<script type="text/javascript" src="<%= BASE_URL %>static/utils.js"></script>
<script>
export default {
  name: 'StatStockin',
  data () {
    return {
      amount: 0,
      summary: {date1:null, date2:null, time_type:'', group_by:'', order_type:''},
      objects: [],

      object_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku', }, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode', }, 
        {title: '名称', key: 'name', dataIndex: 'name', }, 
        //{title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code',},// filters:this.$store.suppliers},
        {title: '规格', key: 'spec', dataIndex: 'spec'},  
        {title: '入库数量', key: 'qty_real', dataIndex: 'qty_real', sorter: (a, b)=>(a.qty_real-b.qty_real)}, 
        {title: '总价', key: 'price', dataIndex: 'price', scopedSlots: { customRender: 'price' }}, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' }}, 
      ],

      // detail
      dlg_detail: false,
      detail_columns:[
        {title: '货品码', key: 'sku', dataIndex: 'sku', }, 
        {title: '名称', key: 'name', dataIndex: 'name',}, 
        {title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code', scopedSlots: {customRender:'supplier_code'}},
        {title: '规格', key: 'spec', dataIndex: 'spec'},  
        {title: '数量', key: 'qty_real', dataIndex: 'qty_real', }, 
        {title: '单价', key: 'price_one', dataIndex: 'price_one', scopedSlots: { customRender: 'price_one' }}, 
        {title: '时间', key: 'create_time', dataIndex: 'create_time', }, 
      ],
      detail_list:[],

      has_manager_perm:false,

      filter: {},
      sort: null,
      code_filter_icon: false,
      name_filter_icon: false,
      barcode_filter_icon: false,
      like_filters: ['sku', 'name'],

      current_page: 1,
      page_size:20,
      total_page:0,
      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},
      time_type_dict: [{value:'create_time', label:'订单创建时间'} , {label:'订单完结时间', value:'finish_time'}, {label:'物料入库时间', value:'in_time'}],
      // group_dict: [{value:'supplier_code', label:'供应商'} , {label:'规格', value:'spec'}, {label:'规格&供应商', value:'both'}],
      group_dict: [{label:'规格', value:'spec'}, ],
    }
  },
  methods:{
    load_detail(index, record){
      var env = this
      env.$http.post('/finance/stat/goods/stockin/detail?sku='+record.sku, this.summary).then(function(resp){
        env.detail_list = resp.data.objects
        env.dlg_detail = true
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
      this.page_size = pagination.pageSize
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
      console.log(q.order_by)

      q.page = this.pagination.current
      q.per_page = this.pagination.pageSize

      this.summary.page = q.page
      this.summary.order_by = q.order_by
      this.summary.per_page = this.page_size
      
      env.$http.post('/finance/stat/goods/stockin', this.summary).then(function(resp){
        env.objects = resp.data.objects

        env.total_page = resp.data.total_pages
        env.current_page = resp.data.page
        env.page_size = resp.data.per_page
        env.pagination.total = resp.data.num_results
        env.pagination.current = resp.data.page
        env.pagination.pageSize = resp.data.per_page
        env.amount = resp.data.amount
      })
    },
    export_objects(){
      // console.log(JSON.parse(JSON.stringify(this.summary)))
      window.open('/finance/stat/goods/stockin?export=xlsx&'+to_querystring(JSON.parse(JSON.stringify(this.summary))), "_blank")
    },
    // end
  },
  // before render
  created:function() {
    var env = this
    // load objects
    this.load_objects()
  },
  // after render
  mounted: function(){
    this.load_choice()
  },
}
</script>
