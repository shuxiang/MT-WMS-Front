<template>
  <div>
    <div>
        <a-row>
          <a-col :span="6">
            <a-breadcrumb style="padding:20px 20px 20px 0px;">
              <a-breadcrumb-item >仓库管理</a-breadcrumb-item>
              <a-breadcrumb-item title="所有单据分配完成才能出库">波次出库</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
          <a-col :span="18">
          </a-col>
        </a-row>
    </div>

    <div>
      <a-modal title="波次出库" :visible="dlg_detail" @cancel="dlg_detail=false" width="1200px" :footer="null">
        <a-tabs  defaultActiveKey="1">
          <a-tab-pane label="出库单详情" tab="出库单详情" key="1">
          </a-tab-pane>
          <a-tab-pane label="拣货单" tab="拣货单" key="2">
            <div>
              <a-table :dataSource="order_allocs" :columns="unpick_columns" rowKey="id" bordered :pagination="false">
                <span slot-scope="text,record" slot="qty_unpick">
                  <span>{{ record.qty_alloc - record.qty_pick }}</span>
                </span>
              </a-table>
            </div>
            <div class="print2">
              <div class="barcode2"></div>
              <table border="1" cellspacing="0">
                <thead>
                  <tr>
                    <td>货品码</td>
                    <td>条码</td>
                    <td>名称</td>
                    <td>库位</td>
                    <!--<td>供应商</td>-->
                    <td>已分配数</td>
                    <td>已拣货数</td>
                    <td>未拣货数</td>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in order_allocs" v-bind:key="item.id">
                    <td>{{ item.sku }}</td>
                    <td>{{ item.barcode }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.location_code }}</td>
                    <!--<td>{{ item.supplier_code }}</td>-->
                    <td>{{ item.qty_alloc }}</td>
                    <td>{{ item.qty_pick }}</td>
                    <td>{{ item.qty_alloc - item.qty_pick }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="dialog-footer">
              <a-button @click="print_allocs()" style="float:right;margin-right:20px;">打印拣货单</a-button>
            </div>
          </a-tab-pane>
        </a-tabs>
      </a-modal>

      <a-form layout="inline" v-if="owner_conf.is_enable_search_bar" style="padding-left:15px;background-color:rgb(235,235,235);">
        <a-form-item label="波次号" >
          <a-input :allowClear="true"  placeholder="单号" v-model="query.order_code" style="width:160px;"/>
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

      <a-table :columns="order_columns"  :dataSource="objects"  bordered rowKey="id" :pagination="pagination" @change="table_filter_sort">
        <span slot-scope="text,record" slot="order_code">
          <router-link :to="{ name: 'StockoutMergeOne', params: {order_id: record.id} }">
              {{ record.order_code }}
          </router-link>
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
        <span slot-scope="text,record" slot="action">
            <router-link :to="{ name: 'StockoutMergeOne', params: { order_id: record.id }}">
                <a-button style="margin-right:10px" :type="record.state!='done' && record.state!='cancel'? 'primary':null">进入</a-button>
            </router-link>
        </span>
      </a-table>

    </div>

  </div>

</template>

<script type="text/javascript" src="<%= BASE_URL %>static/jquery.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/jquery.barcode.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/jquery.print.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/utils.js"></script>
<script>
import Tpl from '@/components/Tpl.vue'
export default {
  name: 'StockoutMerge',
  extends: Tpl,
  data () {
    return {
      partners: [],

      objects: [],
      order: {},
      lines: [],
      line: {},
      order_allocs: [],

      order_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id)}, 
        {title: '单号', key: 'order_code', dataIndex: 'order_code',
          scopedSlots: {customRender: 'order_code'},
        }, 
        {title: '状态', key: 'state', dataIndex: 'state', scopedSlots: { customRender: 'state' },  },
        {title: '分配', key: 'state_alloc', dataIndex: 'state_alloc', scopedSlots: { customRender: 'state_alloc' }, },
        {title: '拣货', key: 'state_pick', dataIndex: 'state_pick', scopedSlots: { customRender: 'state_pick' }, },
        //{title: '发运', key: 'state_ship', dataIndex: 'state_ship', scopedSlots: { customRender: 'state_ship' }, filters:this.$store.options['stockout_state_ship']},
        //{title: '回传', key: 'is_passback', dataIndex: 'is_passback', scopedSlots: { customRender: 'is_passback' }, },
        {title: '创建时间', key: 'create_time', dataIndex: 'create_time', sorter: (a, b)=>(a.create_time>b.create_time),
        },
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' },}
      ],
      unpick_columns: [
        //{title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id), rowClassName: 'no-print'}, 
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '货品名', key: 'name', dataIndex: 'name'}, 
        //{title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code'}, 
        {title: '已分配数', key: 'qty_alloc', dataIndex: 'qty_alloc'}, 
        {title: '已拣货数', key: 'qty_pick', dataIndex: 'qty_pick',  }, 
        {title: '未拣货数', key: 'qty_unpick', dataIndex: 'qty_unpick',  scopedSlots: { customRender: 'qty_unpick' },}, 
        //{title: '已发运数', key: 'qty_ship', dataIndex: 'qty_ship', rowClassName: 'no-print'}, 
        {title: '库位', key: 'location_code', dataIndex: 'location_code', },
        {title: '容器', key: 'lpn', dataIndex: 'lpn', rowClassName: 'no-print', }
      ],

      dlg_detail: false,

      like_filters: ['order_code'],
      create_time_filter_icon:false,
      order_code_filter_icon:false,
    }
  },
  methods:{
    cancel_order(){
      var env = this
      this.$http.post('/stockout/cancel/'+this.order.id).then(function(resp){
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
              title: '出库单: '+this.order.erp_order_code,
              doctype: '<!doctype html>'
      })
    },

    // 订单明细
    order_detail(index, order){
      var env = this
      this.order = order
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
      
      env.$http.get('/stockout/merge?q='+JSON.stringify(q)).then(function(resp){
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
    this.load_objects()
  },
  // after render
  mounted: function(){
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
