<template>
  <div>
    <div>
        <a-row>
          <a-col :span="6">
            <a-breadcrumb style="padding:20px 20px 20px 0;">
              <a-breadcrumb-item >财务管理</a-breadcrumb-item>
              <a-breadcrumb-item title="所有应付款的明细">客户款项汇总</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
          <a-col :span="18">
            <a-button @click="search_query('xlsx')" style="margin:15px 0;">导出</a-button>
          </a-col>
        </a-row>
    </div>

      <a-tabs defaultActiveKey="0" @change="load_tab">
        <a-tab-pane tab="应收汇总" key="recv">
        </a-tab-pane>
        <a-tab-pane tab="应付汇总" key="pay">
        </a-tab-pane>
      </a-tabs>

        <a-card>
          <span slot="title" v-if="false"></span>
          <a-card-grid style="width:33.33%;">总额: ¥<strong>{{mfmt(sum_data.amount)}}</strong>
          </a-card-grid>
          <a-card-grid style="width:33.33%;">实额: ¥<strong>{{mfmt(sum_data.real)}}</strong>
          </a-card-grid>
          <a-card-grid style="width:33.33%;">余额: ¥<strong>{{mfmt(sum_data.unreal)}}</strong>
          </a-card-grid>
        </a-card>

        <a-form layout="inline" style="padding-left:15px;background-color:rgb(235,235,235);">
          <a-form-item label="业务日期" >
            <a-date-picker v-model="query.date_forcount1" :format="'YYYY-MM-DD'" placeholder="开始日期"  style="width:120px;"/> ~
            <a-date-picker v-model="query.date_forcount2" :format="'YYYY-MM-DD'" placeholder="结束日期"  style="width:120px;"/>
          </a-form-item> 
          <a-form-item label="类型" >
            <a-select :defaultValue="query.xtype" style="width: 160px"  v-model="query.xtype">
              <a-select-option value="" v-bind:key="''">--选择类型--</a-select-option>
              <a-select-option :value="item.value" v-for="item in $store.options.money_xtype" v-bind:key="item.value">{{item.label}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="合作商">
            <a-auto-complete placeholder="合作商" @focus="handle_search_partner()" optionLabelProp="value" @change="handle_search_partner" :backfill="true" v-model="query.partner_code">
              <template slot="dataSource">
                  <a-select-option v-for="item in partners" :key="item.code">
                    <strong>{{item.code}} </strong><span class="certain-search-item-count">{{item.name}} {{item.tel}}</span>
                  </a-select-option>
              </template>
            </a-auto-complete>
          </a-form-item>
          <a-form-item label="经手人">
            <a-auto-complete placeholder="经手人" @focus="handle_search_user()" optionLabelProp="value" @change="handle_search_user" :backfill="true" v-model="query.ref_user_code">
            <template slot="dataSource">
                <a-select-option v-for="item in users" :key="item.code">
                  <strong>{{item.name}} </strong><span class="certain-search-item-count">{{item.code}} {{item.tel}}</span>
                </a-select-option>
            </template>
          </a-auto-complete>
          </a-form-item>
          <a-form-item>
              <a-button icon="search" @click="search_query">查询</a-button>
          </a-form-item>
        </a-form>

        <a-table :dataSource="objects" :columns="object_columns" bordered rowKey="id" :pagination="pagination" @change="table_filter_sort" :scroll="{x:'max-content'}">
          <span slot-scope="text,record" slot="partner_code">
            <span>
              <router-link :to="{ name: 'MesPurchase', query: {partner_code: record.partner_code} }" v-if="come=='income'">
              {{ record.partner_code }}
              </router-link>
              <router-link :to="{ name: 'MesSale', query: {partner_code: record.partner_code} }" v-if="come=='outcome'">
              {{ record.partner_code }}
              </router-link>
            </span>
          </span>
          <span slot-scope="text,record" slot="xtype">
            <span>{{ translate('money_xtype', record.xtype) }}</span>
          </span>
          <span slot-scope="text,record" slot="amount">
            <span>¥{{ mfmt(record.amount) }}</span>
          </span>
          <span slot-scope="text,record" slot="real">
            <span>¥{{ mfmt(record.real) }}</span>
          </span>
          <span slot-scope="text,record" slot="unreal">
            <span>¥{{ mfmt((record.amount - record.real)) }}</span>
          </span>
        </a-table>

    <div class="print2">
      <table border="1" cellspacing="0">
        <thead>
          <tr>
            <td>合作商</td>
            <td>类型</td>
            <td>总额</td>
            <td>已收</td>
            <td>应收</td>
          </tr>
        </thead>
        <tbody v-for="object in print_objects" v-bind:key="object.id">
          <tr>
            <td>{{ object.partner_code }}</td>
            <td>{{ translate('money_come', object.come) }} {{ translate('money_xtype', object.xtype) }}</td>
            <td>¥{{ mfmt(object.amount) }}</td>
            <td>¥{{ mfmt(object.real) }}</td>
            <td>¥{{ mfmt((object.amount - object.real)) }}</td>
          </tr>
          <tr>
            <td>业务日期: {{ object.date_forcount }}</td>
            <td colspan="4">备注: {{ object.remark }}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>
<script type="text/javascript" src="<%= BASE_URL %>static/jquery.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/jquery.barcode.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/jquery.print.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/utils.js"></script>
<script>
import echarts from 'echarts'

export default {
  name: 'FinanceSummary',
  data () {
    return {
      come: 'income',
      sum_data: {real:0, unreal:0, amount:0},
      partners: [],

      objects: [],
      object: {state: 'create', amount: 0, real: 0},
      print_objects: [],
      users: [],
      charts_data: [],
      mact: {}, // 收款/付款流水
      trans: [], // 流水

      object_columns: [
        {title: '合作商', key: 'partner_code', dataIndex: 'partner_code', scopedSlots: {customRender: 'partner_code'}}, 
        {title: '总额', key: 'amount', dataIndex: 'amount', scopedSlots: { customRender: 'amount' }}, 
        {title: '实额', key: 'real', dataIndex: 'real', scopedSlots: { customRender: 'real' }}, 
        {title: '余额', key: 'unreal', dataIndex: 'unreal', scopedSlots: { customRender: 'unreal' }},
      ],

      dlg_title: '创建应付款',
      dlg_new: false,
      is_edit: false,
      has_manager_perm:false,
      dlg_mact: false,
      mact_type: 'pay',
      dlg_title_mact: '收款记录',
      dlg_trans: false,
      object_date_forcount: null,

      filter: {},
      query: {},
      like_filters: ['partner_code'],
      partner_code_filter_icon: false,
      sort: null,
      create_time_filter_icon:false,
      date_forcount_filter_icon: false,
      code_filter_icon:false,

      current_page: 1,
      page_size:20,
      total_page:0,
      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},
      flist: [{name: 'come', op:'==', val: 'income'},],
    }
  },
  methods:{

    do_print(index, object){
      this.object = object
      this.print_objects = [object]
      env.$nextTick(() => {
        $('.print2').print({
                globalStyles: false,
                mediaPrint: true,
                stylesheet: '/static/print.css',
                noPrintSelector: ".no-print",
                iframe: true,
                append: null,
                prepend: null,
                manuallyCopyFormValues: true,
                deferred: $.Deferred(),
                timeout: 750,
                title: '应付款项',
                doctype: '<!doctype html>'
        })
      })
    },
    // --------------- end 增删改查 ------------------

    load_tab(tab, event){
      var env = this
      if(tab=="recv"){
        this.flist = [{name: 'come', op:'==', val: 'income'},]
        this.come = 'income'
      }else{
        this.flist = [{name: 'come', op:'==', val: 'outcome'},]
        this.come = 'outcome'
      }
      this.load_objects()
    },

    // 供应商推荐
    handle_search_partner(val){
      var env = this
      var q = {filters:[]}
      if(val){
        q = {filters:[{or: [{name: 'name', op:'ilike', val: val}, {name:'code', op: 'ilike', val: val}]}]}
      }
      this.$http.get('/warehouse/partner?q='+JSON.stringify(q)).then(function(resp){
          env.partners = resp.data.objects
      })
    },
    //end

    // 用户推荐
    handle_search_user(val){
      var env = this
      var q = {}
      if(val){
        q = {filters:[{or: [{name: 'name', op:'ilike', val: val}, {name:'code', op: 'ilike', val: val}]}]}
      }
      this.$http.get('/auth/user?q='+JSON.stringify(q)).then(function(resp){
          env.users = resp.data.objects
      })
    },
    //end

    // -------------- common ------------------
    mfmt(n, c, d, t){
      var s, i, j;
        c = isNaN(c = Math.abs(c)) ? 2 : c, 
        d = d == undefined ? "." : d, 
        t = t == undefined ? "," : t, 
        s = n < 0 ? "-" : "", 
        i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
        j = (j = i.length) > 3 ? j % 3 : 0;
      return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
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
        }else if(f == 'date_forcount1' && fs[f]){
          var create_time1 = new Date(fs[f])
          flist.push({name: 'date_forcount', op:'>=', val: create_time1.format('yyyy-MM-dd')})
        }else if(f == 'date_forcount2' && fs[f]){
          var create_time2 = new Date(fs[f])
          flist.push({name: 'date_forcount', op:'<', val: create_time2.addDate(1).format('yyyy-MM-dd')})
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
    search_query(export_xlsx){
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
        }else if(q == 'date_forcount1' && v){
          var create_time1 = new Date(v)
          filters.push({name: 'date_forcount', op:'>=', val: create_time1.format('yyyy-MM-dd')})
        }else if(q == 'date_forcount2' && v){
          var create_time2 = new Date(v)
          filters.push({name: 'date_forcount', op:'<', val: create_time2.addDate(1).format('yyyy-MM-dd')})
        }else if(this.like_filters.indexOf(q) > -1 && v){
          filters.push({name: q, op: 'ilike', val:v})
        }else if(v){
          filters.push({name: q, op: '==', val:v})
        }
      }
      this.load_objects(filters, this.sort, export_xlsx)
    },

    // load data
    load_objects(filters, sort, export_xlsx){
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
      
      q.filters = (q.filters || []).concat(this.flist||[])

      if (export_xlsx=='xlsx'){
        window.open('/finance/stat/partner/summary?export=xlsx&q='+JSON.stringify(q)+'&come='+this.come, "_blank")
        return
      }
      env.$http.get('/finance/stat/partner/summary?q='+JSON.stringify(q)).then(function(resp){
        env.objects = resp.data.objects

        env.total_page = resp.data.total_pages
        env.current_page = resp.data.page
        env.page_size = resp.data.per_page

        env.sum_data.amount = resp.data.amount
        env.sum_data.real = resp.data.real
        env.sum_data.unreal = resp.data.unreal

        env.pagination.total = resp.data.num_results
        env.pagination.current = resp.data.page
        env.pagination.pageSize = resp.data.per_page
      })
    },
    // end
    // 加载过滤选项
    load_choice(){
      this.options = this.$store.options
    },
  },
  // before render
  created:function() {
    var env = this
    this.owner_conf = this.$store.owner_conf || {}
    // load objects
    var filters = []
    if(this.$route.query.come){
      filters.push({name: 'come', op: '==', val: this.$route.query.come})
    }
    this.load_objects(filters)
  },
  // after render
  mounted: function(){
    this.load_choice()
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
