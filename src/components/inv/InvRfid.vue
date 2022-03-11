<template>
  <div>
    <div>
        <a-row>
          <a-col :span="6">
            <a-breadcrumb style="padding:20px 20px 20px 0px;">
              <a-breadcrumb-item >基础信息</a-breadcrumb-item>
              <a-breadcrumb-item title="生成序列号">生成唯一码</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
          <a-col :span="18">
            <a-button @click="new_order()" type="primary" style="margin:15px 0;margin-left:10px;">新建</a-button>
          </a-col>
        </a-row>
    </div>

    <div>

      <a-modal title="新建唯一码" :visible="dlg_new" width="1200px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_new=false">
        <a-input :allowClear="true" v-model="current_good" id="current_good" @pressEnter="search_good" placeholder="货品码/条码/名称" style="margin-bottom:10px;width:400px;" />
        <a-button @click="search_good" style="margin-left:5px;margin-right:5px;" >搜索</a-button>
        <h4 style="display:block;font-weight:bold;">搜索结果：</h4>
        <a-table bordered :dataSource="new_goods" :columns="new_good_columns" :pagination="false" rowKey="id" v-if="new_goods.length > 0" :scroll="{y: 500 }">
          <span slot="num" slot-scope="text,record">
              <a-input :allowClear="true" v-model="record.num" placeholder="数量" style="width: 120px"></a-input>
          </span>
          <span slot="action" slot-scope="text,record">
              <a-popconfirm
                title="确定要生成这么多数量的唯一码?"
                @confirm="do_submit(record)"
                okText="确定"
                cancelText="取消"
              >
                <a-button style="float:right;" type="primary">生成唯一码</a-button>
            </a-popconfirm>
          </span>
        </a-table>
      </a-modal>

      <a-table :columns="order_columns"  :dataSource="objects"  bordered rowKey="id" :pagination="pagination" @change="table_filter_sort" :scroll="{x:'max-content'}">
        <span slot-scope="text,record" slot="printed">
          <span>{{ translate('print_state', record.printed) }}</span>
        </span>

        <span slot-scope="text,record,index" slot="action">
            <!--<a-button @click="export_excel(index, record)" style="margin-right:10px">导出</a-button>-->
            <a-button @click="export_csv(index, record)" style="margin-right:10px" type="primary">下载</a-button>
            <a-button @click="print_rfid_list(index, record)" style="margin-right:10px">打印预览</a-button>
        </span>
      </a-table>

    </div>

    <a-modal title="打印唯一码" :visible="dlg_print" width="900px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_print=false">
      <a-button @click="print_rfid" style="margin-right:10px" type="primary">打印</a-button>
      <div id="print-qrcode">
        <div v-for="rfid in rfid_list" :key="rfid.id">
          <div class="barcode" style="width:100%;text-align:center;"><img :src="rfid.qrcode_url" style="width:100%;" /></div>
          <div style="width:100%;text-align:center;">{{rfid.rfid}}</div>
          <div style="width:100%;text-align:left;">名称: {{rfid.name}}</div>
          <div style="width:100%;text-align:left;">货码: {{rfid.sku}}</div>
          <div style="page-break-after:always;"></div>
        </div>
      </div>
      <a-button @click="print_rfid" style="margin-right:10px"  type="primary">打印</a-button>
    </a-modal>

  </div>

</template>

<script type="text/javascript" src="<%= BASE_URL %>static/jquery.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/jquery.barcode.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/jquery.print.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/utils.js"></script>
<script>
export default {
  name: 'InvRfid',
  data () {
    return {
      objects: [],
      order: {},
      lines: [],
      line: {},
      rfid_list:[],

      order_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku', sorter: (a, b)=>(a.sku>b.sku),
        }, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode', sorter: (a, b)=>(a.barcode>b.barcode),
        }, 
        {title: '货品名', key: 'name', dataIndex: 'name', sorter: (a, b)=>(a.name>b.name),
        },
        {title: '数量', key: 'num', dataIndex: 'num', },
        {title: '打印', key: 'printed', dataIndex: 'printed', scopedSlots: { customRender: 'printed' }, },
        {title: '创建时间', key: 'create_time', dataIndex: 'create_time', sorter: (a, b)=>(a.create_time>b.create_time),
        },
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' },}
      ],

      // new order
      dlg_new: false,
      new_goods:[],
      new_good_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', rowClassName: 'no-print'}, 
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '货品名', key: 'name', dataIndex: 'name'}, 
        {title: '数量', key: 'num', dataIndex: 'num', scopedSlots: { customRender: 'num' }}, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' },}
      ],
      current_good: '',

      dlg_print:false,

      has_manager_perm:false,

      filter: {},
      sort: null,
      create_time_filter_icon:false,
      sku_filter_icon:false,
      barcode_filter_icon:false,
      name_filter_icon:false,

      current_page: 1,
      page_size: null,
      total_page: null,
      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},
    }
  },
  methods:{
    //------  新建单子 -------
    new_order(){
      this.dlg_new = true
      this.current_good = ''
      this.new_goods = []
      function bf(){
        $('#current_good').focus()
      }
      setTimeout(bf, 1);
    },
    do_submit(record){
      var env = this
      if(!(record.num && record.num*1 > 0)){
        this.$message.error('请输入数量')
        return
      }
      this.$http.post('/inv/rfid/gen', record).then(function(resp){
        if(resp.data.status){
          env.$message.success('创建成功')
          env.dlg_new = false
          env.load_objects()
        }
      })
    },
    search_good(){
      var env = this
      if(this.current_good){
        this.$http.get('/inv/good?q='+this.current_good).then(function(resp){
          env.new_goods = resp.data
        })
      }
      this.current_good = ''
    },
    //------ end 新

    export_csv(index, record){
      window.open('/inv/rfid/gen/download?id='+record.id)
    },

    print_rfid_list(index, record){
      var env = this
      this.$http.get('/inv/rfid/gen/print?id='+record.id).then(function(resp){
        env.rfid_list = resp.data.rfid_list
        env.$nextTick(function (){
          env.dlg_print = true
        })
      })
    },

    print_rfid(){
      var env = this
      env.$nextTick(function (){
        $('#print-qrcode').print({
                globalStyles: false,
                mediaPrint: true,
                //stylesheet: '/static/print.css',
                noPrintSelector: ".no-print",
                iframe: true,
                append: null,
                prepend: null,
                manuallyCopyFormValues: true,
                deferred: $.Deferred(),
                timeout: 750,
                doctype: '<!doctype html>'
        })
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

      q.page = this.pagination.current
      q.per_page = this.pagination.pageSize
      
      env.$http.get('/inv/rfid/gen?q='+JSON.stringify(q)).then(function(resp){
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
