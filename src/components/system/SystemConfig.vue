<template>
  <div>
    <div>
        <a-row>
          <a-col :span="6">
            <a-breadcrumb style="padding:20px 20px 20px 0px;">
              <a-breadcrumb-item >系统管理</a-breadcrumb-item>
              <a-breadcrumb-item title="参数配置">参数配置</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
          <a-col :span="18">
            <a-button  @click="do_create()" style="margin:15px 0;" type="primary">创建配置</a-button>
          </a-col>
        </a-row>
    </div>

      <a-modal title="配置项修改" :visible="dlg_detail" width="600px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_detail=false" >
        <a-form  :layout="'horizontal'">
          <a-form-item label="类别" prop="code"  :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-select style="width: 200px" v-model="object.code">
              <a-select-option :value="item.value" v-for="item in options.conf_code" v-bind:key="item.value">{{item.label}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="子类" prop="subcode" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-select style="width: 200px" v-model="object.subcode">
              <a-select-option :value="item.value" v-for="item in options.conf_subcode" v-bind:key="item.value">{{item.label}}</a-select-option>
            </a-select>
          </a-form-item>
          <!--
          <a-form-item label="公司码" :label-col="{span:4}" :wrapper-col="{span:14}" v-if="has_admin_perm">
            <a-input :allowClear="true" v-model="object.company_code"></a-input>
          </a-form-item>-->
          <a-form-item label="货主码" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-select style="width: 160px" v-model="object.owner_code">
              <a-select-option :value="item.code" v-for="item in owners" v-bind:key="item.code">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="仓库码" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-select style="width: 160px" v-model="object.warehouse_code">
              <a-select-option :value="item.code" v-for="item in warehouses" v-bind:key="item.code">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="str1" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.str1"></a-input>
          </a-form-item>
          <a-form-item label="str2" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.str2"></a-input>
          </a-form-item>
          <a-form-item label="str3" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.str3"></a-input>
          </a-form-item>
          <a-form-item label="int1" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.int1"></a-input>
          </a-form-item>
          <a-form-item label="int2" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.int2"></a-input>
          </a-form-item>
          <a-form-item label="int3" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.int3"></a-input>
          </a-form-item>
          <a-form-item label="bool1" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-radio-group :options="yes_no" v-model="object.bool1" />
          </a-form-item>
          <a-form-item label="bool2" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-radio-group :options="yes_no" v-model="object.bool2" />
          </a-form-item>
          <a-form-item label="bool3" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-radio-group :options="yes_no" v-model="object.bool3" />
          </a-form-item>
          <a-form-item label="float1" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.float1"></a-input>
          </a-form-item>
          <a-form-item label="float2" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.float2"></a-input>
          </a-form-item>
          <a-form-item label="float3" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.float3"></a-input>
          </a-form-item>
          <a-form-item label="说明" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.remark"></a-input>
          </a-form-item>
        </a-form>
        <div  class="dialog-footer">
          <a-button type="primary" @click="do_update()">确定</a-button>
        </div>
      </a-modal>

            <a-table :dataSource="objects" :columns="object_columns" bordered rowKey="id" :pagination="pagination" @change="table_filter_sort">
              <span slot="code" slot-scope="text,record">
                <span>{{ translate('conf_code', record.code) }}</span>
              </span>
              <span slot="subcode" slot-scope="text,record">
                <span>{{ translate('conf_subcode', record.subcode) }}</span>
              </span>
              <span slot="action" slot-scope="text,record,index">
                  <a-button @click="order_detail(index, record)"  type="primary">修改</a-button>
              </span>
            </a-table>
  </div>
</template>

<script>
export default {
  name: 'SystemConfig',
  data () {
    return {
      objects: [],
      object: {},
      object_columns: [
        {title: '类别', key: 'code', dataIndex: 'code', scopedSlots: { customRender: 'code' }}, 
        {title: '子类', key: 'subcode', dataIndex: 'subcode', scopedSlots: { customRender: 'conf_subcode' }}, 
        //{title: '货主码', key: 'owner_code', dataIndex: 'owner_code'}, 
        {title: '仓库码', key: 'warehouse_code', dataIndex: 'warehouse_code'}, 
        {title: '备注', key: 'remark', dataIndex: 'remark', scopedSlots: { customRender: 'remark' }}, 
        {title: 'str1', key: 'str1', dataIndex: 'str1'}, 
        {title: 'str2', key: 'str2', dataIndex: 'str2'}, 
        //{title: 'str3', key: 'str3', dataIndex: 'str3'}, 
        {title: 'int1', key: 'int1', dataIndex: 'int1'}, 
        //{title: 'int2', key: 'int2', dataIndex: 'int2'}, 
        //{title: 'int3', key: 'int3', dataIndex: 'int3'}, 
        {title: 'bool1', key: 'bool1', dataIndex: 'bool1'}, 
        //{title: 'bool2', key: 'bool2', dataIndex: 'bool2'}, 
        //{title: 'float3', key: 'float3', dataIndex: 'float3'}, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' }}, 
      ],

      dlg_detail:false,
      has_manager_perm:false,
      has_admin_perm: false,

      filter: {},
      sort: null,

      current_page: 1,
      page_size:20,
      total_page:0,
      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},
      yes_no:  [{ label: '是', value: '1' }, { label: '否', value: '0' },],

      owners:[],
      tenant:{},
      companys: [],
      warehouses:[],
    }
  },
  methods:{
    // 创建
    do_create(){
      this.dlg_detail = true
      this.object = {owner_code:'default', warehouse_code:'default'}
    },
    // 修改
    do_update(){
      var env = this
      if (this.object.id){
        this.$http.put('/auth/config/'+this.object.id, this.object).then(function(resp){
          if(resp.data.status=='success'){
            env.$message.success('修改成功')
            env.load_objects()
            env.dlg_detail = false
          }else{
            env.$message.error('修改失败: '+resp.data.msg)
          }
        })
      }else{
        this.$http.post('/auth/config', this.object).then(function(resp){
          if(resp.data.status=='success'){
            env.$message.success('创建成功')
            env.load_objects()
            env.dlg_detail = false
          }else{
            env.$message.error('创建失败: '+resp.data.msg)
          }
        })
      }
    },

    // 明细 
    order_detail(index, order){
      var env = this
      this.dlg_detail = true
      this.object = order
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
      
      env.$http.get('/auth/config?q='+JSON.stringify(q)).then(function(resp){
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
    // 选择租户
    load_tenant(){
      var env = this
      this.$http.post('/auth/current_tenant').then(function(resp){
        // load owner and warehouse
        env.owners = resp.data.owners
        env.warehouses = resp.data.warehouses
        env.tenant = resp.data.tenant
      })
    },
  },
  // before render
  created:function() {
    var env = this
    // load orders
    this.load_objects()
    // this.has_admin_perm = this.$store.has_admin_perm
  },
  // after render
  mounted: function(){
    
    this.load_choice()
    this.load_tenant()
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.w135{width: 137px;}
</style>
