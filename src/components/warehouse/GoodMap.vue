<template>
  <div>
    <div>
        <a-row>
          <a-col :span="6">
            <a-breadcrumb style="padding:20px 20px 20px 0px;">
              <a-breadcrumb-item >基础信息</a-breadcrumb-item>
              <a-breadcrumb-item title="货品配件管理-一个货品可能有多个配件组成">配料清单管理</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
          <a-col :span="18">
            <a-button  @click="do_create()" style="margin:15px 0;margin-left:10px;" type="primary">新建配料清单</a-button>
            <a-button @click="export_by_filter()" style="margin-top:15px;margin-left:20px;">导出</a-button>
          </a-col>
        </a-row>
    </div>

      <a-modal :visible="dlg_detail" width="1000px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_detail=false">
        <span slot="title"><h2 style="text-align:center;background-color:none;font-size:18px;">{{ dlg_title }}</h2></span>
        <a-table :dataSource="main_lines" :columns="line_main_columns" bordered rowKey="code" :pagination="false" :rowClassName="main_row_style">
        </a-table>
        <a-table :dataSource="page_lines" :columns="line_columns" bordered rowKey="id" :pagination="pagination3" @change="table_filter_sort3"  :scroll="{x:'max-content'}">
          <span slot="qty" slot-scope="text,record">
            <a-input :allowClear="true" v-model="record.qty" style="width:120px;"></a-input>
          </span>
          <span slot="action" slot-scope="text,record,index">
            <a-button @click="do_edit_line(index,record)" style="margin-right:10px;">修改</a-button>
            <a-button @click="do_del_line(index,record)" style="margin-right:10px;">删除</a-button>
          </span>
        </a-table>
        <div  class="dialog-footer">
          <!--
          <a-popconfirm
              title="确定要提交修改吗?"
              @confirm="do_change()"
              okText="确定"
              cancelText="取消"  v-if="is_edit"
            >
              <a-button style="float:right;margin-right:10px;" type="danger">修改</a-button>
          </a-popconfirm>
          <a-popconfirm
              title="确定要新建配料清单吗?"
              @confirm="do_submit()"
              okText="确定"
              cancelText="取消"  v-if="!is_edit"
            >
              <a-button style="float:right;margin-right:10px;" type="danger">提交</a-button>
          </a-popconfirm>
          -->
          <a-button style="float:right;margin-right:10px;" @click="do_search_good()">查找</a-button>
          <a-input :allowClear="true" v-model="good_code" placeholder="输入货品码或条码或名称或品牌进行查找" ref="good_code" @pressEnter="do_search_good()" style="float:right;margin-right:10px;width:260px;"></a-input>
        </div>
        <div>
          <br/>
          <a-table :dataSource="goods" :columns="search_columns" bordered rowKey="id" :pagination="pagination2" @change="table_filter_sort2">
            <span slot="qty" slot-scope="text,record">
              <a-input :allowClear="true" v-model="record.qty" placeholder="输入单耗数量(配件数量)" style="width:160px;"></a-input>
            </span>
            <span slot="action" slot-scope="text,record,index">
              <a-button @click="do_add_line(index,record)">添加配件</a-button>
              <a-button @click="do_add_main_line(index,record)" style="margin-left:10px;" v-if="!record.is_main && !main_line" type="danger">添加主件</a-button>
            </span>
          </a-table>
        </div>
      </a-modal>

      <a-form layout="inline" v-if="owner_conf.is_enable_search_bar" style="padding-left:15px;background-color:rgb(235,235,235);">
        <a-form-item label="条码">
          <a-input :allowClear="true"  placeholder="条码" v-model="query.barcode" />
        </a-form-item>
        <a-form-item label="货码">
          <a-input :allowClear="true"  placeholder="货码" v-model="query.code"/>
        </a-form-item>
        <a-form-item label="名称">
          <a-input :allowClear="true"  placeholder="名称"  v-model="query.name" />
        </a-form-item>
        <a-form-item>
          <a-button icon="search" @click="search_query">查询</a-button>
        </a-form-item>
      </a-form>

      <a-table :dataSource="objects" :columns="object_columns" bordered rowKey="id" :pagination="pagination" @change="table_filter_sort" :scroll="{x:'max-content'}">
        <span slot="action" slot-scope="text,record,index">
          <a-button @click="object_detail(index, record)" style="margin-right:10px;" type="primary">修改</a-button>
          <a-button @click="export_excel(index, record)" style="margin-right:10px">导出</a-button>
        </span>
      </a-table>

  </div>
</template>

<script>
export default {
  name: 'GoodMap',
  data () {
    return {
      objects: [],
      object: {},
      categorys: [],
      lines: [],
      goods:[],
      page_lines: [],

      object_columns: [
        {title: '主件货品码', key: 'code', dataIndex: 'code', sorter: (a, b)=>(a.code>b.code),
        }, 
        {title: '主件条码', key: 'barcode', dataIndex: 'barcode', 
        }, 
        {title: '主件名称', key: 'name', dataIndex: 'name', 
        }, 
        // {title: '配件货品码', key: 'subcode', dataIndex: 'subcode'}, 
        // {title: '配件条码', key: 'subbarcode', dataIndex: 'subbarcode',  }, 
        // {title: '配件名称', key: 'subname', dataIndex: 'subname'}, 
        // {title: '单耗数量(配件数量)', key: 'qty', dataIndex: 'qty'}, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' }}, 
      ],
      line_main_columns: [
        {title: '主件货品码', key: 'code', dataIndex: 'code', }, 
        {title: '主件条码', key: 'barcode', dataIndex: 'barcode',  }, 
        {title: '主件名称', key: 'name', dataIndex: 'name'}, 
        {title: '成本价', key: 'cost_price', dataIndex: 'cost_price'}, 
      ],
      line_columns: [
        {title: '配件货品码', key: 'subcode', dataIndex: 'subcode'}, 
        {title: '配件条码', key: 'subbarcode', dataIndex: 'subbarcode',  }, 
        {title: '配件名称', key: 'subname', dataIndex: 'subname'}, 
        {title: '成本价', key: 'cost_price', dataIndex: 'cost_price'}, 
        {title: '单耗数量(配件数量)', key: 'qty', dataIndex: 'qty', scopedSlots: { customRender: 'qty' }}, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' }}, 
      ],
      search_columns: [
        {title: '货品码', key: 'code', dataIndex: 'code'}, 
        {title: '名称', key: 'name', dataIndex: 'name'}, 
        {title: '品牌', key: 'brand', dataIndex: 'brand'}, 
        {title: '成本价', key: 'cost_price', dataIndex: 'cost_price'}, 
        {title: '单耗数量(配件数量)', key: 'qty', dataIndex: 'qty', scopedSlots: { customRender: 'qty' }}, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' }}, 
      ],

      dlg_title: '创建货品配件',
      is_edit: false,
      has_manager_perm:false,
      dlg_detail:false,
      good_code: '',
      main_line: null,
      main_lines:[],

      filter: {},
      query: {},
      sort: null,
      code_filter_icon:false,
      barcode_filter_icon: false,
      name_filter_icon: false,
      like_filters: ['code', 'name', 'barcode'],

      current_page: 1,
      page_size:20,
      total_page:0,
      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      pagination2: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      pagination3: {defaultPageSize:10, pageSize: 10, current: 1, total: 0, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},
    }
  },
  methods:{
    main_row_style(record, index){
      return 'bold-tb bg-tc';
    },
    // 增加配件行
    do_add_line(index, record){
      var env = this
      if(!this.main_line){
        this.$message.error('请先添加主件')
        return
      }
      if(record.sku==this.main_line.sku){
        this.$message.error('该货品已经选为主件')
        return
      }
      var is_in = false
      for(var i=0;i<this.lines.length;i++){
        if(this.lines[i].subcode==record.code){
          is_in = true
        }
      }

      if (!is_in){
        if(!record.qty){
          this.$message.error('请输入单耗数量(配件数量)')
          return
        }
        this.object = this.main_line
        var data = {code:this.object.code, barcode: this.object.barcode, name: this.object.name,
          subcode: record.code, subbarcode: record.barcode, subname: record.name, qty:record.qty, cost_price: record.cost_price}
        this.$http.put('/warehouse/goodmap/one', data).then(function(resp){
          if(resp.data.status=='success'){
            env.main_line.cost_price = resp.data.main_cost_price
            env.lines.push(resp.data.data)
            env.page_lines.push(resp.data.data)
            env.$message.success('添加成功')
            env.pagination3.total = env.lines.length
          }else{
            env.$message.error('添加失败'+resp.data.msg)
          }
        })
      }else{
        this.$message.error('已经存在货品码相同的配件了')
      }
    },
    // 删除
    do_del_line(index, record){
      var env = this
      if (record.id){
        this.$http.delete('/warehouse/goodmap/'+record.id).then(function(resp){
          if(resp.data.status=='success'){
            env.page_lines.splice(index, 1)
            for(var i=0;i<env.lines.length;i++){
              if(env.lines[i].code==record.code){
                env.lines.splice(i, 1)
                break
              }
            }
            env.pagination3.total = env.lines.length
            env.$message.success('删除成功')
            env.main_line.cost_price = resp.data.main_cost_price
          }else{
            env.$message.error('删除失败')
          }
        })
      }else{
        env.page_lines.splice(index, 1)
          for(var i=0;i<env.lines.length;i++){
            if(env.lines[i].code==record.code){
              env.lines.splice(i, 1)
              break
            }
          }

        // this.lines.splice(index, 1)
        this.pagination3.total = this.lines.length
      }
    },
    // 修改
    do_edit_line(index, record){
      var env = this
      if (record.id){
        this.$http.put('/warehouse/goodmap/one', record).then(function(resp){
          if(resp.data.status=='success'){
            env.main_line.cost_price = resp.data.main_cost_price
            env.page_lines[index] = resp.data.data
            for(var i=0;i<env.lines.length;i++){
              if(env.lines[i].code==record.code){
                env.lines[i] = resp.data.data
                break
              }
            }
            env.$message.success('修改成功')
          }else{
            env.$message.error('修改失败')
          }
        })
      }
    },
    // 增加主件
    do_add_main_line(index, record){
      // 查询服务器
      this.$message.success('添加主件成功!')
      this.main_line = record
      this.main_lines = [this.main_line]
      this.goods = []
    },
    // 查找货品
    do_search_good(pagination){
      var q = {}
      var env = this;
      q.filters = [{'or': [{name: 'code', op:'ilike', val: this.good_code}, {name: 'barcode', op:'ilike', val: this.good_code}, {name: 'name', op:'ilike', val: this.good_code}, {name: 'brand', op:'ilike', val: this.good_code}]}]
      if(pagination){
        q.page = pagination.current
        q.per_page = pagination.pageSize
      }
      env.$http.get('/warehouse/good?q='+JSON.stringify(q)).then(function(resp){
        env.goods = resp.data.objects
        env.pagination2.total = resp.data.num_results
        env.pagination2.current = resp.data.page
        env.pagination2.pageSize = resp.data.per_page
      })
    },
    table_filter_sort2(pagination, filters, sorter) {
      this.do_search_good(pagination)
    },
    table_filter_sort3(pagination, filters, sorter) {
      this.page_lines = this.lines.slice((pagination.current-1)*pagination.pageSize, pagination.current*pagination.pageSize)
      this.pagination3 = pagination
    },
    // 导出
    export_excel(index, object){
      var env = this
      var q = {filters: [{name: 'code', op: '==', val: object.code}]}

      var data = {
          name: '货品配料导出.xlsx', 
          xtype: 'export', 
          code: 'export_goodmap', 
          func: 'blueprints.auth.tasks.export_base:export_goodmap', 
          func_name: '货品配料导出'}

      this.$http.post('/async/table_export?q='+JSON.stringify(q), data).then(function(resp){
        if(resp.data.status=='success'){
          if (env.$store.owner_conf && env.$store.owner_conf.is_sync_downfile){
            window.open('/async/download/'+resp.data.data.id, "_blank")
          }
          env.$message.success('导出任务创建成功，请到 "数据管理>导入导出" 中查看')
        }else{
          env.$message.error('导出任务创建失败: '+resp.data.msg)
        }
      })
    },

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
          name: '配料配件表.xlsx', 
          xtype: 'export', 
          code: 'export_goodmap', 
          func: 'blueprints.auth.tasks.export_base:export_goodmap', 
          func_name: '配件表导出'}

      this.$http.post('/async/table_export?q='+JSON.stringify(q), data).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('导出任务创建成功，请到 "数据管理>导入导出" 中查看', 3)
          if (env.$store.owner_conf && env.$store.owner_conf.is_sync_downfile){
            window.open('/async/download/'+resp.data.data.id, "_blank")
          }
        }else{
          env.$message.error('导出任务创建失败: '+resp.data.msg)
        }
      })
    },

    object_detail(index, object){
      var env = this
      this.dlg_title = '编辑配料清单'
      this.dlg_detail = true
      this.is_edit = true
      this.object = object

      var q = {}
      q.filters = [{name:'id', op:'==', val:object.id}]
      
      env.$http.get('/warehouse/goodmap?q='+JSON.stringify(q)).then(function(resp){
        env.object = resp.data.objects[0]
        env.lines = env.object.lines
        // pagination
        env.pagination3.total = env.lines.length
        env.page_lines = env.lines.slice((env.pagination3.current-1)*env.pagination3.pageSize, env.pagination3.current*env.pagination3.pageSize)

        env.main_line = env.object
        env.main_lines = [env.main_line]
        env.goods = []
      })
    },
    do_create(){
      this.dlg_title = '创建配料清单'
      this.dlg_detail = true
      this.object = {}
      this.is_edit = false
      this.main_line = null
      this.main_lines = []
      this.lines = []
      this.page_lines = []
      var env = this
      function bf(){
        env.$refs.good_code.focus()
      }
      setTimeout(bf, 1);
    },
    do_change(){
      var env = this
      if(this.lines.length < 1){
        this.$message.error('请先添加配件')
        return
      }
      // update
      this.$http.put('/warehouse/goodmap', this.lines).then(function(resp){
        if(resp.data.status=='success'){
          env.load_objects()
          env.dlg_detail = false
          env.$message.success('修改成功', 3)
        }else{
          env.$message.error('修改失败：'+resp.data.msg)
        }
      })
    },
    do_submit(){
      var env = this
      if(this.lines.length<1){
        this.$message.error('请先添加配件')
        return
      }
      this.$http.post('/warehouse/goodmap', this.lines).then(function(resp){
        if(resp.data.status=='success'){
            env.load_objects()
            env.dlg_detail = false
            env.$message.success('创建成功', 3)
          }else{
            env.$message.error('创建失败：'+resp.data.msg, 3)
          }
      })
    },

    // common ================
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
        if(this.like_filters.indexOf(q) > -1){
          filters.push({name: q, op: 'ilike', val:this.query[q]})
        }else{
          filters.push({name: q, op: '==', val:this.query[q]})
        }
      }
      this.load_objects(filters, this.sort)
    },
    // 加载过滤选项
    load_choice(){
      this.options = this.$store.options
    },
    // end common ==============

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
      
      env.$http.get('/warehouse/goodmap?q='+JSON.stringify(q)).then(function(resp){
        env.objects = resp.data.objects

        env.total_page = resp.data.total_pages
        env.current_page = resp.data.page
        env.page_size = resp.data.per_page
        env.pagination.total = resp.data.num_results
        env.pagination.current = resp.data.page
        env.pagination.pageSize = resp.data.per_page
      })
    },
    load_categorys(){
      var env = this
      this.$http.get('/warehouse/category').then(function(resp){
        env.categorys = resp.data.objects
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

<style scoped>
</style>
