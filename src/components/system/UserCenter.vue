<template>
  <div>
    <div>
        <a-row>
          <a-col :span="6">
            <a-breadcrumb style="padding:20px 20px 20px 0px;">
              <a-breadcrumb-item >系统管理</a-breadcrumb-item>
              <a-breadcrumb-item title="个人中心">个人中心</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
        </a-row>
    </div>

      <a-modal title="个人信息" :visible="dlg_detail" width="600px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="do_close()" >
        <a-form  :layout="'horizontal'">
          <a-form-item label="帐号/手机" prop="code"  :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="object.code"  :disabled="true"></a-input>
          </a-form-item>
          <a-form-item label="名称" prop="name" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="object.name" ></a-input>
          </a-form-item>
          <a-form-item label="公司代码" prop="company_code" v-if="has_admin_perm && !object.id" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="object.company_code" ></a-input>
          </a-form-item>
          <a-form-item label="密码" prop="password" v-if=" !object.id" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.password" ></a-input>
          </a-form-item>
          <!--
          <a-form-item label="货主" prop="owner_list" :label-col="{span:4}" :wrapper-col="{span:14}" >
            <a-checkbox-group :options="owner_options" v-model="object.owners"  :disabled="true"/>
          </a-form-item>
          -->
          <a-form-item label="仓库" prop="warehouse_list" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-checkbox-group :options="warehouse_options" v-model="object.warehouses"  :disabled="true"/>
          </a-form-item>
          <a-form-item label="是否可以登录" prop="is_employee" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-radio-group v-model="object.is_employee" :disabled="true" >
              <a-radio-button :value="false">可登录</a-radio-button>
              <a-radio-button :value="true">不可登录</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="部门" prop="department" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.department"></a-input>
          </a-form-item>
          <a-form-item label="手机" prop="tel" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.tel"></a-input>
          </a-form-item>
          <a-form-item label="邮箱" prop="email" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.email"></a-input>
          </a-form-item>
          <a-form-item label="联系人" prop="contact" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.contact"></a-input>
          </a-form-item>
          <a-form-item label="地址" prop="address" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.address"></a-input>
          </a-form-item>
          <a-form-item label="备注" prop="remark" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.remark"></a-input>
          </a-form-item>
        </a-form>
        <div  class="dialog-footer">
          <a-button type="primary" @click="do_update('normal')" style="float:right;"><a>确定</a></a-button>
          <a-button type="primary" @click="do_update('manager')" v-if="has_admin_perm && !object.id"><a>创建管理员</a></a-button>
        </div>
      </a-modal>

      <a-modal title="修改密码" :visible="dlg_pass" width="600px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_pass=false" >
        <a-form  :layout="'horizontal'">
          <a-form-item label="旧密码" prop="oldpass"  :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="po.oldpass" type="password" placeholder="Password"></a-input>
          </a-form-item>
          <a-form-item label="新密码" prop="newpass" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="po.newpass"  type="password" placeholder="Password"></a-input>
          </a-form-item>
          <a-form-item label="再次确认" prop="newpass2" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="po.newpass2"  type="password" placeholder="Password"></a-input>
          </a-form-item>
        </a-form>
          <div  class="dialog-footer">
            <a-button type="primary" @click="do_pass()" style="float:right;"><a>确定</a></a-button>
          </div>
      </a-modal>

      <a-row>
        <a-col :span='24'>
          <a-card title="个人信息" style="width: 100%;" :bodyStyle="bodyStyle">
            <span slot="extra">
              <a href="javascript:;" @click="do_detail()">编辑</a>
              <a href="javascript:;" @click="po={};dlg_pass=true;" style="margin-left:20px;">修改密码</a>
            </span>
            <!--<a-card-grid style="width:25%;text-align:center;">Avatar</a-card-grid>-->
            <a-card-grid style="width:75%;text-align:left;">
              <a-form :layout="'horizontal'">
                <a-form-item label="账号: "  :label-col="{span:3}" :wrapper-col="{span:14}"><strong>{{ user.code }}</strong></a-form-item>
                <a-form-item label="部门: "  :label-col="{span:3}" :wrapper-col="{span:14}"><strong>{{ user.department }}</strong></a-form-item>
                <a-form-item label="名称: "  :label-col="{span:3}" :wrapper-col="{span:14}"><strong>{{ user.name }}</strong></a-form-item>
                <a-form-item label="手机: "  :label-col="{span:3}" :wrapper-col="{span:14}"><strong>{{ user.tel }}</strong></a-form-item>
                <a-form-item label="邮箱: "  :label-col="{span:3}" :wrapper-col="{span:14}"><strong>{{ user.email }}</strong></a-form-item>
                <a-form-item label="联系人: "  :label-col="{span:3}" :wrapper-col="{span:14}"><strong>{{ user.contact }}</strong></a-form-item>
                <a-form-item label="地址: "  :label-col="{span:3}" :wrapper-col="{span:14}"><strong>{{ user.address }}</strong></a-form-item><!--
                <a-form-item label="可操作货主: "  :label-col="{span:3}" :wrapper-col="{span:14}"><strong>{{ user.owners }}</strong></a-form-item>
                <a-form-item label="可操作仓库: "  :label-col="{span:3}" :wrapper-col="{span:14}"><strong>{{ user.warehouses }}</strong></a-form-item>-->
                <a-form-item label="备注: "  :label-col="{span:3}" :wrapper-col="{span:14}"><strong>{{ user.remark }}</strong></a-form-item>
              </a-form>
            </a-card-grid>
          </a-card>
        </a-col>
      </a-row>

  </div>
</template>

<script>
export default {
  name: 'UserCenter',
  data () {
    return {
      user: {},
      objects: [],
      lines: [],
      object: {roles:'', owners:[], warehouses: [], is_employee:false},
      // tenant select
      warehouse_options: [],
      owner_options: [],
      po: {oldpass:'', newpass:''},

      dlg_detail:false,
      dlg_pass:false,
      has_manager_perm:false,
      has_admin_perm: false,

      filter: {},
      sort: null,

      current_page: 1,
      page_size:20,
      total_page:0,
      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},
      bodyStyle: {'font-size': '20px'},
    }
  },
  methods:{
    // 修改密码
    do_pass(){
      var env = this
      if(env.po.oldpass.length >= 4 && env.po.newpass.length >= 6){
        if(env.po.newpass == env.po.newpass2){
          env.$http.post('/auth/user/reset-passwd', env.po).then(function(resp){
            if(resp.data.status=='success'){
              env.$message.success('修改密码成功!')
              env.po = {oldpass:'', newpass:'', newpass2:''}
              env.dlg_pass = false
            }else{
              env.$message.error('修改密码失败: '+resp.data.msg)
              env.po = {oldpass:'', newpass:'', newpass2:''}
            }
          })
        }else{
          env.$message.warning('两次输入的新密码不一致!')
        }
      }else{
        env.$message.warning('密码太短, 要至少6位!')
      }
    },
    // 创建用户对话框
    do_create(){
      this.object = {roles:'', owners:['default'], warehouses: [], is_employee:false}
      this.dlg_detail = true
    },
    // 明细
    do_detail(){
      this.dlg_detail = true
      this.object = this.user
    },
    do_close(){
      this.dlg_detail = false
      this.object = {roles:'', owners:[], warehouses: []}
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
    // 修改
    do_update(roles){
      var object = this.object
      var env = this
      if(roles=='normal' && object.owners.length == 0 ){
        // this.$message.warning('请选择货主')
        object.owners = ['default']
      }
      if(roles=='normal' && object.warehouses.length == 0){
        this.$message.warning('请选择仓库')
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
        return '管理员'
      }else if(record.is_employee){
        return '不可登录员工'
      }else{
        return '操作人员'
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
      // perm
      env.has_manager_perm = (resp.data.roles.indexOf("manager") > -1)
      env.has_admin_perm = (resp.data.roles.indexOf("admin") > -1)
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
.ant-card-body span{width:200px;}
</style>
