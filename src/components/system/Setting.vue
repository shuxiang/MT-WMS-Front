<template>
  <div>
    <div>
        <a-row>
          <a-col :span="6">
            <a-breadcrumb style="padding:20px 20px 20px 0px;">
              <a-breadcrumb-item >系统管理</a-breadcrumb-item>
              <a-breadcrumb-item title="参数配置">系统配置</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
          <a-col :span="18">
            <!--<a-button  @click="do_create()" style="margin:15px 0;" type="primary">创建配置</a-button>-->
          </a-col>
        </a-row>
    </div>

      <a-modal title="配置项修改" :visible="dlg_detail" width="600px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_detail=false" >
        <a-form  :layout="'horizontal'">
          <a-form-item label="类别" prop="code"  :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-select style="width: 200px" v-model="object.code">
              <a-select-option :value="item.value" v-for="item in options.conf_code" v-bind:key="item.value">{{item.label}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="子类" prop="subcode" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-select style="width: 200px" v-model="object.subcode">
              <a-select-option :value="item.value" v-for="item in options.conf_subcode" v-bind:key="item.value">{{item.label}}</a-select-option>
            </a-select>
          </a-form-item>
          <!--
          <a-form-item label="公司码" :label-col="{span:4}" :wrapper-col="{span:14}" v-if="has_admin_perm">
            <a-input :allowClear="true" v-model="object.company_code"></a-input>
          </a-form-item>-->
          <a-form-item label="货主码" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-select style="width: 160px" v-model="object.owner_code">
              <a-select-option :value="item.code" v-for="item in owners" v-bind:key="item.code">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="仓库码" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-select style="width: 160px" v-model="object.warehouse_code">
              <a-select-option :value="item.code" v-for="item in warehouses" v-bind:key="item.code">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="str1" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.str1"></a-input>
          </a-form-item>
          <a-form-item label="str2" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.str2"></a-input>
          </a-form-item>
          <a-form-item label="str3" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.str3"></a-input>
          </a-form-item>
          <a-form-item label="int1" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.int1"></a-input>
          </a-form-item>
          <a-form-item label="int2" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.int2"></a-input>
          </a-form-item>
          <a-form-item label="int3" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.int3"></a-input>
          </a-form-item>
          <a-form-item label="bool1" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-radio-group :options="yes_no" v-model="object.bool1" />
          </a-form-item>
          <a-form-item label="bool2" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-radio-group :options="yes_no" v-model="object.bool2" />
          </a-form-item>
          <a-form-item label="bool3" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-radio-group :options="yes_no" v-model="object.bool3" />
          </a-form-item>
          <a-form-item label="float1" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.float1"></a-input>
          </a-form-item>
          <a-form-item label="float2" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.float2"></a-input>
          </a-form-item>
          <a-form-item label="float3" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.float3"></a-input>
          </a-form-item>
          <a-form-item label="说明" :label-col="{span:4}" :wrapper-col="{span:14}">
            <a-input :allowClear="true" v-model="object.remark"></a-input>
          </a-form-item>
        </a-form>
        <div  class="dialog-footer">
          <a-button type="primary" @click="do_update()">确定</a-button>
        </div>
      </a-modal>

      <a-tabs default-active-key="1" :tab-position="'left'" >
        <a-tab-pane :key="0" tab="入库配置">
          <div v-for="conf in conf_list_stockin" v-bind:key="conf.value">
            <a-card :title="conf.label" style="width: 100%;">
              <span slot="extra">
                <a-button @click="add_setting(conf)" v-if="conf.multi" style="margin-right:10px;"> + </a-button>
                <a-button @click="save_setting(conf, conf.value)" type="primary">保存</a-button>
              </span>
              <div v-if="!conf.options_multi">
                <p v-for="(opt, idx) in conf.options" v-bind:key="idx">
                  <span v-if="opt.xtype=='bool'">
                    <a-radio-group v-model="opt.val" button-style="solid">
                      <a-radio-button :value="'1'">{{opt.label}}</a-radio-button>
                      <a-radio-button :value="'0'">不{{opt.label}}</a-radio-button>
                    </a-radio-group>
                  </span>
                  <span v-if="opt.xtype=='radio'">
                    <a-radio-group v-model="opt.val" button-style="solid">
                      <a-radio-button :value="o1.value" v-for="o1 in opt.opts" v-bind:key="o1.value">{{o1.label}}</a-radio-button>
                    </a-radio-group>
                  </span>
                  <span v-if="opt.xtype=='select'">
                    <a-select v-model="opt.val" style="width: 400px;">
                      <a-select-option :value="o1.value" v-for="o1 in opt.opts" v-bind:key="o1.value" :title="o1.label">{{o1.label}}</a-select-option>
                    </a-select><a-button @click="del_setting(conf, idx)" v-if="conf.multi">-</a-button>
                  </span>
                </p>
              </div>

              <div v-if="conf.options_multi">
                <p v-for="(opt0, idx0) in conf.options" v-bind:key="idx0">
                  <span v-for="(opt, idx) in opt0" v-bind:key="idx">
                    <span> {{opt.label}}:</span>
                    <span v-if="opt.xtype=='bool'">
                      <a-radio-group v-model="opt.val" button-style="solid">
                        <a-radio-button :value="'1'">{{opt.label}}</a-radio-button>
                        <a-radio-button :value="'0'">不{{opt.label}}</a-radio-button>
                      </a-radio-group>
                    </span>
                    <span v-if="opt.xtype=='radio'">
                      <a-radio-group v-model="opt.val" button-style="solid">
                        <a-radio-button :value="o1.value" v-for="o1 in opt.opts" v-bind:key="o1.value">{{o1.label}}</a-radio-button>
                      </a-radio-group>
                    </span>
                    <span v-if="opt.xtype=='select'">
                      <a-select v-model="opt.val" style="width: 400px;">
                        <a-select-option :value="o1.value" v-for="o1 in opt.opts" v-bind:key="o1.value" :title="o1.label">{{o1.label}}</a-select-option>
                      </a-select>
                    </span>
                  </span>
                  <a-button @click="del_setting(conf, idx0)" v-if="conf.multi">-</a-button>
                </p>
              </div>
            </a-card>
          </div>
        </a-tab-pane>

        <a-tab-pane :key="1" tab="出库配置">
          <div v-for="conf in conf_list_stockout" v-bind:key="conf.value">
            <a-card :title="conf.label" style="width: 100%;">
              <span slot="extra">
                <a-button @click="add_setting(conf)" v-if="conf.multi" style="margin:0 10px;"> + </a-button>
                <a-button @click="save_setting(conf, conf.value)" type="primary">保存</a-button>
              </span>
              <div v-if="!conf.options_multi">
                <p v-for="(opt, idx) in conf.options" v-bind:key="idx">
                  <span v-if="opt.xtype=='bool'">
                    <a-radio-group v-model="opt.val" button-style="solid">
                      <a-radio-button :value="'1'">{{opt.label}}</a-radio-button>
                      <a-radio-button :value="'0'">不{{opt.label}}</a-radio-button>
                    </a-radio-group>
                  </span>
                  <span v-if="opt.xtype=='radio'">
                    <a-radio-group v-model="opt.val" button-style="solid">
                      <a-radio-button :value="o1.value" v-for="o1 in opt.opts" v-bind:key="o1.value">{{o1.label}}</a-radio-button>
                    </a-radio-group>
                  </span>
                  <span v-if="opt.xtype=='select'">
                    <a-select v-model="opt.val" style="width: 400px;">
                      <a-select-option :value="o1.value" v-for="o1 in opt.opts" v-bind:key="o1.value" :title="o1.label">{{o1.label}}</a-select-option>
                    </a-select><a-button @click="del_setting(conf, idx)" v-if="conf.multi">-</a-button>
                  </span>
                </p>
              </div>
              <div v-if="conf.options_multi">
                <p v-for="(opt0, idx0) in conf.options" v-bind:key="idx0">
                  <span v-for="(opt, idx) in opt0" v-bind:key="idx">
                    <span> {{opt.label}}:</span>
                    <span v-if="opt.xtype=='bool'">
                      <a-radio-group v-model="opt.val" button-style="solid">
                        <a-radio-button :value="'1'">{{opt.label}}</a-radio-button>
                        <a-radio-button :value="'0'">不{{opt.label}}</a-radio-button>
                      </a-radio-group>
                    </span>
                    <span v-if="opt.xtype=='radio'">
                      <a-radio-group v-model="opt.val" button-style="solid">
                        <a-radio-button :value="o1.value" v-for="o1 in opt.opts" v-bind:key="o1.value">{{o1.label}}</a-radio-button>
                      </a-radio-group>
                    </span>
                    <span v-if="opt.xtype=='select'">
                      <a-select v-model="opt.val" style="width: 400px;">
                        <a-select-option :value="o1.value" v-for="o1 in opt.opts" v-bind:key="o1.value" :title="o1.label">{{o1.label}}</a-select-option>
                      </a-select>
                    </span>
                  </span>
                  <a-button @click="del_setting(conf, idx0)" v-if="conf.multi">-</a-button>
                </p>
              </div>
            </a-card>
          </div>
        </a-tab-pane>

        <a-tab-pane :key="3" tab="菜单配置">
          <div v-for="conf in conf_list_menu" v-bind:key="conf.value">
            <a-card :title="conf.label" style="width: 100%;">
              <span slot="extra">
                <a-button @click="add_setting(conf)" v-if="conf.multi" style="margin:0 10px;"> + </a-button>
                <a-button @click="save_setting(conf, conf.value)" type="primary">保存</a-button>
              </span>
              <p v-for="(opt, idx) in conf.options" v-bind:key="idx">
                <span v-if="opt.xtype=='bool'">
                  <a-radio-group v-model="opt.val" button-style="solid">
                    <a-radio-button :value="'1'">{{opt.label}}</a-radio-button>
                    <a-radio-button :value="'0'">不{{opt.label}}</a-radio-button>
                  </a-radio-group>
                </span>
                <span v-if="opt.xtype=='radio'">
                  <a-radio-group v-model="opt.val" button-style="solid">
                    <a-radio-button :value="o1.value" v-for="o1 in opt.opts" v-bind:key="o1.value">{{o1.label}}</a-radio-button>
                  </a-radio-group>
                </span>
                <span v-if="opt.xtype=='select'">
                  <a-select v-model="opt.val" style="width: 400px;">
                    <a-select-option :value="o1.value" v-for="o1 in opt.opts" v-bind:key="o1.value" :title="o1.label">{{o1.label}}</a-select-option>
                  </a-select><a-button @click="del_setting(conf, idx)" v-if="conf.multi">-</a-button>
                </span>
              </p>
            </a-card>
          </div>
        </a-tab-pane>

        <a-tab-pane :key="4" tab="非菜单功能配置">
          <div v-for="conf in conf_list_no_menu" v-bind:key="conf.value">
            <a-card :title="conf.label" style="width: 100%;">
              <span slot="extra">
                <a-button @click="add_setting(conf)" v-if="conf.multi" style="margin:0 10px;"> + </a-button>
                <a-button @click="save_setting(conf, conf.value)" type="primary">保存</a-button>
              </span>
              <p v-for="(opt, idx) in conf.options" v-bind:key="idx">
                <span v-if="opt.xtype=='bool'">
                  <a-radio-group v-model="opt.val" button-style="solid">
                    <a-radio-button :value="'1'">{{opt.label}}</a-radio-button>
                    <a-radio-button :value="'0'">不{{opt.label}}</a-radio-button>
                  </a-radio-group>
                </span>
                <span v-if="opt.xtype=='radio'">
                  <a-radio-group v-model="opt.val" button-style="solid">
                    <a-radio-button :value="o1.value" v-for="o1 in opt.opts" v-bind:key="o1.value">{{o1.label}}</a-radio-button>
                  </a-radio-group>
                </span>
                <span v-if="opt.xtype=='select'">
                  <a-select v-model="opt.val" style="width: 400px;">
                    <a-select-option :value="o1.value" v-for="o1 in opt.opts" v-bind:key="o1.value" :title="o1.label">{{o1.label}}</a-select-option>
                  </a-select><a-button @click="del_setting(conf, idx)" v-if="conf.multi">-</a-button>
                </span>
                <span v-if="opt.xtype=='text'">
                  <a-input type="text" v-model="opt.val" :placeholder="opt.label" style="width:400px;"/>
                </span>
              </p>
            </a-card>
          </div>
        </a-tab-pane>
      </a-tabs>
  </div>
</template>

<script>
export default {
  name: 'Setting',
  data () {
    return {
      objects: [],
      object: {},
      stockin_type_opts: [],
      location_type_opts: [],

      object_columns: [
        {title: '类别', key: 'code', dataIndex: 'code', scopedSlots: { customRender: 'code' }}, 
        {title: '子类', key: 'subcode', dataIndex: 'subcode', scopedSlots: { customRender: 'conf_subcode' }}, 
        //{title: '货主码', key: 'owner_code', dataIndex: 'owner_code'}, 
        {title: '仓库码', key: 'warehouse_code', dataIndex: 'warehouse_code'}, 
        {title: '备注', key: 'remark', dataIndex: 'remark', scopedSlots: { customRender: 'remark' }}, 
        {title: 'str1', key: 'str1', dataIndex: 'str1'}, 
        {title: 'str2', key: 'str2', dataIndex: 'str2'}, 
        {title: 'str3', key: 'str3', dataIndex: 'str3'}, 
        {title: 'int1', key: 'int1', dataIndex: 'int1'}, 
        {title: 'int2', key: 'int2', dataIndex: 'int2'}, 
        {title: 'int3', key: 'int3', dataIndex: 'int3'}, 
        {title: 'float1', key: 'float1', dataIndex: 'float1'}, 
        {title: 'float2', key: 'float2', dataIndex: 'float2'}, 
        {title: 'float3', key: 'float3', dataIndex: 'float3'}, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' }}, 
      ],
      conf_list_stockin: [
        {value: 'overcharge', label:'入库/启用超收', options: [{label: '启用', val:'1', xtype:'bool', name:'bool1'}]}, 
        {value: 'enable_lpn', label:'入库/启用容器', options: [{label: '启用', val:'0', xtype:'bool', name:'bool1'}]}, 
        {value: 'scan_each_barcode', label:'入库/逐个扫条码入库', options: [{label: '启用', val:'1', xtype:'bool', name:'bool1'}]}, 
        {value: 'scan_batch_barcode', label:'入库/扫条码入库', options: [{label: '启用', val:'1', xtype:'bool', name:'bool1'}]}, 
        {value: 'scan_rfid', label:'入库/扫RFID入库', options: [{label: '启用', val:'1', xtype:'bool', name:'bool1'}]}, 
        {value: 'enable_quick_in', label:'入库/不扫码快速入库', options: [{label: '启用', val:'1', xtype:'bool', name:'bool1'}]}, 
        {value: 'enable_supplier_batch', label:'入库/供应商批次', options: [{label: '启用', val:'0', xtype:'bool', name:'bool1'}]}, 
        {value: 'auto_location_rules', label:'入库/库位推荐顺序', multi: true, options: [{label: '规则', val:'', xtype:'select', name:'str1', opts:[
            {label:'上一次入库位置', value:'last_time'},
            {label:'根据库存同货品重量, 从少到多. 等同于数量', value:'same_inv_weight'},
            {label:'根据库存所有货品重量分配, 从少到多', value:'inv_weight'},
            {label:'根据库存同货品数量分配, 从少到多', value:'same_inv_qty'},
            {label:'根据库存所有货品数量分配, 从少到多', value:'inv_qty'},
            {label:'一个库位只放一种东西（同货品，没有货品则选择空库位）', value:'same_location'},
            {label:'非质检QC', value:'no_qc'},
            {label:'非临时STAGE', value:'no_stage'},
            {label:'非临时STAGE & 非质检QC', value:'no_stage_qc'},
            {label:'库位编码小到大', value:'code_asc'}, {label:'库位编码大到小', value:'code_desc'}, 
            {label:'库位序小到大', value:'index_location_asc'}, {label:'库位序大到小', value:'index_location_desc'},
            {label:'库位优先级小到大', value:'priority_asc'}, {label:'库位优先级大到小', value:'priority_desc'}, 
            {label:'放满后选择临近库位（根据index, 根据area/workarea）未实现', value:'most_close'},
            {label:'放满后选择临近空库位（根据index, 根据area/workarea）未实现', value:'most_close_empty'},
          ]}]}, 
        {value: 'split_inv_type', label:'入库/库存分裂规则', options: [{label: '规则', val:'new', xtype:'select', name:'str1', opts:[
            {label:'按入库单号分裂', value:'order_code'}, {label:'按入库日期分裂', value:'stockin_date'}, 
            {label:'按入库单号+入库时间分裂', value:'order_code_stockin_date'}, {label:'不分裂', value:'no_split'}, {label:'全新/完全分裂', value:'new'}, 
          ]}]}, 
        {value: 'stockin_type_location', label:'入库单类型对应库位工作区', multi: true, options_multi:true, options: [[
            {label: '订单类型', val:'', xtype:'select', name:'str1', opts:[]},
            {label: '库位工作区', val:'', xtype:'select', name:'str2', opts:[]},]
          ]}, 
      ],
      conf_list_stockout: [
        {value: 'partalloc', label:'出库/部分分配', options: [{label: '启用', val:'1', xtype:'bool', name:'bool1'}]}, 
        {value: 'enable_part_pick', label:'出库/部分拣货', options: [{label: '启用', val:'1', xtype:'bool', name:'bool1'}]}, 
        {value: 'enable_quick_pick', label:'出库/不扫码快速拣货', options: [{label: '启用', val:'1', xtype:'bool', name:'bool1'}]}, 
        {value: 'close_when_pick', label:'出库/拣货后关闭出库单', options: [{label: '启用', val:'1', xtype:'bool', name:'bool1'}]}, 
        {value: 'enable_out_barcode', label:'出库/启用扫条码出库', options: [{label: '启用', val:'1', xtype:'bool', name:'bool1'}]}, 
        {value: 'enable_out_each_barcode', label:'出库/启用逐个扫条码出库', options: [{label: '启用', val:'1', xtype:'bool', name:'bool1'}]}, 
        {value: 'enable_out_rfid', label:'出库/启用扫RFID出库', options: [{label: '启用', val:'1', xtype:'bool', name:'bool1'}]}, 
        {value: 'enable_stockout_merge', label:'出库/启用波次出库', options: [{label: '启用', val:'0', xtype:'bool', name:'bool1'}]}, 
        {value: 'alloc_location', label:'出库/可分配库位', options: [{label: '库位类型', val:'ALL', xtype:'radio', name:'str1', 
            opts: [{label:'所有', value:'ALL'}, {label:'临时', value:'STAGE'}, {label:'非临时', value:'NO_STAGE'}, {label:'非质检', value:'NO_QC'}, {label:'非质检非临时', value:'NO_QC_STAGE'},]}]}, 
        {value: 'alloc_rule', label:'出库/分配优先规则', multi: true, options: [{label: '规则', val:'', xtype:'select', name:'str1', opts:[
            {label:'先进先出', value:'FIFO'}, {label:'后进先出', value:'FILO'}, 
            {label:'先生产先出', value:'FPFO'}, {label:'先生产后出', value:'FPLO'},
            {label:'库位库存少的先出', value:'clear_location'}, 
            {label:'库位优先级高先出', value:'priority_location'},
            {label:'保质期短的先出', value:'FBFO'}, {label:'保质期长的后出', value:'FBLO'}, 
            {label:'库位序小的先出', value:'index_location_asc'}, {label:'库位序大的先出', value:'index_location_desc'},
          ]}]}, 
        {value: 'print_rule', label:'出库/拣货单打印规则', options: [{label: '规则', val:'code_asc', xtype:'select', name:'str1', opts:[
            {label:'库位编码小到大', value:'code_asc'}, {label:'库位编码大到小', value:'code_desc'}, 
            {label:'库位序小到大', value:'index_location_asc'}, {label:'库位序大到小', value:'index_location_desc'},
          ]}]}, 
        {value: 'stockout_type_location', label:'出库单类型对应库位工作区', multi: true, options_multi:true, options: [[
            {label: '订单类型', val:'', xtype:'select', name:'str1', opts:[]},
            {label: '库位工作区', val:'', xtype:'select', name:'str2', opts:[]},]
          ]}, 
        {value: 'stockout_cancel_pick_inv_handle_type', label:'出库取消时已拣货品处理', options: [{label: '规则', val:'to_origin', xtype:'select', name:'str1', opts:[
            {label:'放到临时库位', value:'to_stage'}, 
            {label:'放到退库入库单', value:'to_stockin'}, 
            {label:'放到原始库位', value:'to_origin'}, 
          ]}]},
      ],
      conf_list_menu: [
        {value: 'enable_finance', label:'菜单/财务信息', options: [{label: '启用', val:'0', xtype:'bool', name:'bool1'}]},  
        {value: 'enable_inv_warn', label:'菜单/库存告警', options: [{label: '启用', val:'1', xtype:'bool', name:'bool1'}]}, 
        {value: 'enable_setting', label:'非菜单功能/系统配置菜单', options: [{label: '启用', val:'1', xtype:'bool', name:'bool1'}]}, 
      ],
      conf_list_no_menu: [
        {value: 'enable_search_bar', label:'非菜单功能/分页表格的搜索框', options: [{label: '启用', val:'1', xtype:'bool', name:'bool1'}]}, 
        {value: 'enable_inv_unfreeze', label:'非菜单功能/库存解冻', options: [{label: '启用', val:'0', xtype:'bool', name:'bool1'}]}, 
        {value: 'enable_fast_invmove', label:'非菜单功能/快速移库', options: [{label: '启用', val:'0', xtype:'bool', name:'bool1'}]}, 
        {value: 'enable_simple_mode', label:'非菜单功能/菜单栏简洁模式', options: [{label: '启用', val:'1', xtype:'bool', name:'bool1'}]}, 
        {value: 'sync_downfile', label:'非菜单功能/同步方式下载文件', options: [{label: '启用', val:'0', xtype:'bool', name:'bool1'}]}, 
        {value: 'enable_search_good_500', label:'非菜单功能/搜索货品返回数量', options: [{label: '请输入数字, 默认20', val:'20', xtype:'text', name:'int1'}]}, 
        {value: 'qq_list', label:'QQ客服列表', options: [{label: '请输入QQ号, 多个QQ号用英文逗号(,)分开', val:'', xtype:'text', name:'str1'}]}, 
        {value: 'wx_list', label:'WX客服列表', options: [{label: '请输入WX号, 多个WX号用英文逗号(,)分开', val:'', xtype:'text', name:'str1'}]}, 
        {value: 'async2oss', label:'文件上传到OSS', options: [{label: '启用', val:'0', xtype:'bool', name:'bool1'}]},  
        // selection: '选项列表',
        // translation: '翻译列表',
      ],

      dlg_detail:false,
      has_manager_perm:false,
      has_admin_perm: false,

      filter: {},
      sort: null,

      current_page: 1,
      page_size:20,
      total_page:0,
      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},
      yes_no:  [{ label: '是', value: '1' }, { label: '否', value: '0' },],

      owners:[],
      tenant:{},
      companys: [],
      warehouses:[],
    }
  },
  methods:{
    save_setting(conf, key){
      var env = this
      this.$http.post("/auth/setting", conf).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('保存成功!')
        }else{
          env.$message.error('保存失败: '+resp.data.msg)
        }
      })
    },
    add_setting(conf, conf_list){
      var env = this
      if (conf.options.length<3 || conf.options_multi){
        conf.options.push(JSON.parse(JSON.stringify(conf.options[conf.options.length-1])))
      }else{
        env.$message.error('最多只能3条')
      }
    },
    del_setting(conf, idx){
      var env = this
      if(conf.options.length > 1){
        conf.options.splice(idx, 1)
      }else{
        env.$message.error('至少保留一条')
      }
    },
    // 创建
    do_create(){
      this.dlg_detail = true
      this.object = {owner_code:'default', warehouse_code:'default'}
    },
    // 修改
    do_update(){
      var env = this
      if (this.object.id){
        this.$http.put('/auth/config/'+this.object.id, this.object).then(function(resp){
          if(resp.data.status=='success'){
            env.$message.success('修改成功')
            env.load_objects()
            env.dlg_detail = false
          }else{
            env.$message.error('修改失败: '+resp.data.msg)
          }
        })
      }else{
        this.$http.post('/auth/config', this.object).then(function(resp){
          if(resp.data.status=='success'){
            env.$message.success('创建成功')
            env.load_objects()
            env.dlg_detail = false
          }else{
            env.$message.error('创建失败: '+resp.data.msg)
          }
        })
      }
    },

    // 明细 
    order_detail(index, order){
      var env = this
      this.dlg_detail = true
      this.object = order
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

      this.stockin_type_opts = JSON.parse(JSON.stringify(this.options['stockin_xtype']))
      this.stockin_type_opts.push({value: 'movein_inv', label: '移入库存'})

      this.stockout_type_opts = JSON.parse(JSON.stringify(this.options['stockout_order_type']))
      this.stockout_type_opts.push({value: 'moveout_inv', label: '移出库存'})

      this.location_type_opts = this.options['location_work_type']

      for(var i=0;i<this.conf_list_stockin.length;i++){
        var conf = this.conf_list_stockin[i]
        if(conf.value == 'stockin_type_location'){
          conf['options'][0][0]['opts'] = this.stockin_type_opts
          conf['options'][0][1]['opts'] = this.location_type_opts
        }
      }
      for(var j=0;j<this.conf_list_stockout.length;j++){
        var conf2 = this.conf_list_stockout[j]
        if(conf2.value == 'stockout_type_location'){
          conf2['options'][0][0]['opts'] = this.stockout_type_opts
          conf2['options'][0][1]['opts'] = this.location_type_opts
        }
      }
    },

    load_to_conf(confs){
      var env = this
      for(var i=0;i<env.objects.length;i++){
        var obj = env.objects[i]

        for(var j=0;j<confs.length;j++){
          var obj1 = confs[j]
          if(obj1.value==obj.code){
            // 多条的, 则复制第一行options[0], 并重置值
            if(obj1.multi){
              if(obj1.options_multi){
                var opt21 = obj1.options[obj.index]
                if(!opt21){
                  var opt31 = JSON.parse(JSON.stringify(obj1.options[0]))
                  obj1.options.push(opt31)
                }
                var opt20 = obj1.options[obj.index] || opt31
                for(var m=0;m<opt20.length;m++){
                  var opt22 = opt20[m]
                  if(obj[opt22.name]!=''){
                    opt22.val = obj[opt22.name]
                  }
                }
              }else{
                var opt2 = obj1.options[0]
                if (opt2.val==''){
                  opt2.val = obj.str1
                }else{
                  var opt3 = JSON.parse(JSON.stringify(opt2))
                  opt3.val = obj.str1
                  obj1.options.push(opt3)
                }
              }
            }else{
              for(var k=0;k<obj1.options.length;k++){
                var opt = obj1.options[k]
                opt.val = obj[opt.name]
              }
            }
          }
        }
      }
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
      q.per_page = 10000//this.pagination.pageSize
      
      env.$http.get('/auth/config?q='+JSON.stringify(q)).then(function(resp){
        env.objects = resp.data.objects

        env.load_to_conf(env.conf_list_stockin)
        env.load_to_conf(env.conf_list_stockout)
        env.load_to_conf(env.conf_list_menu)
        env.load_to_conf(env.conf_list_no_menu)

        env.total_page = resp.data.total_pages
        env.current_page = resp.data.page
        env.page_size = resp.data.per_page

        env.pagination.total = resp.data.num_results
        env.pagination.current = resp.data.page
        env.pagination.pageSize = resp.data.per_page
      })
    },
    // end
    // 选择租户
    load_tenant(){
      var env = this
      this.$http.post('/auth/current_tenant').then(function(resp){
        // load owner and warehouse
        env.owners = resp.data.owners
        env.warehouses = resp.data.warehouses
        env.tenant = resp.data.tenant
      })
    },
  },
  // before render
  created:function() {
    var env = this
    this.owner_conf = this.$store.owner_conf || {}
    // load orders
    this.load_objects()
    // this.has_admin_perm = this.$store.has_admin_perm
  },
  // after render
  mounted: function(){
    this.load_tenant()
    this.load_choice()
  },
}
</script>
