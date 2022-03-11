<template>
  <div>
    <div>
        <a-row>
          <a-col :span="6">
            <a-breadcrumb style="padding:20px 20px 20px 0px;">
              <a-breadcrumb-item >基础信息</a-breadcrumb-item>
              <a-breadcrumb-item title="合作伙伴管理-一个公司可能有多个合作伙伴">合作伙伴管理</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
          <a-col :span="18">
            <a-button  @click="do_create()" type="primary" style="margin:15px 0;">新建合作伙伴</a-button>
            <a-button @click="export_by_filter()" style="margin:15px 0;margin-left:20px;">导出</a-button>
          </a-col>
        </a-row>
    </div>

      <a-modal :title="dlg_title" :visible="dlg_new" width="600px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_new=false">
        <a-form-model :layout="'horizontal'" :rules="rules" :model="object">
          <a-form-model-item label="编号" prop="code" :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.code" ref="code" :disabled="is_edit" placeholder="必填, 客户编号或客户的手机号码"></a-input>
          </a-form-model-item>
          <a-form-model-item label="名称" prop="name" :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="object.name"  placeholder="必填"></a-input>
          </a-form-model-item>
          <a-form-model-item label="合作类型" prop="xtype" :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-select :defaultValue="'client_supplier'" style="width: 120px" v-model="object.xtype">
              <a-select-option :value="item.value" v-for="item in options.au_partner_xtype" v-bind:key="item.value">{{item.label}}</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item label="内采/外采" prop="stype" :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-select defaultValue="purchase" style="width: 120px" v-model="object.stype">
              <a-select-option :value="item.value" v-for="item in options.au_partner_stype" v-bind:key="item.value">{{item.label}}</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item label="协同生产公司key" prop="coopkey" :label-col="{span:6}" :wrapper-col="{span:14}" v-if="owner_conf.is_enable_coop">
            <a-input :allowClear="true"  v-model="object.coopkey" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="手机" prop="tel" :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="object.tel" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="公司名称" prop="company_name" :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.company_name" ></a-input>
          </a-form-model-item>

          <a-form-item label="物流电子面单" prop="express_on" :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-radio-group :defaultValue="'off'" buttonStyle="solid" v-model="object.express_on">
              <a-radio-button :value="'off'">不使用</a-radio-button>
              <a-radio-button :value="'on'">使用</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-model-item label="快递(物流)类型" prop="express_type" :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.express_type" placeholder="kdniao"></a-input>
          </a-form-model-item>
          <a-form-model-item label="快递(物流)公司" prop="express_code" :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.express_code" placeholder="SF"></a-input>
          </a-form-model-item>
          <a-form-model-item label="物流月结卡号" prop="express_month_code" :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.express_month_code" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="物流EBusinessID"  :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.express_bid" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="物流appkey"  :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.express_appkey" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="物流secret"  :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.express_secret" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="物流password"  :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.express_passwd" ></a-input>
          </a-form-model-item>

          <a-form-model-item label="物流发货人"  :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.sender_name" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="物流发货人电话"  :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.sender_tel" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="物流发货人省份"  :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.sender_province" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="物流发货人城市"  :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.sender_city" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="物流发货人城区"  :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.sender_area" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="物流发货人详细地址"  :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.sender_address" ></a-input>
          </a-form-model-item>

          <a-form-model-item label="物流收货人"  :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.receiver_name" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="物流收货人电话"  :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.receiver_tel" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="物流收货人省份"  :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.receiver_province" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="物流收货人城市"  :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.receiver_city" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="物流收货人城区"  :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.receiver_area" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="物流收货人详细地址"  :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.receiver_address" ></a-input>
          </a-form-model-item>

          <a-form-model-item label="奇门请求类型"  :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-radio-group v-model="object.qimen_type">
              <a-radio-button value="json"> json </a-radio-button>
              <a-radio-button value="xml"> xml </a-radio-button>
            </a-radio-group>
          </a-form-model-item>
          <a-form-model-item label="奇门地址"  :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.qimen_url" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="奇门客户id"  :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.qimen_customerid" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="奇门secret"  :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input  v-model="object.qimen_secret" ></a-input>
          </a-form-model-item>

          <a-form-model-item label="联系人" prop="contact" :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="object.contact" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="固定电话" prop="phone" :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="object.phone" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="邮箱" prop="email" :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="object.email" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="地址" prop="address" :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="object.address" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="备注" prop="remark" :label-col="{span:6}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.remark"></a-input>
          </a-form-model-item>
        </a-form-model>
        <div class="dialog-footer">
          <a-button  @click="do_submit()" style="float:right" type="primary">提交</a-button>
        </div>
      </a-modal>

      <a-form layout="inline" v-if="owner_conf.is_enable_search_bar" style="padding-left:15px;background-color:rgb(235,235,235);">
        <a-form-item label="编号" >
          <a-input :allowClear="true"  placeholder="编号" v-model="query.code" style="width:160px;"/>
        </a-form-item>
        <a-form-item label="名称" >
          <a-input :allowClear="true"  placeholder="名称" v-model="query.name" style="width:160px;"/>
        </a-form-item>
        <a-form-item label="手机" >
          <a-input :allowClear="true"  placeholder="手机" v-model="query.tel" style="width:160px;"/>
        </a-form-item>
        <a-form-item label="类型">
          <a-select :defaultValue="query.xtype"  v-model="query.xtype" style="width:120px;">
            <a-select-option value="" v-bind:key="''">--所有--</a-select-option>
            <a-select-option :value="item.code" v-for="item in options.au_partner_xtype" v-bind:key="item.code">{{item.name}}</a-select-option>
          </a-select> 
        </a-form-item>
        <a-form-item>
          <a-button icon="search" @click="search_query">查询</a-button>
        </a-form-item>
      </a-form>

      <a-table :dataSource="objects" :columns="object_columns" bordered rowKey="id" :pagination="pagination" @change="table_filter_sort" :scroll="{x:'max-content'}">
        <span slot="action" slot-scope="text,record,index">
          <a-button @click="do_edit(index, record)"  type="primary">修改</a-button>
        </span>
        <span slot="xtype" slot-scope="text,record">
          <span>{{ translate('au_partner_xtype', record.xtype) }} </span>
        </span>

        <span slot="stype" slot-scope="text,record">
          <span>{{ translate('au_partner_stype', record.stype) }} </span>
        </span>
      </a-table>

  </div>
</template>

<script>
export default {
  name: 'Partner',
  data () {
    return {
      rules: {
        name: [
          {required: true, message: '必填', trigger: 'change'},
          {min:2, max:50, message:'必填, 长度2位以上', trigger: 'change'},
        ],
        code: [
          {required: true, message: '必填', trigger: 'change'},
          {min:2, max:50, message:'必填, 长度2位以上', trigger: 'change'},
          {pattern: /[a-zA-Z0-9_-]{1,}/, message:'只能使用字母与数字', trigger: 'change'},
        ],
      },
      owner_conf:{},
      objects: [],
      object: {},

      object_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id), rowClassName: 'no-print'}, 
        {title: '编号', key: 'code', dataIndex: 'code', }, 
        {title: '名称', key: 'name', dataIndex: 'name', }, 
        {title: '合作类型', key: 'xtype', dataIndex: 'xtype', scopedSlots: { customRender: 'xtype' }, }, 
        {title: '类型', key: 'stype', dataIndex: 'stype', scopedSlots: { customRender: 'stype' }, }, 
        {title: '手机', key: 'tel', dataIndex: 'tel'}, 
        {title: '联系人', key: 'contact', dataIndex: 'contact'}, 
        {title: '固定电话', key: 'phone', dataIndex: 'phone'}, 
        {title: '邮箱', key: 'email', dataIndex: 'email'}, 
        {title: '地址', key: 'address', dataIndex: 'address'}, 
        {title: '备注', key: 'remark', dataIndex: 'remark', scopedSlots: { customRender: 'remark' }}, 
        {title: '操作', key: 'action', dataIndex: 'action', rowClassName: 'no-print', scopedSlots: { customRender: 'action' }}, 
      ],

      dlg_title: '创建合作伙伴',
      dlg_new: false,
      is_edit: false,
      has_manager_perm:false,

      filter: {},
      query: {},
      sort: null,
      code_filter_icon: false,
      name_filter_icon: false,
      like_filters: ['code', 'name', 'company_code', 'tel'],

      current_page: 1,
      page_size:20,
      total_page:0,
      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},
    }
  },
  methods:{
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

      var data = {
          name: '合作伙伴.xlsx', 
          xtype: 'export', 
          code: 'export_good', 
          func: 'blueprints.auth.tasks.export_base:export_partner', 
          func_name: '合作伙伴导出'}

      this.$http.post('/async/table_export?q='+JSON.stringify(q), data).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('导出任务创建成功，请到 "导入导出" 中查看', 3)
          if (env.$store.owner_conf && env.$store.owner_conf.is_sync_downfile){
            window.open('/async/download/'+resp.data.data.id, "_blank")
          }
        }else{
          env.$message.error('导出任务创建失败: '+resp.data.msg)
        }
      })
    },

    do_create(){
      this.dlg_title = '创建合作伙伴'
      this.dlg_new = true
      this.object = {xtype: 'client_supplier', stype: 'purchase'}
      this.is_edit = false
      var env = this
      function bf(){
        env.$refs.code.focus()
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
        this.$http.put('/warehouse/partner', this.object).then(function(resp){
          if(resp.data.status=='success'){
            env.load_objects()
            env.dlg_new = false
            env.$message.success('修改成功')
          }else{
            env.$message.error('修改失败：'+resp.data.msg)
          }
        })
      }else{
        if(!env.object.code){
          env.$message.warning('请填写合作伙伴代码')
        }
        // create
        this.$http.post('/warehouse/partner', this.object).then(function(resp){
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
        var v = this.query[q]
        if(q == 'create_time1' && v){
          var create_time1 = new Date(v)
          filters.push({name: 'create_time', op:'>=', val: create_time1.format('yyyy-MM-dd')})
        }else if(q == 'create_time2' && v){
          var create_time2 = new Date(v)
          filters.push({name: 'create_time', op:'<', val: create_time2.addDate(1).format('yyyy-MM-dd')})
        }else if(this.like_filters.indexOf(q) > -1 && v){
          filters.push({name: q, op: 'ilike', val:v})
        }else if(v){
          filters.push({name: q, op: '==', val:v})
        }
      }
      this.load_objects(filters, this.sort)
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
      
      env.$http.get('/warehouse/partner?q='+JSON.stringify(q)).then(function(resp){
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
    this.owner_conf = this.$store.owner_conf || {}
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
.w135{width: 135px;}
</style>
