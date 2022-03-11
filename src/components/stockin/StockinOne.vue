<template>
  <div>
    <div>
        <a-breadcrumb style="padding:20px 20px 20px 0px;">
          <a-breadcrumb-item ><router-link :to="{name: 'StockinQuick'}">仓库管理</router-link></a-breadcrumb-item>
          <a-breadcrumb-item title="使用扫码入库，扫取货品条码，填写收货数量，默认收入·STAGE·库位，确认入库后，直接增加库存记录">{{ page_title }}</a-breadcrumb-item>
        </a-breadcrumb>
    </div>


      <a-modal title="订单行入库" :visible="dlg_putin" width="1000px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_putin=false">
        <a-table bordered :dataSource="lines" :columns="putin_columns" :pagination="false" rowKey="id">
          <span slot="qty_receive" slot-scope="text,record">
            <a-input :allowClear="true" placeholder="输入数量" v-model="record.qty_receive" style="width:80px;"/>
          </span>
          <span slot="location" slot-scope="text,record">
            <!--<a-input :allowClear="true" placeholder="库位码" v-model="record.location" style="width:120px;"/>-->
            <a-auto-complete placeholder="库位码" @focus="fetch_locations(record)" @select="select_location" optionLabelProp="value" v-model="record.location" :defaultValue="record.location_code || 'STAGE'">
              <template slot="dataSource">
                  <a-select-option v-for="item in locations" :key="item.value">
                    <strong>{{item.value}} </strong><span class="certain-search-item-count"> 库存{{ item.qty }}, 总库存{{item.qty_total}}</span>
                  </a-select-option>
              </template>
            </a-auto-complete>
          </span>
          <span slot="lpn" slot-scope="text,record">
            <a-input :allowClear="true" placeholder="可不填" v-model="record.lpn" style="width:80px;"/>
          </span>
        </a-table>
        <div class="dialog-footer">
          <a-popconfirm
            title="确定要入库单吗?"
            @confirm="do_putin()"
            okText="确定"
            cancelText="取消" style="float:right;"
          >
            <a-button type="primary">确定入库</a-button>
          </a-popconfirm>
          <!--<a-button @click="do_putin()" style="float:right;" type="primary">确定入库</a-button>-->
          <a-button @click="do_auto()" style="float:right;margin-right:20px;" type="primary">推荐库位</a-button>
          <a-button @click="dlg_putin=false" style="float:right;margin-right:20px;">取消</a-button>
        </div>
      </a-modal>

      <a-modal title="扫码入库" :visible="dlg_scan_each" width="1000px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_scan_each=false">
        <a-input :allowClear="true" v-model="current_barcode" id="current_barcode" @pressEnter="add_barcode" placeholder="请输入条码/物料号" style="margin-bottom:10px;width:400px;" />
        <a-table bordered :dataSource="lines" :columns="barcode_columns" :pagination="false" rowKey="id">
          <span slot="location" slot-scope="text,record">
            <!--<a-input :allowClear="true" placeholder="库位码" v-model="record.location" style="width:120px;"/>-->
            <a-auto-complete placeholder="库位码" @focus="fetch_locations(record)" @select="select_location" optionLabelProp="value" v-model="record.location" :defaultValue="record.location_code || 'STAGE'">
              <template slot="dataSource">
                  <a-select-option v-for="item in locations" :key="item.value">
                    <strong>{{item.value}} </strong><span class="certain-search-item-count"> 库存{{ item.qty }}, 总库存{{item.qty_total}}</span>
                  </a-select-option>
              </template>
            </a-auto-complete>
          </span>
          <span slot="lpn" slot-scope="text,record">
            <a-input :allowClear="true" placeholder="可不填" v-model="record.lpn" style="width:80px;"/>
          </span>
        </a-table>
        <div class="print3">
          <div class="barcode3"></div>
          <div>
            <span>供应商: {{ order.partner_code }} </span> 
            <span>No: {{ order.order_code }} </span> 
            <span>日期: {{ order.create_time }} </span> 
          </div>
          <table border="1" cellspacing="0">
            <thead>
              <tr>
                <td>货品码</td>
                <td>条码</td>
                <td>名称</td>
                <td>条码数</td>
                <td>库位</td>
                <td>容器</td>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in xlines" v-bind:key="item.id">
                <td>{{ item.sku }}</td>
                <td>{{ item.barcode }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.qty }}</td>
                <td>{{ item.location }}</td>
                <td>{{ item.lpn }}</td>
              </tr>
              <tr><td colspan="6">备注: {{ order.remark }}</td>
                <!--<td colspan="3"><div class="barcode"></div></td>-->
              </tr>
            </tbody>
          </table>
        </div>
        <div class="dialog-footer">
          <a-button @click="do_check_putin_each(true)" style="float:right;margin-right:20px;">入库并打印</a-button>
          <a-button @click="do_check_putin_each()" style="float:right;margin-right:20px;" type="primary">入库</a-button>
          <a-button @click="do_auto()" style="float:right;margin-right:20px;" type="primary">推荐库位</a-button>
          <a-button @click="dlg_scan_each=false" style="float:right;margin-right:20px;">取消</a-button>
        </div>
      </a-modal>


      <a-modal title="扫码入库" :visible="dlg_scan" width="1000px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_scan=false">
        <a-tabs  defaultActiveKey="first">
          <a-tab-pane tab="扫码" key="first" >
            <a-form :layout="'horizontal'">
              <a-form-item label="货品条码" :label-col="{span:4}" :wrapper-col="{span:14}">
                <a-input :allowClear="true" v-model="order_line2.barcode" placeholder="必填, 请扫描货品条码" id="c_ol_barcode"  @pressEnter="enter_barcode"></a-input>
              </a-form-item>
              <a-form-item label="货品名称" :label-col="{span:4}" :wrapper-col="{span:14}">
                <span><strong>{{order_line2.name}}</strong></span>
              </a-form-item>
              <a-form-item label="货品数量" :label-col="{span:4}" :wrapper-col="{span:14}">
                <a-input :allowClear="true" v-model="order_line2.qty" ref="c_ol_qty" id="c_ol_qty"  placeholder="必填，必须大于0"></a-input>
              </a-form-item>
              <!-- <a-form-item label="收货库位" :label-col="{span:4}" :wrapper-col="{span:14}">
                <a-input :allowClear="true" v-model="order_line2.location" placeholder="必填，请扫描库位条码"></a-input>
              </a-form-item> -->
              <a-form-item label="收货库位" :label-col="{span:4}" :wrapper-col="{span:14}">
                <a-auto-complete placeholder="库位码" @focus="fetch_locations(order_line2)" @select="select_location" optionLabelProp="value" v-model="order_line2.location" :defaultValue="order_line2.location_code || 'STAGE'">
                  <template slot="dataSource">
                      <a-select-option v-for="item in locations" :key="item.value">
                        <strong>{{item.value}} </strong><span class="certain-search-item-count"> 库存{{ item.qty }}, 总库存{{item.qty_total}}</span>
                      </a-select-option>
                  </template>
                </a-auto-complete>
              </a-form-item>
              <a-form-item label="收货容器" :label-col="{span:4}" :wrapper-col="{span:14}">
                <a-input :allowClear="true" v-model="order_line2.lpn" placeholder="可不填"></a-input>
              </a-form-item>
            </a-form>
          </a-tab-pane>
          <a-tab-pane tab="明细" key="second">
            <a-table :dataSource="order_lines" :columns="scan_columns" rowKey="id" bordered :pagination="false">
            </a-table>
          </a-tab-pane>
        </a-tabs>
        <div class="dialog-footer">
          <a-button  @click="do_scan()" style="float:right;">下一个货品</a-button>
          <a-button  @click="do_check_putin()" style="float:right;margin-right:20px;" type="primary">提 交</a-button>
        </div>
      </a-modal>

      <a-modal title="扫RFID/二维码入库" :visible="dlg_scan_rfid" width="1000px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_scan_rfid=false">
        <a-modal width="800px"  :title="rfid_title" :visible="dlg_rfid_list" :footer="null" @cancel="dlg_rfid_list=false">
          <a-input :allowClear="true" v-model="current_rfid" id="current_rfid" @pressEnter="add_rfid" placeholder="请输入RFID或二维码" style="margin-bottom:10px;width:400px;" />
          <a-button @click="add_rfid" style="float:right;"  type="primary">添加</a-button>
          <a-button @click="del_rfid_specify" style="float:right;margin-right:10px;"  type="primary">删除</a-button>
          <a-table :dataSource="order_line.rfid_list" :columns="rfid_list_columns" rowKey="rfid" bordered :pagination="false">
            <span slot="rfid" slot-scope="text,record">
              <span>{{ record.rfid }}</span>
            </span>
            <span slot="action" slot-scope="text,record,index">
              <a-button @click="del_rfid(index,record)" type="primary" >删除</a-button>
            </span>
          </a-table>
        </a-modal>
        <a-input :allowClear="true" v-model="current_rfid2" id="current_rfid2" @pressEnter="add_rfid2" placeholder="请输入RFID或二维码" style="margin-bottom:10px;width:400px;" />
        <a-table bordered :dataSource="lines" :columns="rfid_columns" :pagination="false" rowKey="id">
          <span slot="location" slot-scope="text,record">
            <!--<a-input :allowClear="true" placeholder="库位码" v-model="record.location" style="width:120px;"/>-->
            <a-auto-complete placeholder="库位码" @focus="fetch_locations(record)" @select="select_location" optionLabelProp="value" v-model="record.location" :defaultValue="record.location_code || 'STAGE'">
              <template slot="dataSource">
                  <a-select-option v-for="item in locations" :key="item.value">
                    <strong>{{item.value}} </strong><span class="certain-search-item-count"> 库存{{ item.qty }}, 总库存{{item.qty_total}}</span>
                  </a-select-option>
              </template>
            </a-auto-complete>
          </span>
          <span slot="lpn" slot-scope="text,record">
            <a-input :allowClear="true" placeholder="可不填" v-model="record.lpn" style="width:80px;"/>
          </span>
          <span slot="action" slot-scope="text,record,index">
            <a-button @click="scan_rfid(index,record)" type="primary">扫RFID</a-button>
          </span>
        </a-table>
        <div class="dialog-footer">
          <a-button @click="do_putin_rfid()" style="float:right;" type="primary">确定入库</a-button>
          <a-button @click="do_auto()" style="float:right;margin-right:20px;" type="primary">推荐库位</a-button>
          <a-button @click="dlg_scan_rfid=false" style="float:right;margin-right:20px;">取消</a-button>
        </div>
      </a-modal>

      <h3 style="padding-left:20px;">
        <router-link :to="{ name:'MesSaleOne', params: {order_id: $route.params.sale_id} }" v-if="$route.params.sale_id">
          <a-button :type=" order.state=='done' ?  'danger': 'dashed'" icon="rollback" style="margin-right:20px;">回销售单</a-button>
        </router-link>

        <router-link :to="{ name:'MesPurchaseOne', params: {order_id: $route.params.purchase_id} }" v-if="$route.params.purchase_id">
          <a-button :type="order.state=='done' ? 'danger' : 'dashed'" icon="rollback" style="margin-right:20px;">回采购单</a-button>
        </router-link>

        <router-link :to="{ name:'MesProduceOne', params: {order_id: $route.params.produce_id} }" v-if="$route.params.produce_id">
          <a-button type="dashed" icon="rollback" style="margin-right:20px;">回生产单</a-button>
        </router-link>

        <a-button @click="putin_dlg(0, order)" v-if="(order.state=='create' || order.state=='part') && owner_conf.is_enable_quick_in" style="margin-right:20px;" type="primary">不扫码入库</a-button>
        <a-button @click="scan_dlg_each(0, order)"  v-if="(order.state=='create' || order.state=='part') && owner_conf.is_scan_each_barcode" style="margin-right:20px;" type="primary">扫条码入库</a-button>
        <!--
        <a-button @click="scan_dlg(0, order)"  v-if="(order.state=='create' || order.state=='part') && owner_conf.is_scan_batch_barcode" style="margin-right:20px;" type="primary">扫条码入库</a-button>
        -->
        <a-button @click="scan_dlg_rfid(0, order)"  v-if="(order.state=='create' || order.state=='part') && owner_conf.is_scan_rfid" style="margin-right:20px;" type="primary">扫RFID/二维码入库</a-button>
        <a-button @click="print_lines()" style="margin-right:20px;" >打印明细</a-button>
        <a-button @click="print_translines()"  style="margin-right:20px;">打印入库记录</a-button>
        <a-button @click="passback()"  style="margin-right:20px;" v-if="order.is_qimen && !order.is_passback">回传</a-button>
        <a-popconfirm
          title="确定要取消当前入库单吗?"
          @confirm="cancel_order()"
          okText="确定"
          cancelText="取消"
        >
          <a-button v-if="order.state!='cancel' && order.state!='done'" style="margin-right:20px;" type="primary">取消入库单</a-button>
        </a-popconfirm>

        <a-popconfirm
          title="确定要创建反单吗?"
          @confirm="reverse_order()"
          okText="确定"
          cancelText="取消"
        >
          <a-button v-if="order.state=='done' && !order.fan_order_code" style="margin-right:20px;" type="primary">创建反单</a-button>
        </a-popconfirm>

        <router-link :to="{ name:'StockoutOne', params: {order_id: order.fan_order_code} }" v-if="order.fan_order_code">
          <a-button type="dashed" style="margin-right:20px;">进入反单</a-button>
        </router-link>
      </h3>

      <table border="0" cellspacing="0" class="h-tb">
        <thead>
          <tr>
            <td>
              {{ page_title }} 状态: <strong>{{ translate('stockin_state', order.state) }} </strong> &nbsp;&nbsp;
              <strong v-if="order.is_qimen">{{ translate('stockin_is_passback', order.is_passback) }} </strong> 
            </td>
            <td>
              总价值: <strong>¥{{ mfmt(order.price) }}</strong>
            </td>
            <td>
              类型: <strong>{{ translate('stockin_xtype', order.xtype) }}</strong>
            </td>
            <td>
              供应商: <strong>{{ order.partner_code }}</strong>
            </td>
          </tr>
        </thead>
      </table><br/>

      <a-table :columns="line_columns"  :dataSource="lines"  bordered rowKey="id" :pagination="false">
        <span slot-scope="text,record" slot="qty_not">
          <span>{{ record.qty - record.qty_real }}</span>
        </span>
      </a-table>

      <!-- 打印 -->
      <div class="print">
        <table border="0" cellspacing="0">
          <thead>
            <tr><td style="text-align:center;font-size:30px;margin-bottom:20px;" colspan="3" class="nb">入库单</td></tr>
            <tr>
              <td class="nb mr-20">
                供应商名称电话: 
                <span>{{ partner.name }}</span> 
                <span>{{ partner.tel || partner.phone }}</span> 
                <span>{{ partner.company_name }}</span></td>
              <td class="nb">No: {{ order.order_code }}</td>
              <td class="nb">业务日期: {{ date_fmt(order.create_time) }}</td>
            </tr>
          </thead>
        </table>
        <table border="1" cellspacing="0">
          <thead>
            <tr>
              <td>货品码</td>
              <td>名称</td>
              <td>数量</td>
              <td>单位</td>
              <td>单价</td>
              <td>金额</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in lines" v-bind:key="item.id">
              <td>{{ item.sku }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.qty }}</td>
              <td>{{ item.unit }}</td>
              <td>¥{{ mfmt(item.price) }}</td>
              <td>¥{{ mfmt(item.price*item.qty) }}</td>
              <!--
              <td>{{ item.qty_real }}</td>
              <td>{{ item.qty - item.qty_real }}</td>
              -->
            </tr>
            <tr><td colspan="6">是否付款: {{ pay_state }}</td>
            </tr>
            <tr><td colspan="6">备注: {{ order.remark }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="print2">
        <div class="barcode2"></div>
        <div>
            <span>供应商: {{ order.partner_code }} </span> 
            <span>No: {{ order.order_code }} </span> 
            <span>日期: {{ order.create_time }} </span> 
        </div>
        <table border="1" cellspacing="0">
          <thead>
            <tr>
              <td>货品码</td>
              <td>条码</td>
              <td>名称</td>
              <td>预期数</td>
              <td>已收数</td>
              <td>库位</td>
              <td>容器</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in trans" v-bind:key="item.id">
              <td>{{ item.sku }}</td>
              <td>{{ item.barcode }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.qty }}</td>
              <td>{{ item.qty_real }}</td>
              <td>{{ item.location_code }}</td>
              <td>{{ item.lpn }}</td>
            </tr>
            <tr><td colspan="7">备注: {{ order.remark }}</td>
                <!--<td colspan="3"><div class="barcode"></div></td>-->
            </tr>
          </tbody>
        </table>
      </div>
      <br/>

      <a-tabs defaultActiveKey="1" @change="load_order_trans" v-if="!(order.sale_order_code || order.purchase_order_code)">
        <a-tab-pane tab="订单信息" key="1">
            <a-list bordered >
              <a-list-item>
                <label class="input-label">发货人姓名</label>
                <a-input :allowClear="true" v-model="order.sender_info.name" style="width:800px;"></a-input>
              </a-list-item>
              <a-list-item>
                <label class="input-label">发货人电话</label>
                <a-input :allowClear="true" v-model="order.sender_info.tel" style="width:800px;"></a-input>
              </a-list-item>
              <a-list-item>
                <label class="input-label">发货人地址</label>
                <a-input :allowClear="true" v-model="order.sender_info.address" style="width:800px;"></a-input>
              </a-list-item>
              <a-list-item>
                <label class="input-label">收货人姓名</label>
                <a-input :allowClear="true" v-model="order.receiver_info.name" style="width:800px;"></a-input>
              </a-list-item>
              <a-list-item>
                <label class="input-label">收货人电话</label>
                <a-input :allowClear="true" v-model="order.receiver_info.tel" style="width:800px;"></a-input>
              </a-list-item>
              <a-list-item>
                <label class="input-label">收货人地址</label>
                <a-input :allowClear="true" v-model="order.receiver_info.address" style="width:800px;"></a-input>
              </a-list-item>
              <a-list-item>
                <label class="input-label">计划日期</label>
                <a-date-picker v-model="order.date_planned" style="width:160px;"></a-date-picker>
              </a-list-item>
              <a-list-item>
                <label class="input-label">备注</label>
                <a-input :allowClear="true" v-model="order.remark" style="width:800px;"></a-input>
              </a-list-item>
            </a-list>
            <br/>
            <a-button @click="update_order_info()" type="primary">更新订单信息</a-button>
        </a-tab-pane>
          <a-tab-pane tab="入库记录" key="2" forceRender>
            <a-table bordered :dataSource="trans" :columns="trans_columns" rowKey="id">
            </a-table>
            <br/>
        </a-tab-pane>
      </a-tabs>
  </div>
</template>

<script type="text/javascript" src="<%= BASE_URL %>static/jquery.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/jquery.barcode.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/jquery.print.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/utils.js"></script>
<script>
export default {
  name: 'StockinOne',
  data () {
    return {
      line_columns: [
        //{title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id), rowClassName: 'no-print'}, 
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '名称', key: 'name', dataIndex: 'name'}, 
        {title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code'}, 
        {title: '预期数', key: 'qty', dataIndex: 'qty'}, 
        {title: '已收数', key: 'qty_real', dataIndex: 'qty_real'}, 
        {title: '未收数', key: 'qty_not', dataIndex: 'qty_not', scopedSlots: { customRender: 'qty_not' }}, 
        //{title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code', }, 
        {title: '价格', key: 'price', dataIndex: 'price',}, 
        // {title: '质量类型', key: 'quality_type', dataIndex: 'quality_type', rowClassName: 'no-print'}, 
        // {title: '生产日期', key: 'product_date', dataIndex: 'product_date', rowClassName: 'no-print'}, 
        // {title: '过期日期', key: 'expire_date', dataIndex: 'expire_date', rowClassName: 'no-print'}, 
        // {title: '批次号', key: 'batch_code', dataIndex: 'batch_code', rowClassName: 'no-print'},
        {title: '规格', key: 'spec', dataIndex: 'spec', },
        {title: '单位', key: 'unit', dataIndex: 'unit', },
      ],
      putin_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '名称', key: 'name', dataIndex: 'name'}, 
        //{title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code'}, 
        {title: '预期数', key: 'qty', dataIndex: 'qty'}, 
        {title: '已收数', key: 'qty_real', dataIndex: 'qty_real'}, 
        {title: '收取数', key: 'qty_receive', dataIndex: 'qty_receive', scopedSlots: { customRender: 'qty_receive' }}, 
        {title: '收取库位', key: 'location', dataIndex: 'location', scopedSlots: {customRender: 'location'}}, 
        {title: '收取容器', key: 'lpn', dataIndex: 'lpn', scopedSlots: {customRender: 'lpn'}}, 
      ],
      rfid_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '名称', key: 'name', dataIndex: 'name'}, 
        {title: '预期数', key: 'qty', dataIndex: 'qty'}, 
        {title: '已收数', key: 'qty_real', dataIndex: 'qty_real'}, 
        {title: 'RFID数', key: 'qty_receive', dataIndex: 'qty_receive', scopedSlots: { customRender: 'qty_receive' }}, 
        {title: '收取库位', key: 'location', dataIndex: 'location', scopedSlots: {customRender: 'location'}}, 
        {title: '收取容器', key: 'lpn', dataIndex: 'lpn', scopedSlots: {customRender: 'lpn'}}, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: {customRender: 'action'}},
      ],
      rfid_list_columns: [
        {title: 'RFID', key: 'rfid', dataIndex: 'rfid'}, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: {customRender: 'action'}},
      ],
      trans_columns: [
        //{title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id), }, 
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '名称', key: 'name', dataIndex: 'name'}, 
        {title: '未收数', key: 'qty', dataIndex: 'qty'}, 
        {title: '已收数', key: 'qty_real', dataIndex: 'qty_real'}, 
        {title: '库位', key: 'location_code', dataIndex: 'location_code',  }, 
        {title: '容器', key: 'lpn', dataIndex: 'lpn', }, 
        {title: '操作人', key: 'user_code', dataIndex: 'user_code',}, 
        {title: '操作时间', key: 'create_time', dataIndex: 'create_time', }, 
      ],
      // scan barcodes
      barcode_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '名称', key: 'name', dataIndex: 'name'}, 
        {title: '预期数', key: 'qty', dataIndex: 'qty'}, 
        {title: '已收数', key: 'qty_real', dataIndex: 'qty_real'}, 
        {title: '条码数', key: 'qty_receive', dataIndex: 'qty_receive', scopedSlots: { customRender: 'qty_receive' }}, 
        {title: '收取库位', key: 'location', dataIndex: 'location', scopedSlots: {customRender: 'location'}}, 
        {title: '收取容器', key: 'lpn', dataIndex: 'lpn', scopedSlots: {customRender: 'lpn'}}, 
      ],

      page_title: '入库订单',

      order: {sender_info:{}, receiver_info: {}},
      lines: [],
      trans: [],
      current_rfid: '',
      current_rfid2: '',
      rfid_title: 'RFID明细',

      dlg_putin: false,
      dlg_scan: false,
      dlg_scan_each: false,
      dlg_scan_rfid:false,
      dlg_rfid_list: false,
      has_manager_perm:false,

      locations_dict: {},
      locations: [],

      // 扫单入库
      current_barcode: '',
      order_line: {},
      xlines: [],
      partner: {},
      pay_state: '',

      // 扫码入库
      order_lines:[],
      order_line2: {qty:1, location:'STAGE'},
      scan_columns:[
        {title: '货品条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '收货数量', key: 'qty', dataIndex: 'qty'}, 
        {title: '收货库位', key: 'location', dataIndex: 'location'}, 
        {title: '收货容器', key: 'lpn', dataIndex: 'lpn'}, 
      ],

      current_page: 1,
      page_size:20,
      total_page:0,
      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},

      owner_conf: {},
    }
  },
  methods:{
    pay_type_fmt(d){
      return d ? d : '现金'
    },
    // 更新订单基础信息
    update_order_info(){
      var env = this
      this.$http.post('/stockin/stockin/info', this.order).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('更新成功')
          env.search()
        }else{
          env.$message.error('更新失败:'+resp.data.msg)
        }
        
      })
    },

    cancel_order(){
      var env = this
      this.$http.post('/stockin/cancel/'+this.order.id).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('取消成功');
          env.dlg_detail = false
          env.load_objects()
        }else{
          env.$message.error('取消失败: '+resp.data.msg)
        }
      })
    },

    reverse_order(){
      var env = this
      this.$http.post('/stockin/reverse/'+this.order.id).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('创建反单成功');
          env.load_objects()
        }else{
          env.$message.error('创建反单失败: '+resp.data.msg)
        }
      })
    },

    passback(){
      var env = this
      this.$http.post('/open/qimen/confirm/in/'+this.order.id).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('回传成功');
          env.load_objects()
        }else{
          env.$message.error('回传失败: '+resp.data.msg)
        }
      })
    },
    
    // 打印订单行
    print_lines(){
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
              title: '入库单: '+this.order.erp_order_code,
              doctype: '<!doctype html>'
      })
    },

    print_translines(){
      var env = this
      if(env.trans.length == 0){
        this.$http.get('/stockin/trans/'+this.order.id+'?q={"limit":1000}').then(function(resp){
          env.trans = resp.data.objects
          env.$nextTick(() => {
              env.print_inlines()
          });
        })
      }else{
        env.print_inlines()
      }
    },
    // 打印入库单入库记录
    print_inlines(){

      // 增加条形码
      $(".barcode2").barcode(this.order.erp_order_code, 'code128', {barWidth: 2, barHeight: 80})
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
              title: '入库记录: '+this.order.erp_order_code,
              doctype: '<!doctype html>'
      })
    },

    // 扫条码, 非逐个入库 =======-========
    // 查询入库单行
    enter_barcode(event){
      var env = this
      // console.log(env.order_line)
      this.$http.post('/stockin/'+this.order.id+'/line', env.order_line2).then(function(resp){
        if (resp.data.status=='success'){
          // console.log(resp.data)
          env.order_line2.id = resp.data.data.id
          env.order_line2.qty = resp.data.data.qty - resp.data.data.qty_real
          env.order_line2.name = resp.data.data.name
          env.order_line2.location = env.order_line2.location_code = resp.data.data.location_code
          // 光标跳到数量填写
          $('#c_ol_qty').focus();
          playOk()
        }else{
          env.order_line2.id = 0
          env.order_line2.qty = 1
          env.order_line2.name = '~~该订单没找到这个货品条码~~'
          playErr()
        }
      })

    },
    scan_dlg(index, order){
      this.dlg_scan = true
      this.order = order
      // 清空
      this.order_lines = []
      this.order_line2 = {qty:1, location:'STAGE'}
      function bf(){
        $('#c_ol_barcode').focus()
      }
      setTimeout(bf, 1);
    },
    // 暂时保存当前扫的货品
    do_scan(){
      var env = this
      if(this.order_line2.qty*1 > 0 && this.order_line2.barcode && this.order_line2.location && this.order_line2.name !="~~该订单没找到这个货品条码~~"){
          this.order_lines.push(this.order_line2)
          this.order_line2 = {qty:1, location:'STAGE'}
      }else{
          //this.$message.error('请填写必须的数据')
      }
      $('#c_ol_barcode').focus()
    },
    // 提交复核的订单行
    do_check_putin(){
      var env = this
      // 最后一条别漏了
      this.do_scan()
      // 保存到后端
      if(this.order_lines.length==0){
        env.$message.warning('请扫描条码或货码')
        return
      }
      // console.log(this.order_lines)
      var data = {erp_order_code: this.order.erp_order_code, lines: this.order_lines}
      this.$http.post('/stockin/check', data).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('入库成功')
          // reload objects
          env.dlg_scan = false
          env.load_objects()
        }else{
          env.$message.error(resp.data.msg)
        }
      })
    },
    // end 扫条码, 非逐个入库 =======-========

    // 订单入库, 不扫码快速入库 ===========
    putin_dlg(index, order){
      var env = this
      if(!(order.state == 'create' || order.state == 'part')){
        env.$message.warning('该单已经收货完成，不能再收货！')
        return
      }
      this.dlg_putin = true
      this.order = order

      this.$http.get('/stockin/putin/'+order.id).then(function(resp){
        for(var i=0; i < resp.data.lines.length; i++){
          var line = resp.data.lines[i]
          line.qty_receive = (line.qty - line.qty_real)
          line.location = line.location_code || line.location || 'STAGE'
        }
        // 赋值后，对对象进行修改，可能会导致数据无法正常绑定的问题; 所以，先对数据进行修改，在赋值给环境
        env.lines = resp.data.lines
        env.order.price = resp.data.order.price
      })
    },

    // 推荐库位
    do_auto(){
      var env = this
      this.$http.post('/stockin/'+this.order.id+'/autolocation').then(function(resp){
          if(resp.data.status=='success'){
            var loc_dict = resp.data.loc_dict
            for(var i=0;i<env.lines.length;i++){
              var line = env.lines[i]
              console.log(loc_dict[line.id+''])
              line.location = loc_dict[line.id+""] || line.location || line.location_code || 'STAGE'
            }
          }else{
            env.$message.error(resp.data.msg)
          }
      })
    },

    // 非扫码入库
    do_putin(){
      var env = this
      var data = []
      for(var i=0; i < env.lines.length; i++){
        var line = env.lines[i]
        if (line.qty_receive > 0 && line.location){
          data.push({line_id: line.id, location: line.location, lpn: line.lpn, qty: line.qty_receive*1})
        }
      }
      if (data.length > 0){
        var json = {lines: data}
        this.$http.post('/stockin/putin/'+this.order.id, json).then(function(resp){
            //[{line_id, qty, location, lpn=''}...]
            if(resp.data.status!='success'){
              env.$message.error(resp.data.msg)
            }else{
              env.$message.success('入库成功')
              // reload lines
              env.load_lines()
              // reload objects
              env.load_objects()
              env.dlg_putin = false
            }
        })
      }else{
        env.$message.error('请填写数据')
      }
    },
    // end 订单入库, 不扫码快速入库 ===========

    // rfid =============
    do_putin_rfid(){
      var env = this, data = []
      // {id, qty, location, lpn, rfid_list:[]}
      for(var i=0;i<this.lines.length;i++){
        var line = this.lines[i]
        if(line.qty_receive > 0){
          if(!line.location){
            env.$message.warning('请输入库位')
            return
          }else{
            data.push({line_id:line.id, qty:line.qty_receive, location:line.location, lpn:line.lpn, rfid_list:line.rfid_list2})
          }
        }
      }
      this.$http.post('/stockin/putin/rfid/'+this.order.id, {lines: data, }).then(function(resp){
        if(resp.data.status=='success'){
          env.dlg_scan_rfid = false
          env.$message.success('入库成功')
          env.load_objects()
        }else{
          env.$message.error(resp.data.msg)
        }
      })
    },
    scan_dlg_rfid(index, order){
      this.dlg_scan_rfid = true
      this.order = order

      function bf(){
        $('#current_rfid2').focus()
      }
      setTimeout(bf, 1);

      var env = this
      if(!(order.state == 'create' || order.state == 'part')){
        env.$message.warning('该单已经收货完成，不能再收货！')
        return
      }

      this.$http.get('/stockin/putin/'+order.id).then(function(resp){
        var exp_lines = []
        for(var i=0; i < resp.data.lines.length; i++){
          var line = resp.data.lines[i]
          line.qty_receive = 0
          line.location = line.location_code || line.location || 'STAGE'
          line.rfid_list = []
          line.rfid_list2 = []
          line.qty_expect = line.qty - line.qty_real
          if(line.qty_expect > 0){
            exp_lines.push(line)
          }
        }
        // 赋值后，对对象进行修改，可能会导致数据无法正常绑定的问题; 所以，先对数据进行修改，在赋值给环境
        env.lines = exp_lines
      })
    },
    scan_rfid(index, order_line){
      this.dlg_rfid_list = true
      this.order_line = order_line
      this.current_rfid = ''
      this.rfid_title = order_line.sku+ ' ' + order_line.name + ' 预收数: '+order_line.qty_expect + ' 当前RFID数: '+order_line.rfid_list2.length

      function bf(){
        $('#current_rfid').focus()
      }
      setTimeout(bf, 1);
    },
    del_rfid(index, rfid){
      this.order_line.rfid_list.splice(index, 1)
      this.order_line.rfid_list2.splice(index, 1)
      this.order_line.qty_receive = this.order_line.rfid_list2.length
    },
    del_rfid_specify(){
      var index = this.order_line.rfid_list2.indexOf(this.current_rfid)
      if(index >= 0){
        this.order_line.rfid_list2.splice(index, 1)
        this.order_line.rfid_list.splice(index, 1)
        this.order_line.qty_receive = this.order_line.rfid_list2.length
      }
    },
    add_rfid(){
      if(this.order_line.rfid_list2.length >= this.order_line.qty_expect){
        this.$message.warning('RFID数量已经等于预收数量！')
        playErr()
      }
      else if(this.current_rfid && this.order_line.rfid_list2.indexOf(this.current_rfid) < 0){
        this.order_line.rfid_list.push({rfid:this.current_rfid})
        this.order_line.rfid_list2.push(this.current_rfid)
        this.order_line.qty_receive = this.order_line.rfid_list2.length
        this.current_rfid = ''
        playOk()
      }
    },
    add_rfid2(){
      var env = this
      if(this.current_rfid2==''){
        return
      }
      this.$http.get('/inv/rfid?rfid='+this.current_rfid2).then(function(resp){
        var ok = false
        if(resp.data.status=='success'){
          var rfid = resp.data.data
          for(var i=0;i<env.lines.length;i++){
            if(env.lines[i].barcode==rfid.barcode){
              // console.log(env.lines[i])
              env.order_line = env.lines[i]
              env.current_rfid = env.current_rfid2
              env.add_rfid()
              ok = true
              env.current_rfid2 = ''
              env.$message.success('OK')
              playOk()
            }
          }

        }
        if (!ok){
          env.$message.error('未找到该RFID/二维码')
          env.current_rfid2 = ''
          playErr()
        }
      })
    },
    // end rfid =============

    // barcode ==============
    // 扫单入库
    scan_dlg_each(index, order){
      this.dlg_scan_each = true
      this.order = order
      function bf(){
        $('#current_barcode').focus()
      }
      setTimeout(bf, 1);

      var env = this
      if(!(order.state == 'create' || order.state == 'part')){
        env.$message.warning('该单已经收货完成，不能再收货！')
        return
      }

      this.$http.get('/stockin/putin/'+order.id).then(function(resp){
        var exp_lines = []
        for(var i=0; i < resp.data.lines.length; i++){
          var line = resp.data.lines[i]
          line.qty_receive = 0
          line.location = line.location_code || line.location || 'STAGE'
          line.qty_expect = line.qty - line.qty_real
          line.lpn = ''
          if(line.qty_expect > 0){
            exp_lines.push(line)
          }
        }
        // 赋值后，对对象进行修改，可能会导致数据无法正常绑定的问题; 所以，先对数据进行修改，在赋值给环境
        env.lines = exp_lines
      })
    },
    // 扫码动作
    add_barcode(){
      var env = this
      for(var i=0;i<env.lines.length;i++){
        var line = env.lines[i]
        if (line.barcode!=env.current_barcode){
          continue
        }
        if(line.qty_receive>=line.qty_expect){
          env.$message.error('该货品已收数量已经足额!')
          playErr()
          return
        }else{
          line.qty_receive += 1
          env.current_barcode = ''
          playOk()
          return
        }
      }
      env.$message.warning('该货品不属于这个订单')
      playErr()
    },
    // 扫码入库
    do_check_putin_each(print){
      var env = this
      // 保存到后端
      var xlines = []
      var data = {erp_order_code: this.order.erp_order_code, lines: xlines}
      for(var i=0;i<this.lines.length;i++){
        // {barcode, location, lpn, qty}
        var line = this.lines[i]
        if(line.qty_receive > 0){
          xlines.push({barcode:line.barcode, location:line.location, qty:line.qty_receive, lpn:line.lpn, sku:line.sku, name:line.name, id:line.id})
        }
      }
      this.xlines = xlines
      this.$http.post('/stockin/check', data).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('入库成功')
          // reload objects
          env.dlg_scan_each = false
          if(print){
            // print current trans
            env.$nextTick(() => {
              env.print_xlines()
            })
          }
          env.load_objects()
        }else{
          env.$message.error(resp.data.msg)
        }
      })
    },
    // 打印当前入库明细
    print_xlines(){
      $(".barcode3").barcode(this.order.erp_order_code, 'code128', {barWidth: 2, barHeight: 80})
      $('.print3').print({
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
              title: '入库上架明细: '+this.order.erp_order_code,
              doctype: '<!doctype html>'
      })
    },
    // end barcode ==============

    // 加载入库记录
    load_order_trans(tab, event){
      var env = this
      if((tab.name=='second' || tab=="2") && env.trans.length == 0){
        this.$http.get('/stockin/trans/'+this.order.id+'?q={"limit":1000}').then(function(resp){
          env.trans = resp.data.objects
        })
      }
    },

    // 新库位推荐 ===========
    fetch_locations(line){
      var env = this
      var lineid = line.id
      this.line = line
      if ((!env.locations_dict[lineid] || env.locations_dict[lineid].length == 0) && lineid){
        this.$http.get('/stockin/recommend/location/'+lineid).then(function(resp){
          env.locations_dict[lineid] = resp.data
          env.locations = resp.data
        })
      }
      this.locations = this.locations_dict[lineid]
    },
    select_location(val, option){
      // old
      // this.line.location = row.value
      return this.line.location = val
    },
    // end 新库位推荐 ===========

    // common ============
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
    // end common ============

    // load data
    load_objects(filters, sort){
      var env = this
      
      env.$http.get('/stockin/stockin/one/'+this.$route.params.order_id).then(function(resp){
        env.order = resp.data.order
        env.lines = resp.data.lines
        env.partner = resp.data.partner
        env.pay_state = resp.data.pay_state
        env.page_title = env.translate('stockin_xtype', env.order.xtype)+'单: '+env.order.order_code
      })
    },
    load_lines(){
      var env = this
      env.$http.get('/stockin/putin/'+env.order.id).then(function(resp){
        env.lines = resp.data.lines
        env.order.price = resp.data.order.price
      })
    },
    // end
  },
  // before render
  created:function() {
    var env = this
    // load objects
    this.load_objects()
    this.owner_conf = this.$store.owner_conf || {}
  },
  // after render
  mounted: function(){
    this.load_choice()
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.print{display: none;}
.print2{display: none;}
.print3{display: none;}
.input-label{width:100px;line-height: 32px;}
</style>
