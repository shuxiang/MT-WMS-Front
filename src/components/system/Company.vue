<template>
  <div>
    <div>
        <a-row>
          <a-col :span="6">
            <a-breadcrumb style="padding:20px 20px 20px 0px;">
              <a-breadcrumb-item >系统管理</a-breadcrumb-item>
              <a-breadcrumb-item title="公司管理">公司管理</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
          <a-col :span="18"><a-button  @click="do_create()" style="margin:15px 0;" v-if="has_agent_perm" type="primary">创建公司</a-button></a-col>
        </a-row>
    </div>

      <a-modal title="公司信息" :visible="dlg_detail" width="600px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_detail=false" >
        <a-form-model  :layout="'horizontal'" :rules="object.id ? rules2 : rules" :model="object">
          <a-form-model-item label="管理员手机" prop="user_code" :label-col="{span:4}" :wrapper-col="{span:14}" v-if="!object.id">
            <a-input :allowClear="true"  v-model="object.user.code" ref="user_code" placeholder="必填"></a-input>
          </a-form-model-item>
          <a-form-model-item label="管理员名称" prop="user_name" v-if="!object.id" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="object.user.name" placeholder="必填" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="管理员密码" prop="password" v-if="!object.id" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.user.password"  placeholder="必填"></a-input>
          </a-form-model-item>
          <a-form-model-item label="公司代码" prop="code" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="object.code" :disabled="object.id && object.id>0" placeholder="必填"></a-input>
          </a-form-model-item>
          <a-form-model-item label="公司名称" prop="name" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="object.name"  placeholder="必填"></a-input>
          </a-form-model-item>
          <a-form-model-item label="唯一标识" prop="uniquekey" :label-col="{span:4}" :wrapper-col="{span:14}" v-if="object.id && object.id>0">
            <a-input :allowClear="true"  v-model="object.uniquekey" :disabled="object.id && object.id>0"></a-input>
          </a-form-model-item>
          <a-form-model-item label="APIKEY" prop="apikey" :label-col="{span:4}" :wrapper-col="{span:14}" v-if="object.id && object.id>0">
            <a-input :allowClear="true"  v-model="object.apikey" :disabled="object.id && object.id>0"></a-input>
          </a-form-model-item>
          <a-form-model-item label="公司手机" prop="tel" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.tel" placeholder="必填"></a-input>
          </a-form-model-item>
          <a-form-model-item label="最大用户数" prop="max_users" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.max_users" placeholder=""></a-input>
          </a-form-model-item>
          <a-form-model-item label="HOST" prop="host" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.host" placeholder=""></a-input>
          </a-form-model-item>
          <a-form-model-item label="邮箱" prop="email" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.email"></a-input>
          </a-form-model-item>
          <a-form-model-item label="其它联系方式" prop="contact" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.contact"></a-input>
          </a-form-model-item>
          <a-form-model-item label="地址" prop="address" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.address"></a-input>
          </a-form-model-item>
          <a-form-model-item label="备注" prop="remark" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.remark"></a-input>
          </a-form-model-item>
          <a-form-model-item label="LOGO" prop="logo" :label-col="{span:4}" :wrapper-col="{span:14}" v-if="object.id">
            <img :src="object.image_path" style="max-width:320px;" /><br/>
            <a-upload accept=".png,.jpg,.jpeg,.gif,.bmp,.webp" name="file" :multiple="false" :action="'/auth/company/'+object.id+'/image'" @change="uploadLogo" :showUploadList="false">
              <a-button v-if="object.id"> <a-icon type="upload" /> 上传 </a-button>
            </a-upload>
          </a-form-model-item>
        </a-form-model>
        <div  class="dialog-footer">
          <a-button  @click="do_update()" style="float:right;" type="primary">确定</a-button>
        </div>
      </a-modal>

      <a-form layout="inline" v-if="owner_conf.is_enable_search_bar" style="padding-left:15px;background-color:rgb(235,235,235);">
        <a-form-item label="代码" >
          <a-input :allowClear="true"  placeholder="代码" v-model="query.code" style="width:160px;"/>
        </a-form-item>
        <a-form-item label="名称" >
          <a-input :allowClear="true"  placeholder="名称" v-model="query.name" style="width:160px;"/>
        </a-form-item>
        <a-form-item label="手机" >
          <a-input :allowClear="true"  placeholder="手机" v-model="query.tel" style="width:160px;"/>
        </a-form-item>
        <a-form-item label="代理商" >
          <a-input :allowClear="true"  placeholder="代理商" v-model="query.agent" style="width:160px;"/>
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
        <span slot="action" slot-scope="text,record,index">
            <a-button @click="do_detail(index, record)" type="primary" >修改</a-button>
        </span>
      </a-table>
  </div>
</template>

<script>
export default {
  name: 'Company',
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
        ],
        user_name: [
          {required: true, message: '必填', trigger: 'change'},
          {min:2, max:50, message:'必填, 长度2位以上', trigger: 'change'},
        ],
        user_code: [
          {required: true, message: '必填', trigger: 'change'},
          {min:2, max:50, message:'必填, 长度2位以上', trigger: 'change'},
        ],
        password: [
          {required: true, message: '必填', trigger: 'change'},
          {min:6, max:20, message:'必填, 长度6位以上', trigger: 'change'},
        ],
        tel: [
          {required: true, message: '必填', trigger: 'change'},
          {min:8, max:20, message:'必填, 长度8位以上', trigger: 'change'},
        ],
      },
      rules2: {
        name: [
          {required: true, message: '必填', trigger: 'change'},
          {min:2, max:50, message:'必填, 长度2位以上', trigger: 'change'},
        ],
        tel: [
          {required: true, message: '必填', trigger: 'change'},
          {min:8, max:20, message:'必填, 长度8位以上', trigger: 'change'},
        ],
      },
      objects: [],
      lines: [],
      object: {user:{}},

      object_columns: [
        {title: '公司代码', key: 'code', dataIndex: 'code'}, 
        {title: '公司名称', key: 'name', dataIndex: 'name'}, 
        {title: '邮箱', key: 'email', dataIndex: 'email'}, 
        {title: '手机', key: 'tel', dataIndex: 'tel'}, 
        {title: '电话', key: 'contact', dataIndex: 'contact'}, 
        {title: '代理商', key: 'agent', dataIndex: 'agent'}, 
        {title: '创建时间', key: 'create_time', dataIndex: 'create_time'}, 
        //{title: '地址', key: 'address', dataIndex: 'address'}, 
        //{title: '备注', key: 'remark', dataIndex: 'remark', scopedSlots: { customRender: 'remark' }}, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' }}, 
      ],

      dlg_detail:false,
      dlg_comp: false,
      has_manager_perm:false,
      has_admin_perm: false,
      has_agent_perm: false,

      filter: {},
      query: {},
      like_filters: ['code', 'name', 'tel', 'agent'],
      sort: null,

      current_page: 1,
      page_size:20,
      total_page:0,
      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},
    }
  },
  methods:{
    // 上传logo
    uploadLogo(info) {
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          this.object.image_url = info.file.response.image_url
          this.object.image_path = info.file.response.image_path
          this.$message.success(info.file.name+"上传成功");
        } else if (info.file.status === 'error') {
          this.$message.error(info.file.name+"上传失败");
        }
    },
    // 对话框
    do_create(){
      this.object = {user:{}}
      this.dlg_detail = true
      var env = this
      function bf(){
        env.$refs.user_code.focus()
      }
      setTimeout(bf, 1);
    },
    // 明细
    do_detail(index, object){
      this.dlg_detail = true
      this.object = object
    },
    // 修改
    do_update(){
      var object = this.object
      var env = this

      if(this.object.id){
        this.$http.put('/auth/company/'+this.object.id, this.object).then(function(resp){
          if(resp.data.status=='success'){
            env.$message.success('修改成功')
            env.dlg_detail = false
            env.load_objects()
          }else{
            env.$message.error('修改失败: '+resp.data.msg)
          }
        })
      }else{
        object.user.tel = object.user.code
        if (object.user.password && object.user.password.length >= 6 && object.code && object.code.length >= 2){
          this.$http.post('/auth/company', this.object).then(function(resp){
            if(resp.data.status=='success'){
              env.$message.success('创建成功')
              env.dlg_detail = false
              env.load_objects()
            }else{
              env.$message.error('创建失败: '+resp.data.msg)
            }
          })
        }else{
          env.$message.error('密码至少6位, 管理员帐号至少3位, 公司代码至少2位')
        }
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
      
      env.$http.get('/auth/company?q='+JSON.stringify(q)).then(function(resp){
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
    // load orders
    this.load_objects()

    // load user
    this.$http.get('/auth/current_user').then(function(resp){
      env.user = resp.data
      // perm
      env.has_admin_perm = (resp.data.roles.indexOf("admin") > -1)
      env.has_manager_perm = (resp.data.roles.indexOf("manager") > -1) || env.has_admin_perm
      env.has_agent_perm = (resp.data.roles.indexOf('agent') > -1) || env.has_admin_perm
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
