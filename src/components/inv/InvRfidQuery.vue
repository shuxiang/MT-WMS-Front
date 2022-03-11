<template>
  <div>
    <div>
        <a-row>
          <a-col :span="6">
            <a-breadcrumb style="padding:20px 20px 20px 0px;">
              <a-breadcrumb-item >仓库管理</a-breadcrumb-item>
              <a-breadcrumb-item title="查询唯一码">唯一码库存</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
          <a-col :span="18">
          </a-col>
        </a-row>
    </div>

      <a-form layout="inline" v-if="owner_conf.is_enable_search_bar" style="padding-left:15px;background-color:rgb(235,235,235);">
        <a-form-item label="唯一码">
          <a-input :allowClear="true"  placeholder="唯一码" v-model="query.rfid" />
        </a-form-item>
        <a-form-item label="条码">
          <a-input :allowClear="true"  placeholder="条码" v-model="query.barcode" />
        </a-form-item>
        <a-form-item label="货码">
          <a-input :allowClear="true"  placeholder="货码" v-model="query.sku"/>
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

        <a-table width="100%" :columns="inv_columns"  :dataSource="objects"  bordered rowKey="id" :pagination="pagination" @change="table_filter_sort" :scroll="{x:'max-content'}">
          <span slot-scope="text,record,index" slot="action">
            <a-button @click="print_rfid_list(index, record)" style="margin-right:10px">打印二维码</a-button>
          </span>
        </a-table>

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
      </a-modal>

  </div>
</template>

<script type="text/javascript" src="<%= BASE_URL %>static/jquery.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/jquery.print.min.js"></script>
<script>
import Tpl from '@/components/Tpl.vue'
export default {
  name: 'InvRfidQuery',
  extends: Tpl,
  data () {
    return {
      inv_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id)}, 
        {title: 'RFID', key: 'rfid', dataIndex: 'rfid', scopedSlots: {customRender: 'rfid'}}, 
        {title: '货品码', key: 'sku', dataIndex: 'sku', sorter: (a, b)=>(a.sku > b.sku), 
          scopedSlots: {customRender: 'sku', },
        }, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode', sorter: (a, b)=>(a.barcode > b.barcode), 
          scopedSlots: {customRender: 'barcode', },
        }, 
        {title: '名称', key: 'name', dataIndex: 'name', scopedSlots: {customRender: 'name', },
        }, 
        {title: '库位', key: 'location_code', dataIndex: 'location_code', sorter: (a, b)=>(a.location_code-b.location_code), 
          scopedSlots: {customRender: 'location_code', },
        }, 
        {title: '数量', key: 'qty', dataIndex: 'qty', sorter: (a, b)=>(a.qty-b.qty)},
        {title: '货类码', key: 'category_code', dataIndex: 'category_code'}, 
        {title: '单位', key: 'unit', dataIndex: 'unit'}, 
        {title: '规格', key: 'spec', dataIndex: 'spec'}, 
        {title: '容器', key: 'lpn', dataIndex: 'lpn',}, 
        {title: '入库单号', key: 'stockin_order_code', dataIndex: 'stockin_order_code',},
        {title: '出库单号', key: 'stockout_order_code', dataIndex: 'stockout_order_code',},
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: {customRender: 'action'}}, 
      ],
      objects: [],

      rfid_list:[],
      dlg_print: false,

      has_manager_perm:false,

      sku_filter_icon: false,
      barcode_filter_icon:false,
      location_code_filter_icon:false,
      name_filter_icon:false,
      like_filters: ['sku', 'name', 'barcode', 'location_code'],
    }
  },
  methods:{
    print_rfid_list(index, record){
      var env = this
      env.rfid_list = [record]
      env.dlg_print = true
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
      
      env.$http.get('/inv/rfid?q='+JSON.stringify(q)).then(function(resp){
        env.objects = resp.data.objects

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
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.w135{width: 137px;}
</style>
