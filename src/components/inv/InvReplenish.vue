<template>
  <div>
    <div>
      <a-row>
        <a-col :span="6">
          <a-breadcrumb style="padding:20px 20px 20px 0px;">
            <a-breadcrumb-item >仓库管理</a-breadcrumb-item>
            <a-breadcrumb-item title=" ">库位补货</a-breadcrumb-item>
          </a-breadcrumb>
        </a-col>
        <a-col :span="18">
          <a-button  @click="do_create()" style="margin:15px 0;" type="primary">新建补货条件</a-button>
          <a-popconfirm
                title="你确定要创建移库补货单?"
                @confirm="do_replenish()"
                okText="确定"
                cancelText="取消"
              >
            <a-button style="margin:15px 0;margin-left:20px;" type="primary">生成补货移库单</a-button>
          </a-popconfirm>
        </a-col>
      </a-row>
    </div>

      <a-modal :title="dlg_title" :visible="dlg_new" width="600px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_new=false">
        <a-form-model :layout="'horizontal'"  :rules="rules" :model="object" >
          <a-form-model-item label="货品码" prop="sku" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-auto-complete placeholder="货品码" @focus="handle_search_good('')" @select="select_good" optionLabelProp="value" @change="handle_search_good" :backfill="true" v-model="object.sku" ref="sku" :disabled="is_edit">
              <template slot="dataSource">
                  <a-select-option v-for="item in goods" :key="item.code">
                    <strong>{{item.code}} </strong><span class="certain-search-item-count">{{item.name}}</span>
                  </a-select-option>
              </template>
            </a-auto-complete>
          </a-form-model-item>
          <a-form-model-item label="名称" prop="name" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="object.name"  placeholder="必填"></a-input>
          </a-form-model-item>
          <a-form-model-item label="条码" prop="barcode" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="object.barcode" :disabled="is_edit" placeholder="必填"></a-input>
          </a-form-model-item>
          <a-form-model-item label="库位" prop="location_code" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.location_code"></a-input>
          </a-form-model-item>
          <a-form-model-item label="告警数量" prop="min_qty" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.min_qty"></a-input>
          </a-form-model-item>
          <a-form-model-item label="补齐数量" prop="max_qty" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.max_qty"></a-input>
          </a-form-model-item>
        </a-form-model>
        <div  class="dialog-footer">
          <a-button @click="do_submit()" style="float:right" type="primary"><a>提交</a></a-button>
        </div>
      </a-modal>

      <a-table :dataSource="objects" :columns="object_columns" bordered rowKey="id" :pagination="pagination" @change="table_filter_sort">
        <span slot="action" slot-scope="text,record,index">
          <a-button @click="do_edit(index, record)"  type="primary">修改</a-button>
        </span>
      </a-table>

  </div>
</template>

<script>
import Tpl from '@/components/Tpl.vue'
export default {
  name: 'InvReplenish',
  extends: Tpl,
  data () {
    return {
      rules: {
        location_code: [
          {required: true, message: '必填', trigger: 'change'},
          {min:1, max:50, message:'必填, 长度1位以上', trigger: 'change'},
        ],
        sku: [
          {required: true, message: '必填', trigger: 'change'},
          {min:2, max:50, message:'必填, 长度2位以上', trigger: 'change'},
        ],
        min_qty: [
          {required: true, message: '必填, 数字', trigger: 'change'},
          {pattern:/\d+/, message:'必填, 长度2位以上', trigger: 'change'},
        ],
        max_qty: [
          {required: true, message: '必填, 数字', trigger: 'change'},
          {pattern:/\d+/, message:'必填, 长度2位以上', trigger: 'change'},
        ],
      },
      objects: [],
      object: {},
      goods: [],
      goods_dict: {},

      object_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id), rowClassName: 'no-print'}, 
        {title: '货品码', key: 'sku', dataIndex: 'sku', scopedSlots: {customRender: 'sku'},}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode', }, 
        {title: '名称', key: 'name', dataIndex: 'name', }, 
        {title: '库位', key: 'location_code', dataIndex: 'location_code'}, 
        {title: '告警数量', key: 'min_qty', dataIndex: 'min_qty'}, 
        {title: '补齐数量', key: 'max_qty', dataIndex: 'max_qty'}, 
        {title: '操作', key: 'action', dataIndex: 'action', rowClassName: 'no-print', scopedSlots: { customRender: 'action' }}, 
      ],

      dlg_title: '创建补货条件',
      dlg_new: false,
      is_edit: false,
      has_manager_perm:false,

      filter: {},
      sort: null,
      sku_filter_icon: false,
      name_filter_icon: false,
      barcode_filter_icon: false,
      like_filters: ['sku', 'name'],

      current_page: 1,
      page_size:20,
      total_page:0,
      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},
    }
  },
  methods:{

    do_create(){
      this.dlg_title = '创建补货条件'
      this.dlg_new = true
      this.object = {location_code:'STAGE'}
      this.is_edit = false
      var env = this
      function bf(){
        env.$refs.sku.focus()
      }
      setTimeout(bf, 1);
    },

    do_edit(index, object){
      this.dlg_title = '修改'
      this.dlg_new = true
      this.object = object
      this.is_edit = true
    },  

    do_submit(){
      var env = this
      if (this.object.id){
        // update
        this.$http.put('/inv/replenish/invwarn', this.object).then(function(resp){
          if(resp.data.status=='success'){
            env.load_objects()
            env.dlg_new = false
            env.$message.success('修改成功')
          }else{
            env.$message.error('修改失败：'+resp.data.msg)
          }
        })
      }else{
        // create
        this.$http.post('/inv/replenish/invwarn', this.object).then(function(resp){
          if(resp.data.status=='success'){
            env.load_objects()
            env.dlg_new = false
            env.$message.success('创建成功')
          }else{
            env.$message.error('创建失败：'+resp.data.msg)
          }
        })
      }
    },
    do_replenish(){
      var env = this
      this.$http.get('/inv/replenish/compute/move').then(function(resp){
        if(resp.data.status=='success'){
          env.dlg_new = false
          env.$message.success('创建成功, 补货移库单号: '+resp.data.series_code, 3)
        }else{
          env.$message.error('创建失败：'+resp.data.msg, 3)
        }
      })
    },

    // 推荐
    select_good(val, option){
      for(var i=0;i<this.goods.length;i++){
        if(this.goods[i].sku==val){
          this.object.name = this.goods[i].name
          this.object.barcode = this.goods[i].barcode
        }
      }
      return this.object.sku = val
    },
    handle_search_good(val){
      var env = this
      val = val || ''
      this.$http.get('/inv/good?q='+val).then(function(resp){
        env.goods_dict[val] = resp.data
        env.goods = resp.data
      })
    },
    // end

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
      
      env.$http.get('/inv/replenish/invwarn?q='+JSON.stringify(q)).then(function(resp){
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
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.w135{width: 135px;}
</style>
