<template>
  <div>

    <div>
        <a-breadcrumb style="padding:20px 20px 20px 0px;">
          <a-breadcrumb-item ><router-link :to="{name: 'StockoutHandle'}">仓库管理</router-link></a-breadcrumb-item>
          <a-breadcrumb-item title="扫货品条码，输入货品数量进行拣货">{{ page_title }}</a-breadcrumb-item>
        </a-breadcrumb>
    </div>

      <a-modal title="扫箱单/扫物流单" :visible="dlg_scan_express" width="1000px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_scan_express=false">
        <a-auto-complete placeholder="快递公司" optionLabelProp="value" :defaultValue="''" @change="handle_search_express"  :backfill="true" v-model="box.express_code" style="width:250px;" @focus="handle_search_express" :allowClear="true">
          <template slot="dataSource">
              <a-select-option v-for="item in express_list2" :key="item.code">
                <strong>{{item.code}} </strong><span class="certain-search-item-count">{{item.name}} {{item.tel}}</span>
              </a-select-option>
          </template>
        </a-auto-complete>
        <a-input :allowClear="true" v-model="box.bill_code" placeholder="请输入快递单/物流单号" @pressEnter="add_express_line" style="margin-bottom:10px;width:300px;" />
        <a-input :allowClear="true" v-model="box.box_code"  placeholder="请输入箱号, 可不填" style="margin-bottom:10px;width:300px;" />
        <a-button @click="add_express_line">添加</a-button><br/><br/>
        <a-table bordered :dataSource="box_lines" :columns="box_columns" :pagination="false" rowKey="id">
          <span slot="action" slot-scope="text,record,index">
            <a-button @click="del_express_line(index,record)" v-if="!record.id">删除</a-button>
            <a-button @click="query_express_line(index,record)" v-if="record.id">查询</a-button>
          </span>
        </a-table>
        <div class="dialog-footer">
          <a-button  @click="do_update_express()" style="float:right;margin-right:20px;" type="primary">确定</a-button>
        </div>
      </a-modal>

      <a-modal title="扫货品条码打包" :visible="dlg_pack" width="1000px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_pack=false">
        <a-input :allowClear="true" v-model="pack_barcode" ref="pack_barcode" @pressEnter="add_pack_barcode" placeholder="请输入条码/货品码" style="margin-bottom:10px;width:400px;" />
        <a-input :allowClear="true" v-model="pack_boxcode" ref="pack_boxcode" placeholder="请输入包裹码, 可不填" style="margin-bottom:10px;width:200px;margin-left:10px;" />
        <a-table  :dataSource="pack_lines" :columns="pack_columns" rowKey="id" bordered :pagination="false">
          <span slot="qty_uncheck" slot-scope="text,record">
            {{ record.qty_pick - record.qty_check }}
          </span>
          <span slot="qty_pack" slot-scope="text,record">
            <a-input v-model="record.qty_pack"  :allowClear="true" style="width:150px;"/>
          </span>
        </a-table>
        <div class="dialog-footer">
          <a-button  @click="do_pack_clear()" style="float:right;" type="primary">清空</a-button>
          <a-button  @click="do_pack_submit()" style="float:right;margin-right:20px;" type="primary">提交包裹</a-button>
        </div>
      </a-modal>

      <a-modal title="扫货品条码出库" :visible="dlg_scan_each" width="1000px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_scan_each=false">
        <a-input :allowClear="true" v-model="current_barcode" id="current_barcode" @pressEnter="add_barcode" placeholder="请输入条码/物料号" style="margin-bottom:10px;width:400px;" />
        <a-table bordered :dataSource="lines" :columns="barcode_columns" :pagination="false" rowKey="id">
        </a-table>
        <div class="dialog-footer">
          <a-button  @click="do_check_pick_rfid()" style="float:right;margin-right:20px;" type="primary">确定出库</a-button>
        </div>
      </a-modal>

      <a-modal title="扫货品条码出库" :visible="dlg_scan" width="1000px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_scan=false">
        <a-tabs   defaultActiveKey="first">
          <a-tab-pane tab="扫码" key="first" >
            <a-form :layout="'horizontal'">
              <a-form-item label="货品条码"  :label-col="{span:4}" :wrapper-col="{span:14}">
                <a-input :allowClear="true" v-model="order_line.barcode" placeholder="必填, 请扫描货品条码" id="c_ol_barcode" @pressEnter="enter_barcode"></a-input>
              </a-form-item>
              <a-form-item label="货品名称"  :label-col="{span:4}" :wrapper-col="{span:14}">
                <a-input :allowClear="true" v-model="order_line.name" disabled="disabled" ></a-input>
              </a-form-item>
              <!--
              <a-form-item label="货品库位"  :label-col="{span:4}" :wrapper-col="{span:14}">
                <a-input :allowClear="true" v-model="order_line.location" disabled="disabled" ></a-input>
              </a-form-item> -->
              <a-form-item label="货品数量" :label-col="{span:4}" :wrapper-col="{span:14}">
                <a-input :allowClear="true" v-model="order_line.qty" id="c_ol_qty" placeholder="必填，必须大于0"></a-input>
              </a-form-item>
            </a-form>
            <div class="dialog-footer">
              <a-button  @click="do_scan()" style="float:right;margin-right:20px;">下一个货品</a-button>
              <a-button  @click="do_check_pick()" style="float:right;margin-right:20px;" type="primary">提 交</a-button>
            </div>
          </a-tab-pane>
          <a-tab-pane tab="明细" key="second">
            <a-table  :dataSource="order_lines" :columns="scan_columns" rowKey="id" bordered :pagination="false">
              <span slot="action" slot-scope="text,record,index">
                <a-button  @click="do_scan_clear_one(index, record)"  type="primary">删除</a-button>
              </span>
            </a-table>
            <br/>
            <a-button  @click="do_scan_clear()" style="float:right;" type="primary">全部清空</a-button>
          </a-tab-pane>
        </a-tabs>
      </a-modal>

      <a-modal title="扫RFID/二维码出库" :visible="dlg_scan_rfid" width="1000px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_scan_rfid=false">
        <a-modal width="800px"  :title="rfid_title" :visible="dlg_rfid_list" :footer="null" @cancel="dlg_rfid_list=false">
          <a-input :allowClear="true" v-model="current_rfid" id="current_rfid" @pressEnter="add_rfid" placeholder="请输入RFID或二维码" style="margin-bottom:10px;width:400px;" />
          <a-button @click="add_rfid" style="float:right;"  type="primary">添加</a-button>
          <a-button @click="del_rfid_specify" style="float:right;margin-right:10px;"  type="primary">删除</a-button>
          <a-table :dataSource="rfid_line.rfid_list" :columns="rfid_list_columns" rowKey="rfid" bordered :pagination="false">
            <span slot="rfid" slot-scope="text,record">
              <span>{{ record.rfid }}</span>
            </span>
            <span slot="action" slot-scope="text,record,index">
              <a-button @click="del_rfid(index,record)"  type="primary">删除</a-button>
            </span>
          </a-table>
        </a-modal>
        <a-input :allowClear="true" v-model="current_rfid2" id="current_rfid2" @pressEnter="add_rfid2" placeholder="请输入RFID或二维码" style="margin-bottom:10px;width:400px;" />
        <a-table bordered :dataSource="lines" :columns="rfid_columns" :pagination="false" rowKey="id">
          <span slot="action" slot-scope="text,record,index">
            <a-button @click="scan_rfid(index,record)" type="primary">扫RFID</a-button>
          </span>
        </a-table>
        <div class="dialog-footer">
          <a-button @click="do_putout_rfid()" style="float:right;" type="primary">确定出库</a-button>
          <a-button @click="dlg_scan_rfid=false" style="float:right;margin-right:20px;">取消</a-button>
        </div>
      </a-modal>

      <a-modal title="订单行出库-指定库位库存分配" :visible="dlg_alloc" width="1200px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_alloc=false">
        <a-modal width="1200px" :footer="null" :keyboard="false" :title="dlg_specify_title" :visible="dlg_specify" :show-close="false" @cancel="dlg_specify=false">
          <a-table :dataSource="invs" bordered rowKey="id" :pagination="false" :columns="inv_select_columns">
            <span slot="qty_now" slot-scope="text,record">
              <a-input :allowClear="true" v-model="record.qty_now" :placeholder="0" @blur="specify_qty(record)"></a-input>
            </span>
          </a-table>
          <div class="dialog-footer">
            <a-button type="primary" @click="dlg_specify_close()"  style="float:right">确 定</a-button>
          </div>
        </a-modal>
        <a-table :dataSource="lines" bordered rowKey="id" :pagination="false" :columns="line_select_columns">
          <span slot="qty_now" slot-scope="text,record">
              <span>{{ record.qty_now }}</span>
          </span>
          <span slot="qty_unalloc" slot-scope="text,record">
              <span>{{ record.qty - record.qty_alloc || 0 }}</span>
          </span>
          <span slot="action" slot-scope="text,record">
              <a-button @click="do_specify(record)" type="primary">选择</a-button>
          </span>
        </a-table>
        <div class="dialog-footer">
          <a-button  @click="do_alloc_lines()" style="float:right" type="primary">确定分配</a-button>
        </div>
      </a-modal>

      <h3 style="padding-left:20px;">
        <a-popconfirm title="确定要自动分配吗?" @confirm="do_quick_alloc_confirm(0, order)" okText="确定" cancelText="取消" >
          <a-button v-if="order.state_alloc!='done' && order.state!='cancel' && order.state !='done'" style="margin-right:20px;" type="primary">自动分配</a-button>
        </a-popconfirm>
        <a-button @click="do_alloc(0, order)" v-if="order.state_alloc!='done' && order.state!='cancel' && order.state !='done'" style="margin-right:20px;" type="primary">手动分配</a-button>
        <a-popconfirm title="你确定要进行快速拣货吗?"
          @confirm="do_quick_pick(0, order)" okText="确定" cancelText="取消" 
          v-if="order.state_pick!='done' && order.state_alloc=='done' && order.state!='done' && owner_conf.is_enable_quick_pick"
          >
          <a-button  style="margin-right:20px;" type="primary">快速拣货</a-button>
        </a-popconfirm>

        <a-button @click="scan_dlg_each(0, order)"  v-if="order.state_pick!='done' && (order.state_alloc=='done' || order.state_alloc=='part') && owner_conf.is_enable_out_each_barcode" style="margin-right:20px;" type="primary">扫条码出库</a-button>

        <a-button @click="scan_dlg_rfid(0, order)"  v-if="order.state_pick!='done' && (order.state_alloc=='done' || order.state_alloc=='part') && owner_conf.is_enable_out_rfid" style="margin-right:20px;" type="primary">扫RFID/二维码出库</a-button>
        
        <!--
        <a-button @click="scan_dlg(0, order)"  v-if="order.state_pick!='done' && (order.state_alloc=='done' || order.state_alloc=='part') && owner_conf.is_enable_out_barcode" style="margin-right:20px;" type="primary">扫条码出库</a-button>
        -->
        <a-button @click="passback()"  style="margin-right:20px;" v-if="order.is_qimen && !order.is_passback">回传</a-button>

        <a-popconfirm
          title="此操作将取消所有未开始发运订单行的分配，你确定要取消吗?"
          @confirm="cancel_order_allocs_confirm()"
          okText="确定"
          cancelText="取消"
          v-if="order.state!='cancel' && order.state_ship=='no' && order.state!='done' && order.state_alloc!='no'"
        >
          <a-button style="margin-right:20px;" type="primary" >取消全部分配</a-button>
        </a-popconfirm>

        <a-popconfirm title="你确定要进行部分拣货吗?"
          @confirm="do_part_pick(0, order)" okText="确定" cancelText="取消" 
          v-if="order.state_pick!='done' && order.state_alloc=='part' && order.state!='done' && owner_conf.is_enable_part_pick"
          >
          <a-button  style="margin-right:20px;" type="primary">部分拣货</a-button>
        </a-popconfirm>

        <a-button @click="do_pack_dlg()"  v-if="order.state_check!='done' && (order.state_pick=='done' || order.state_pick=='part')" style="margin-right:20px;" type="primary">复核打包</a-button>

        <a-popconfirm title="你确定要完成订单吗? 订单完成后不能再出库!"
          @confirm="do_finish(0, order)" okText="确定" cancelText="取消" 
          v-if="order.state_pick!='done' && order.state!='done' && owner_conf.is_enable_part_pick && order.state!='create' && order.state_pick!='no'"
          >
          <a-button  style="margin-right:20px;" type="primary">完成订单</a-button>
        </a-popconfirm>

        <a-popconfirm title="你确定要完成订单吗? "
          @confirm="do_finish(0, order)" okText="确定" cancelText="取消" 
          v-if="order.state_pick=='done' && order.state!='done'"
          >
          <a-button  style="margin-right:20px;" type="primary" >完成订单</a-button>
        </a-popconfirm>

        <router-link :to="{ name:'MesSaleOne', params: {order_id: $route.params.sale_id} }" v-if="$route.params.sale_id">
          <a-button type="dashed" icon="rollback" style="margin-right:20px;">回销售单</a-button>
        </router-link>

        <router-link :to="{ name:'MesProduceOne', params: {order_id: $route.params.produce_id} }" v-if="$route.params.produce_id">
          <a-button type="dashed" icon="rollback" style="margin-right:20px;">回生产单</a-button>
        </router-link>

        <a-button @click="print_lines()" style="margin-right:20px;" >打印明细</a-button>
        <a-button @click="print_allocs()" style="margin-right:20px;" v-if="order.state_pick!='done'">打印拣货单</a-button>
        <a-button @click="dlg_scan_express=true" style="margin-right:20px;" v-if="order.state=='done'">快递物流信息</a-button>

        <a-popconfirm
                title="确定要取消当前出库单吗?"
                @confirm="cancel_order()"
                okText="确定"
                cancelText="取消"
              >
          <a-button v-if="order.state!='cancel' && order.state!='done' && order.state_alloc=='no'" style="margin-right:20px;" type="primary">取消出库单</a-button>
        </a-popconfirm>

        <a-popconfirm
          title="确定要创建反单吗?"
          @confirm="reverse_order()"
          okText="确定"
          cancelText="取消"
        >
          <a-button v-if="order.state=='done' && !order.fan_order_code" style="margin-right:20px;" type="primary">创建反单</a-button>
        </a-popconfirm>

        <router-link :to="{ name:'StockinOne', params: {order_id: order.fan_order_code} }" v-if="order.fan_order_code">
          <a-button type="dashed" style="margin-right:20px;">进入反单</a-button>
        </router-link>
      </h3>
      
      <table border="0" cellspacing="0" class="h-tb">
        <thead>
          <tr>
            <td>
              {{ page_title }} 状态: <strong>{{ translate('stockout_state', order.state) }}</strong> &nbsp;&nbsp;
              <strong v-if="order.is_qimen">{{ translate('stockout_is_passback', order.is_passback) }} </strong> 
            </td>
            <td>
              分配状态: <strong>{{translate('stockout_state_alloc', order.state_alloc)}}</strong>
            </td>
            <td>
              拣货状态: <strong>{{translate('stockout_state_pick', order.state_pick)}}</strong>
            </td>
          </tr>
          <tr>
            <td>
              类型: {{translate('stockout_order_type', order.order_type) }}
            </td>
            <td>
              客户: {{ order.partner_code }}
            </td>
            <td>
              总价值: <strong>¥{{ mfmt(order.price) }}</strong>
            </td>
          </tr>
        </thead>
      </table><br/>

      <a-table :columns="line_columns"  :dataSource="lines"  bordered rowKey="id" :pagination="false">
        <span slot="qty_not" slot-scope="text,record">
            <span>{{ record.qty_alloc - record.qty_pick }}</span>
        </span>
      </a-table>

      <div class="print">
        <div class="barcode"></div>
        <table border="0" cellspacing="0">
          <thead>
            <tr><td style="text-align:center;font-size:30px;margin-bottom:20px;" colspan="3" class="nb">出库单</td></tr>
            <tr>
              <td class="nb mr-20" v-if="!order.is_qimen">
                客户名称电话: 
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
              <td>名称</td>
              <td>数量</td>
              <td>单价</td>
              <td>金额</td>
              <!--<td>供应商</td>
              <td>预期数量</td>
              <td>已分配数</td>
              <td>已拣货数</td>
              <td>已发运数</td>-->
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in lines"  v-bind:key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ item.qty }}</td>
              <td>{{ mfmt(item.price) }}</td>
              <td>{{ mfmt(item.qty*item.price) }}</td>
              <!--<td>{{ item.supplier_code }}</td>
              <td>{{ item.qty }}</td>
              <td>{{ item.qty_alloc }}</td>
              <td>{{ item.qty_pick }}</td>
              <td>{{ item.qty_ship }}</td>-->
            </tr>
            <tr v-if="!order.is_qimen"><td colspan="7">地址: {{ order.receiver_address }}</td>
            </tr>
            <tr v-if="order.is_qimen"><td colspan="7">客户: {{ order.receiver_name }} 电话: {{order.receiver_tel}}</td></tr>
            <tr v-if="order.is_qimen"><td colspan="7">地址: {{order.receiver_province+order.receiver_city+order.receiver_area+order.receiver_town +' '+order.receiver_address }}</td></tr>
            <tr><td colspan="7">备注: {{ order.remark }}</td>
                <!--<td colspan="3"><div class="barcode"></div></td>-->
            </tr>
            <tr v-if="order.bill_code"><td colspan="7">快递面单: <div class="barcode_bill_code1"></div></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="print2">
        <div class="barcode2"></div>
        <table border="0" cellspacing="0">
          <thead>
            <tr><td style="text-align:center;font-size:30px;margin-bottom:20px;" colspan="3" class="nb">出库单</td></tr>
            <tr>
              <td class="nb mr-20" v-if="!order.is_qimen">
                客户名称电话: 
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
              <td>条码</td>
              <td>名称</td>
              <td>库位</td>
              <!--<td>供应商</td>-->
              <td>已分配数</td>
              <td>已拣货数</td>
              <td>未拣货数</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in order_allocs" v-bind:key="item.id">
              <td>{{ item.sku }}</td>
              <td>{{ item.barcode }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.location_code }}</td>
              <!--<td>{{ item.supplier_code }}</td>-->
              <td>{{ item.qty_alloc }}</td>
              <td>{{ item.qty_pick }}</td>
              <td>{{ item.qty_alloc - item.qty_pick }}</td>
            </tr>
            <tr><td colspan="7">地址: {{ order.receiver_address }}</td>
            </tr>
            <tr v-if="order.is_qimen"><td colspan="7">客户: {{ order.receiver_name }} 电话: {{order.receiver_tel}}</td></tr>
            <tr v-if="order.is_qimen"><td colspan="7">地址: {{order.receiver_province+order.receiver_city+order.receiver_area+order.receiver_town +' '+order.receiver_address }}</td></tr>
            <tr><td colspan="7">备注: {{ order.remark }}</td>
            </tr>
            <tr v-if="order.bill_code"><td colspan="7">快递面单: <div class="barcode_bill_code2"></div></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div id="print0" style="display:none;"></div>
      <br/>

      <a-tabs defaultActiveKey="0" @change="get_lines_unpick">
        <a-tab-pane tab="快递(物流)包裹" key="0">
          <div v-for="(box, idx) in box_lines" v-bind:key="box.id">
            <table border="0" cellspacing="0" class="h-tb2">
              <thead>
                <tr>
                  <td>包裹<strong>{{idx+1}}</strong>: {{box.box_code}}
                    <a-button @click="get_bill_code(idx, box)" v-if="!box.bill_code" type="primary">获取面单</a-button>
                    <a-button @click="query_express_line(0,box)" v-if="box.bill_code">查询物流</a-button>
                    <a-button @click="print_bill_code(0,box)" v-if="box.bill_code" style="margin-left:10px;">打印面单</a-button>
                    <a-button @click="ship_box(0,box)" v-if="box.state=='no'" style="margin-left:10px;" type="primary">发运</a-button>
                  </td>
                  <td>快递(物流)公司: {{translate('kdniao_express_list', box.express_code)}}({{box.express_code}})</td>
                  <td>快递面单号: {{box.bill_code}} 
                  </td>
                  <td>子单号: {{box.sub_bill_code}}</td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="line in box.lines" v-bind:key="line.id">
                  <td>{{ line.sku }}</td>
                  <td>{{ line.name }}</td>
                  <td>{{ line.qty }}</td>
                  <td>{{ line.unit }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </a-tab-pane>
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
                <label class="input-label">交货日期</label>
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
        <a-tab-pane tab="拣货单" key="2">
          <a-button @click="print_allocs()" style="margin-right:20px;" v-if="order.state_pick!='done'">打印拣货单</a-button>
          <a-table :dataSource="order_allocs" :columns="unpick_columns" rowKey="id" bordered :pagination="false">
            <span slot-scope="text,record" slot="qty_unpick">
              <span>{{ record.qty_alloc - record.qty_pick }}</span>
            </span>
          </a-table>
          <br/>
        </a-tab-pane>
        <!--
        <a-tab-pane tab="物流包裹" key="3">
          <a-alert type="warning" message="没有包裹" v-if="order_boxs.length==0"/>
          <div v-for="box in order_boxs" v-bind:key="box.id">
            <h3>包裹号: <strong>{{box.box_code}}</strong> / 快递: {{box.express_code}} / 面单号: {{box.bill_code}}</h3>
            <a-table :dataSource="box.lines" :columns="box_columns2" rowKey="id" bordered :pagination="false">
            </a-table>
            <br/>
          </div>
        </a-tab-pane>
        -->
      </a-tabs>
  </div>
</template>

<script type="text/javascript" src="<%= BASE_URL %>static/jquery.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/jquery.barcode.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/jquery.print.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/utils.js"></script>
<script>
export default {
  name: 'StockoutOne',
  data () {
    return {
      owner_conf:{},
      line_select_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '货品名', key: 'name', dataIndex: 'name'}, 
        {title: '预期数量', key: 'qty', dataIndex: 'qty'}, 
        //{title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code'}, 
        {title: '质量类型', key: 'quality_type', dataIndex: 'quality_type'}, 
        {title: '已分配数', key: 'qty_alloc', dataIndex: 'qty_alloc',  }, 
        {title: '未分配数', key: 'qty_unalloc', dataIndex: 'qty_unalloc', scopedSlots: { customRender: 'qty_unalloc' }}, 
        {title: '选择数量', key: 'qty_now', dataIndex: 'qty_now', scopedSlots: { customRender: 'qty_now' }},
        {title: '指定库位库存', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' }},
      ],
      inv_select_columns: [
        //{title: 'ID', key: 'id', dataIndex: 'id', },
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '货品名', key: 'name', dataIndex: 'name'}, 
        {title: '库位', key: 'location_code', dataIndex: 'location_code'}, 
        //{title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code', }, 
        {title: '质量类型', key: 'quality_type', dataIndex: 'quality_type'}, 
        {title: '批号', key: 'batch_code', dataIndex: 'batch_code',  }, 
        {title: '生产日期', key: 'product_date', dataIndex: 'product_date', }, 
        {title: '库存数量', key: 'qty_able', dataIndex: 'qty_able', },
        {title: '选择数量', key: 'qty_now', dataIndex: 'qty_now', scopedSlots: { customRender: 'qty_now' }},
      ],
      unpick_columns: [
        //{title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id), rowClassName: 'no-print'}, 
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '货品名', key: 'name', dataIndex: 'name'}, 
        //{title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code'}, 
        //{title: '已分配数', key: 'qty_alloc', dataIndex: 'qty_alloc'}, 
        {title: '已拣货数', key: 'qty_pick', dataIndex: 'qty_pick',  }, 
        {title: '未拣货数', key: 'qty_unpick', dataIndex: 'qty_unpick',  scopedSlots: { customRender: 'qty_unpick' },}, 
        //{title: '已发运数', key: 'qty_ship', dataIndex: 'qty_ship', rowClassName: 'no-print'}, 
        {title: '库位', key: 'location_code', dataIndex: 'location_code', },
        {title: '容器', key: 'lpn', dataIndex: 'lpn', rowClassName: 'no-print', }
      ],
      line_columns: [
        //{title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id), rowClassName: 'no-print'}, 
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '名称', key: 'name', dataIndex: 'name'}, 
        {title: '预期数', key: 'qty', dataIndex: 'qty'}, 
        {title: '已分配数', key: 'qty_alloc', dataIndex: 'qty_alloc',  }, 
        {title: '已拣货数', key: 'qty_pick', dataIndex: 'qty_pick'}, 
        {title: '未拣货数', key: 'qty_not', dataIndex: 'qty_not', scopedSlots: { customRender: 'qty_not' }}, 
        //{title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code', }, 
        {title: '价格', key: 'price', dataIndex: 'price',}, 
        // {title: '质量类型', key: 'quality_type', dataIndex: 'quality_type', rowClassName: 'no-print'}, 
        // {title: '生产日期', key: 'product_date', dataIndex: 'product_date', rowClassName: 'no-print'}, 
        // {title: '过期日期', key: 'expire_date', dataIndex: 'expire_date', rowClassName: 'no-print'}, 
        // {title: '批次号', key: 'batch_code', dataIndex: 'batch_code', rowClassName: 'no-print'},
        {title: '单位', key: 'unit', dataIndex: 'unit', }
      ],
      rfid_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '名称', key: 'name', dataIndex: 'name'}, 
        {title: '分配数', key: 'qty_alloc', dataIndex: 'qty_alloc'}, 
        {title: '已出数', key: 'qty_pick', dataIndex: 'qty_pick'}, 
        {title: 'RFID数', key: 'qty_rfid', dataIndex: 'qty_rfid', scopedSlots: { customRender: 'qty_rfid' }}, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: {customRender: 'action'}},
      ],
      rfid_list_columns: [
        {title: 'RFID', key: 'rfid', dataIndex: 'rfid'}, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: {customRender: 'action'}},
      ],
      barcode_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '名称', key: 'name', dataIndex: 'name'}, 
        {title: '分配数', key: 'qty_alloc', dataIndex: 'qty_alloc'}, 
        {title: '已出数', key: 'qty_pick', dataIndex: 'qty_pick'}, 
        {title: '条码数', key: 'qty_barcode', dataIndex: 'qty_barcode', scopedSlots: { customRender: 'qty_barcode' }}, 
      ],

      page_title: '出库单',

      order: {sender_info:{}, receiver_info: {}},
      partner: {},
      current_rfid: '',
      current_rfid2: '',
      current_barcode: '',
      rfid_title: 'RFID明细',

      has_manager_perm:false,
      dlg_scan: false,
      dlg_scan_each: false,
      dlg_scan_rfid:false,
      dlg_rfid_list: false,

      // 扫单出库
      order_lines:[],
      order_line: {qty:1,},
      scan_columns:[
        {title: '货品条码', key: 'barcode', dataIndex: 'barcode'},
        {title: '货品名', key: 'name', dataIndex: 'name'},  
        // {title: '库位', key: 'location', dataIndex: 'location'},  
        {title: '出库数量', key: 'qty', dataIndex: 'qty'}, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' },}, 
      ],

      // 分配
      order_allocs: [],
      dlg_alloc: false,
      dlg_specify: false,
      dlg_line_allocs: false,
      dlg_specify_title: '选择库位库存',

      invs: [],
      invs_dict: {},

      // 扫ｒｆｉｄ出库
      lines: [],
      rfid_line: {},

      // express
      express_list:[
        {"code":"shunfeng", "name":"顺丰"},
        {"code":"debangwuliu", "name":"德邦物流"},
        {"code":"yunda", "name":"韵达快运"},
        {"code":"ems", "name":"ems快递"},
        {"code":"yuantong", "name":"圆通速递"},
        {"code":"huitongkuaidi", "name":"汇通快运"},
        {"code":"shentong", "name":"申通"},
        {"code":"zhongtong", "name":"中通速递"},
        {"code":"zhongyouwuliu", "name":"中邮物流"},
        {"code":"lianb", "name":"联邦快递（国内）"},

        {"code":"aae", "name":"aae全球专递"},
        {"code":"anjie", "name":"安捷快递"},
        {"code":"anxindakuaixi", "name":"安信达快递"},
        {"code":"biaojikuaidi", "name":"彪记快递"},
        {"code":"bht", "name":"bht"},
        {"code":"baifudongfang", "name":"百福东方国际物流"},
        {"code":"coe", "name":"中国东方（COE）"},
        {"code":"changyuwuliu", "name":"长宇物流"},
        {"code":"datianwuliu", "name":"大田物流"},
        {"code":"dhl", "name":"dhl"},
        {"code":"dpex", "name":"dpex"},
        {"code":"dsukuaidi", "name":"d速快递"},
        {"code":"disifang", "name":"递四方"},
        {"code":"fedex", "name":"fedex（国外）"},
        {"code":"feikangda", "name":"飞康达物流"},
        {"code":"fenghuangkuaidi", "name":"凤凰快递"},
        {"code":"feikuaida", "name":"飞快达"},
        {"code":"guotongkuaidi", "name":"国通快递"},
        {"code":"ganzhongnengda", "name":"港中能达物流"},
        {"code":"guangdongyouzhengwuliu", "name":"广东邮政物流"},
        {"code":"gongsuda", "name":"共速达"},
        {"code":"hengluwuliu", "name":"恒路物流"},
        {"code":"huaxialongwuliu", "name":"华夏龙物流"},
        {"code":"haihongwangsong", "name":"海红"},
        {"code":"haiwaihuanqiu", "name":"海外环球"},
        {"code":"jiayiwuliu", "name":"佳怡物流"},
        {"code":"jinguangsudikuaijian", "name":"京广速递"},
        {"code":"jixianda", "name":"急先达"},
        {"code":"jjwl", "name":"佳吉物流"},
        {"code":"jymwl", "name":"加运美物流"},
        {"code":"jindawuliu", "name":"金大物流"},
        {"code":"jialidatong", "name":"嘉里大通"},
        {"code":"jykd", "name":"晋越快递"},
        {"code":"kuaijiesudi", "name":"快捷速递"},
        {"code":"lianhaowuliu", "name":"联昊通物流"},
        {"code":"longbanwuliu", "name":"龙邦物流"},
        {"code":"lijisong", "name":"立即送"},
        {"code":"lejiedi", "name":"乐捷递"},
        {"code":"minghangkuaidi", "name":"民航快递"},
        {"code":"meiguokuaidi", "name":"美国快递"},
        {"code":"menduimen", "name":"门对门"},
        {"code":"ocs", "name":"OCS"},
        {"code":"peisihuoyunkuaidi", "name":"配思货运"},
        {"code":"quanchenkuaidi", "name":"全晨快递"},
        {"code":"quanfengkuaidi", "name":"全峰快递"},
        {"code":"quanjitong", "name":"全际通物流"},
        {"code":"quanritongkuaidi", "name":"全日通快递"},
        {"code":"quanyikuaidi", "name":"全一快递"},
        {"code":"rufengda", "name":"如风达"},
        {"code":"santaisudi", "name":"三态速递"},
        {"code":"shenghuiwuliu", "name":"盛辉物流"},
        {"code":"sue", "name":"速尔物流"},
        {"code":"shengfeng", "name":"盛丰物流"},
        {"code":"saiaodi", "name":"赛澳递"},
        {"code":"tiandihuayu", "name":"天地华宇"},
        {"code":"tiantian", "name":"天天快递"},
        {"code":"tnt", "name":"tnt"},
        {"code":"ups", "name":"ups"},
        {"code":"wanjiawuliu", "name":"万家物流"},
        {"code":"wenjiesudi", "name":"文捷航空速递"},
        {"code":"wuyuan", "name":"伍圆"},
        {"code":"wxwl", "name":"万象物流"},
        {"code":"xinbangwuliu", "name":"新邦物流"},
        {"code":"xinfengwuliu", "name":"信丰物流"},
        {"code":"yafengsudi", "name":"亚风速递"},
        {"code":"yibangwuliu", "name":"一邦速递"},
        {"code":"youshuwuliu", "name":"优速物流"},
        {"code":"youzhengguonei", "name":"邮政包裹挂号信"},
        {"code":"youzhengguoji", "name":"邮政国际包裹挂号信"},
        {"code":"yuanchengwuliu", "name":"远成物流"},
        {"code":"yuanweifeng", "name":"源伟丰快递"},
        {"code":"yuanzhijiecheng", "name":"元智捷诚快递"},
        {"code":"yuntongkuaidi", "name":"运通快递"},
        {"code":"yuefengwuliu", "name":"越丰物流"},
        {"code":"yad", "name":"源安达"},
        {"code":"yinjiesudi", "name":"银捷速递"},
        {"code":"zhaijisong", "name":"宅急送"},
        {"code":"zhongtiekuaiyun", "name":"中铁快运"},
        {"code":"zhongxinda", "name":"忠信达"},
        {"code":"zhimakaimen", "name":"芝麻开门"},
      ],
      express_list2:[],
      dlg_scan_express: false,
      box: {express_code:'', bill_code:'', box_code:''},
      box_columns: [
        {title: '快递公司', key: 'express_code', dataIndex: 'express_code'},
        {title: '快递号', key: 'bill_code', dataIndex: 'bill_code'},
        {title: '箱码', key: 'box_code', dataIndex: 'box_code'},
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' },}, 
      ],
      box_lines: [],

      // 扫码装箱, 打包发运
      kdniao_express_list: [
        {"code":"SF", "name":"顺丰"},
        {"code":"EMS", "name":"EMS"},
        // {"code":"ZJS", "name":"宅急送"},  
        {"code":"YZPY", "name":"邮政快递包裹"},  
        {"code":"ZTKY", "name":"中铁快运"},  
        {"code":"YZBK", "name":"邮政国内标快"}, 
        {"code":"UAPEX", "name":"全一快递"}, 
        {"code":"DBL", "name":"德邦"},
        {"code":"UC", "name":"优速"},  
        {"code":"YD", "name":"韵达"},  
        {"code":"YTO", "name":"圆通"},  
        {"code":"YCWL", "name":"远成"},  
        {"code":"ANE", "name":"安能"},  
        {"code":"HTKY", "name":"百世快递"}, 
        {"code":"ZTO", "name":"中通"},  
        {"code":"STO", "name":"申通"},  
        {"code":"DBL", "name":"德邦"},  
        {"code":"JD", "name":"京东"},  
        {"code":"XFEX", "name":"信丰"},  
        {"code":"GTO", "name":"国通"},  
        {"code":"HHTT", "name":"天天快递"},  
        {"code":"SURE", "name":"速尔快递"},  
        {"code":"PJ", "name":"品骏快递"}, 
        {"code":"JDKY", "name":"京东快运"}, 
        {"code":"ANEKY", "name":"安能快运"}, 
        {"code":"DBLKY", "name":"德邦快运"},  
        {"code":"LB", "name":"龙邦快运"}, 
      ],
      order_boxs: [],
      dlg_pack: false,
      pack_barcode: '',
      pack_boxcode: '',
      pack_lines: [],
      pack_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '名称', key: 'name', dataIndex: 'name'}, 
        {title: '拣货数', key: 'qty_pick', dataIndex: 'qty_pick'}, 
        {title: '未打包数', key: 'qty_uncheck', dataIndex: 'qty_uncheck', scopedSlots: {customRender: 'qty_uncheck'}}, 
        {title: '打包数', key: 'qty_pack', dataIndex: 'qty_pack', scopedSlots: {customRender: 'qty_pack'}}, 
      ],
      box_columns2: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '名称', key: 'name', dataIndex: 'name'}, 
        {title: '数量', key: 'qty', dataIndex: 'qty'}, 
      ],


      filter: {},
      sort: null,

      current_page: 1,
      page_size: null,
      total_page: null,
      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},
    }
  },
  methods:{
    // 扫码装箱, 打包发运
    do_pack_dlg(){
      var env = this
      this.pack_barcode = ''
      this.pack_boxcode = ''
      this.dlg_pack = true
      this.pack_lines = []

      for(var i=0;i<env.lines.length;i++){
        var v = env.lines[i]
        if( (v.qty_pick-v.qty_check) > 0 ){
          env.pack_lines.push({id:v.id, name:v.name, sku:v.sku, barcode:v.barcode, spec:v.spec, unit:v.unit,
              qty_pick:v.qty_pick, qty_check:v.qty_check, qty_uncheck: v.qty_pick-v.qty_check, qty_pack:0})
        }
      }
      function bf(){
        env.$refs.pack_barcode.focus()
      }
      setTimeout(bf, 1);
    },
    do_pack_clear(){
      this.do_pack_dlg()
    },
    do_pack_submit(){
      var env = this
      if(this.pack_lines.length==0){
        return
      }
      var c = 0
      for(var i=0;i<env.pack_lines.length;i++){
        if(env.pack_lines[i].qty_pack*1>0){
          c += 1
        }
      }
      if(c==0){
        env.$message.warning('没有可以打包的数量')
      }
      this.$http.post('/stockout/stockout/box/pack/'+this.order.id, {lines:this.pack_lines, pack_boxcode:this.pack_boxcode}).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('打包成功')
          if(resp.data.waybill_state=='fail'){
            env.$message.error('获取电子面单出错, 请在下面的`包裹`手动获取, 错误: '+resp.data.msg)
          }
          env.load_objects()
          env.dlg_pack = false
        }else{
          env.$message.error('打包出错: '+resp.data.msg)
        }
      })
    },
    add_pack_barcode(){
      var env = this
      var ok = false
      for(var i=0;i<env.pack_lines.length;i++){
        var v = env.pack_lines[i]
        if(env.pack_barcode==v.barcode){
          ok = true
          if(v.qty_pack*1<v.qty_uncheck){
            v.qty_pack = v.qty_pack*1 + 1
          }else{
            env.$message.warning('未打包数不足, 不要重复扫码~')
            ok = false
          }
          break
        }
      }
      if(ok){
        playOk()
      }else{
        playErr()
      }
      env.pack_barcode = ''
      this.pack_boxcode = ''
    },
    // end 扫码装箱, 打包发运

    // express
    ship_box(index, record){
      var env = this
      this.$http.post('/stockout/stockout/box/ship/'+record.id).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('发运成功')
          record.state = 'done'
        }else{
          env.$message.error('发运失败: '+resp.data.msg)
        }
      })
    },
    print_bill_code(index, record){
      var env = this
      if (record.bill_code && record.tpl){
        // TODO 云打印
        var wind = window.open("", "快递单", "scrollbars=yes");
        wind.document.body.innerHTML = record.tpl
        wind.print();
      }else if(record.bill_code){
        console.log(env.order.bill_code)
        $(".barcode_bill_code1").barcode(env.order.bill_code, 'code128', {barWidth: 2, barHeight: 80})
        env.$nextTick(() => {
          env.print_lines()
        })
      }else{
        env.$message.error('找不到打印模板')
      }
    },
    get_bill_code(index, record){
      var env = this
      this.$http.post('/stockout/stockout/box/waybill/'+env.order.id+'/'+record.id).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('获取快递面单成功')
          env.load_objects()
          // env.box_lines[index] = resp.data.data
        }else{
          env.$message.error('获取快递面单失败: '+resp.data.msg)
        }
      })
    },
    query_express_line(index, record){
      window.open('https://www.kuaidi100.com/chaxun?com='+record.express_code+'&nu='+record.bill_code, '_blank')
    },
    del_express_line(index, record){
      if(!record.id){
        this.box_lines.splice(index, 1)
      }
    },
    add_express_line(){
      if(this.box.bill_code && this.box.express_code){
        var express_code = this.box.express_code
        this.box_lines.push(this.box)
        this.box = {express_code:express_code, bill_code:'', box_code:''}
      }
    },
    handle_search_express(text){
      var env = this
      this.express_list2 = []
      for(var i=0;i<this.express_list.length;i++){
        if(!text && i<10){
          this.express_list2.push(this.express_list[i])
        }
        if(text && (this.express_list[i].code.indexOf(text)>-1 || this.express_list[i].name.indexOf(text)>-1)){
          this.express_list2.push(this.express_list[i])
        }
      }
    },
    do_update_express(){
      var env = this
      this.$http.put('/stockout/stockout/box/'+this.order.id, {box_lines: this.box_lines}).then(function(resp){
        if(resp.data.status=='success'){
          env.load_objects()
          env.$message.success('操作成功~', 3)
        }else{
          env.$message.error('错误:'+resp.data.msg)
        }
      })
    },
    // 更新订单基础信息
    update_order_info(){
      var env = this
      this.$http.post('/stockout/stockout/info', this.order).then(function(resp){
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
      this.$http.post('/stockout/cancel/'+this.order.id).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('取消成功');
          env.load_objects()
        }else{
          env.$message.error('取消失败: '+resp.data.msg)
        }
      })
    },

    reverse_order(){
      var env = this
      this.$http.post('/stockout/reverse/'+this.order.id).then(function(resp){
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
      this.$http.post('/open/qimen/confirm/out/'+this.order.id).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('回传成功');
          env.load_objects()
        }else{
          env.$message.error('回传失败: '+resp.data.msg)
        }
      })
    },

    cancel_order_allocs_confirm(){
      var env = this;
      env.$http.post('/stockout/cancel_alloc/'+env.order.id).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success("取消订单分配成功")
          // 查询加载订单与订单行
          env.load_objects()
        }else{
          env.$message.error("取消订单分配失败: "+resp.data.msg)
        }
      })
    },

    // 打印订单行
    print_lines(){
      // 增加条形码
      // $(".barcode").barcode(this.order.erp_order_code, 'code128', {barWidth: 2, barHeight: 80})
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
              title: '出库单: '+this.order.erp_order_code,
              doctype: '<!doctype html>'
      })
    },
    // 打印拣货单
    print_allocs(){
      var env = this
      this.$http.get('/stockout/alloc/'+this.order.id+'/line?unpick=1').then(function(resp){
          env.order_allocs = resp.data
          // 增加条形码
          $(".barcode2").barcode(env.order.erp_order_code, 'code128', {barWidth: 2, barHeight: 80})
          $(".barcode_bill_code2").barcode(env.order.bill_code, 'code128', {barWidth: 2, barHeight: 80})

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
                    title: '出库拣货单',
                    doctype: '<!doctype html>'
            })
          })
      })
    },

    // 分配相关 ============
    do_finish(index, order){
      var env = this
      // 快速拣货
      this.$http.post('/stockout/done/'+order.id).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('完成订单成功')
          env.search()
        }else{
          env.$message.error('完成订单失败, '+resp.data.msg)
        }
      })
    }, 
    // 部分拣货
    do_part_pick(index, order){
      var env = this
      // 快速拣货
      this.$http.post('/stockout/part_pick/'+order.id).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('部分拣货成功')
          env.search()
        }else{
          env.$message.error('部分拣货失败, '+resp.data.msg)
        }
      })
    }, 
    // 快速拣货
    do_quick_pick(index, order){
      var env = this
      if(order.state_alloc != 'done'){
        env.$message.error('未分配完成的单子不能快速拣货')
        return
      }
      // 快速拣货
      this.$http.post('/stockout/quick_pick/'+order.id).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('快速拣货成功')
          env.search()
        }else{
          env.$message.error('快速拣货失败, '+resp.data.msg)
        }
      })
    }, 
    // 获取未拣货行
    get_lines_unpick(tab, event){
      var env = this
      if(tab.name=='second' || tab=="2"){
        // load order allocs, 未拣货的分配行
        this.$http.get('/stockout/alloc/'+this.order.id+'/line?unpick=1').then(function(resp){
          env.order_allocs = resp.data
        })
      }
    },
    // 快速分配
    do_quick_alloc_confirm(index, order){
      var env = this
      if(order.state_alloc =='done'){
        env.$message.error('改订单已经分配完成!', 3)
        return
      }
        // 自动分配
        env.$http.post('/stockout/alloc/'+order.id).then(function(resp){
          if(resp.data.status=='success'){
            env.$message.success('分配成功', 3)
            env.search()
          }else{
            env.$message.error('分配失败, '+resp.data.msg, 3)
          }
        })
    },
    // 手动出库分配
    do_alloc(index, order){
      var env = this
      if(order.state_alloc == 'done'){
        env.$message.error('改订单已经分配完成!')
        return
      }
      this.dlg_alloc = true
    },
    // 保存订单行分配数据
    do_alloc_lines(){ // {line_id: [{inv_id, qty}...]}
      var env = this
      var data = {}

      for(var i=0; i<env.lines.length; i++){
        var line_id = env.lines[i].id
        data[line_id] = []
        var invs = env.invs_dict[line_id]

        if(invs){
          for(var j=0; j<invs.length; j++){
            if(invs[j].qty_now){
              data[line_id].push({inv_id: invs[j].id, qty: invs[j].qty_now*1})
            }
          }
        }
        //
      }
      // delete empty lines
      for(var k in data){
        if(!data[k].length){
          delete data[k];
        }
      }
      if(Object.keys(data).length==0){
        env.$message.error("没有可以分配的数据")
        return
      }
      env.$http.post('/stockout/alloc/'+this.order.id+'/line/specify', data).then(function(resp){
        if(resp.data.status=='success'){
          env.dlg_alloc = false
          env.$message.success(resp.data.msg)
          // reload objects
          env.search()
        }else{
          env.$message.error(resp.data.msg)
        }
      })
    },
    // 指定库存分配订单行
    do_specify(line){
      var env = this
      var select_num = 0
      this.line = line
      this.dlg_specify = true

      var invs = env.invs_dict[line.id]
      if (invs && invs.length>0){
        env.invs = invs
        for(var i =0; i<env.invs.length; i++){
          select_num += (env.invs[i].qty_now || 0)*1
        }
      }else{
        // 获取订单行
        this.$http.get('/stockout/alloc/'+this.order.id+'/line/'+line.id+'/inv').then(function(resp){
            env.invs = resp.data
            env.invs_dict[line.id] = env.invs
        })
      }
      this.dlg_specify_title = '选择库位库存      未分数量: '+(line.qty-line.qty_alloc)+';  选择数量: '+select_num
      return select_num
    },
    // 关闭指定库存行窗口
    dlg_specify_close(){
      var env = this
      var select_num = 0

      var invs = env.invs_dict[env.line.id]
      if (invs && invs.length>0){
        env.invs = invs
        for(var i =0; i<env.invs.length; i++){
          select_num += (env.invs[i].qty_now || 0)*1
        }
      }
      this.line.qty_now = select_num
      if(this.line.qty_now*1 < 0){
        this.line.qty_now = 0
        this.$message.error('请填写大于0的数字')
        return
      }
      this.dlg_specify = false
    },
    // 指定库存分配的数量，标题修改显示数量
    specify_qty(inv){
      if(inv.qty_now*1 < 0){
        this.$message.error('请填写大于0的数字')
        return
      }
      if(inv.qty_now > inv.qty_able){
        this.$message.warning('当前库存不足 '+inv.qty_now)
        inv.qty_now = inv.qty_able*1
      }
      var select_num = 0
      var invs = this.invs_dict[this.line.id]
      if (invs && invs.length>0){
        for(var i =0; i<this.invs.length; i++){
          select_num += (this.invs[i].qty_now || 0)*1
        }
      }

      this.dlg_specify_title = '选择库位库存      未分数量: '+(this.line.qty-this.line.qty_alloc)+';  选择数量: '+select_num
      this.line.qty_now = select_num
    },
    // end 分配相关 ===============

    // rfid =============
    do_putout_rfid(){
      var env = this, data = []

      for(var i=0;i<this.lines.length;i++){
        var line = this.lines[i]
        if(line.qty_rfid>0){
          data.push({rfid_list: line.rfid_list2, barcode:line.barcode, qty:line.rfid_list2.length, line_id:line.id})
        }
      }
      this.$http.post('/stockout/check_pick/rfid/'+this.order.id, {lines: data,}).then(function(resp){
        if(resp.data.status=='success'){
          env.dlg_scan_rfid = false
          env.$message.success('出库成功')
          env.load_objects()
        }else{
          env.$message.error(resp.data.msg)
        }
      })
    },
    scan_dlg_rfid(index, order){
      this.dlg_scan_rfid = true

      function bf(){
        $('#current_rfid2').focus()
      }
      setTimeout(bf, 1);

      var env = this
      if(order.state_pick=='done'){
        env.$message.warning('该单已经发货完成，不能再出库！')
        return
      }else if(!(order.state_alloc=='done' || order.state_alloc=='part')){
        env.$message.warning('该单尚未分配库存，不能出库！')
        return
      }
      // load order aloc lines
      this.$http.get('/stockout/'+order.id+'/line').then(function(resp){
        var exp_lines = []
        for(var i=0; i < resp.data.lines.length; i++){
          var line = resp.data.lines[i]
          line.rfid_list = []
          line.rfid_list2 = []
          line.qty_expect = line.qty_alloc - line.qty_pick
          line.qty_rfid = 0
          if(line.qty_expect > 0){
            exp_lines.push(line)
          }
        }
        // 赋值后，对对象进行修改，可能会导致数据无法正常绑定的问题; 所以，先对数据进行修改，在赋值给环境
        env.lines = exp_lines
        env.order = resp.data
      })
    },
    scan_rfid(index, rfid_line){
      this.dlg_rfid_list = true
      this.rfid_line = rfid_line
      this.current_rfid = ''
      this.rfid_title = rfid_line.sku+ ' ' + rfid_line.name + ' 预出数: '+rfid_line.qty_expect + ' 当前RFID数: '+rfid_line.rfid_list2.length

      function bf(){
        $('#current_rfid').focus()
      }
      setTimeout(bf, 1);
    },
    del_rfid(index, rfid){
      this.rfid_line.rfid_list.splice(index, 1)
      this.rfid_line.rfid_list2.splice(index, 1)
      this.rfid_line.qty_rfid = this.rfid_line.rfid_list2.length
    },
    del_rfid_specify(){
      var index = this.rfid_line.rfid_list2.indexOf(this.current_rfid)
      if(index >= 0){
        this.rfid_line.rfid_list2.splice(index, 1)
        this.rfid_line.rfid_list.splice(index, 1)
        this.rfid_line.qty_rfid = this.rfid_line.rfid_list2.length
      }
    },
    add_rfid(){
      if(this.rfid_line.rfid_list2.length >= this.rfid_line.qty_expect){
        this.$message.warning('RFID数量已经等于预出数量！')
        playErr()
      }
      else if(this.current_rfid && this.rfid_line.rfid_list2.indexOf(this.current_rfid) < 0){
        this.rfid_line.rfid_list.push({rfid:this.current_rfid})
        this.rfid_line.rfid_list2.push(this.current_rfid)
        this.rfid_line.qty_rfid = this.rfid_line.rfid_list2.length
        this.current_rfid = ''
        playOk()
      }
    },
    add_rfid2(){
      var env = this
      if(this.current_rfid2==''){
        playErr()
        return
      }
      this.$http.get('/inv/rfid?rfid='+this.current_rfid2).then(function(resp){
        var ok = false
        if(resp.data.status=='success'){
          var rfid = resp.data.data
          for(var i=0;i<env.lines.length;i++){
            if(env.lines[i].barcode==rfid.barcode){
              // console.log(env.lines[i])
              env.rfid_line = env.lines[i]
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

    // barcode old ===========
    // 查询出库单行
    enter_barcode(event){
      var env = this
      this.$http.post('/stockout/check_pick/query/'+this.order.id+'/line', env.order_line).then(function(resp){
        if (resp.data.status=='success'){
          env.order_line.qty = 0
          env.order_line.qty = resp.data.data.qty
          env.order_line.name = resp.data.data.name
          // 光标跳到数量填写
          $('#c_ol_qty').focus();
          playOk()
        }else{
          env.order_line.qty = 1
          env.order_line.name = '~~该订单没找到这个货品条码~~'
          playErr()
        }
      })

    },
    // 扫单出库
    scan_dlg(index, order){
      this.dlg_scan = true
      this.order = order
      // 清空
      this.order_lines = []
      this.order_line = {qty:1,}
      function bf(){
        $('#c_ol_barcode').focus()
      }
      setTimeout(bf, 1);
    },
    // 清空所有暂存扫过的货品
    do_scan_clear(){
      this.order_lines = []
      this.order_line = {qty:1,}
    },
    do_scan_clear_one(index, line){
      this.order_lines.splice(index, 1)
    },
    // 暂时保存当前扫的货品
    do_scan(valid){
      var env = this
      if(this.order_line.qty*1 > 0 && this.order_line.barcode){
          this.order_line.qty = this.order_line.qty*1
          this.order_lines.push(this.order_line)
          this.order_line = {qty:1,}
      }else if(valid){
          this.$message.error('请填写必须的数据')
      }
      $('#c_ol_barcode').focus()
    },
    // 提交复核的订单行
    do_check_pick(){
      var env = this
      // 最后一条别漏了
      this.do_scan(false)
      // 保存到后端
      // console.log(this.order_lines)
      if(this.order_lines.length < 1){
        env.$message.error("没有可以提交的数据")
        return
      }
      var data = {erp_order_code: this.order.erp_order_code, lines: this.order_lines}
      this.$http.post('/stockout/check_pick', data).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('拣货成功')
          // reload objects
          env.dlg_scan = false
          env.load_objects()
        }else{
          env.$message.error(resp.data.msg)
        }
      })
    },

    // end barcode old ==========

    // barcode ==============
    scan_dlg_each(index, order){
      this.dlg_scan_each = true
      function bf(){
        $('#current_barcode').focus()
      }
      setTimeout(bf, 1);

      var env = this
      if(order.state_pick=='done'){
        env.$message.warning('该单已经发货完成，不能再出库！')
        return
      }else if(!(order.state_alloc=='done' || order.state_alloc=='part')){
        env.$message.warning('该单尚未分配库存，不能出库！')
        return
      }
      // load order aloc lines
      this.$http.get('/stockout/'+order.id+'/line').then(function(resp){
        var exp_lines = []
        for(var i=0; i < resp.data.lines.length; i++){
          var line = resp.data.lines[i]
          line.qty_expect = line.qty_alloc - line.qty_pick
          line.qty_barcode = 0
          if(line.qty_expect > 0){
            exp_lines.push(line)
          }
        }
        // 赋值后，对对象进行修改，可能会导致数据无法正常绑定的问题; 所以，先对数据进行修改，在赋值给环境
        env.lines = exp_lines
        env.order = resp.data
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
        if(line.qty_barcode>=line.qty_expect){
          env.$message.error('该货品出库数量已经足额!')
          playErr()
          return
        }else{
          line.qty_barcode += 1
          env.current_barcode = ''
          playOk()
          return
        }
      }
      env.$message.warning('该货品不属于这个订单')
      playErr()
    },
    // 扫码入库
    do_check_pick_rfid(){
      var env = this
      var xlines = []
      // 保存到后端
      var xlines = []
      var data = {erp_order_code: this.order.erp_order_code, lines: xlines}
      for(var i=0;i<this.lines.length;i++){
        // // {barcode, location:None, qty, rfid_list}
        var line = this.lines[i]
        if(line.qty_barcode > 0){
          xlines.push({barcode:line.barcode, qty:line.qty_barcode})
        }
      }
      this.$http.post('/stockout/check_pick', data).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('出库成功')
          // reload objects
          env.dlg_scan_each = false
          env.load_objects()
        }else{
          env.$message.error(resp.data.msg)
        }
      })
    },
    // end barcode ==============

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

      var kv = {}
      this.$store.config['kdniao_express_list'] = kv
      for(var i=0; i<this.kdniao_express_list.length; i++){
        kv[this.kdniao_express_list[i].code] = this.kdniao_express_list[i].name
      }
    },
    // end common ============

    // load data
    load_objects(filters, sort){
      var env = this
      
      env.$http.get('/stockout/stockout/one/'+this.$route.params.order_id).then(function(resp){
        env.order = resp.data.order
        env.lines = resp.data.lines
        env.box_lines = resp.data.box_lines
        env.order_boxs = resp.data.order_boxs || []
        env.partner = resp.data.partner
        env.page_title = env.translate('stockout_order_type', env.order.order_type)+'单: '+env.order.order_code
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
