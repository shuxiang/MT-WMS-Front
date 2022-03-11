<template>
  <div>
    <div>
        <a-row>
          <a-col :span="6">
            <a-breadcrumb style="padding:20px 20px 20px 0px;">
              <a-breadcrumb-item >出库作业</a-breadcrumb-item>
              <a-breadcrumb-item title="使用自动分配，系统将自动分配可用的库存。
                          使用手动分配，需要手动分配指定的库位库存及数量。
                          使用快速拣货，订单将直接扣除库存，但订单需要已经分配完毕才能进行快速拣货。">分配库存</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
          <a-col :span="18">
            <a-button type="primary" @click="new_order()" style="margin:15px 0;">新建出库单</a-button>
            <a-button @click="export_by_filter()" style="margin:15px 0;margin-left:20px;">导出</a-button>
          </a-col>
        </a-row>
    </div>

    <div>
      <a-modal title="新建订单" :visible="dlg_new" width="1200px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_new=false;new_goods=[];">
        <a-tabs defaultActiveKey="1">
          <a-tab-pane tab="订单行明细" key="1">
            <div>
              <a-input :allowClear="true" v-model="current_good" id="current_good" @pressEnter="search_good" placeholder="货品码/条码/名称" style="margin-bottom:10px;width:400px;" />
              <a-button @click="search_good" style="margin-left:5px;margin-right:5px;" >搜索</a-button>
              <span class="red">  订单类型: </span>
              <a-select :defaultValue="'normal'" style="width: 120px"  v-model="current_order_type" >
                    <a-select-option :value="item.value" v-for="item in options.stockout_order_type" v-bind:key="item.value">{{item.text}}</a-select-option>
              </a-select>
              <span>  客户: </span>
              <span v-if="order_new.partner_name">{{ order_new.partner_name }}</span>
              <a-auto-complete placeholder="客户" @focus="handle_search_partner()" optionLabelProp="value" :defaultValue="''" @change="handle_search_partner" :backfill="true" v-model="partner_code" @select="select_partner0">
                <template slot="dataSource">
                    <a-select-option v-for="item in partners" :key="item.code">
                      <strong>{{item.code}} </strong><span class="certain-search-item-count">{{item.name}} {{item.tel}}</span>
                    </a-select-option>
                </template>
              </a-auto-complete>
            </div>
            <h4 style="display:block;font-weight:bold;">搜索结果：</h4>
            <a-table bordered :dataSource="new_goods" :columns="new_good_columns" :pagination="pagination2" rowKey="id" :rowClassName="new_goods_class" v-if="new_goods.length > 0" :scroll="{y: 500 }" @change="table_filter_sort2">
              <span slot="qty" slot-scope="text,record">
                  <a-input :allowClear="true" v-model="record.qty" placeholder="数量" style="width: 120px"></a-input>
              </span>
              <span slot="now_price" slot-scope="text,record">
                  <a-input :allowClear="true" v-model="record.now_price" placeholder="价格" style="width: 120px"></a-input>
              </span>
              <!--
              <span slot="supplier_code" slot-scope="text,record">
                <span>
                  <a-select :defaultValue="record.supplier_code" style="width: 120px"  v-model="record.supplier_code" >
                    <a-select-option value="" v-bind:key="''">无供应商信息</a-select-option>
                    <a-select-option :value="item.code" v-for="item in suppliers" v-bind:key="item.code">{{item.name}}</a-select-option>
                  </a-select>
                </span>
              </span>-->
              <span slot="unit" slot-scope="text,record">
                  <a-input :allowClear="true" v-model="record.qty" placeholder="单位" style="width: 120px"></a-input>
              </span>
              <span slot="action" slot-scope="text,record,index">
                  <a-button type="primary" @click="add_order_line(index, record)" style="float:right;" >添加</a-button>
              </span>
            </a-table>
            <br/>
            <h4 style="display:block;font-weight:bold;">已选订单行：</h4>
            <a-table bordered :dataSource="new_lines" :columns="new_line_columns" :pagination="false" rowKey="id" :rowClassName="new_goods_class2" :scroll="{y: 500 }">
              <span slot="qty" slot-scope="text,record">
                  <a-input :allowClear="true" v-model="record.qty" placeholder="数量" style="width: 120px"></a-input>
              </span>
              <span slot="price" slot-scope="text,record">
                  <a-input :allowClear="true" v-model="record.price" placeholder="价格" style="width: 120px"></a-input>
              </span>
              <!--
              <span slot="supplier_code" slot-scope="text,record">
                <span>
                  <a-select :defaultValue="record.supplier_code" style="width: 120px"  v-model="record.supplier_code" >
                    <a-select-option value="" v-bind:key="''">无供应商信息</a-select-option>
                    <a-select-option :value="item.code" v-for="item in suppliers" v-bind:key="item.code">{{item.name}}</a-select-option>
                  </a-select>
                </span>
              </span>-->
              <span slot="action" slot-scope="text,record,index">
                  <a-button type="primary" @click="del_order_line(index, record)" style="float:right;" >删除</a-button>
              </span>
            </a-table>
          </a-tab-pane>
          <a-tab-pane tab="订单信息" key="2">
            <a-form :layout="'horizontal'"  >
              <a-form-item label="发货人姓名" prop="1" :label-col="{span:4}" :wrapper-col="{span:14}">
                <a-input :allowClear="true"  v-model="order_new.sender_info.name" ></a-input>
              </a-form-item>
              <a-form-item label="发货人电话" prop="2" :label-col="{span:4}" :wrapper-col="{span:14}">
                <a-input :allowClear="true"  v-model="order_new.sender_info.tel" ></a-input>
              </a-form-item>
              <a-form-item label="发货人地址" prop="3" :label-col="{span:4}" :wrapper-col="{span:14}">
                <a-input :allowClear="true"  v-model="order_new.sender_info.address" ></a-input>
              </a-form-item>
              <a-form-item label="收货人姓名" prop="1" :label-col="{span:4}" :wrapper-col="{span:14}">
                <a-input :allowClear="true"  v-model="order_new.receiver_info.name" ></a-input>
              </a-form-item>
              <a-form-item label="收货人电话" prop="2" :label-col="{span:4}" :wrapper-col="{span:14}">
                <a-input :allowClear="true"  v-model="order_new.receiver_info.tel" ></a-input>
              </a-form-item>
              <a-form-item label="收货人地址" prop="3" :label-col="{span:4}" :wrapper-col="{span:14}">
                <a-input :allowClear="true"  v-model="order_new.receiver_info.address" ></a-input>
              </a-form-item>
              <a-form-item label="计划时间" prop="date_planned" :label-col="{span:4}" :wrapper-col="{span:14}">
                <a-date-picker v-model="order_new.date_planned2" placeholder="计划时间" style="width:160px;"/>
              </a-form-item>
              <a-form-item label="备注" prop="remark" :label-col="{span:4}" :wrapper-col="{span:14}">
                <a-input :allowClear="true" v-model="order_new.remark"></a-input>
              </a-form-item>
            </a-form>
          </a-tab-pane>
        </a-tabs>
        <div class="dialog-footer">
          <a-popconfirm
              title="确定要创建新订单吗?"
              @confirm="do_submit()"
              okText="确定"
              cancelText="取消"
            >
              <a-button type="primary" style="float:right;">提交</a-button>
          </a-popconfirm>
        </div>
      </a-modal>

      <a-modal title="明细" :visible="dlg_detail" @cancel="dlg_detail=false" width="1200px" :footer="null">
        <a-modal width="800px"  title="行已经分配明细" :visible="dlg_line_allocs" :footer="null" @cancel="dlg_line_allocs=false">
          <a-table :dataSource="line_allocs" :columns="alloc_columns" rowKey="id" bordered :pagination="false">
          </a-table>
        </a-modal>
        <a-tabs  defaultActiveKey="first">
          <a-tab-pane tab="订单行明细" key="1">
            <div>
              <a-input :allowClear="true" v-model="current_good" id="current_good" @pressEnter="search_good" placeholder="货品码/条码/名称" style="margin-bottom:10px;width:400px;" />
              <a-button @click="search_good" style="margin-left:5px;margin-right:5px;" >搜索</a-button>
              <span class="red">  订单类型: </span><a-select :defaultValue="'normal'" style="width: 120px"  v-model="current_order_type" >
                    <a-select-option :value="item.value" v-for="item in options.stockout_order_type" v-bind:key="item.value">{{item.text}}</a-select-option>
              </a-select>
              <span>  客户: </span>
              <span v-if="partner_name">{{ partner_name }}</span>
              <a-auto-complete placeholder="客户" @focus="handle_search_partner()" optionLabelProp="value" :defaultValue="''" @change="handle_search_partner" :backfill="true" v-model="partner_code" @select="select_partner1">
                <template slot="dataSource">
                    <a-select-option v-for="item in partners" :key="item.code">
                      <strong>{{item.code}} </strong><span class="certain-search-item-count">{{item.name}} {{item.tel}}</span>
                    </a-select-option>
                </template>
              </a-auto-complete>
              <span>  总价: <strong>¥{{order.price}}</strong></span>
            </div>
            <h4 style="display:block;font-weight:bold;">搜索结果：</h4>
            <a-table bordered :dataSource="new_goods" :columns="new_good_columns" :pagination="false" rowKey="id" :rowClassName="new_goods_class" v-if="new_goods.length > 0" :scroll="{y: 500 }">
              <span slot="qty" slot-scope="text,record">
                  <a-input :allowClear="true" v-model="record.qty" placeholder="数量" style="width: 120px"></a-input>
              </span>
              <span slot="now_price" slot-scope="text,record">
                  <a-input :allowClear="true" v-model="record.now_price" placeholder="价格" style="width: 120px"></a-input>
              </span>
              <span slot="unit" slot-scope="text,record">
                  <a-input :allowClear="true" v-model="record.qty" placeholder="单位" style="width: 120px"></a-input>
              </span>
              <span slot="action" slot-scope="text,record,index">
                  <a-button @click="add_order_line(index, record)" style="float:right;"  type="primary">添加</a-button>
              </span>
            </a-table>
            <br/>
            <h4 style="display:block;font-weight:bold;">已选订单行：</h4>
            <a-table bordered :dataSource="new_lines" :columns="new_line_columns" :pagination="false" rowKey="sku" :rowClassName="new_goods_class2" :scroll="{y: 500 }">
              <span slot="qty" slot-scope="text,record">
                  <a-input :allowClear="true" v-model="record.qty" placeholder="数量" style="width: 120px"></a-input>
              </span>
              <span slot="price" slot-scope="text,record">
                  <a-input :allowClear="true" v-model="record.price" placeholder="价格" style="width: 120px"></a-input>
              </span>
              <span slot="action" slot-scope="text,record,index">
                  <a-button @click="del_order_line(index, record)" style="float:right;"  type="primary" v-if="!record.id">删除</a-button>
                  <a-button @click="delete_order_line(index, record)" type="primary" style="float:right;" v-if="record.id && order.state=='create'">删除</a-button>
              </span>
            </a-table>
            <div class="print">
              <table border="0" cellspacing="0">
                <thead>
                  <tr><td style="text-align:center;font-size:30px;margin-bottom:20px;" colspan="3" class="nb">出库单</td></tr>
                  <tr>
                    <td class="nb mr-20">
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
                  <tr><td colspan="6">地址: {{ order.receiver_address }}</td>
                  </tr>
                  <tr><td colspan="6">备注: {{ order.remark }}</td>
                      <!--<td colspan="3"><div class="barcode"></div></td>-->
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="dialog-footer">
              <a-popconfirm
                title="此操作将取消所有未开始发运的订单行的分配，已经拣货的将生成退库单，你确定要取消吗?"
                @confirm="cancel_order_allocs_confirm()"
                okText="确定"
                cancelText="取消"
              >
                <a-button type="primary"  style="float:right;" v-if="order.state!='cancel' && order.state_ship=='no' && order.state!='done' && order.state_alloc!='no'">取消全部分配</a-button>
              </a-popconfirm>

              <a-popconfirm
                title="确定要取消当前出库单吗?"
                @confirm="cancel_order()"
                okText="确定"
                cancelText="取消"
              >
                <a-button v-if="order.state!='cancel' && order.state!='done' && order.state_alloc=='no'" style="float:right;margin-right:20px;" type="primary">取消出库单</a-button>
              </a-popconfirm>

              <a-button @click="print_lines()" style="float:right;margin-right:20px;">打印出库单明细</a-button>
              <a-popconfirm
                title="此操作下，如果订单缺货（没有分配足够的库存），将创建生产单?"
                @confirm="create_produce_order()"
                okText="确定"
                cancelText="取消"
              >
                <a-button type="primary" style="float:right;margin-right:20px;" v-if="order.state_alloc!='done' && order.order_type!='produce' && owner_conf.is_enable_mes && !order.has_produce_order">创建生产单</a-button>
              </a-popconfirm>
              <a-popconfirm
                title="确定要修改订单吗?"
                @confirm="do_submit_edit()"
                okText="确定"
                cancelText="取消"
              >
                <a-button style="float:right;margin-right:20px;" type="primary" v-if="order.state=='create'">提交修改</a-button>
              </a-popconfirm>
            </div>
          </a-tab-pane>
          <a-tab-pane label="所有已分配未拣货明细" tab="拣货单" key="2">
            <div>
              <a-table :dataSource="order_allocs" :columns="unpick_columns" rowKey="id" bordered :pagination="false">
                <span slot-scope="text,record" slot="qty_unpick">
                  <span>{{ record.qty_alloc - record.qty_pick }}</span>
                </span>
              </a-table>
            </div>
            <div class="print2">
              <div class="barcode2"></div>
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
                </tbody>
              </table>
            </div>
            <div class="dialog-footer">
              <a-button @click="print_allocs()" style="float:right;margin-right:20px;">打印拣货单</a-button>
            </div>
          </a-tab-pane>
          <a-tab-pane tab="订单信息" key="3">
            <a-list bordered >
              <a-list-item>
                <label class="input-label">发货人姓名</label>
                <a-input :allowClear="true" v-model="order.sender_info.name" :disabled="order.state!='create'" style="width:800px;"></a-input>
              </a-list-item>
              <a-list-item>
                <label class="input-label">发货人电话</label>
                <a-input :allowClear="true" v-model="order.sender_info.tel" :disabled="order.state!='create'" style="width:800px;"></a-input>
              </a-list-item>
              <a-list-item>
                <label class="input-label">发货人地址</label>
                <a-input :allowClear="true" v-model="order.sender_info.address" :disabled="order.state!='create'" style="width:800px;"></a-input>
              </a-list-item>
              <a-list-item>
                <label class="input-label">收货人姓名</label>
                <a-input :allowClear="true" v-model="order.receiver_info.name" :disabled="order.state!='create'" style="width:800px;"></a-input>
              </a-list-item>
              <a-list-item>
                <label class="input-label">收货人电话</label>
                <a-input :allowClear="true" v-model="order.receiver_info.tel" :disabled="order.state!='create'" style="width:800px;"></a-input>
              </a-list-item>
              <a-list-item>
                <label class="input-label">收货人地址</label>
                <a-input :allowClear="true" v-model="order.receiver_info.address" :disabled="order.state!='create'" style="width:800px;"></a-input>
              </a-list-item>
              <a-list-item>
                <label class="input-label">计划时间</label>
                <a-date-picker v-model="order.date_planned2" :disabled="order.state!='create'" style="width:160px;"></a-date-picker>
              </a-list-item>
              <a-list-item>
                <label class="input-label">备注</label>
                <a-input :allowClear="true" v-model="order.remark" :disabled="order.state!='create'" style="width:800px;"></a-input>
              </a-list-item>
            </a-list>
            <a-button type="primary" @click="update_order_info()" style="float:right;margin-top:10px;" v-if="order.state=='create'">更新订单信息</a-button>
          </a-tab-pane>
        </a-tabs>
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
          <span slot="qty_unalloc" slot-scope="text,record">
              <span>{{record.qty - record.qty_alloc || 0}}</span>
          </span>
          <span slot="action" slot-scope="text,record">
              <a-button type="primary" @click="do_specify(record)">选择</a-button>
          </span>
        </a-table>
        <div class="dialog-footer">
          <a-button type="primary"  @click="do_alloc_lines()" style="float:right">确定分配</a-button>
        </div>
      </a-modal>

      <a-form layout="inline" v-if="owner_conf.is_enable_search_bar" style="padding-left:15px;background-color:rgb(235,235,235);">
        <a-form-item label="单号" >
          <a-input :allowClear="true"  placeholder="单号" v-model="query.order_code" style="width:160px;"/>
        </a-form-item>
        <a-form-item label="客户">
          <a-auto-complete placeholder="客户" @focus="handle_search_partner()" optionLabelProp="value" :defaultValue="''" @change="handle_search_partner" :backfill="true" v-model="query.partner_code">
            <template slot="dataSource">
                <a-select-option v-for="item in partners" :key="item.code">
                  <strong>{{item.code}} </strong><span class="certain-search-item-count">{{item.name}} {{item.tel}}</span>
                </a-select-option>
            </template>
          </a-auto-complete>
        </a-form-item>
        <a-form-item label="类型">
          <a-select :defaultValue="query.order_type"  v-model="query.order_type" style="width:120px;">
            <a-select-option value="" v-bind:key="''">--所有--</a-select-option>
            <a-select-option :value="item.value" v-for="item in options.stockout_order_type" v-bind:key="item.value">{{item.label}}</a-select-option>
          </a-select> 
        </a-form-item>
        <a-form-item label="状态">
          <a-select :defaultValue="query.state"  v-model="query.state" style="width:120px;">
            <a-select-option value="" v-bind:key="''">--所有--</a-select-option>
            <a-select-option :value="item.value" v-for="item in options.stockout_state" v-bind:key="item.value">{{item.label}}</a-select-option>
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

      <a-table :columns="order_columns"  :dataSource="objects"  bordered rowKey="id" :pagination="pagination" @change="table_filter_sort" :scroll="{x:'max-content'}">
        <span slot-scope="text,record" slot="order_code">
          <router-link :to="{ name: 'StockoutOne', params: {order_id: record.id} }">
              {{ record.order_code }}
          </router-link>
        </span>
        <span slot-scope="text,record" slot="partner_code">
          <span>{{ record.partner_name || record.partner_code }}</span>
        </span>
        <span slot-scope="text,record" slot="is_passback">
          <span>{{ translate('stockout_is_passback', record.is_passback) }}</span>
        </span>
        <span slot-scope="text,record" slot="xtype">
          <span>{{ translate('stockout_xtype', record.xtype) }}</span>
        </span>
        <span slot-scope="text,record" slot="order_type">
          <span>{{ translate('stockout_order_type', record.order_type) }}</span>
        </span>
        <span slot-scope="text,record" slot="state">
          <span>{{ translate('stockout_state', record.state) }}</span>
        </span>
        <span slot-scope="text,record" slot="state_alloc">
          <span>{{ translate('stockout_state_alloc', record.state_alloc) }}</span>
        </span>
        <span slot-scope="text,record" slot="state_pick">
          <span>{{ translate('stockout_state_pick', record.state_pick) }}</span>
        </span>
        <span slot-scope="text,record" slot="state_ship">
          <span>{{ translate('stockout_state_ship', record.state_ship) }}</span>
        </span>
        <span slot-scope="text,record,index" slot="action">
            <a-popconfirm
              title="确定要自动分配吗?"
              @confirm="do_quick_alloc_confirm(index,record)"
              okText="确定"
              cancelText="取消"
            >
              <a-button type="danger" v-if="record.state_alloc!='done' && record.state!='done' && record.state!='cancel'" style="margin-right:10px">自动分配</a-button>
            </a-popconfirm>
            <a-button type="primary" @click="do_alloc(index, record)" v-if="record.state_alloc!='done' && record.state!='done' && record.state!='cancel'" style="margin-right:10px">手动分配</a-button>

            <a-popconfirm title="你确定要进行部分拣货吗?"
              @confirm="do_part_pick(0, record)" okText="确定" cancelText="取消" 
              v-if="record.state_pick!='done' && record.state_alloc=='part' && record.state!='done' && $store.owner_conf.is_enable_part_pick"
              >
              <a-button  style="margin-right:10px;" type="primary">部分拣货</a-button>
            </a-popconfirm>

            <a-popconfirm
              title="你确定要进行快速拣货吗?"
              @confirm="do_quick_pick(index, record)"
              okText="确定"
              cancelText="取消"
            >
              <a-button type="danger" v-if="record.state_pick!='done' && record.state_alloc=='done' && $store.owner_conf.is_enable_quick_pick" style="margin-right:10px">快速拣货</a-button>
            </a-popconfirm>

            <a-popconfirm title="你确定要完成订单吗? 订单完成后不能再出库!"
              @confirm="do_finish(0, record)" okText="确定" cancelText="取消" 
              v-if="record.state_pick!='done' && record.state!='done' && $store.owner_conf.is_enable_part_pick"
              >
              <a-button  style="margin-right:10px;" type="primary" v-if="record.state=='create' && record.state_pick=='done'">完成订单</a-button>
            </a-popconfirm>

            <a-button @click="order_detail(index, record)" style="margin-right:10px">明细</a-button>
            <a-button @click="export_excel(index, record)" style="margin-right:10px">导出</a-button>
        </span>
      </a-table>

    </div>

  </div>

</template>

<script type="text/javascript" src="<%= BASE_URL %>static/jquery.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/jquery.barcode.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/jquery.print.min.js"></script>
<script type="text/javascript" src="<%= BASE_URL %>static/utils.js"></script>
<script>
export default {
  name: 'StockoutHandle',
  data () {
    return {
      clients:[],
      partners: [],
      owner_conf: {},

      objects: [],
      order: {sender_info:{}, receiver_info: {}},
      partner: {},
      lines: [],
      line: {},
      invs: [],
      invs_dict: {},
      line_allocs: [],
      order_allocs: [],

      order_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id)}, 
        {title: '单号', key: 'order_code', dataIndex: 'order_code',
        }, 
        //{title: '类型', key: 'xtype', dataIndex: 'xtype', scopedSlots: { customRender: 'xtype' }, filters:this.$store.options['stockout_xtype']},
        {title: '类型', key: 'order_type', dataIndex: 'order_type', scopedSlots: { customRender: 'order_type' }, },
        {title: '状态', key: 'state', dataIndex: 'state', scopedSlots: { customRender: 'state' },},
        {title: '客户', key: 'partner_code', dataIndex: 'partner_code', scopedSlots: {customRender: 'partner_code'}}, 
        {title: '分配', key: 'state_alloc', dataIndex: 'state_alloc', scopedSlots: { customRender: 'state_alloc' }, },
        {title: '拣货', key: 'state_pick', dataIndex: 'state_pick', scopedSlots: { customRender: 'state_pick' }, },
        //{title: '发运', key: 'state_ship', dataIndex: 'state_ship', scopedSlots: { customRender: 'state_ship' }, filters:this.$store.options['stockout_state_ship']},
        //{title: '回传', key: 'is_passback', dataIndex: 'is_passback', scopedSlots: { customRender: 'is_passback' }, },
        {title: '创建时间', key: 'create_time', dataIndex: 'create_time', sorter: (a, b)=>(a.create_time>b.create_time),
        },
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' },}
      ],
      unpick_columns: [
        //{title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id), rowClassName: 'no-print'}, 
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '货品名', key: 'name', dataIndex: 'name'}, 
        //{title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code'}, 
        {title: '已分配数', key: 'qty_alloc', dataIndex: 'qty_alloc'}, 
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
        {title: '货品名', key: 'name', dataIndex: 'name'}, 
        //{title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code'}, 
        {title: '价格', key: 'price', dataIndex: 'price'}, 
        {title: '预期数量', key: 'qty', dataIndex: 'qty'}, 
        {title: '已分配数', key: 'qty_alloc', dataIndex: 'qty_alloc'}, 
        {title: '已拣货数', key: 'qty_pick', dataIndex: 'qty_pick',  }, 
        //{title: '已发运数', key: 'qty_ship', dataIndex: 'qty_ship', }, 
        {title: '已分配明细', key: 'alloc_line', dataIndex: 'alloc_line', rowClassName: 'no-print', scopedSlots: { customRender: 'alloc_line' }}
      ],
      alloc_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '货品名', key: 'name', dataIndex: 'name'}, 
        {title: '库位', key: 'location_code', dataIndex: 'location_code'}, 
        {title: '容器', key: 'lpn', dataIndex: 'lpn'}, 
        {title: '已分配数', key: 'qty_alloc', dataIndex: 'qty_alloc'}, 
        {title: '已拣货数', key: 'qty_pick', dataIndex: 'qty_pick',  }, 
        //{title: '已发运数', key: 'qty_ship', dataIndex: 'qty_ship', }, 
      ],
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

      dlg_alloc: false,
      dlg_specify: false,
      dlg_detail: false,
      dlg_line_allocs: false,
      dlg_specify_title: '选择库位库存',

      // new order
      order_new: {receiver_info:{}, sender_info: {}},
      dlg_new: false,
      suppliers: [],
      new_goods:[],
      new_good_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '货品名', key: 'name', dataIndex: 'name'}, 
        //{title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code', scopedSlots: {customRender: 'supplier_code'}}, 
        {title: '数量', key: 'qty', dataIndex: 'qty', scopedSlots: {customRender: 'qty'}},
        {title: '上次价格', key: 'last_out_price', dataIndex: 'last_out_price', scopedSlots: {customRender: 'last_out_price'}},
        {title: '价格', key: 'now_price', dataIndex: 'now_price', scopedSlots: {customRender: 'now_price'}},
        {title: '单位', key: 'unit', dataIndex: 'unit', }, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: {customRender: 'action'}}, 
      ],
      new_lines: [],
      new_line_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '货品名', key: 'name', dataIndex: 'name'}, 
        //{title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code', scopedSlots: {customRender: 'supplier_code'}}, 
        {title: '数量', key: 'qty', dataIndex: 'qty', scopedSlots: {customRender: 'qty'}},
        {title: '价格', key: 'price', dataIndex: 'price', scopedSlots: {customRender: 'price'}},
        {title: '单位', key: 'unit', dataIndex: 'unit', }, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: {customRender: 'action'}}, 
      ],
      new_lines_ids: [],
      current_good: '',
      current_order_type: '',
      partner_code: '',
      partner_name: '',

      locations_dict: {},

      has_manager_perm:false,

      filter: {},
      query: {},
      like_filters: ['partner_code'],
      partner_code_filter_icon: false,
      sort: null,
      create_time_filter_icon:false,
      erp_order_code_filter_icon:false,
      order_code_filter_icon:false,

      current_page: 1,
      page_size: null,
      total_page: null,
      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      pagination2: {defaultPageSize:10, pageSize: 10, current: 1, total: 20, showSizeChanger: false, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},
    }
  },
  methods:{
    //------  新建单子 -------
    new_order(){
      this.dlg_new = true
      this.current_good = ''
      this.new_goods = []
      this.new_lines = []
      this.new_lines_ids = []
      this.current_order_type = 'normal'
      this.partner_code = ''
      function bf(){
        $('#current_good').focus()
      }
      setTimeout(bf, 1);
    },
    del_order_line(index, line){
      this.new_lines.splice(index, 1)
      this.new_lines_ids.splice(index, 1)
    },
    add_order_line(index, line){
      if (line.qty){
        if(this.new_lines_ids.indexOf(line.sku) >= 0){
          this.$message.warning('已经添加过该货品了')
        }else{
          var new_line = JSON.parse(JSON.stringify(line))
          new_line.price = new_line.now_price
          new_line.id = undefined
          this.new_lines.push(new_line)
          this.new_lines_ids.push(line.sku)
        }
      }else{
        this.$message.warning('请输入数量')
      }
    },
    do_submit(){
      var env = this
      if(env.new_lines.length < 1){
        env.$message.warning('请添加订单行！')
        return 
      }
      if(!env.current_order_type){
        env.$message.warning('请选择订单类型')
        return
      }

      this.order_new.lines = env.new_lines
      this.order_new.order_type = this.current_order_type
      this.order_new.partner_code = this.partner_code
      if(this.order_new.date_planned2){
        this.order_new.date_planned = new Date(this.order_new.date_planned2).format('yyyy-MM-dd')
      }else{
        this.order_new.date_planned = null
      }
      
      var data = [this.order_new]//[{'lines':env.new_lines, 'order_type': this.current_order_type}]
      this.$http.post('/stockout/stockout', data).then(function(resp){
        if(resp.data.length > 0){
          env.$message.success('创建成功！')
          env.dlg_new = false
          env.search()
        }else{
          env.$message.success('创建失败!')
        }
      })
    },
    
    search_good(e, page, supplier_code){
      var env = this
      var url = '/inv/good/v2?with_inv_qty=true&qtype=out&q2='+this.current_good
      var q = {per_page: 10, page:page||1}

      this.$http.get(url+'&q='+JSON.stringify(q)).then(function(resp){
        env.new_goods = resp.data.objects
        env.pagination2.total = resp.data.num_results
        env.pagination2.current = resp.data.page
        env.pagination2.pageSize = resp.data.per_page
      })
    },
    table_filter_sort2(pagination, filters, sorter) {
      this.pagination2 = pagination
      this.search_good(null, pagination.current)
    },

    new_goods_class(record, index){
      if(record.now_price && record.now_price < record.last_out_price){
        return 'red-tb-row'
      }
      return ''
    },
    new_goods_class2(record, index){
      if(record.price && record.price < record.last_out_price){
        return 'red-tb-row'
      }
      return ''
    },
    //------ end 新建单子 -------

    delete_order_line(index, record){
      var env = this
      this.$http.delete('/stockout/'+env.order.id+'/line/'+record.id).then(function(resp){
        if(resp.data.status=='success'){
          env.new_lines.splice(index, 1)
          env.new_lines_ids.splice(index, 1)
          env.$message.success('删除成功')
        }else{
          env.$message.success('删除失败'+resp.data.msg)
        }
      })
    },

    // 创建生产单
    create_produce_order(){
      var env = this
      this.$http.post('/mes/produce/'+this.order.id+'/create', {}).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success(resp.data.msg, 3)
        }else{
          env.$message.error(resp.data.msg, 3)
        }
      })
    },

    update_order_info(){
      var env = this
      this.order.date_planned = new Date(this.order.date_planned2).format('yyyy-MM-dd')
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
          env.dlg_detail = false
          env.load_objects()
        }else{
          env.$message.error('取消失败: '+resp.data.msg)
        }
      })
    },

    // 提交修改
    do_submit_edit(){
      var env = this
      // load order lines
      var data = {lines:this.new_lines, user_code:this.user_code, partner_code: this.partner_code, remark: this.remark, 
          order_type:this.current_order_type, partner_name:this.partner_name}
      this.$http.put('/stockout/stockout/one/'+this.order.id, data).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('成功修改出库单明细!')
          env.search()
          env.dlg_detail = false
        }else{
          env.$message.error('修改出库单明细失败!')
        }
      })
    },

    // 打印订单行
    print_lines(){
      // 增加条形码
      $(".barcode").barcode(this.order.erp_order_code, 'code128', {barWidth: 2, barHeight: 80})
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
              title: '出库拣货单',
              doctype: '<!doctype html>'
      })
    },

    // 导出出库单
    export_excel(index, order){
      var env = this
      var q = {filters: [{name: 'order_code', op: '==', val: order.order_code}]}

      var data = {
          name: '出库单导出.xlsx', 
          xtype: 'export', 
          code: 'export_stockout', 
          func: 'blueprints.auth.tasks.export_stockout:export_stockout', 
          func_name: '出库单导出'}

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
          name: '出库单.xlsx', 
          xtype: 'export', 
          code: 'export_stockout', 
          func: 'blueprints.auth.tasks.export_stockout:export_stockout', 
          func_name: '出库单导出'}

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

    // 订单明细
    order_detail(index, order){
      var env = this
      this.new_goods = []
      this.order = order
      this.new_lines_ids = []
      env.current_order_type = order.order_type
      env.partner_code = order.partner_code
      env.partner_name = order.partner_name
      // load order lines
      this.$http.get('/stockout/alloc/'+order.id).then(function(resp){
        env.lines = resp.data.lines
        env.order.price = resp.data.order.price
        env.partner = resp.data.partner
        // new; load to detail
        env.new_lines = JSON.parse(JSON.stringify(env.lines))
        for(var i=0;i<env.lines.length;i++){
          env.new_lines_ids.push(env.lines[i].sku)
        }
      })
      // load order allocs, 未拣货的分配行
      if(env.order.state!='done'){
        this.$http.get('/stockout/alloc/'+order.id+'/line?unpick=1').then(function(resp){
          env.order_allocs = resp.data
        })
      }else{
        this.$http.get('/stockout/alloc/'+order.id+'/line').then(function(resp){
          env.order_allocs = resp.data
        })
      }
      this.dlg_detail = true
      this.order.date_planned2 = this.order.date_planned ? this.$moment(this.order.date_planned) : null
      $('.barcode').html('')
      $('.barcode2').html('')
    },
    // 订单行已分配明细
    order_line_allocs(index, line){
      var  env = this
      // load order line allocs， 订单行所有分配行，包括已拣货与未拣货的
      this.$http.get('/stockout/alloc/'+line.stockout_id+'/line/'+line.id).then(function(resp){
        env.line_allocs = resp.data
      })
      this.dlg_line_allocs = true
    },
    // 取消订单行已经分配的明细，已发运不能取消
    cancel_order_line_allocs(index, line){
      var env = this;
      this.$confirm('此操作将取消该订单行的分配，你确定要取消吗?', '重要提示', {
        confirmButtonText: '确定',
        cancelButtonText: '不了',
        type: 'warning'
      }).then(() => {
          env.$http.post('/stockout/cancel_alloc/'+line.stockout_id+'/line/'+line.id).then(function(resp){
            if(resp.data.status=='success'){
              env.$message.success("取消订单行分配成功")
              // 查询加载订单与订单行
              env.search()
              env.$http.get('/stockout/alloc/'+env.order.id).then(function(resp){
                env.lines = resp.data.lines
                env.order.price = resp.data.order.price
              })
              // load order allocs
              env.$http.get('/stockout/alloc/'+env.order.id+'/line').then(function(resp){
                env.order_allocs = resp.data
              })
            }else{
              env.$message.error("取消订单行分配失败: "+resp.data.msg)
            }
          })
      }).catch(() => {
      })
    },
    cancel_order_line_allocs_confirm(index, line){
      var env = this;

          env.$http.post('/stockout/cancel_alloc/'+line.stockout_id+'/line/'+line.id).then(function(resp){
            if(resp.data.status=='success'){
              env.$message.success("取消订单行分配成功")
              // 查询加载订单与订单行
              env.search()
              env.$http.get('/stockout/alloc/'+env.order.id).then(function(resp){
                env.lines = resp.data.lines
                env.order.price = resp.data.order.price
              })
              // load order allocs
              env.$http.get('/stockout/alloc/'+env.order.id+'/line').then(function(resp){
                env.order_allocs = resp.data
              })
            }else{
              env.$message.error("取消订单行分配失败: "+resp.data.msg)
            }
          })
    },
    // 取消整个订单的分配
    cancel_order_allocs(){
      var env = this;
      this.$confirm('此操作将取消所有未开始发运的订单行的分配，你确定要取消吗?', '重要提示', {
        confirmButtonText: '确定',
        cancelButtonText: '不了',
        type: 'warning'
      }).then(() => {
          env.$http.post('/stockout/cancel_alloc/'+env.order.id).then(function(resp){
            if(resp.data.status=='success'){
              env.$message.success("取消订单分配成功")
              // 查询加载订单与订单行
              env.search()
              env.$http.get('/stockout/alloc/'+env.order.id).then(function(resp){
                env.lines = resp.data.lines
              })
              // load order allocs
              env.$http.get('/stockout/alloc/'+env.order.id+'/line').then(function(resp){
                env.order_allocs = resp.data
              })
            }else{
              env.$message.error("取消订单分配失败: "+resp.data.msg)
            }
          })
      }).catch(() => {
      })
    },
    cancel_order_allocs_confirm(){
      var env = this;
          env.$http.post('/stockout/cancel_alloc/'+env.order.id).then(function(resp){
            if(resp.data.status=='success'){
              env.$message.success("取消订单分配成功")
              // 查询加载订单与订单行
              env.search()
              env.$http.get('/stockout/alloc/'+env.order.id).then(function(resp){
                env.lines = resp.data.lines
              })
              // load order allocs
              env.$http.get('/stockout/alloc/'+env.order.id+'/line').then(function(resp){
                env.order_allocs = resp.data
              })
            }else{
              env.$message.error("取消订单分配失败: "+resp.data.msg)
            }
          })
    },

    // 快速分配，自动分配
    do_quick_alloc(index, order){
      var env = this
      this.order = order
      if(order.state_alloc =='done'){
        env.$message.error('改订单已经分配完成!')
        return
      }

      this.$confirm('确定要自动分配吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 自动分配
        env.$http.post('/stockout/alloc/'+order.id).then(function(resp){
          if(resp.data.status=='success'){
            env.$message.success('分配成功')
            env.search()
          }else{
            env.$message.error('分配失败, '+resp.data.msg)
          }
        })
      })
    },

    do_quick_alloc_confirm(index, order){
      var env = this
      this.order = order
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
      this.order = order
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

    // 出库分配
    do_alloc(index, order){
      var env = this
      this.order = order
      if(order.state_alloc == 'done'){
        env.$message.error('改订单已经分配完成!')
        return
      }
      this.dlg_alloc = true
      // load lines
      this.$http.get('/stockout/alloc/'+order.id).then(function(resp){
        env.lines = resp.data.lines
        env.order.price = resp.data.order.price
      })
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


    // 供应商推荐
    handle_search_partner(val){
      var env = this
      var q = {filters:[{name: 'xtype', op:'ilike', val: 'client'}]}
      if(val){
        q = {filters:[{name: 'xtype', op:'ilike', val: 'client'}, {or: [{name: 'name', op:'ilike', val: val}, {name:'code', op: 'ilike', val: val}]}]}
      }
      this.$http.get('/warehouse/partner?q='+JSON.stringify(q)).then(function(resp){
          env.partners = resp.data.objects
      })
    },
    select_partner0(val, option){
      var env = this
      for(var i=0;i<env.partners.length;i++){
        if(env.partners[i].code==val){
            env.partner_code = env.partners[i].code
            env.order_new.partner_name = env.partners[i].name
        }
      }
      return false
    },
    select_partner1(val, option){
      var env = this
      for(var i=0;i<env.partners.length;i++){
        if(env.partners[i].code==val){
            env.partner_code = env.partners[i].code
            env.partner_name = env.partners[i].name
        }
      }
      return false
    },
    //end

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

    // 格式化，翻译
    translate(key, val){
      if (this.$store.config[key]){
        val = this.$store.config[key][val] || val
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
      
      env.$http.get('/stockout/stockout?q='+JSON.stringify(q)).then(function(resp){
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
.w135{width: 135px;}
.print{display: none;}
.print2{display: none;}
.input-label{width:100px;line-height: 32px;}
</style>
