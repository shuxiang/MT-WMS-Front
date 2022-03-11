<template>
  <div>
    <div>
        <a-row>
          <a-col :span="6">
            <a-breadcrumb style="padding:20px 20px 20px 0px;">
              <a-breadcrumb-item >财务信息</a-breadcrumb-item>
              <a-breadcrumb-item title="所有应付款的明细">应付账款</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
          <a-col :span="18">
            <a-button  @click="do_create()" style="margin:15px 0;margin-left:10px;" type="primary">新建应付款</a-button>
            <a-button @click="export_by_filter()" style="margin-top:15px;margin-left:10px;">导出</a-button>
          </a-col>
        </a-row>
    </div>

    <a-modal :title="dlg_title" :visible="dlg_new" width="600px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_new=false">
      <a-form :layout="'horizontal'"  >
        <!-- ['id', 'code', 'subcode', 'company_code', 'partner_code', 'xtype', 'amount', 'real', 'user_code', 'come', 'invoice_url', 'state', 'remark', 'create_time', 'update_time'] -->
        <a-form-item label="合作商" prop="partner_code" :label-col="{span:4}" :wrapper-col="{span:14}">
          <a-auto-complete placeholder="合作商" @focus="handle_search_partner()" optionLabelProp="value" @change="handle_search_partner" :backfill="true"  :disabled="object.state!='create'" v-model="object.partner_code">
            <template slot="dataSource">
                <a-select-option v-for="item in partners" :key="item.code">
                  <strong>{{item.code}} </strong><span class="certain-search-item-count">{{item.name}} {{item.tel}}</span>
                </a-select-option>
            </template>
          </a-auto-complete>
        </a-form-item>
        <a-form-item label="类型" prop="xtype" :label-col="{span:4}" :wrapper-col="{span:14}">
          <a-select :defaultValue="object.xtype" style="width: 120px"  v-model="object.xtype" :disabled="object.state!='create'">
            <a-select-option :value="item.value" v-for="item in $store.options['money_xtype']" v-bind:key="item.value">{{item.label}}</a-select-option>
          </a-select><a-button  @click="dlg_config=true" >新增</a-button>
        </a-form-item>
        <!--
        <a-form-item label="收支" prop="come" :label-col="{span:4}" :wrapper-col="{span:14}">
          <a-select :defaultValue="object.come" style="width: 120px"  v-model="object.come" :disabled="object.state!='create'">
            <a-select-option :value="item.value" v-for="item in $store.options['money_come']" v-bind:key="item.value">{{item.label}}</a-select-option>
          </a-select>
        </a-form-item>-->
        <a-form-item label="总额" prop="amount" :label-col="{span:4}" :wrapper-col="{span:14}">
          <a-input :allowClear="true"  v-model="object.amount" ></a-input>
        </a-form-item>
        <a-form-item label="结清" prop="is_clear" :label-col="{span:4}" :wrapper-col="{span:14}">
          <a-radio-group :defaultValue="false" buttonStyle="solid" v-model="object.is_clear">
            <a-radio-button :value="true">已结清</a-radio-button>
            <a-radio-button :value="false">未结清</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <!--
        <a-form-item label="已收/已付" prop="real" :label-col="{span:4}" :wrapper-col="{span:14}">
          <a-input :allowClear="true"  v-model="object.real" ></a-input>
        </a-form-item>
        -->
        <a-form-item label="业务日期" prop="date_forcount" :label-col="{span:4}" :wrapper-col="{span:14}">
          <a-date-picker :format="'YYYY-MM-DD'" v-model="object_date_forcount"  style="width:120px;"></a-date-picker>
        </a-form-item>
        <a-form-item label="经手人" prop="ref_user_code" :label-col="{span:4}" :wrapper-col="{span:14}">
          <a-auto-complete placeholder="经手人" @focus="handle_search_user()" optionLabelProp="value" @change="handle_search_user" :backfill="true" v-model="object.ref_user_code">
          <template slot="dataSource">
              <a-select-option v-for="item in users" :key="item.code">
                <strong>{{item.name}} </strong><span class="certain-search-item-count">{{item.code}} {{item.tel}}</span>
              </a-select-option>
          </template>
        </a-auto-complete>
        </a-form-item>
        <a-form-item label="发票号" prop="invoice_no" :label-col="{span:4}" :wrapper-col="{span:14}">
          <a-input :allowClear="true"  v-model="object.invoice_no"></a-input>
        </a-form-item>
        <a-form-item label="关联单号" prop="code" :label-col="{span:4}" :wrapper-col="{span:14}">
          <a-input :allowClear="true"  v-model="object.code"></a-input>
        </a-form-item>
        <a-form-item label="备注" prop="remark" :label-col="{span:4}" :wrapper-col="{span:14}">
          <a-input :allowClear="true"  v-model="object.remark"></a-input>
        </a-form-item>
      </a-form>
      <div class="dialog-footer">
        <a-button  @click="do_cancel()" style="float:right; margin-left:20px;" v-if="object.state=='create'">取消款项</a-button>
        <a-button  @click="do_submit()" style="float:right" v-if="object.state!='done' && object.state!='partdone'" type="primary">提交</a-button>
      </div>
    </a-modal>

    <a-modal title="应付款项流水" :visible="dlg_trans" width="800px" :footer="null"  @cancel="dlg_trans=false">
      <a-table :dataSource="trans" :columns="trans_columns" bordered rowKey="id" :pagination="false">
        <span slot-scope="text,record" slot="real">
          <span>¥{{ mfmt(record.real) }}</span>
        </span>
      </a-table>
    </a-modal>

    <a-modal :title="dlg_title_mact" :visible="dlg_mact" width="600px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_mact=false">
      <a-form :layout="'horizontal'"  >
        <a-form-item label="本次金额" prop="real" :label-col="{span:4}" :wrapper-col="{span:14}">
          <a-input :allowClear="true"  v-model="mact.real" ></a-input><span>{{ (mact_type=='pay'? '未付金额: ': "未收金额: ") }}<strong>¥{{ mfmt((object.amount-object.real)) }}</strong></span>
        </a-form-item>
        <a-form-item label="经手人" prop="ref_user_code" :label-col="{span:4}" :wrapper-col="{span:14}">
          <a-auto-complete placeholder="经手人" @focus="handle_search_user()" optionLabelProp="value" @change="handle_search_user" :backfill="true" v-model="mact.ref_user_code">
          <template slot="dataSource">
              <a-select-option v-for="item in users" :key="item.code">
                <strong>{{item.name}} </strong><span class="certain-search-item-count">{{item.code}} {{item.tel}}</span>
              </a-select-option>
          </template>
        </a-auto-complete>
        </a-form-item>
        <a-form-item label="账户" prop="account_longname" :label-col="{span:4}" :wrapper-col="{span:14}">
          <a-auto-complete placeholder="账户" @focus="handle_search_account()" optionLabelProp="value" @change="handle_search_account" :backfill="true" v-model="mact.account_longname">
          <template slot="dataSource">
              <a-select-option v-for="item in accounts" :key="item.longname">
                <strong>{{item.longname}} </strong>
              </a-select-option>
          </template>
          </a-auto-complete>
        </a-form-item>
        <a-form-item label="备注" prop="remark" :label-col="{span:4}" :wrapper-col="{span:14}">
          <a-textarea  v-model="mact.remark"></a-textarea>
        </a-form-item>
      </a-form>
      <div class="dialog-footer">
        <a-button  @click="do_pay()" style="float:right" v-if="mact_type=='pay'" type="primary">提交</a-button>
        <a-button  @click="do_recv()" style="float:right" v-if="mact_type!='pay'" type="primary">提交</a-button>
      </div>
    </a-modal>

    <a-modal :title="dlg_title_config" :visible="dlg_config" width="600px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_config=false">
      <a-form :layout="'horizontal'"  >
        <a-form-item label="类型名称" :label-col="{span:4}" :wrapper-col="{span:14}">
          <a-input  v-model="conf.str2" ></a-input>
        </a-form-item>
      </a-form>
      <div class="dialog-footer">
          <a-button  @click="do_config('money_xtype')" style="float:right;" type="primary">提交</a-button>
      </div>
    </a-modal>
    
    <a-tabs defaultActiveKey="0" @change="load_month_charts">
      <a-tab-pane tab="明细" key="0">
        <h3 >
          <span><!--
            收入总额: ¥<strong>{{mfmt(sum_data.income_amount)}}</strong> | 
            收入实额: ¥<strong>{{mfmt(sum_data.income_real)}}</strong> | -->
            支出总额: ¥<strong>{{mfmt(sum_data.outcome_amount)}}</strong> | 
            实付: ¥<strong>{{mfmt(sum_data.outcome_real)}}</strong> |
            未付余额: ¥<strong>{{mfmt(sum_data.outcome_amount - sum_data.outcome_real)}}</strong><!-- |
            总额毛利: ¥<strong>{{mfmt(sum_data.income_amount-sum_data.outcome_amount)}}</strong> | 
            实额毛利: ¥<strong>{{mfmt(sum_data.income_real-sum_data.outcome_real)}}</strong>-->
          </span>
        </h3>
        <a-form layout="inline" v-if="owner_conf.is_enable_search_bar" style="padding-left:15px;background-color:rgb(235,235,235);">
            <a-form-item label="合作商" >
              <a-auto-complete placeholder="合作商" @focus="handle_search_partner()" optionLabelProp="value" @change="handle_search_partner" :backfill="true"  v-model="query.partner_code">
                <template slot="dataSource">
                    <a-select-option v-for="item in partners" :key="item.code">
                      <strong>{{item.code}} </strong><span class="certain-search-item-count">{{item.name}} {{item.tel}}</span>
                    </a-select-option>
                </template>
              </a-auto-complete>
            </a-form-item>
            <a-form-item label="类型">
              <a-select :defaultValue="query.xtype"  v-model="query.xtype" style="width:120px;">
                <a-select-option value="" v-bind:key="''">--所有--</a-select-option>
                <a-select-option :value="item.value" v-for="item in options.money_xtype" v-bind:key="item.value">{{item.label}}</a-select-option>
              </a-select> 
            </a-form-item>
            <a-form-item label="收支">
              <a-select :defaultValue="query.come"  v-model="query.come" style="width:120px;">
                <a-select-option value="" v-bind:key="''">--所有--</a-select-option>
                <a-select-option :value="item.value" v-for="item in options.money_come" v-bind:key="item.value">{{item.label}}</a-select-option>
              </a-select> 
            </a-form-item>
            <a-form-item label="状态">
              <a-select :defaultValue="query.state"  v-model="query.state" style="width:120px;">
                <a-select-option value="" v-bind:key="''">--所有--</a-select-option>
                <a-select-option :value="item.value" v-for="item in options.money_state" v-bind:key="item.value">{{item.label}}</a-select-option>
              </a-select> 
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
          <span slot-scope="text,record" slot="state">
            <span>{{ translate('money_state', record.state) }}</span>
          </span>
          <span slot-scope="text,record" slot="xtype">
            <span>{{ translate('money_xtype', record.xtype) }}</span>
          </span>
          <span slot-scope="text,record" slot="come">
            <span>{{ translate('money_come', record.come) }}</span>
          </span>
          <span slot-scope="text,record" slot="amount">
            <span>¥{{ mfmt(record.amount) }}</span>
          </span>
          <span slot-scope="text,record" slot="real">
            <span>¥{{ mfmt(record.real) }}</span>
          </span>
          <span slot-scope="text,record" slot="code">
            <router-link :to="{ name: 'MesSaleOne', params: {order_id: record.code} }" v-if="record.xtype=='sale'">
                {{ record.code }}
            </router-link>
            <router-link :to="{ name: 'MesPurchaseOne', params: {order_id: record.code} }" v-if="record.xtype=='purchase'">
                {{ record.code }}
            </router-link>
          </span>

          <span slot="action" slot-scope="text,record,index">
            <a-button @click="do_edit(index, record)" v-if="record.state!='done' && record.state!='partdone'" style="margin-right:10px;" type="primary">修改</a-button>
            <a-button @click="do_trans(index, record)" v-if="record.state!='create'" style="margin-right:10px;">流水</a-button>
            <a-button @click="do_print(index, record)" style="margin-right:10px;">打印</a-button>
            <a-button @click="do_pay_dlg(index, record)" v-if="(record.state=='create' || record.state=='doing') && record.come=='outcome'" type="primary">付款</a-button>
            <a-button @click="do_recv_dlg(index, record)" v-if="(record.state=='create' || record.state=='doing') && record.come=='income'" type="primary">收款</a-button>
          </span>
        </a-table>
      </a-tab-pane>
      <a-tab-pane tab="月度应付款" key="1">
        <a-form layout="inline">
          <a-form-item label="月份"  prop="month" >
            <a-month-picker v-model="summary.month" :format="'YYYY-MM'" placeholder="请选择月份" />
          </a-form-item> 
          <a-form-item label="类型"  prop="xtype">
            <a-select :defaultValue="summary.xtype" style="width: 160px"  v-model="summary.xtype">
              <a-select-option value="" v-bind:key="''">--选择类型--</a-select-option>
              <a-select-option :value="item.value" v-for="item in $store.options['money_xtype']" v-bind:key="item.value">{{item.label}}</a-select-option>
            </a-select>
          </a-form-item>
          <!--
          <a-form-item label="收支"  prop="come">
            <a-select :defaultValue="summary.come" style="width: 160px"  v-model="summary.come" >
              <a-select-option value="" v-bind:key="''">--选择收支--</a-select-option>
              <a-select-option :value="item.value" v-for="item in $store.options['money_come']" v-bind:key="item.value">{{item.label}}</a-select-option>
            </a-select> 
          </a-form-item>-->
          <a-form-item prop="action">
            <a-button @click="query_month_summary">月度汇总</a-button>
          </a-form-item>
          <a-form-item prop="action2">
            <a-button @click="print_month_summary">打印汇总</a-button>
          </a-form-item>
        </a-form>
        <a-table :dataSource="summary_data" :columns="summary_columns" bordered rowKey="id" :pagination="false">
          <span slot-scope="text,record" slot="month">
            <span>{{ record.x ? summary_month+'汇总' : record.month }}</span>
          </span>
          <span slot-scope="text,record" slot="xtype">
            <span>{{ translate('money_xtype', record.xtype) }}</span>
          </span>
          <span slot-scope="text,record" slot="come">
            <span>{{ translate('money_come', record.come) }}</span>
          </span>
          <span slot-scope="text,record" slot="amount">
            <span>¥{{ mfmt(record.amount) }}</span>
          </span>
          <span slot-scope="text,record" slot="real">
            <span>¥{{ mfmt(record.real) }}</span>
          </span>
          <span slot-scope="text,record" slot="month_real">
            <span>¥{{ mfmt(record.month_real) }}</span>
          </span>
          <span slot-scope="text,record" slot="diff">
            <span>¥{{ mfmt((record.amount - record.real)) }}</span>
          </span>
        </a-table>
      </a-tab-pane>
      <a-tab-pane tab="统计图表" key="2">
        <div id="money_line" style="width: 95%;height:300px;margin-left:10px;margin-top:10px;"></div>
      </a-tab-pane>
    </a-tabs>

    <!--<h2 style="padding-left:20px;padding-top:20px;">明细</h2>-->
    

    <div class="print">
      <table border="1" cellspacing="0">
        <thead>
          <tr>
            <td>月份</td>
            <!--<td>收支</td>-->
            <td>类型</td>
            <td>总额</td>
            <td>实付额</td>
            <td>流水实付额</td>
            <td>欠付额</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in summary_data"  v-bind:key="record.id">
            <td>{{ record.x ? summary_month+'汇总' : record.month }}</td>
            <td>{{ translate('money_come', record.come) }}</td>
            <td>{{ translate('money_xtype', record.xtype) }}</td>
            <td>¥{{ mfmt(record.amount) }}</td>
            <td>¥{{ mfmt(record.real) }}</td>
            <td>¥{{ mfmt(record.month_real) }}</td>
            <td>¥{{ mfmt((record.amount - record.real)) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

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
  name: 'FinanceList',
  data () {
    return {
      summary: {come:'outcome'},
      summary_month: '',
      summary_data: [],
      sum_data: {income_real:0, outcome_real:0, income_amount:0, outcome_amount:0},
      partners: [],

      objects: [],
      object: {state: 'create', amount: 0, real: 0},
      print_objects: [],
      users: [],
      charts_data: [],
      mact: {}, // 收款/付款流水
      trans: [], // 流水

      accounts: [],

      // config
      conf: {},
      dlg_config: false,
      dlg_title_config: '添加费用类型',

      summary_columns: [
        {title: '月份', key: 'month', dataIndex: 'month', scopedSlots: { customRender: 'month' }}, 
        //{title: '收支', key: 'come', dataIndex: 'come', scopedSlots: { customRender: 'come' }}, 
        {title: '类型', key: 'xtype', dataIndex: 'xtype', scopedSlots: { customRender: 'xtype' }}, 
        {title: '总额', key: 'amount', dataIndex: 'amount', scopedSlots: { customRender: 'amount' }}, 
        {title: '实付额', key: 'real', dataIndex: 'real', scopedSlots: { customRender: 'real' }}, 
        {title: '流水实付额', key: 'month_real', dataIndex: 'month_real', scopedSlots: { customRender: 'month_real' }}, 
        {title: '欠付额', key: 'diff', dataIndex: 'diff', scopedSlots: { customRender: 'diff' }}, 
      ],

      object_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id), rowClassName: 'no-print'}, 
        {title: '关联单号', key: 'code', dataIndex: 'code', scopedSlots: {customRender:'code'},
        }, 
        {title: '合作商', key: 'partner_code', dataIndex: 'partner_code', scopedSlots: {}}, 
        {title: '类型', key: 'xtype', dataIndex: 'xtype', scopedSlots: { customRender: 'xtype' }, }, 
        {title: '总额', key: 'amount', dataIndex: 'amount', scopedSlots: { customRender: 'amount' }}, 
        {title: '实付额', key: 'real', dataIndex: 'real', scopedSlots: { customRender: 'real' }}, 
        {title: '状态', key: 'state', dataIndex: 'state', scopedSlots: { customRender: 'state' }, }, 
        {title: '备注', key: 'remark', dataIndex: 'remark', scopedSlots: { customRender: 'remark' }}, 
        {title: '业务日期', key: 'date_forcount', dataIndex: 'date_forcount', sorter: (a, b)=>(a.date_forcount>b.date_forcount),
        },
        {title: '操作', key: 'action', dataIndex: 'action', rowClassName: 'no-print', scopedSlots: { customRender: 'action' }}, 
      ],

      trans_columns: [
        {title: '时间', key: 'create_time', dataIndex: 'create_time', scopedSlots: { customRender: 'create_time' }}, 
        {title: '金额', key: 'real', dataIndex: 'real', scopedSlots: { customRender: 'real' }}, 
        {title: '经手人', key: 'ref_user_code', dataIndex: 'ref_user_code', scopedSlots: { customRender: 'ref_user_code' }}, 
        {title: '账户', key: 'account_longname', dataIndex: 'account_longname', scopedSlots: { customRender: 'account_longname' }}, 
        {title: '备注', key: 'remark', dataIndex: 'remark', scopedSlots: { customRender: 'remark' }}, 
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
      flist: [{name: 'come', op:'==', val: 'outcome'},],
    }
  },
  methods:{
    do_config(subcode){
      var env = this
      env.conf.code = 'translation'
      env.conf.subcode = subcode
      this.$http.post('/auth/config', env.conf).then(function(resp) {
        if(resp.data.status=='success'){
          var d = resp.data.data
          env.options[subcode].push({'value': d.str1, 'label': d.str2, 'text': d.str2})
          env.$message.success('添加成功')
          env.dlg_config = false
          env.object.xtype = d.str1
        }else{
          env.$message.error('添加失败: '+ resp.data.msg)
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
      q.filters = (q.filters || []).concat(this.flist||[])
      var data = {
          name: '费用明细.xlsx', 
          xtype: 'export', 
          code: 'export_finance', 
          func: 'blueprints.auth.tasks.export_finance:export_finance', 
          func_name: '费用明细导出'}

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
    // --------------- 汇总与图表 ------------------
    // 汇总数据
    query_month_summary(){
      var env = this
      this.$http.post('/finance/money/summary', this.summary).then(function(resp){
        if(resp.data.status=='success'){
          env.summary_data = resp.data.data
          env.summary_month = resp.data.month
        }
      })
    },
    print_month_summary(){
      // 增加条形码
      $('.print').print({
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
              title: '应付款明细汇总 '+this.summary_month,
              doctype: '<!doctype html>'
      })
    },
    // 加载入库记录
    load_month_charts(tab, event){
      var env = this
      if((tab.name=='second' || tab=="2")){
        this.$http.get('/finance/money/month/summary').then(function(resp){
          env.charts_data = resp.data.data

          var title = '最近一年月度应付款统计'
          // var legend = ['应收', '实收', '应付', '实付']
          var legend = ['应付', '实付']
          var category = resp.data.category
          var ynames = ['金额']
          var grid = {
            height: 200,
          }
          var data = [
              // {
              //     name:'应收',
              //     type:'line',
              //     smooth: true,
              //     data:resp.data.in
              // },
              // {
              //     name:'实收',
              //     type:'line',
              //     smooth: true,
              //     data:resp.data.in_real
              // },
              {
                  name:'应付',
                  type:'line',
                  smooth: true,
                  data:resp.data.out
              },
              {
                  name:'实付',
                  type:'line',
                  smooth: true,
                  data:resp.data.out_real
              },
              ]
          var opt = BarChart(title, legend, category, grid, ynames, data)
          var myChart = echarts.init(document.getElementById('money_line'));
          myChart.setOption(opt);
        })
      }
    },
    // --------------- end 汇总与图表 ------------------

    // --------------- 增删改查 ------------------
    do_create(){
      this.dlg_title = '创建应付款'
      this.dlg_new = true
      this.object = {state: 'create', amount: 0, real: 0, xtype: 'other'}
      this.is_edit = false
    },

    do_edit(index, object){
      this.dlg_title = '修改应付款'
      this.dlg_new = true
      this.object = object
      this.object_date_forcount = this.object.date_forcount ? this.$moment(this.object.date_forcount, 'YYYY-MM-DD') : null
      this.is_edit = true
    },  

    do_submit(){
      var env = this
      this.object.date_forcount = this.object_date_forcount || null
      this.object.come = 'outcome'
      if (this.object.id){
        // update
        this.$http.put('/finance/money/'+this.object.id, this.object).then(function(resp){
          if(resp.data.status=='success'){
            env.load_objects([{name:'come',op: '==',val: 'outcome'}])
            env.dlg_new = false
            env.$message.success('修改成功')
          }else{
            env.$message.error('修改失败：'+resp.data.msg)
          }
        })
      }else{
        // create
        this.$http.post('/finance/money', this.object).then(function(resp){
          if(resp.data.status=='success'){
            env.load_objects([{name:'come',op: '==',val: 'outcome'}])
            env.dlg_new = false
            env.$message.success('创建成功')
          }else{
            env.$message.error('创建失败：'+resp.data.msg)
          }
        })
      }
    },

    do_cancel(){
      var env = this
      if(!this.object.id){
        this.dlg_new = false
        return;
      }
      this.$http.delete('/finance/money/'+this.object.id).then(function(resp){
          if(resp.data.status=='success'){
            env.load_objects()
            env.dlg_new = false
            env.$message.success('修改成功')
          }else{
            env.$message.error('修改失败：'+resp.data.msg)
          }
        })
    },

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

    // --------------- 收款付款 ------------------
    do_pay_dlg(index, object){
      this.object = object
      this.dlg_mact = true
      this.mact_type = 'pay'
      this.mact = {}
      this.dlg_title_mact = '付款记录'
    },
    do_recv_dlg(index, object){
      this.object = object
      this.dlg_mact = true
      this.mact_type = 'recv'
      this.mact = {}
      this.dlg_title_mact = '收款记录'
    },
    do_pay(){
      var env = this
      env.mact.real = env.mact.real * 1
      if(env.mact.real >= 0){
        this.$http.post('/finance/money/pay/'+this.object.id, env.mact).then(function(resp){
          if(resp.data.status=='success'){
            env.dlg_mact = false
            env.load_objects([{name:'come',op: '==',val: 'outcome'}])
            env.$message.success('收款记录成功!')
          }else{
            env.$message.error(resp.data.msg)
          }
        })
      }
    },
    do_recv(){
      var env = this
      env.mact.real = env.mact.real * 1
      if(env.mact.real >= 0){
        this.$http.post('/finance/money/recv/'+this.object.id, env.mact).then(function(resp){
          if(resp.data.status=='success'){
            env.dlg_mact = false
            env.load_objects([{name:'come',op: '==',val: 'outcome'}])
            env.$message.success('付款记录成功!')
          }else{
            env.$message.error(resp.data.msg)
          }
        })
      }
    },
    // 流水
    do_trans(index, object){
      var env = this
      this.$http.get('/finance/money/trans/'+object.id).then(function(resp){
        env.trans = resp.data.data
        env.dlg_trans = true
      })
    },
    // --------------- end 收款付款 ------------------

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

    // 推荐
    handle_search_account(val){
      var env = this
      var q = {}
      if(val){
        q = {filters:[{or: [{name: 'name', op:'ilike', val: val}, {name:'organ', op: 'ilike', val: val}, {name:'account', op: 'ilike', val: val}]}]}
      }
      this.$http.get('/finance/money/account?q='+JSON.stringify(q)).then(function(resp){
          env.accounts = resp.data.objects
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
          var date_forcount1 = new Date(fs[f])
          flist.push({name: 'date_forcount', op:'>=', val: date_forcount1.format('yyyy-MM-dd')})
        }else if(f == 'date_forcount2' && fs[f]){
          var date_forcount2 = new Date(fs[f])
          flist.push({name: 'date_forcount', op:'<', val: date_forcount2.addDate(1).format('yyyy-MM-dd')})
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
      //console.log(this.$store.options['money_come'])
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
      q.filters = (q.filters || []).concat(this.flist||[])
      env.$http.get('/finance/money?q='+JSON.stringify(q)).then(function(resp){
        env.objects = resp.data.objects

        env.total_page = resp.data.total_pages
        env.current_page = resp.data.page
        env.page_size = resp.data.per_page

        env.sum_data.income_amount = resp.data.income_amount
        env.sum_data.income_real = resp.data.income_real
        env.sum_data.outcome_amount = resp.data.outcome_amount
        env.sum_data.outcome_real = resp.data.outcome_real

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
    // load summary
    this.query_month_summary()
    // load objects
    this.load_objects([{name:'come',op: '==',val: 'outcome'}])  },
  // after render
  mounted: function(){
    this.load_choice()
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
