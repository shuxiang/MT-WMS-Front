<template>
  <div>
    <div>
        <a-row>
          <a-col :span="12">
            <a-breadcrumb style="padding:20px 20px 20px 20px;">
              <a-breadcrumb-item >财务管理</a-breadcrumb-item>
              <a-breadcrumb-item title="财务管理">收款账户</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
          <a-col :span="12">
            <a-button  @click="do_create()" style="float:right;margin-top:15px;">新建账户</a-button>
          </a-col>
        </a-row>
    </div>

    <div>

      <a-modal :title="dlg_title" :visible="dlg_new" width="600px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_new=false">
        <a-form-model :layout="'horizontal'" :model="object" :rules="rules">
          <a-form-model-item label="开户机构" prop="organ" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input  v-model="object.organ"  placeholder="必填" ref="code"></a-input>
          </a-form-model-item>
          <a-form-model-item label="账户名称" prop="name" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input  v-model="object.name"  placeholder="必填"></a-input>
          </a-form-model-item>
          <a-form-model-item label="账号" prop="account" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input v-model="object.account"></a-input>
          </a-form-model-item>
          <a-form-model-item label="备注" prop="remark" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input v-model="object.remark"></a-input>
          </a-form-model-item>
        </a-form-model>
        <div class="dialog-footer">
          <a-button  @click="do_submit()" style="float:right"><a>提交</a></a-button>
        </div>
      </a-modal>


      <a-table :dataSource="objects" :columns="object_columns" bordered rowKey="id" :pagination="pagination" @change="table_filter_sort" :scroll="{x:'max-content'}">
        <span slot="action" slot-scope="text,record,index">
          <a-button @click="do_edit(index, record)" >修改</a-button>
        </span>
      </a-table>

    </div>
  </div>
</template>

<script>
export default {
  name: 'MoneyAccount',
  data () {
    return {
      rules: {
        name: [
          {required: true, message: '必填', trigger: 'change'},
          {min:1, max:50, message:'必填, 长度1位以上', trigger: 'change'},
        ],
        organ: [
          {required: true, message: '必填', trigger: 'change'},
          {min:1, max:50, message:'必填, 长度1位以上', trigger: 'change'},
        ],
        account: [
          {required: true, message: '必填', trigger: 'change'},
          {min:1, max:50, message:'必填, 长度1位以上', trigger: 'change'},
        ],
      },
      objects: [],
      object: {},

      object_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id), rowClassName: 'no-print'}, 
        {title: '开户机构', key: 'organ', dataIndex: 'organ'}, 
        {title: '账户名称', key: 'name', dataIndex: 'name'}, 
        {title: '账号', key: 'account', dataIndex: 'account'}, 
        {title: '备注', key: 'remark', dataIndex: 'remark', scopedSlots: { customRender: 'remark' }}, 
        {title: '操作', key: 'action', dataIndex: 'action', rowClassName: 'no-print', scopedSlots: { customRender: 'action' }}, 
      ],

      dlg_title: '创建账户',
      dlg_new: false,
      is_edit: false,
      has_manager_perm:false,

      filter: {},
      sort: null,

      current_page: 1,
      page_size:20,
      total_page:0,
      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},
    }
  },
  methods:{

    do_create(){
      var env = this
      this.dlg_title = '创建账户'
      this.dlg_new = true
      this.object = {}
      this.is_edit = false
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
        this.$http.put('/finance/money/account/'+this.object.id, this.object).then(function(resp){
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
        this.$http.post('/finance/money/account', this.object).then(function(resp){
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
      
      env.$http.get('/finance/money/account?q='+JSON.stringify(q)).then(function(resp){
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
<style>
.dialog-footer{padding-top:20px;padding-bottom:20px;}
</style>

