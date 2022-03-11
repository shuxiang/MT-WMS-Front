<template>
  <div>
    <div>
        <a-row>
          <a-col :span="6">
            <a-breadcrumb style="padding:20px 20px 20px 0px;">
              <a-breadcrumb-item >基础信息</a-breadcrumb-item>
              <a-breadcrumb-item title="货品管理-一个公司/货主可能有多个货品">货品管理</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
          <a-col :span="18">
            <a-button  @click="do_create()" style="margin:15px 0;" type="primary">新建货品</a-button>
            <a-button @click="export_by_filter()" style="margin:15px 0;margin-left:20px;">导出</a-button>
          </a-col>
        </a-row>
    </div>

    <a-modal title="打印条码" :visible="dlg_print" width="900px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_print=false">
      <span>打印数量: </span>
      <a-input v-model="current_barcode_qty" style="width:200px;" placeholder="请填写打印数量"></a-input>
      <a-button @click="print_barcode" style="margin-right:10px" type="primary">打印</a-button>
      <div id="print-qrcode">
        <div v-for="(rfid,idx) in barcode_list" :key="idx">
          <div class="barcode" style="width:100%;text-align:center;"><img :src="rfid.barcode_url" style="width:100%;" /></div>
          <div style="width:100%;text-align:left;">名称: {{rfid.name}}</div>
          <div style="width:100%;text-align:left;">条码: {{rfid.barcode}}</div>
          <div style="page-break-after:always;"></div>
        </div>
      </div>
    </a-modal>

      <a-modal title="新建货类" :visible="dlg_new_c" width="600px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_new_c=false">
        <a-form-model :layout="'horizontal'" :rules="rules" :model="category">
          <a-form-model-item label="编号" prop="code" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input  v-model="category.code" placeholder="必填"></a-input>
          </a-form-model-item>
          <a-form-model-item label="名称" prop="name" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input  v-model="category.name" placeholder="必填" ></a-input>
          </a-form-model-item>
          <a-form-model-item label="备注" prop="remark" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input v-model="category.remark"></a-input>
          </a-form-model-item>
        </a-form-model>
        <div class="dialog-footer">
          <a-button  @click="do_submit_category()" style="float:right"><a>提交</a></a-button>
        </div>
      </a-modal>

      <a-modal :title="dlg_title" :visible="dlg_new" width="600px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_new=false">
        <a-form-model :layout="'horizontal'"  :rules="rules" :model="object" >
          <a-form-model-item label="货品码" prop="code" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="object.code" :disabled="is_edit" ref="code" placeholder="必填"></a-input>
          </a-form-model-item>
          <a-form-model-item label="名称" prop="name" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="object.name"  placeholder="必填"></a-input>
          </a-form-model-item>
          <a-form-model-item label="条码" prop="barcode" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true"  v-model="object.barcode" :disabled="is_edit" placeholder=""></a-input>
            <div id="barcode" v-if="is_edit">
              <!--
              <div id="barcode_box">
                <p style="margin:0px;text-align:center;">{{object.name}}</p>
                <p class="barcode" style="margin:0px;"></p>
              </div>
              -->
              <a-button @click="dlg_print_barcode()">打印条码</a-button>
            </div>
          </a-form-model-item>
          <a-form-model-item label="货类" prop="category_code"  :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-select :defaultValue="object.category_code" style="width: 120px" v-model="object.category_code">
              <a-select-option :value="item.code" v-for="item in categorys" v-bind:key="item.code">{{item.name}}</a-select-option>
            </a-select><a-button type="primary" @click="dlg_new_c=true;">新建货类</a-button>
          </a-form-model-item>

          <a-form-model-item label="价格(元)" prop="price" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.price"></a-input>
          </a-form-model-item>
          <a-form-model-item label="成本价(元)" prop="cost_price" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.cost_price"></a-input>
          </a-form-model-item>
          <a-form-model-item label="品牌" prop="brand" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-auto-complete placeholder="品牌" optionLabelProp="value" :defaultValue="''" :backfill="true" v-model="object.brand" style="width:200px;" @focus="do_load_unit('brands')">
              <template slot="dataSource">
                  <a-select-option v-for="item in brands" :key="item">
                    <strong>{{item}} </strong>
                  </a-select-option>
              </template>
            </a-auto-complete><a-button @click="do_save_unit('brands', object.brand)">保存品牌</a-button>
          </a-form-model-item>
          <a-form-model-item label="规格" prop="spec" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.spec"></a-input>
          </a-form-model-item>
          <a-form-model-item label="单位" prop="unit" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-auto-complete placeholder="单位" optionLabelProp="value" :defaultValue="''" :backfill="true" v-model="object.unit" style="width:200px;" @focus="do_load_unit('units')">
              <template slot="dataSource">
                  <a-select-option v-for="item in units" :key="item">
                    <strong>{{item}} </strong>
                  </a-select-option>
              </template>
            </a-auto-complete><a-button @click="do_save_unit('units', object.unit)">保存单位</a-button>
          </a-form-model-item>

          <a-form-model-item label="最高库存" prop="max_qty" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.max_qty"></a-input>
          </a-form-model-item>
          <a-form-model-item label="最低库存" prop="min_qty" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.min_qty"></a-input>
          </a-form-model-item>

          <a-form-model-item label="重量(千克kg)" prop="weight" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.weight"></a-input>
          </a-form-model-item>

          <a-form-model-item label="商品参数" prop="args" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-textarea :allowClear="true" v-model="object.args"></a-textarea>
          </a-form-model-item>

          <a-form-model-item label="备注" prop="remark" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-textarea :allowClear="true" v-model="object.remark"></a-textarea>
          </a-form-model-item>

          <a-form-model-item label="商品图片" prop="image_url" :label-col="{span:4}" :wrapper-col="{span:20}">
            <a-card>
              <span slot="title" v-if="false"></span>
              <a-card-grid style="width:100%;" v-for="(im, idx) in object.images_list" v-bind:key="im">
                <img :src="im" style="max-width:320px;max-height:300px;overflow:hidden;" /><br/>
                <a-popconfirm title="确定要删除吗?" @confirm="del_good_img(im, idx)" okText="确定" cancelText="取消" >
                  <a-button>删除</a-button>
                </a-popconfirm>
              </a-card-grid>
            </a-card>

            <a-upload accept=".png,.jpg,.jpeg,.gif,.bmp,.webp" name="file" :multiple="false" :action="'/inv/good/'+object.id+'/image'" @change="upload_img" :showUploadList="false" :method="'put'">
              <a-button > <a-icon type="upload" /> 上传 </a-button>
            </a-upload>
          </a-form-model-item>

          <a-form-model-item label="广告图片" prop="ad_image_url" :label-col="{span:4}" :wrapper-col="{span:20}">
            <a-card>
              <span slot="title" v-if="false"></span>
              <a-card-grid style="width:100%;" v-for="(im, idx) in object.ad_images_list" v-bind:key="im">
                <img :src="im" style="max-width:320px;max-height:300px;overflow:hidden;" /><br/>
                <a-popconfirm title="确定要删除吗?" @confirm="del_good_ad_img(im, idx)" okText="确定" cancelText="取消" >
                  <a-button>删除</a-button>
                </a-popconfirm>
              </a-card-grid>
            </a-card>

            <a-upload accept=".png,.jpg,.jpeg,.gif,.bmp,.webp" name="file" :multiple="false" :action="'/inv/good/'+object.id+'/ad_image'" @change="upload_ad_img" :showUploadList="false" :method="'put'">
              <a-button > <a-icon type="upload" /> 上传 </a-button>
            </a-upload>
          </a-form-model-item>

        </a-form-model>
        <div  class="dialog-footer">
          <a-button @click="do_submit()" style="float:right" type="primary"><a>提交</a></a-button>
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
        <span slot="id" slot-scope="text,record">
          <span>{{ record.index || record.id }}</span>
        </span>
        <span slot="code" slot-scope="text,record">
          <a-popover :title="record.name">
            <template slot="content">
              <p style="background-color:#ddd;"><img :src="img" style="max-width:300px;max-height:300px;margin-right:5px;" v-bind:key="idx" v-for="(img, idx) in record.images_list"/></p>
            </template>
            <span v-if="record.images_list.length"><a>图</a> <a v-if="record.is_main">主</a> {{ record.code }}</span>
          </a-popover>
          <span v-if="!record.images_list.length">
            <a v-if="record.is_main">主</a> {{ record.code }}
          </span>
        </span>
        <span slot="action" slot-scope="text,record,index">
          <a-button @click="do_edit(index, record)"  type="primary">修改</a-button>
        </span>

        <span slot="price" slot-scope="text,record">
          <span>¥{{ mfmt(record.price) }}</span>
        </span>
        <span slot="cost_price" slot-scope="text,record">
          <span>¥{{ mfmt(record.cost_price) }}</span>
        </span>
      </a-table>

  </div>
</template>

<script type="text/javascript" src="<%= BASE_URL %>static/jquery.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/jquery.barcode.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/jquery.print.min.js"></script>
<script>
export default {
  name: 'Good',
  data () {
    return {
      rules: {
        name: [
          {required: true, message: '必填', trigger: 'change'},
          {min:1, max:50, message:'必填, 长度1位以上', trigger: 'change'},
        ],
        code: [
          {required: true, message: '必填', trigger: 'change'},
          {min:2, max:50, message:'必填, 长度2位以上', trigger: 'change'},
        ],
      },
      units: [],
      brands: [],
      objects: [],
      object: {},
      categorys: [],
      need_produce: [{code:1, name:'是'}, {code:0, name:'否'}],

      object_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id), rowClassName: 'no-print'}, 
        {title: '货品码', key: 'code', dataIndex: 'code', scopedSlots: {customRender: 'code'},}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode', }, 
        {title: '名称', key: 'name', dataIndex: 'name', }, 
        {title: '货类码', key: 'category_code', dataIndex: 'category_code', }, 
        {title: '售价', key: 'price', dataIndex: 'price', scopedSlots: { customRender: 'price' }}, 
        {title: '成本', key: 'cost_price', dataIndex: 'cost_price', scopedSlots: { customRender: 'cost_price' }}, 
        {title: '单位', key: 'unit', dataIndex: 'unit'},  
        {title: '规格', key: 'spec', dataIndex: 'spec'},  
        /*
        {title: '长', key: 'length', dataIndex: 'length'}, 
        {title: '宽', key: 'width', dataIndex: 'width'}, 
        {title: '高', key: 'height', dataIndex: 'height'}, 
        {title: '体积', key: 'volume', dataIndex: 'volume'}, */
        {title: '重量', key: 'weight', dataIndex: 'weight'}, 
        // {title: '款式', key: 'style', dataIndex: 'style'}, 
        // {title: '颜色', key: 'color', dataIndex: 'color'}, 
        // {title: '尺寸', key: 'size', dataIndex: 'size'}, 
        {title: '品牌', key: 'brand', dataIndex: 'brand'}, 
        {title: '最高库存', key: 'max_qty', dataIndex: 'max_qty'}, 
        {title: '最低库存', key: 'min_qty', dataIndex: 'min_qty'}, 
        {title: '操作', key: 'action', dataIndex: 'action', rowClassName: 'no-print', fixed:'right', scopedSlots: { customRender: 'action' }}, 
      ],

      dlg_title: '创建货品',
      dlg_new: false,
      is_edit: false,
      dlg_new_c: false,
      category: {},
      has_manager_perm:false,

      // print
      dlg_print:false,
      current_barcode:'',
      current_barcode_qty:1,
      barcode_list: [],

      filter: {},
      query: {},
      sort: null,
      code_filter_icon: false,
      name_filter_icon: false,
      barcode_filter_icon: false,
      category_code_filter_icon: false,
      like_filters: ['code', 'name', 'barcode'],

      current_page: 1,
      page_size:20,
      total_page:0,
      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},
    }
  },
  methods:{
    do_save_unit(selection, field){
      var env = this
      if(field){
        this.$http.post('/warehouse/selection/'+selection, {'unit':field}).then(function(resp){
          if(resp.data.status=='success'){
            if(selection=='units'){
              env.units = resp.data.units
            }else if(selection=='brands'){
              env.brands = resp.data.units
            }
            
            env.$message.success('保存成功')
          }else{
            env.$message.error('保存失败：'+resp.data.msg)
          }
        })
      }
    },
    do_load_unit(selection){
      var env = this
      this.$http.get('/warehouse/selection/'+selection).then(function(resp){
        if(resp.data.status=='success'){
          if(selection=='units'){
            env.units = resp.data.units
          }else if(selection=='brands'){
            env.brands = resp.data.units
          }
        }
      })
    },

    // 新建货类
    do_submit_category(){
      var env = this
      // create
      this.$http.post('/warehouse/category', this.category).then(function(resp){
        if(resp.data.status=='success'){
          env.load_objects()
          env.load_categorys()
          env.dlg_new_c = false
          env.object.category_code = env.category.code
          env.$message.success('创建成功')
        }else{
          env.$message.error('创建失败：'+resp.data.msg)
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
          name: '货品.xlsx', 
          xtype: 'export', 
          code: 'export_good', 
          func: 'blueprints.auth.tasks.export_base:export_good', 
          func_name: '货品导出'}

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

    // 上传logo
    upload_img(info) {
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          console.log(info.file.response)
          if (this.object.id){
            this.object.images_list = info.file.response.images_list
          }else{
            this.object.images_list.push(info.file.response.image_url)
          }
          
          this.$message.success(info.file.name+"上传成功");
        } else if (info.file.status === 'error') {
          this.$message.error(info.file.name+"上传失败");
        }
    },
    del_good_img(im, idx){
      var env = this
      this.$http.delete('/inv/good/'+this.object.id+'/image?img='+im).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('删除成功', 3)
          env.object.images_list.splice(idx, 1)
        }else{
          env.$message.error('删除失败', 3)
        }
      })
    },

    upload_ad_img(info) {
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          console.log(info.file.response)
          if (this.object.id){
            this.object.ad_images_list = info.file.response.ad_images_list
          }else{
            this.object.ad_images_list.push(info.file.response.image_url)
          }
          
          this.$message.success(info.file.name+"上传成功");
        } else if (info.file.status === 'error') {
          this.$message.error(info.file.name+"上传失败");
        }
    },
    del_good_ad_img(im, idx){
      var env = this
      this.$http.delete('/inv/good/'+this.object.id+'/ad_image?img='+im).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('删除成功', 3)
          env.object.ad_images_list.splice(idx, 1)
        }else{
          env.$message.error('删除失败', 3)
        }
      })
    },

    do_create(){
      this.dlg_title = '创建货品'
      this.dlg_new = true
      this.object = {category_code:'default', images_list:[], ad_images_list:[]}
      this.is_edit = false
      var env = this
      function bf(){
        env.$refs.code.focus()
      }
      setTimeout(bf, 1);
    },

    do_edit(index, object){
      var env = this
      this.dlg_title = '修改'
      this.dlg_new = true
      this.object = object
      this.is_edit = true
    },
    // print_barcode(){
    //   var env = this
    //   env.$nextTick(function (){
    //     $('#barcode_box').print({
    //             globalStyles: false,
    //             mediaPrint: true,
    //             //stylesheet: '/static/print.css',
    //             noPrintSelector: ".no-print",
    //             iframe: true,
    //             append: null,
    //             prepend: null,
    //             manuallyCopyFormValues: true,
    //             deferred: $.Deferred(),
    //             timeout: 750,
    //             //title: '销售单: '+this.order.order_code,
    //             doctype: '<!doctype html>'
    //     })
    //   })
    // },

    dlg_print_barcode(){
      var env = this
      env.current_barcode = env.object
      env.barcode_list = []
      env.current_barcode_qty = 1
      env.dlg_print = true
    },
    print_barcode(){
      var env = this
      env.barcode_list = []
      for(var i=0;i<env.current_barcode_qty;i++){
        env.barcode_list.push(env.current_barcode)
      }
      env.$nextTick(function (){
        $('#print-qrcode').print({
                globalStyles: false,
                mediaPrint: true,
                //stylesheet: '/static/print.css',
                noPrintSelector: ".no-print",
                iframe: true,
                append: null,
                prepend: null,
                manuallyCopyFormValues: true,
                deferred: $.Deferred(),
                timeout: 750,
                doctype: '<!doctype html>'
        })
      })
    },

    do_submit(){
      var env = this
      if (this.object.id){
        // update
        this.$http.put('/warehouse/good', this.object).then(function(resp){
          if(resp.data.status=='success'){
            env.load_objects()
            env.dlg_new = false
            env.$message.success('修改成功')
          }else{
            env.$message.error('修改失败：'+resp.data.msg)
          }
        })
      }else{
        if (!this.object.category_code){
          this.$message.error('请选择货类')
          return
        }
        // create
        this.$http.post('/warehouse/good', this.object).then(function(resp){
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
      
      env.$http.get('/warehouse/good?q='+JSON.stringify(q)).then(function(resp){
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
    this.load_categorys()
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
