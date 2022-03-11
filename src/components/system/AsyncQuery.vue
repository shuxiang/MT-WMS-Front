<template>
  <div>
    <div>
        <a-breadcrumb style="padding:20px 20px 20px 0px;">
          <a-breadcrumb-item >数据管理</a-breadcrumb-item>
          <a-breadcrumb-item title="导入导出的历史记录和成功失败状态">导入导出</a-breadcrumb-item>
        </a-breadcrumb>
    </div>


    <a-modal title="错误详情" :visible="dlg_error" width="800px" :footer="null" @cancel="dlg_error=false">
      <a-textarea v-model="object.exc_info" autosize/>
    </a-modal>

    <a-tabs defaultActiveKey="1" @change="load_tabs">
      <a-tab-pane tab="导入导出明细" key="1">
        <a-table :columns="object_columns" :dataSource="objects" bordered rowKey="id" :pagination="pagination" @change="table_filter_sort" :scroll="{x:'max-content'}">
          <span slot="state" slot-scope="text,record">
            <span>{{ translate('async_state', record.state) }}</span>
          </span>
          <span slot="xtype" slot-scope="text,record">
            <span>{{ translate('async_xtype', record.xtype) }}</span>
          </span>
          <span slot="exc_info" slot-scope="text,record">
            <span v-if="record.state=='doing' || record.state=='done'">{{ record.exc_info }}</span>
            <a-button v-if="record.state=='fail'" @click="dlg_error=true;object=record;" type="danger">查看错误</a-button>
          </span>
          <span slot-scope="text,record" slot="link">
            <a :href="baseURL+'/async/download/'+record.id" target="_blank" type="success" v-if="record.link && record.state=='done'" ><a-icon type="download" />下载</a>
          </span>
        </a-table>
      </a-tab-pane>
      <a-tab-pane tab="导入数据" key="2">
        <a-table :columns="object_columns2" :dataSource="objects2" bordered rowKey="func" :pagination="pagination2" :scroll="{x:'max-content'}">
          <span slot="xtype" slot-scope="text,record">
            <span>{{ translate('async_xtype', record.xtype) }}</span>
          </span>
          <span slot-scope="text,record" slot="link">
                <a :href="record.link" target="_blank" type="success" v-if="record.link"><a-icon type="download" />下载</a>
          </span>
          <span slot="action" slot-scope="text,record">
                <a-upload :accept="record.code=='good' ? '.xlsx' : '.xls,.xlsx'"
                  name="file" :withCredentials="true" :data="record" method="post" :headers="headers"
                  :multiple="false" @change="handleChange"
                  :action="baseURL+'/async/table_import'"
                >
                  <a-button v-if="record.link" type="primary"> <a-icon type="upload" /> 选取文件导入 </a-button>
                </a-upload>
          </span>
        </a-table>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
export default {
  name: 'AsyncQuery',
  data () {
    return {
      baseURL: '',
      object_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id)},
        {title: '任务名称', key: 'name', dataIndex: 'name',},
        {title: '子类型', key: 'code', dataIndex: 'code'},
        {title: '状态', key: 'state', dataIndex: 'state', scopedSlots: { customRender: 'state' }, filters: [{ text: '进行中', value: 'doing' }, { text: '完成', value: 'done' }],},
        {title: '类型', key: 'xtype', dataIndex: 'xtype', scopedSlots: { customRender: 'xtype' },},
        {title: '创建时间', key: 'create_time', dataIndex: 'create_time', },
        {title: '下载', key: 'link', dataIndex: 'link', scopedSlots: { customRender: 'link' }},
        {title: '标识', key: 'async_id', dataIndex: 'async_id',},
        {title: '错误', key: 'exc_info', dataIndex: 'exc_info', scopedSlots: { customRender: 'exc_info' },},
      ],
      objects: [],
      object: {},

      has_manager_perm:false,
      dlg_error: false,

      filter: {},
      sort: null,

      current_page: 1,
      page_size:20,
      total_page:0,
      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},

      // ----------- imports ---------------
      object_columns2: [
        {title: '类型', key: 'xtype', dataIndex: 'xtype', scopedSlots: { customRender: 'xtype' },},
        {title: '子类型', key: 'code', dataIndex: 'code'},
        {title: '名称', key: 'name', dataIndex: 'name'},
        {title: '模板', key: 'link', dataIndex: 'link', scopedSlots: { customRender: 'link' },},
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' },},
      ],
      objects2: [],
      fileList: [],
      headers: {},//{'Access-Control-Allow-Origin': 'http://127.0.0.1:8080'},
      pagination2: {defaultPageSize:20},
    }
  },
  methods:{
    view_error(index, object){
      this.dlg_error = true
      this.object = object
    },
    load_tabs(tab, event){
      var env = this
      if((tab.name=='first' || tab=="1")){
        this.load_objects()
      }
    },

    // common ---------
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
      this.load_objects(fs, sorter)
    },

    // 格式化，翻译
    translate(key, val){
      if (this.$store.config[key]){
        return this.$store.config[key][val] || val
      }
      return val
    },

    // 搜索
    fetch_filter(filters){
      var flist = [], fs = filters || this.filter
      for(var f in fs){
        if(f == 'create_time1' && fs[f]){
          flist.push({name: 'create_time', op:'>', val:fs[f]})
        }else if(f == 'create_time2' && fs[f]){
          var create_time2 = new Date(fs[f])
          flist.push({name: 'create_time', op:'<=', val: create_time2.addDate(1).format('yyyy-MM-dd')})
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
    // end common

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
      
      env.$http.get('/async?q='+JSON.stringify(q)).then(function(resp){
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

    // --------- imports -----------
    handleChange(info, fileList) {
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          this.$message.success(`${info.file.name} file uploaded successfully`, 5);
        } else if (info.file.status === 'error') {
          this.$message.error(`${info.file.name} file upload failed.`, 5);
        }
    },
    // load data
    load_objects2(){
      var env = this
      env.$http.get('/async/table_import').then(function(resp){
        env.objects2 = resp.data
      })
    },
    // end imports
  },
  // before render
  created:function() {
    var env = this
    // load orders
    this.load_objects()
    this.load_objects2()
  },
  // after render
  mounted: function(){
    
    this.load_choice()
    this.baseURL = this.$store.baseURL
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.w135{width: 137px;}
.da{text-decoration:none;color:#606266;}
</style>
