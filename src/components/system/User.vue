<template>
  <div>
    <div>
        <a-row>
          <a-col :span="6">
            <a-breadcrumb style="padding:20px 20px 20px 0px;">
              <a-breadcrumb-item >系统管理</a-breadcrumb-item>
              <a-breadcrumb-item title="用户管理">用户管理</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
          <a-col :span="18">
            <a-button  @click="do_create()" style="margin:15px 0;" type="primary"  v-if="has_manager_perm">新建用户</a-button>
          </a-col>
        </a-row>
    </div>

      <a-modal title="用户信息" :visible="dlg_detail" width="600px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="do_close()" >
        <a-form-model  :layout="'horizontal'" :rules="rules" :model="object">
          <a-form-model-item label="帐号/手机" prop="code"  :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="object.code" ref="code" placeholder="必填"></a-input>
          </a-form-model-item>
          <a-form-model-item label="名称" prop="name" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="object.name"  placeholder="必填"></a-input>
          </a-form-model-item>
          <a-form-model-item label="公司代码" prop="company_code" v-if="has_admin_perm && !object.id" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="object.company_code"  placeholder="必填"></a-input>
          </a-form-model-item>
          <a-form-model-item label="密码" prop="password" v-if=" !object.id" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.password"  placeholder="必填"></a-input>
          </a-form-model-item>
          <a-form-model-item label="货主" prop="owner_list" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-checkbox-group :options="owner_options" v-model="object.owners" />
          </a-form-model-item>
          <a-form-model-item label="仓库" prop="warehouse_list" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-checkbox-group :options="warehouse_options" v-model="object.warehouses" />
          </a-form-model-item>
          <a-form-model-item label="角色" prop="vrole_list" :label-col="{span:4}" :wrapper-col="{span:14}" v-if="has_manager_perm">
            <a-checkbox-group :options="vrole_options" v-model="object.vroles" />
          </a-form-model-item>
          <a-form-model-item label="是否可以登录" prop="is_employee" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-radio-group v-model="object.is_employee" :disabled="object.id>0">
              <a-radio-button :value="false">可登录</a-radio-button>
              <a-radio-button :value="true">不可登录</a-radio-button>
            </a-radio-group>
          </a-form-model-item>
          <a-form-model-item label="岗位" prop="post" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-auto-complete placeholder="岗位" optionLabelProp="value" :defaultValue="''" :backfill="true" v-model="object.post" style="width:200px;" @focus="do_load_unit('posts')">
              <template slot="dataSource">
                  <a-select-option v-for="item in posts" :key="item">
                    <strong>{{item}} </strong>
                  </a-select-option>
              </template>
            </a-auto-complete><a-button @click="do_save_unit('posts', object.post)">保存</a-button>
          </a-form-model-item>
          <a-form-model-item label="部门" prop="department" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-auto-complete placeholder="部门" optionLabelProp="value" :defaultValue="''" :backfill="true" v-model="object.department" style="width:200px;" @focus="do_load_unit('departments')">
              <template slot="dataSource">
                  <a-select-option v-for="item in departments" :key="item">
                    <strong>{{item}} </strong>
                  </a-select-option>
              </template>
            </a-auto-complete><a-button @click="do_save_unit('departments', object.department)">保存</a-button>
          </a-form-model-item>
          <a-form-model-item label="手机" prop="tel" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.tel"></a-input>
          </a-form-model-item>
          <a-form-model-item label="地址" prop="address" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.address"></a-input>
          </a-form-model-item>
          <a-form-model-item label="菜单权限" prop="menu_list" :label-col="{span:4}" :wrapper-col="{span:14}" v-if="has_manager_perm">
            <a-checkbox-group :options="options.menus" v-model="object.menus" style="width:250px;"/>
          </a-form-model-item>
        </a-form-model>
        <div  class="dialog-footer">
          <a-button type="primary" @click="do_update('normal')" style="float:right;" >确定</a-button>
          <a-button type="primary" @click="do_update('manager')" v-if="has_admin_perm && !object.id" style="margin-right:5px;">创建管理员</a-button>
          <a-button type="primary" @click="do_update('agent')" v-if="has_admin_perm && !object.id" style="margin-right:5px;">创建代理商</a-button>
        </div>
      </a-modal>

      <a-form layout="inline" v-if="owner_conf.is_enable_search_bar" style="padding-left:15px;background-color:rgb(235,235,235);">
        <a-form-item label="帐号" >
          <a-input :allowClear="true"  placeholder="帐号" v-model="query.code" style="width:160px;"/>
        </a-form-item>
        <a-form-item label="名称" >
          <a-input :allowClear="true"  placeholder="名称" v-model="query.name" style="width:160px;"/>
        </a-form-item>
        <a-form-item label="公司代码" v-if="has_agent_perm">
          <a-input :allowClear="true"  placeholder="公司代码" v-model="query.company_code" style="width:160px;"/>
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
      
      <a-table :dataSource="objects" :columns="object_columns" bordered rowKey="id" :pagination="pagination" @change="table_filter_sort" :scroll="{x:'max-content'}">
        <span slot="state" slot-scope="text,record">
          <span>{{ translate('au_user_state', record.state) }}</span>
        </span>
        <span slot="perm" slot-scope="text,record">
          <span>{{ perm_desc(record) }}</span>
        </span>
        <span slot="operation" slot-scope="text,record">
          <span>{{ operation_desc(record) }}</span>
        </span>
        <span slot="action" slot-scope="text,record,index">
            <a-button @click="do_ban(index, record, 'ban')"   v-if="record.state=='on' && record.roles && record.roles.indexOf('manager') < 0"   type="primary">禁用</a-button>
            <a-button @click="do_ban(index, record, 'on')"   v-if="record.state=='ban'"   type="primary">启用</a-button>
            <a-button @click="do_detail(index, record)" style="margin-left:10px;" v-if="has_admin_perm || has_manager_perm" type="primary">修改</a-button>
            <a-popconfirm
              title="确定要删除用户吗?"
              @confirm="do_delete(index, record)"
              okText="确定"
              cancelText="取消"
            >
              <a-button style="margin-left:10px;" type="warning" >删除</a-button>
            </a-popconfirm>
        </span>
      </a-table>

  </div>
</template>

<script>
export default {
  name: 'User',
  data () {
    return {
      posts:[],
      departments:[],
      rules: {
        name: [
          {required: true, message: '必填', trigger: 'change'},
          {min:2, max:50, message:'必填, 长度2位以上', trigger: 'change'},
        ],
        code: [
          {required: true, message: '必填', trigger: 'change'},
          {min:2, max:50, message:'必填, 长度2位以上', trigger: 'change'},
        ],
        password: [
          {required: true, message: '必填', trigger: 'change'},
          {min:6, max:20, message:'必填, 长度6位以上', trigger: 'change'},
        ],
      },
      objects: [],
      lines: [],
      object: {roles:'', owners:[], warehouses: [], is_employee:false, vroles:[]},
      // tenant select
      warehouse_options: [],
      owner_options: [],
      vrole_options:[],
      vrole_dict: {},

      object_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id)}, 
        {title: '帐号', key: 'code', dataIndex: 'code'}, 
        {title: '名称', key: 'name', dataIndex: 'name'}, 
        {title: '公司代码', key: 'company_code', dataIndex: 'company_code',  }, 
        {title: '部门', key: 'department', dataIndex: 'department'}, 
        {title: '手机', key: 'tel', dataIndex: 'tel'}, 
        {title: '状态', key: 'state', dataIndex: 'state', scopedSlots: { customRender: 'state' } }, 
        {title: '系统权限', key: 'perm', dataIndex: 'perm', scopedSlots: { customRender: 'perm' } }, 
        {title: '角色', key: 'operation', dataIndex: 'operation', scopedSlots: { customRender: 'operation' } }, 
        {title: '创建时间', key: 'create_time', dataIndex: 'create_time', sorter: (a, b)=>(a.create_time-b.create_time)}, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' }}, 
      ],

      dlg_detail:false,
      has_manager_perm:false,
      has_admin_perm: false,
      has_agent_perm: false,

      filter: {},
      query: {},
      like_filters: ['code', 'name', 'company_code', 'tel'],
      sort: null,

      current_page: 1,
      page_size:20,
      total_page:0,
      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},
    }
  },
  methods:{
    do_load_unit(selection){
      var env = this
      this.$http.get('/warehouse/selection/'+selection).then(function(resp){
        if(resp.data.status=='success'){
          if(selection=='departments'){
            env.departments = resp.data.units
          }else if(selection=='posts'){
            env.posts = resp.data.units
          }
        }
      })
    },
    do_save_unit(selection, field){
      var env = this
      if(!field){
        return
      }
      this.$http.post('/warehouse/selection/'+selection, {'unit':field}).then(function(resp){
        if(resp.data.status=='success'){
            if(selection=='departments'){
              env.departments = resp.data.units
            }else if(selection=='posts'){
              env.posts = resp.data.units
            }
          env.$message.success('保存成功')
        }else{
          env.$message.error('保存失败：'+resp.data.msg)
        }
      })
    },
    // 创建用户对话框
    do_create(){
      this.object = {roles:'', owners:['default'], warehouses: ['default'], is_employee:false, vroles:[]}
      this.dlg_detail = true
      var env = this
      function bf(){
        env.$refs.code.focus()
      }
      setTimeout(bf, 1);
    },
    // 明细
    do_detail(index, object){
      this.dlg_detail = true
      this.object = object
    },
    do_close(){
      this.dlg_detail = false
      this.object = {roles:'', owners:[], warehouses: [], vroles:[]}
    },
    // 禁用
    do_ban(index, object, state){
      var env = this
      object['state'] = state
      this.object = object
      this.$http.put('/auth/user/'+object.id, object).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('设置成功')
        }else{
          env.$message.error('设置失败: '+resp.data.msg)
        }
      })
    },
    do_delete(index, object){
      var env = this
      console.log(object)
      if(object.id){
        this.$http.delete('/auth/user/'+object.id, object).then(function(resp){
          if(resp.data.status=='success'){
            env.$message.success('删除成功')
            env.dlg_detail = false
            env.load_objects()
          }else{
            env.$message.error('删除失败: '+resp.data.msg)
          }
        })
      }
    },
    // 修改
    do_update(roles){
      var object = this.object
      var env = this
      if(roles=='normal' && object.owners.length == 0 ){
        // this.$message.warning('请选择货主')
        object.owners = ['default']
      }
      if(roles=='normal' && object.warehouses.length == 0){
        // this.$message.warning('请选择仓库')
      }

      if (!this.has_admin_perm){
        object.company_code = ''
      }
      if(this.object.id){
        this.$http.put('/auth/user/'+this.object.id, this.object).then(function(resp){
          if(resp.data.status=='success'){
            env.$message.success('修改成功')
            env.dlg_detail = false
            env.load_objects()
          }else{
            env.$message.error('修改失败: '+resp.data.msg)
          }
        })
      }else{
        if (object.password && object.password.length >= 6 && object.code && object.code.length >= 3){
          this.object['roles'] = roles
          this.$http.post('/auth/user', this.object).then(function(resp){
            if(resp.data.status=='success'){
              env.$message.success('创建成功')
              env.dlg_detail = false
              env.load_objects()
            }else{
              env.$message.error('创建失败: '+resp.data.msg)
            }
          })
        }else{
          env.$message.error('密码至少6位, 帐号至少3位')
        }
      }
    },

    perm_desc(record){
      if(record.is_admin){
        return '超级管理员'
      }else if(record.is_manager){
        return '老板'
      }else if(record.is_employee){
        return '不可登录员工'
      }else{
        return '操作人员'
      }
    },
    operation_desc(record){
      var env = this
      var li = []
      for(var i=0;i<record.vroles.length;i++){
        li.push(env.vrole_dict[record.vroles[i]])
      }
      return li.join(',')
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
      
      env.$http.get('/auth/user?q='+JSON.stringify(q)).then(function(resp){
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
    env.has_manager_perm = this.$store.has_manager_perm 
    env.has_admin_perm = this.$store.has_admin_perm
    env.has_agent_perm = this.$store.has_agent_perm

    // load vroles 老板boss 管理员manager 财务finance 仓库stock 销售sale 采购purchase
    env.vrole_options = [
      {label:'老板', value:'boss'}, 
      {label:'管理员', value:'manager'}, 
      {label:'财务', value:'finance'}, 
      {label:'仓库', value:'stock'}, 
    ]
    env.vrole_options.forEach(function(v, i){
      env.vrole_dict[v.value] = v.label
    })
    // load orders
    this.load_objects()

    // load warehouses
    this.$http.get('/warehouse/warehouse').then(function(resp){
      env.warehouse_options = resp.data.objects
      for(var j=0;j<env.warehouse_options.length;j++){
        env.warehouse_options[j].label = env.warehouse_options[j].name
        env.warehouse_options[j].value = env.warehouse_options[j].code
      }
    })

    // load owners
    this.$http.get('/warehouse/partner/owner').then(function(resp){
      env.owner_options = resp.data.objects
      for(var j=0;j<env.owner_options.length;j++){
        env.owner_options[j].label = env.owner_options[j].name
        env.owner_options[j].value = env.owner_options[j].code
      }
    })

    // load user
    this.$http.get('/auth/current_user').then(function(resp){
      env.user = resp.data
      // // perm
      // env.has_admin_perm = (resp.data.roles.indexOf("admin") > -1)
      // env.has_manager_perm = (resp.data.roles.indexOf("manager") > -1) || env.has_admin_perm
      // env.has_agent_perm = (resp.data.roles.indexOf('agent') > -1) || env.has_admin_perm
    })
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
