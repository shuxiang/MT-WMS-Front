<template>
  <div>
 
    <div>
        <a-row>
          <a-col :span="6">
            <a-breadcrumb style="padding:20px 20px 20px 0px;">
              <a-breadcrumb-item >基础信息</a-breadcrumb-item>
              <a-breadcrumb-item title="库位管理-一个仓库可能有多个库位">库位管理</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
          <a-col :span="18">
            <a-button  @click="do_create()" style="margin:15px 0;" type="primary">新建库位</a-button>
          </a-col>
        </a-row>
    </div>

      <a-modal :title="dlg_title" :visible="dlg_new" width="600px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_new=false">
        <a-form-model :layout="'horizontal'"  :rules="rules" :model="object" >
          <a-form-model-item label="编号" prop="code" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="object.code" ref="code" :disabled="is_edit" placeholder="必填"></a-input>
          </a-form-model-item>
          <a-form-model-item label="优先级" prop="priority"  :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-select :defaultValue="object.priority" style="width: 120px" v-model="object.priority">
              <a-select-option :value="item.value" v-for="item in options.wh_location_priority" v-bind:key="item.value">{{item.label}}</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item label="操作序" prop="index" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model.number="object.index" placeholder="只可以填数字"></a-input>
          </a-form-model-item>
          <a-form-model-item label="库区" prop="area_code" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-select :defaultValue="object.area_code" style="width: 120px" :disabled="is_edit" v-model="object.area_code">
              <a-select-option :value="item.code" v-for="item in areas" v-bind:key="item.code">{{item.name}}</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item label="工作区" prop="workarea_code" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-select :defaultValue="object.workarea_code" style="width: 120px" v-model="object.workarea_code" :disabled="object.is_inner">
              <a-select-option :value="item.code" v-for="item in workareas" v-bind:key="item.code">{{item.name}}</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item label="长" prop="length" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.length"></a-input>
          </a-form-model-item>
          <a-form-model-item label="宽" prop="width" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.width"></a-input>
          </a-form-model-item>
          <a-form-model-item label="高" prop="height" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.height"></a-input>
          </a-form-model-item>
          <a-form-model-item label="容积" prop="cubage" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.cubage"></a-input>
          </a-form-model-item>
        </a-form-model>
        <div  class="dialog-footer">
          <a-button  @click="do_submit()" style="float:right" type="primary"><a>提交</a></a-button>
        </div>
      </a-modal>

      <a-form layout="inline" v-if="owner_conf.is_enable_search_bar" style="padding-left:15px;background-color:rgb(235,235,235);">
        <a-form-item label="编号" >
          <a-input :allowClear="true"  placeholder="编号" v-model="query.code" style="width:160px;"/>
        </a-form-item>
        <a-form-item label="库区">
          <a-select :defaultValue="query.area"  v-model="query.area" style="width:120px;">
            <a-select-option value="" v-bind:key="''">--所有--</a-select-option>
            <a-select-option :value="item.code" v-for="item in areas" v-bind:key="item.code">{{item.name}}</a-select-option>
          </a-select> 
        </a-form-item>
        <a-form-item>
          <a-button icon="search" @click="search_query">查询</a-button>
        </a-form-item>
      </a-form>

      <a-table :dataSource="objects" :columns="object_columns" bordered rowKey="id" :pagination="pagination" @change="table_filter_sort" :scroll="{x:'max-content'}">
        <span slot="action" slot-scope="text,record,index">
          <a-button @click="do_edit(index, record)" type="primary" >修改</a-button>
        </span>
        <span slot="priority" slot-scope="text,record">
          <span>{{ translate('wh_location_priority', record.priority) }} </span>
        </span>
      </a-table>
  </div>
</template>

<script>
export default {
  name: 'Location',
  data () {
    return {
      rules: {
        code: [
          {required: true, message: '必填', trigger: 'change'},
          {min:1, max:50, message:'必填, 长度1位以上', trigger: 'change'},
        ],
      },
      objects: [],
      object: {},
      areas: [],
      workareas: [],

      object_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id), rowClassName: 'no-print'}, 
        {title: '编号', key: 'code', dataIndex: 'code', }, 
        {title: '优先级', key: 'priority', dataIndex: 'priority', scopedSlots: { customRender: 'priority' }}, 
        {title: '操作序', key: 'index', dataIndex: 'index'}, 
        {title: '库区', key: 'area_code', dataIndex: 'area_code'}, 
        {title: '工作区', key: 'workarea_code', dataIndex: 'workarea_code'}, 
        {title: '长', key: 'length', dataIndex: 'length'}, 
        {title: '宽', key: 'width', dataIndex: 'width'}, 
        {title: '高', key: 'height', dataIndex: 'height'}, 
        {title: '容积', key: 'cubage', dataIndex: 'cubage'}, 
        {title: '操作', key: 'action', dataIndex: 'action', rowClassName: 'no-print', scopedSlots: { customRender: 'action' }}, 
      ],

      dlg_title: '创建库位',
      dlg_new: false,
      is_edit: false,
      has_manager_perm:false,
      name_filter_icon: false,
      code_filter_icon: false,

      filter: {},
      query: {},
      like_filters: ['code'],
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
      this.dlg_title = '创建库位'
      this.dlg_new = true
      this.object = {priority:'L3', area_code:'default', workarea_code:'default', index:'1'}
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
        this.$http.put('/warehouse/location', this.object).then(function(resp){
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
        this.$http.post('/warehouse/location', this.object).then(function(resp){
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
      
      env.$http.get('/warehouse/location?q='+JSON.stringify(q)).then(function(resp){
        env.objects = resp.data.objects

        env.total_page = resp.data.total_pages
        env.current_page = resp.data.page
        env.page_size = resp.data.per_page

        env.pagination.total = resp.data.num_results
        env.pagination.current = resp.data.page
        env.pagination.pageSize = resp.data.per_page
      })
    },

    // load area
    load_areas(){
      var env = this
      env.$http.get('/warehouse/area').then(function(resp){
        env.areas = resp.data.objects

        env.total_page = resp.data.total_pages
        env.current_page = resp.data.page
        env.page_size = resp.data.per_page
      })
    },
    // load workarea
    load_workareas(){
      var env = this
      env.$http.get('/warehouse/workarea').then(function(resp){
        env.workareas = resp.data.objects

        env.total_page = resp.data.total_pages
        env.current_page = resp.data.page
        env.page_size = resp.data.per_page
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
    this.load_areas()
    this.load_workareas()
    
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
