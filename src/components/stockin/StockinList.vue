<template>
  <div>
    <div>
        <a-row>
          <a-col :span="6">
            <a-breadcrumb style="padding:20px 20px 20px 0px;">
              <a-breadcrumb-item >仓库管理</a-breadcrumb-item>
              <a-breadcrumb-item title="使用快速入库，分配库位与填写收货数量，确认入库后，直接增加库存记录">入库单</a-breadcrumb-item>
            </a-breadcrumb>
          </a-col>
          <a-col :span="18">
            <a-button @click="new_order()" type="primary" style="margin:15px 0;">新建</a-button>
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
              <a-select :defaultValue="'purchase'" style="width: 120px"  v-model="current_order_type" >
                    <a-select-option :value="item.value" v-for="item in options.stockin_xtype" v-bind:key="item.value">{{item.text}}</a-select-option>
              </a-select>
              <span>  供应商: </span>
              <a-auto-complete placeholder="供应商" @focus="handle_search_partner()" optionLabelProp="value" :defaultValue="''" @change="handle_search_partner" :backfill="true" v-model="partner_code">
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
              <span slot="action" slot-scope="text,record,index">
                  <a-button @click="add_order_line(index, record)" type="primary" style="float:right;" >添加</a-button>
              </span>
              <span slot="location_code" slot-scope="text,record">
                <a-auto-complete placeholder="入库库位" @focus="fetch_locations2(record)" @select="select_location2" optionLabelProp="value" :defaultValue="'STAGE'" @change="handle_search_location2" :backfill="true">
                  <template slot="dataSource">
                      <a-select-option v-for="item in locations" :key="item.value">
                        <strong>{{item.value}} </strong><span class="certain-search-item-count"> 库存{{ item.qty }}, 总库存{{item.qty_total}}</span>
                      </a-select-option>
                  </template>
                </a-auto-complete>
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
              <span slot="unit" slot-scope="text,record">
                  <a-input :allowClear="true" v-model="record.qty" placeholder="单位" style="width: 120px"></a-input>
              </span>
              <span slot="action" slot-scope="text,record,index">
                  <a-button @click="del_order_line(index, record)" type="primary" style="float:right;" >删除</a-button>
              </span>
              <span slot="location_code" slot-scope="text,record">
                <a-auto-complete placeholder="入库库位" @focus="fetch_locations2(record)" @select="select_location2" optionLabelProp="value" :defaultValue="record.location_code || 'STAGE'" @change="handle_search_location2" :backfill="true">
                  <template slot="dataSource">
                      <a-select-option v-for="item in locations" :key="item.value">
                        <strong>{{item.value}} </strong><span class="certain-search-item-count"> 库存{{ item.qty }}, 总库存{{item.qty_total}}</span>
                      </a-select-option>
                  </template>
                </a-auto-complete>
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
              <a-button style="float:right;" type="primary">提交</a-button>
          </a-popconfirm>
        </div>
      </a-modal>

      <a-modal title="订单行入库" :visible="dlg_putin" width="1000px" :footer="null" :keyboard="false" :maskClosable="false" @cancel="dlg_putin=false">
        <a-table bordered :dataSource="lines" :columns="putin_columns" :pagination="false" rowKey="id">
          <span slot="qty_receive" slot-scope="text,record">
            <a-input :allowClear="true" v-model="record.qty_receive" style="width:80px;" :id="'qty_receive'+record.id"/>
          </span>
          <span slot="location" slot-scope="text,record">
            <!--<a-input :allowClear="true" placeholder="库位码" v-model="record.location" style="width:120px;"/>-->
            <a-auto-complete placeholder="库位码" @focus="fetch_locations(record)" @select="select_location" optionLabelProp="value" :defaultValue="record.location_code || 'STAGE'" @change="handle_search_location" :backfill="true">
              <template slot="dataSource">
                  <a-select-option v-for="item in locations" :key="item.value">
                    <strong>{{item.value}} </strong><span class="certain-search-item-count"> 库存{{ item.qty }}, 总库存{{item.qty_total}}</span>
                  </a-select-option>
              </template>
            </a-auto-complete>
          </span>
          <span slot="lpn" slot-scope="text,record">
            <a-input :allowClear="true" placeholder="可不填" v-model="record.lpn" style="width:80px;" :id="'lpn'+record.id"/>
          </span>
        </a-table>
        <div class="dialog-footer">
          <a-button @click="do_putin()" style="float:right;" type="primary">确定入库</a-button>
          <a-button @click="dlg_putin=false" style="float:right;margin-right:20px;">取消</a-button>
        </div>
      </a-modal>


      <a-modal title="入库单明细" :visible="dlg_detail" @cancel="dlg_detail=false" width="1200px" :footer="null">
        <a-tabs defaultActiveKey="1" @change="load_order_trans">
          <a-tab-pane tab="订单行明细" key="1">
            <div>
              <a-input :allowClear="true" v-model="current_good" id="current_good" @pressEnter="search_good" placeholder="货品码/条码/名称" style="margin-bottom:10px;width:400px;" />
              <a-button @click="search_good" style="margin-left:5px;margin-right:5px;" >搜索</a-button>
              <span class="red">  订单类型: </span>
              <a-select :defaultValue="'purchase'" style="width: 120px"  v-model="current_order_type" >
                    <a-select-option :value="item.value" v-for="item in options.stockin_xtype" v-bind:key="item.value">{{item.text}}</a-select-option>
              </a-select>
              <span>  供应商: </span>
              <a-auto-complete placeholder="供应商" @focus="handle_search_partner()" optionLabelProp="value" :defaultValue="''" @change="handle_search_partner" :backfill="true" v-model="partner_code">
                <template slot="dataSource">
                    <a-select-option v-for="item in partners" :key="item.code">
                      <strong>{{item.code}} </strong><span class="certain-search-item-count">{{item.name}} {{item.tel}}</span>
                    </a-select-option>
                </template>
              </a-auto-complete>
              <span>  总价: <strong>¥{{order.price}}</strong></span>
            </div>
            <h4 style="display:block;font-weight:bold;">搜索结果：</h4>
            <a-table bordered :dataSource="new_goods" :columns="new_good_columns" :pagination="pagination2" rowKey="id" :rowClassName="new_goods_class" v-if="new_goods.length > 0" :scroll="{y: 500 }" @change="table_filter_sort2">
              <span slot="qty" slot-scope="text,record">
                  <a-input :allowClear="true" v-model="record.qty" placeholder="数量" style="width: 120px"></a-input>
              </span>
              <span slot="now_price" slot-scope="text,record">
                  <a-input :allowClear="true" v-model="record.now_price" placeholder="价格" style="width: 120px"></a-input>
              </span>
              <span slot="action" slot-scope="text,record,index">
                  <a-button @click="add_order_line(index, record)" type="primary" style="float:right;" >添加</a-button>
              </span>
              <span slot="location_code" slot-scope="text,record">
                <a-auto-complete placeholder="入库库位" @focus="fetch_locations2(record)" @select="select_location2" optionLabelProp="value" :defaultValue="'STAGE'" @change="handle_search_location2" :backfill="true">
                  <template slot="dataSource">
                      <a-select-option v-for="item in locations" :key="item.value">
                        <strong>{{item.value}} </strong><span class="certain-search-item-count"> 库存{{ item.qty }}, 总库存{{item.qty_total}}</span>
                      </a-select-option>
                  </template>
                </a-auto-complete>
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
              <span slot="unit" slot-scope="text,record">
                  <a-input :allowClear="true" v-model="record.qty" placeholder="单位" style="width: 120px"></a-input>
              </span>
              <span slot="location_code" slot-scope="text,record">
                <a-auto-complete placeholder="入库库位" @focus="fetch_locations2(record)" @select="select_location2" optionLabelProp="value" :defaultValue="record.location_code || 'STAGE'" @change="handle_search_location2" :backfill="true">
                  <template slot="dataSource">
                      <a-select-option v-for="item in locations" :key="item.value">
                        <strong>{{item.value}} </strong><span class="certain-search-item-count"> 库存{{ item.qty }}, 总库存{{item.qty_total}}</span>
                      </a-select-option>
                  </template>
                </a-auto-complete>
              </span>
              <span slot="action" slot-scope="text,record,index">
                  <a-button @click="del_order_line(index, record)" type="primary" style="float:right;" v-if="!record.id">删除</a-button>
                  <a-button @click="delete_order_line(index, record)" type="primary" style="float:right;" v-if="record.id && order.state=='create'">删除</a-button>
              </span>
            </a-table>
            <div class="print">
              <div class="barcode"></div>
              <table border="1" cellspacing="0">
                <thead>
                  <tr>
                    <td>货品码</td>
                    <td>条码</td>
                    <td>名称</td>
                    <td>预期数</td>
                    <td>已收数</td>
                    <td>未收数</td>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in lines" v-bind:key="item.id">
                    <td>{{ item.sku }}</td>
                    <td>{{ item.barcode }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.qty }}</td>
                    <td>{{ item.qty_real }}</td>
                    <td>{{ item.qty - item.qty_real }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="dialog-footer">
              <a-button @click="print_lines()" style="float:right;margin-left:10px;">打印入库单明细</a-button>
              <a-popconfirm
                title="确定要修改订单吗?"
                @confirm="do_submit_edit()"
                okText="确定"
                cancelText="取消"
              >
                <a-button style="float:right;margin-left:10px;" type="primary" v-if="order.state=='create'">提交修改</a-button>
              </a-popconfirm>
              <a-popconfirm
                title="确定要取消吗?"
                @confirm="cancel_order()"
                okText="确定"
                cancelText="取消"
              >
                <a-button v-if="order.state!='cancel' && order.state!='done'" style="float:right;margin-left:10px;" type="primary">取消</a-button>
              </a-popconfirm>
            </div>
          </a-tab-pane>
          <a-tab-pane tab="入库记录" key="2" forceRender>
            <a-table bordered :dataSource="trans" :columns="trans_columns" rowKey="id" :pagination="false">
            </a-table>
            <div class="print2">
              <div class="barcode2"></div>
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
                </tbody>
              </table>
            </div>
            <div class="dialog-footer">
              <a-button @click="print_inlines()" style="float:right;">打印入库记录</a-button>
              <!--
              <a-button @click="to_move_order()" v-if="trans.length > 0 && !order.move_order_code" style="float:right;margin-right:20px;" type="primary">转移库单</a-button>-->
              <a-popconfirm
                  title="确定要转移库单吗?"
                  @confirm="to_move_order()"
                  okText="确定"
                  cancelText="取消"  v-if="trans.length > 0 && !order.move_order_code"
                >
                  <a-button style="float:right;margin-right:20px;" type="primary">转移库单</a-button>
              </a-popconfirm>
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
            <a-button @click="update_order_info()" style="float:right;margin-top:10px;" v-if="order.state=='create'">更新订单信息</a-button>
          </a-tab-pane>
        </a-tabs>
      </a-modal>

      <a-form layout="inline" v-if="owner_conf.is_enable_search_bar" style="padding-left:15px;background-color:rgb(235,235,235);">
        <a-form-item label="单号" >
          <a-input :allowClear="true"  placeholder="单号" v-model="query.order_code" style="width:160px;"/>
        </a-form-item>
        <a-form-item label="供应商">
          <a-auto-complete placeholder="供应商" @focus="handle_search_partner()" optionLabelProp="value" :defaultValue="''" @change="handle_search_partner" :backfill="true" v-model="query.partner_code" :allowClear="true">
            <template slot="dataSource">
                <a-select-option v-for="item in partners" :key="item.code">
                  <strong>{{item.code}} </strong><span class="certain-search-item-count">{{item.name}} {{item.tel}}</span>
                </a-select-option>
            </template>
          </a-auto-complete>
        </a-form-item>
        <a-form-item label="类型">
          <a-select :defaultValue="query.xtype"  v-model="query.xtype" style="width:120px;" :allowClear="true">
            <a-select-option value="" v-bind:key="''">--所有--</a-select-option>
            <a-select-option :value="item.value" v-for="item in options.stockin_xtype" v-bind:key="item.value">{{item.label}}</a-select-option>
          </a-select> 
        </a-form-item>
        <a-form-item label="子类型">
          <a-select :defaultValue="query.order_type"  v-model="query.order_type" style="width:120px;" :allowClear="true">
            <a-select-option value="" v-bind:key="''">--所有--</a-select-option>
            <a-select-option :value="item.value" v-for="item in options.sub_in_type" v-bind:key="item.value">{{item.label}}</a-select-option>
          </a-select> 
        </a-form-item>
        <a-form-item label="状态">
          <a-select :defaultValue="query.state"  v-model="query.state" style="width:120px;" :allowClear="true">
            <a-select-option value="" v-bind:key="''">--所有--</a-select-option>
            <a-select-option :value="item.value" v-for="item in options.stockin_state" v-bind:key="item.value">{{item.label}}</a-select-option>
          </a-select> 
        </a-form-item>
        <a-form-item label="创建时间">
          <a-date-picker :allowClear="true"
            v-model="query.create_time1"
            format="YYYY-MM-DD"
            placeholder="start" style="width:120px;"
          /> ~
          <a-date-picker :allowClear="true"
            v-model="query.create_time2"
            format="YYYY-MM-DD"
            placeholder="end" style="width:120px;"
          />
        </a-form-item>
        <a-form-item>
          <a-button icon="search" @click="search_query">查询</a-button>
        </a-form-item>
      </a-form>

      <a-table :columns="object_columns"  :dataSource="objects"  bordered rowKey="id" :pagination="pagination" @change="table_filter_sort">
        <span slot-scope="text,record" slot="order_code">
          <router-link :to="{ name: 'StockinOne', params: {order_id: record.id} }">
              {{ record.order_code }}
          </router-link>
        </span>
        <span slot-scope="text,record" slot="partner_code">
          <span>{{ record.partner_name || record.partner_code }}</span>
        </span>
        <span slot-scope="text,record" slot="is_passback">
          <span>{{ translate('stockin_is_passback', record.is_passback) }}</span>
        </span>
        <span slot-scope="text,record" slot="xtype">
          <span>{{ translate('stockin_xtype', record.xtype) }}</span>
        </span>
        <span slot-scope="text,record" slot="order_type">
          <span>{{ translate('sub_in_type', record.order_type) }}</span>
        </span>
        <span slot-scope="text,record" slot="state">
          <span>{{ translate('stockin_state', record.state) }}</span>
        </span>
        <span slot-scope="text,record" slot="partner_code">
          <span>{{ record.partner_name || record.partner_code }}</span>
        </span>
        <span slot-scope="text,record,index" slot="action"><!--
            <a-button @click="putin_dlg(index, record)" v-if="record.state=='create' || record.state=='part'" style="margin-right:10px">入库</a-button>-->
            <router-link :to="{ name: 'StockinOne', params: { order_id: record.id }}">
                <a-button style="margin-right:10px" :type="record.state!='done' && record.state!='cancel'? 'primary':null">进入</a-button>
            </router-link>
            <a-button @click="order_detail( index, record)" style="margin-right:10px" >明细</a-button>
            <a-button @click="export_excel( index, record)" style="margin-right:10px">导出</a-button>
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
  name: 'StockinList',
  data () {
    return {
      partners: [],

      object_columns: [
        {title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id)}, 
        {title: '单号', key: 'order_code', dataIndex: 'order_code',
        }, 
        {title: '类型', key: 'xtype', dataIndex: 'xtype', scopedSlots: { customRender: 'xtype' }, },
        {title: '子类型', key: 'order_type', dataIndex: 'order_type', scopedSlots: { customRender: 'order_type' }, },
        {title: '状态', key: 'state', dataIndex: 'state', scopedSlots: { customRender: 'state' }, },
        {title: '供应商', key: 'partner_code', dataIndex: 'partner_code', 
          scopedSlots: {customRender: 'partner_code', },
        }, 
        //{title: '回传', key: 'is_passback', dataIndex: 'is_passback', scopedSlots: { customRender: 'is_passback' }, },
        {title: '创建时间', key: 'create_time', dataIndex: 'create_time', 
        },
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: { customRender: 'action' },}
      ],
      line_columns: [
        //{title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id), rowClassName: 'no-print'}, 
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '名称', key: 'name', dataIndex: 'name'}, 
        {title: '预期数', key: 'qty', dataIndex: 'qty'}, 
        {title: '已收数', key: 'qty_real', dataIndex: 'qty_real'}, 
        {title: '未收数', key: 'qty_not', dataIndex: 'qty_not', scopedSlots: { customRender: 'qty_not' }}, 
        //{title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code',}, 
        {title: '价格', key: 'price', dataIndex: 'price',}, 
        // {title: '质量类型', key: 'quality_type', dataIndex: 'quality_type', rowClassName: 'no-print'}, 
        // {title: '生产日期', key: 'product_date', dataIndex: 'product_date', rowClassName: 'no-print'}, 
        // {title: '过期日期', key: 'expire_date', dataIndex: 'expire_date', rowClassName: 'no-print'}, 
        // {title: '批次号', key: 'batch_code', dataIndex: 'batch_code', rowClassName: 'no-print'},
        {title: '单位', key: 'unit', dataIndex: 'unit', }
      ],
      putin_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        //{title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '名称', key: 'name', dataIndex: 'name'}, 
        {title: '预期数量', key: 'qty', dataIndex: 'qty'}, 
        {title: '已收数量', key: 'qty_real', dataIndex: 'qty_real'}, 
        {title: '收取数量', key: 'qty_receive', dataIndex: 'qty_receive', scopedSlots: { customRender: 'qty_receive' }}, 
        {title: '收取库位', key: 'location', dataIndex: 'location', scopedSlots: {customRender: 'location'}}, 
        {title: '收取容器', key: 'lpn', dataIndex: 'lpn', scopedSlots: {customRender: 'lpn'}}, 
      ],
      trans_columns: [
        //{title: 'ID', key: 'id', dataIndex: 'id', sorter: (a, b)=>(a.id-b.id), }, 
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        {title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '名称', key: 'name', dataIndex: 'name'}, 
        {title: '预期数量', key: 'qty', dataIndex: 'qty'}, 
        {title: '已收数量', key: 'qty_real', dataIndex: 'qty_real'}, 
        {title: '库位', key: 'location_code', dataIndex: 'location_code',  }, 
        {title: '容器', key: 'lpn', dataIndex: 'lpn', }, 
        {title: '操作人', key: 'user_code', dataIndex: 'user_code',}, 
        {title: '操作时间', key: 'create_time', dataIndex: 'create_time', }, 
      ],

      objects: [],
      order: {sender_info:{}, receiver_info: {}, date_planned2:null},
      lines: [],
      trans: [],
      line: {},

      dlg_putin: false,
      dlg_detail: false,
      putin_title: '入库',
      has_manager_perm:false,

      // new order
      order_new: {receiver_info:{}, sender_info: {}},
      dlg_new: false,
      new_goods:[],
      new_good_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        //{title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '货品名', key: 'name', dataIndex: 'name'}, 
        //{title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code', scopedSlots: {customRender: 'supplier_code'}}, 
        {title: '数量', key: 'qty', dataIndex: 'qty', scopedSlots: {customRender: 'qty'}, width:160,},
        {title: '库位', key: 'location_code', dataIndex: 'location_code', scopedSlots: {customRender: 'location_code'}, width:180,},
        {title: '上次价格', key: 'last_in_price', dataIndex: 'last_in_price', scopedSlots: {customRender: 'last_in_price'}},
        {title: '价格', key: 'now_price', dataIndex: 'now_price', scopedSlots: {customRender: 'now_price'}, width:160,},
        {title: '单位', key: 'unit', dataIndex: 'unit', width:60,}, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: {customRender: 'action'}}, 
      ],
      new_lines: [],
      new_line_columns: [
        {title: '货品码', key: 'sku', dataIndex: 'sku'}, 
        //{title: '条码', key: 'barcode', dataIndex: 'barcode'}, 
        {title: '货品名', key: 'name', dataIndex: 'name'}, 
        //{title: '供应商', key: 'supplier_code', dataIndex: 'supplier_code', scopedSlots: {customRender: 'supplier_code'}}, 
        {title: '数量', key: 'qty', dataIndex: 'qty', scopedSlots: {customRender: 'qty'}, width:160,},
        {title: '库位', key: 'location_code', dataIndex: 'location_code', scopedSlots: {customRender: 'location_code'}, width:180,},
        {title: '价格', key: 'price', dataIndex: 'price', scopedSlots: {customRender: 'price'}, width:160,},
        {title: '单位', key: 'unit', dataIndex: 'unit', width:60,}, 
        {title: '操作', key: 'action', dataIndex: 'action', scopedSlots: {customRender: 'action'}}, 
      ],
      new_lines_ids: [],
      current_good: '',
      current_order_type: '',
      partner_code: '',
      
      locations_dict: {},
      locations: [],

      filter: {},
      query: {},
      like_filters: ['partner_code', 'order_code'],
      sort: null,
      create_time_filter_icon:false,
      erp_order_code_filter_icon:false,
      order_code_filter_icon:false,
      partner_code_filter_icon:false,

      pagination: {defaultPageSize:20, pageSize: 20, current: 1, total: 20, showSizeChanger: true, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`,},

      pagination2: {defaultPageSize:10, pageSize: 10, current: 1, total: 20, showSizeChanger: false, showTotal: (total, range) => `${range[0]}到${range[1]}条 共${total}条`},

      options: {},
    }
  },
  methods:{
    // 入库记录转移库单
    to_move_order(){
      var env = this
      this.$http.post('/stockin/to_move/'+this.order.id).then(function(resp){
        if(resp.data.status=='success'){
          env.order.move_order_code = resp.data.move_order_code
          env.$message.success("成功创建移库单")
        }else{
          env.$message.error(resp.data.msg)
        }
      })
    },
    //------  新建单子 -------
    new_order(){
      this.dlg_new = true
      this.current_order_type = 'purchase'
      this.current_good = ''
      this.new_goods = []
      this.new_lines = []
      this.new_lines_ids = []
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
          new_line.id = undefined
          new_line.price = new_line.now_price
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
      this.order_new.xtype = this.current_order_type
      this.order_new.partner_code = this.partner_code
      if(this.order_new.date_planned2){
        this.order_new.date_planned = new Date(this.order_new.date_planned2).format('yyyy-MM-dd')
      }else{
        this.order_new.date_planned = null
      }
      
      var data = [this.order_new] //[{'lines':env.new_lines, 'xtype': this.current_order_type}]
      this.$http.post('/stockin/stockin', data).then(function(resp){
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
      var url = '/inv/good/v2?with_inv_qty=true&qtype=in&q2='+this.current_good
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
      if(record.now_price && record.now_price > record.last_in_price){
        return 'red-tb-row'
      }
      return ''
    },
    new_goods_class2(record, index){
      if(record.price && record.price > record.last_in_price){
        return 'red-tb-row'
      }
      return ''
    },
    //------ end 新建单子 -------

    delete_order_line(index, record){
      var env = this
      this.$http.delete('/stockin/'+env.order.id+'/line/'+record.id).then(function(resp){
        if(resp.data.status=='success'){
          env.new_lines.splice(index, 1)
          env.new_lines_ids.splice(index, 1)
          env.$message.success('删除成功')
        }else{
          env.$message.success('删除失败'+resp.data.msg)
        }
      })
    },

    update_order_info(){
      var env = this
      this.order.date_planned = new Date(this.order.date_planned2).format('yyyy-MM-dd')
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

    // 提交修改
    do_submit_edit(){
      var env = this
      // load order lines
      var data = {lines:this.new_lines, user_code:this.user_code, partner_code: this.partner_code, remark: this.remark, xtype:this.current_order_type}
      this.$http.put('/stockin/stockin/one/'+this.order.id, data).then(function(resp){
        if(resp.data.status=='success'){
          env.$message.success('成功修改入库单明细!')
          env.search()
          env.dlg_detail = false
        }else{
          env.$message.error('修改入库单明细失败!')
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
              title: '入库单明细: '+this.order.erp_order_code,
              doctype: '<!doctype html>'
      })
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
    // 导出入库单
    export_excel(index, order){
      var env = this
      var q = {filters: [{name: 'order_code', op: '==', val: order.order_code}]}

      var data = {
          name: '入库单导出.xlsx', 
          xtype: 'export', 
          code: 'export_stockin', 
          func: 'blueprints.auth.tasks.export_stockin:export_stockin', 
          func_name: '入库单导出'}

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
          name: '入库单.xlsx', 
          xtype: 'export', 
          code: 'export_stockin', 
          func: 'blueprints.auth.tasks.export_stockin:export_stockin', 
          func_name: '入库单导出'}

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

    // 供应商推荐
    handle_search_partner(val){
      var env = this
      var q = {filters:[{name:'xtype', op: 'ilike', val: 'supplier'}]}
      if(val){
        q = {filters:[{name:'xtype', op: 'ilike', val: 'supplier'}, {or: [{name: 'name', op:'ilike', val: val}, {name:'code', op: 'ilike', val: val}]}]}
      }
      this.$http.get('/warehouse/partner?q='+JSON.stringify(q)).then(function(resp){
          env.partners = resp.data.objects
      })
    },
    //end

    // 新库位推荐
    fetch_locations(line){
      var env = this
      var lineid = line.id
      this.line = line
      if (!env.locations_dict[lineid] || env.locations_dict[lineid].length == 0){
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
    handle_search_location(val){
      var env = this
      var lineid = this.line.id
      this.$http.get('/stockin/recommend/location/'+lineid+'?q='+val).then(function(resp){
          env.locations_dict[lineid] = resp.data
          env.locations = resp.data
      })
    },

    fetch_locations2(line){
      var env = this
      var lineid = line.sku
      this.line = line
      if (!env.locations_dict[lineid] || env.locations_dict[lineid].length == 0){
        this.$http.get('/stockin/recommend/location/sku/'+lineid).then(function(resp){
          env.locations_dict[lineid] = resp.data
          env.locations = resp.data
        })
      }
      this.locations = this.locations_dict[lineid]
    },
    select_location2(val, option){
      return this.line.location_code = val
    },
    handle_search_location2(val){
      var env = this
      var lineid = this.line.sku
      this.$http.get('/stockin/recommend/location/sku/'+lineid+'?q='+val).then(function(resp){
          env.locations_dict[lineid] = resp.data
          env.locations = resp.data
      })
    },
    // end

    // 订单入库
    dlg_close(){
      this.dlg_putin = false
    },

    putin_dlg(index, order){
      var env = this
      if(order.state != 'create' && order.state != 'part'){
        env.$message.warning('该单已经收货完成，不能再收货！', 3)
        return
      }
      this.order = order
      env.dlg_putin = true

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

    // 入库
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
            if(resp.data.status=='success'){
              env.$message.success('入库成功')
              // reload lines
              env.load_lines()
              // reload objects
              env.load_objects()
              env.dlg_putin = false
            }else{
              env.$message.error(resp.data.msg)
            }
        })
      }else{
        env.$message.error('请填写数据')
      }
    },


    // 订单明细
    order_detail(index, order){
      var env = this
      env.new_goods = []
      env.order = order
      env.lines = []
      env.trans = []
      env.new_lines_ids = []
      env.current_order_type = order.xtype
      env.partner_code = order.partner_code
      env.$http.get('/stockin/putin/'+order.id).then(function(resp){
        env.lines = resp.data.lines
        env.order.price = resp.data.order.price
        // new; load to detail
        env.new_lines = JSON.parse(JSON.stringify(env.lines))
        for(var i=0;i<env.lines.length;i++){
          env.new_lines_ids.push(env.lines[i].sku)
        }
      })
      this.dlg_detail = true
      this.load_order_trans(2)
      this.order.date_planned2 = this.order.date_planned ? this.$moment(this.order.date_planned) : null
      $('.barcode').html('')
    },
    // 加载入库记录
    load_order_trans(tab, event){
      var env = this
      if((tab.name=='second' || tab=="2") && env.trans.length==0){
        this.$http.get('/stockin/trans/'+this.order.id+'?q={"limit":1000}').then(function(resp){
          env.trans = resp.data.objects
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
      //console.log(this.options)
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
      
      env.$http.get('/stockin/stockin?q='+JSON.stringify(q)).then(function(resp){
        env.objects = resp.data.objects

        env.pagination.total = resp.data.num_results
        env.pagination.current = resp.data.page
        env.pagination.pageSize = resp.data.per_page
      })
    },
    load_lines(){
      var env = this
      env.$http.get('/stockin/putin/'+env.order.id).then(function(resp){
        env.lines = resp.data
        env.order.price = resp.data.order.price
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
<style>
.print{display: none;}
.print2{display: none;}
.input-label{width:100px;line-height: 32px;}
.red-tb-row{background-color:#ffb3a7;}
</style>

