<template>
  <div>
    <div>
        <a-row>
          <a-col :span="6">
            <a-breadcrumb style="padding:20px 20px 20px 0px;">
              <a-breadcrumb-item >仓库管理</a-breadcrumb-item>
              <a-breadcrumb-item title="所有单据分配完成才能出库"><router-link :to="{ name: 'StockoutMerge' }">波次出库</router-link></a-breadcrumb-item>
              <a-breadcrumb-item title="所有单据分配完成才能出库">{{order.order_code}}</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
          <a-col :span="18">
          </a-col>
        </a-row>
    </div>

    <div>
      <a-modal title="扫货品条码打包" :visible="dlg_pack" width="1000px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_pack=false">
        <a-input :allowClear="true" v-model="pack_barcode" ref="pack_barcode" @pressEnter="add_pack_barcode" placeholder="请输入条码/货品码" style="margin-bottom:10px;width:400px;" />
        <a-input :allowClear="true" v-model="pack_boxcode" ref="pack_boxcode" placeholder="请输入包裹码, 可不填" style="margin-bottom:10px;width:200px;margin-left:10px;" />
        <a-table  :dataSource="pack_lines" :columns="pack_columns" rowKey="id" bordered :pagination="false">
          <span slot="qty_uncheck" slot-scope="text,record">
            {{ record.qty_pick - record.qty_check }}
          </span>
          <span slot="qty_pack" slot-scope="text,record">
            <a-input v-model="record.qty_pack"  :allowClear="true" style="width:150px;"/>
          </span>
        </a-table>
        <div class="dialog-footer">
          <a-button  @click="do_pack_clear()" style="float:right;" type="primary">清空</a-button>
          <a-button  @click="do_pack_submit()" style="float:right;margin-right:20px;" type="primary">提交包裹</a-button>
        </div>
      </a-modal>

      <a-form layout="inline" v-if="owner_conf.is_enable_search_bar" style="padding-left:15px;background-color:rgb(235,235,235);">
        <a-form-item>
          <a-button type="primary" v-if="order.state_alloc=='no' && order.state!='done' && order.state!='cancel'" @click="do_all_alloc">全部自动分配</a-button>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" v-if="order.state_pick=='no' && order.state_alloc=='done' && order.state!='cancel'" @click="do_all_pick">全部快速拣货</a-button>
        </a-form-item>
        <a-form-item>
          <a-popconfirm
              title="确定要取消波次吗?"
              @confirm="cancel_order()"
              okText="确定"
              cancelText="取消" v-if="order.state!='done' && order.state!='cancel'"
            >
              <a-button type="primary">取消波次</a-button>
          </a-popconfirm>
        </a-form-item>
        <a-form-item>
          <a-button @click="print_lines()" v-if="order.state!='cancel'">打印拣货单</a-button>
        </a-form-item>
      </a-form>

      <table border="0" cellspacing="0" class="h-tb">
        <thead>
          <tr>
            <td>
              波次号: <strong>{{ order.order_code }}</strong>
              状态: <strong>{{ translate('stockout_state', order.state) }}</strong> 
            </td>
            <td>
              分配状态: <strong>{{ translate('stockout_state_alloc', order.state_alloc) }}</strong> 
            </td>
            <td>
              拣货状态: <strong>{{ translate('stockout_state_pick', order.state_pick) }}</strong> 
            </td>
            <td>
              发运状态: <strong>{{ translate('stockout_state_ship', order.state_ship) }}</strong> 
            </td>
          </tr>
        </thead>
      </table>

      <a-tabs defaultActiveKey="1">
        <a-tab-pane tab="出库单" key="1">
          <a-table :columns="order_columns"  :dataSource="stockout_orders"  bordered rowKey="id" :pagination="false">
            <span slot-scope="text,record" slot="order_code">
              <router-link :to="{ name: 'StockoutOne', params: {order_id: record.id} }">
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
            <span slot-scope="text,record,index" slot="action">
              <a-button type="primary" v-if="record.state_alloc!='done'" style="margin-right:15px;" @click="do_throw_stockout(index, record)">剔除订单</a-button>

              <a-button type="primary" v-if="record.state_alloc!='done'" style="margin-right:15px;" @click="do_quick_alloc_confirm(index, record)">自动分配</a-button>
              <a-button type="primary" v-if="record.state_alloc=='done' && record.state_pick!='done'" style="margin-right:15px;" @click="do_quick_pick(index, record)">快速拣货</a-button>
              <a-button type="primary" v-if="record.state_alloc=='part' && record.state_pick=='no'" style="margin-right:15px;" @click="cancel_order_allocs_confirm(index, record)">取消分配</a-button>

              <a-button @click="do_pack_dlg(index, record)"  v-if="record.state_check!='done' && (record.state_pick=='done' || record.state_pick=='part')" style="margin-right:20px;" type="primary">复核打包</a-button>
            </span>
          </a-table>
        </a-tab-pane>
        <a-tab-pane tab="拣货单" key="2">
          <a-table :columns="unpick_columns"  :dataSource="order_allocs"  bordered rowKey="id" :pagination="false">
            <span slot-scope="text,record" slot="qty_unpick">
              <span>{{ record.qty_alloc-record.qty_pick }}</span>
            </span>
          </a-table>
        </a-tab-pane>
        <a-tab-pane tab="播种单" key="3">
          <a-table :columns="bo_columns"  :dataSource="bo_allocs"  bordered rowKey="id" :pagination="false">
            <span slot-scope="text,record,index" slot="idx">{{index+1}}</span>
          </a-table>
        </a-tab-pane>
      </a-tabs>

      <div class="print">
        <table border="0" cellspacing="0">
          <thead>
            <tr><td style="text-align:center;font-size:30px;margin-bottom:20px;" colspan="3" class="nb">波次拣货单</td></tr>
            <tr>
              <td class="nb">No: {{ order.order_code }}</td>
              <td class="nb">日期: {{ date_fmt(order.create_time) }}</td>
              <td class="nb">备注: {{order.remark}}</td>
            </tr>
          </thead>
        </table>
        <table border="1" cellspacing="0">
          <thead>
            <tr>
              <td>名称</td>
              <td>货码</td>
              <td>条码</td>
              <td>库位</td>
              <td>容器</td>
              <td>分配数量</td>
              <td>未拣货数</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in order_allocs"  v-bind:key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ item.sku }}</td>
              <td>{{ item.barcode }}</td>
              <td>{{ item.location_code }}</td>
              <td>{{ item.lpn }}</td>
              <td>{{ item.qty_alloc }}</td>
              <td>{{ item.qty_alloc-item.qty_pick }}</td>
            </tr>
          </tbody>
        </table>
      </div>

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
  name: 'StockoutMergeOne',
  extends: Tpl,
  data () {
    return {
      partners: [],

      order: {},
      stockout_orders: [],
      line: {},
      order_allocs: [],
      bo_allocs:[],

      order_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id)}, 
        {title: '出库单号', key: 'order_code', dataIndex: 'order_code',
          scopedSlots: {customRender: 'order_code'},
        }, 
        {title: '状态', key: 'state', dataIndex: 'state', scopedSlots: { customRender: 'state' },},
        {title: '分配状态', key: 'state_alloc', dataIndex: 'state_alloc', scopedSlots: { customRender: 'state_alloc' }, sorter: (a, b)=>(a.state_alloc-b.state_alloc)},
        {title: '拣货状态', key: 'state_pick', dataIndex: 'state_pick', scopedSlots: { customRender: 'state_pick' },sorter: (a, b)=>(a.state_pick-b.state_pick)},
        {title: '发运状态', key: 'state_ship', dataIndex: 'state_ship', scopedSlots: { customRender: 'state_ship' }, sorter: (a, b)=>(a.state_ship-b.state_ship)},
        //{title: '回传', key: 'is_passback', dataIndex: 'is_passback', scopedSlots: { customRender: 'is_passback' }, },
        {title: '创建时间', key: 'create_time', dataIndex: 'create_time', sorter: (a, b)=>(a.create_time>b.create_time),
        },
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' },}
      ],
      unpick_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode', rowClassName: 'no-print', }, 
        {title: '货品名', key: 'name', dataIndex: 'name'}, 
        {title: '分配数量', key: 'qty_alloc', dataIndex: 'qty_alloc'}, 
        {title: '已拣货数', key: 'qty_pick', dataIndex: 'qty_pick',  }, 
        {title: '未拣货数', key: 'qty_unpick', dataIndex: 'qty_unpick',  scopedSlots: { customRender: 'qty_unpick' },}, 
        {title: '库位', key: 'location_code', dataIndex: 'location_code', },
        {title: '容器', key: 'lpn', dataIndex: 'lpn', rowClassName: 'no-print', }
      ],

      bo_columns: [
        {title: '序号', key: 'idx', dataIndex: 'idx', scopedSlots: { customRender: 'idx' }},
        {title: '库位', key: 'location_code', dataIndex: 'location_code', },
        {title: '订单号', key: 'order_code', dataIndex: 'order_code'}, 
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode', rowClassName: 'no-print', }, 
        {title: '货品名', key: 'name', dataIndex: 'name'}, 
        {title: '播种数量', key: '_text', dataIndex: '_text'}, 
      ],

      // 扫码装箱, 打包发运
      current_out: null,
      lines: [],
      order_boxs: [],
      dlg_pack: false,
      pack_barcode: '',
      pack_boxcode: '',
      pack_lines: [],
      pack_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '名称', key: 'name', dataIndex: 'name'}, 
        {title: '拣货数', key: 'qty_pick', dataIndex: 'qty_pick'}, 
        {title: '未打包数', key: 'qty_uncheck', dataIndex: 'qty_uncheck', scopedSlots: {customRender: 'qty_uncheck'}}, 
        {title: '打包数', key: 'qty_pack', dataIndex: 'qty_pack', scopedSlots: {customRender: 'qty_pack'}}, 
      ],
      box_columns2: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '名称', key: 'name', dataIndex: 'name'}, 
        {title: '数量', key: 'qty', dataIndex: 'qty'}, 
      ],


      like_filters: ['order_code'],
      create_time_filter_icon:false,
      order_code_filter_icon:false,
    }
  },
  methods:{
    // 扫码装箱, 打包发运
    do_pack_dlg(index, record){
      var env = this
      this.pack_barcode = ''
      this.pack_boxcode = ''
      this.dlg_pack = true
      this.pack_lines = []
      this.current_out = record ? record : this.current_out
      this.lines = this.current_out.lines

      for(var i=0;i<env.lines.length;i++){
        var v = env.lines[i]
        if( (v.qty_pick-v.qty_check) > 0 ){
          env.pack_lines.push({id:v.id, name:v.name, sku:v.sku, barcode:v.barcode, spec:v.spec, unit:v.unit,
              qty_pick:v.qty_pick, qty_check:v.qty_check, qty_uncheck: v.qty_pick-v.qty_check, qty_pack:0})
        }
      }
      function bf(){
        env.$refs.pack_barcode.focus()
      }
      setTimeout(bf, 1);
    },
    do_pack_clear(){
      this.do_pack_dlg()
    },
    do_pack_submit(){
      var env = this
      if(this.pack_lines.length==0){
        return
      }
      var c = 0
      for(var i=0;i<env.pack_lines.length;i++){
        if(env.pack_lines[i].qty_pack*1>0){
          c += 1
        }
      }
      if(c==0){
        env.$message.warning('没有可以打包的数量')
      }
      this.$http.post('/stockout/stockout/box/pack/'+this.current_out.id, {lines:this.pack_lines, pack_boxcode:this.pack_boxcode}).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('打包成功')
          env.load_objects()
          env.dlg_pack = false
        }else{
          env.$message.error('打包出错: '+resp.data.msg)
        }
      })
    },
    add_pack_barcode(){
      var env = this
      var ok = false
      for(var i=0;i<env.pack_lines.length;i++){
        var v = env.pack_lines[i]
        if(env.pack_barcode==v.barcode){
          ok = true
          if(v.qty_pack<v.qty_uncheck){
            v.qty_pack += 1
          }else{
            env.$message.warning('未打包数不足, 不要重复扫码~')
            ok = false
          }
          break
        }
      }
      if(ok){
        playOk()
      }else{
        playErr()
      }
      env.pack_barcode = ''
      this.pack_boxcode = ''
    },
    // end 扫码装箱, 打包发运
    

    // 打印订单行
    print_lines(){
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
              title: '波次拣货单: '+this.order.order_code,
              doctype: '<!doctype html>'
      })
    },

    // 取消整个订单的分配
    cancel_order_allocs_confirm(index, out){
      var env = this;
      env.$http.post('/stockout/cancel_alloc/'+out.id).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success("取消订单分配成功")
          env.load_objects()
        }else{
          env.$message.error("取消订单分配失败: "+resp.data.msg)
        }
      })
    },

    // 快速分配
    do_quick_alloc_confirm(index, order){
      var env = this
      if(order.state_alloc =='done'){
        env.$message.error('改订单已经分配完成!', 3)
        return
      }
      // 自动分配
      env.$http.post('/stockout/alloc/'+order.id).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('分配成功', 3)
          env.load_objects()
        }else{
          env.$message.error('分配失败, '+resp.data.msg, 3)
        }
      })
    },

    // 快速拣货
    do_quick_pick(index, order){
      var env = this
      if(order.state_alloc != 'done'){
        env.$message.error('未分配完成的单子不能快速拣货')
        return
      }
      // 快速拣货
      this.$http.post('/stockout/quick_pick/'+order.id).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('快速拣货成功')
          env.load_objects()
        }else{
          env.$message.error('快速拣货失败, '+resp.data.msg)
        }
      })
    },  

    // 剔除某个订单
    do_throw_stockout(index, order){
      var env  = this
      this.$http.post('/stockout/merge/throw/'+env.order.id, {'stockout_id': order.id}).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('剔除出库单成功')
          env.load_objects()
        }else{
          env.$message.error('剔除出库单失败: ' +resp.data.msg)
        }
      })
    },

    // 取消波次
    cancel_order(){
      var env = this
      this.$http.delete('/stockout/merge/one/'+this.order.id).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('取消成功');
          env.$router.push({path:'/StockoutMerge'})
        }else{
          env.$message.error('取消失败: '+resp.data.msg)
        }
      })
    },

    // 全部自动分配
    do_all_alloc(){
      var env = this
      this.$http.post('/stockout/merge/alloc/'+env.order.id).then(function(resp){
        if(resp.data.status=='success'){
          if(resp.data.state_alloc!='done'){
            env.$message.warning('自动分配存在 部分 订单没有分配完全, 可能库存不足')
          }else if(resp.data.state_alloc=='no'){
            env.$message.warning('库存不足')
          }else{
            env.$message.success('分配成功')
          }
          env.load_objects()
        }else{
          env.$message.error('自动分配失败, '+resp.data.msg)
        }
      })
    },

    // 全部快速拣货
    do_all_pick(){
      var env = this
      this.$http.post('/stockout/merge/pick/'+env.order.id).then(function(resp){
        if(resp.data.status=='success'){
          if(resp.data.state_pick=='part'){
            env.$message.success('快速拣货存在 部分 订单没有拣货完全, 可能有订单分配没完成')
          }else if(resp.data.state_pick=='no'){
            env.$message.warning('快速拣货失败, 请检查分配是否完成')
          }else{
            env.$message.success('拣货成功')
          }
          env.load_objects()
        }else{
          env.$message.error('快速拣货失败, '+resp.data.msg)
        }
      })
    },

    // load data
    load_objects(filters, sort){
      var env = this
      
      env.$http.get('/stockout/merge/one/'+this.$route.params.order_id).then(function(resp){
        env.order = resp.data.order
        env.stockout_orders = resp.data.stockout_orders || []
        env.order_allocs = resp.data.order_allocs || []

      })
      env.$http.get('/stockout/merge/alloc/'+this.$route.params.order_id).then(function(resp){
        env.bo_allocs = resp.data.data
      })
    },
    // end
  },
  // before render
  created:function() {
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
