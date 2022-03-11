<template>
  <div class="box">
    <a-row>
      <a-alert type="error" message="您的密码过于简单, 请修改您的密码" v-if="$store.need_change_pwd"/>
      <a-col :span="18" style="padding-right:20px;padding-top:20px;">
        <a-row v-if="$store.vr_stock || $store.vr_manager">
          <a-col :span="12" style="padding-right:10px;">
            <a-card  :bodyStyle="bodyStyle">
              <span slot="title"><router-link :to="{ name: 'StockinScanRFID' }">入库单</router-link></span>
              <a-card-grid style="width:100%;text-align:left;">
                <div id="stockin_pie" style="height:280px;"></div>
              </a-card-grid>
            </a-card>
          </a-col>
          <a-col :span="12" style="padding-left:10px;">
            <a-card  :bodyStyle="bodyStyle">
              <span slot="title"><router-link :to="{ name: 'StockoutScanRFID' }">出库单</router-link></span>
              <a-card-grid style="width:100%;text-align:left;">
                <div id="stockout_pie" style="height:280px;"></div>
              </a-card-grid>
            </a-card>
          </a-col>
        </a-row>

        <a-row v-if="$store.vr_manager || $store.vr_finance">
          <a-col :span="24" >
            <a-card title="应付款(金额)"  :bodyStyle="bodyStyle">
              <a-card-grid style="width:100%;text-align:left;">
                <div id="pay_line" style="height:280px;"></div>
              </a-card-grid>
            </a-card>
          </a-col>
        </a-row>

        <a-row v-if="$store.vr_manager || $store.vr_finance">
          <a-col :span="24" >
            <a-card title="应收款(金额)"  :bodyStyle="bodyStyle">
              <a-card-grid style="width:100%;text-align:left;">
                <div id="recv_line" style="height:280px;"></div>
              </a-card-grid>
            </a-card>
          </a-col>
        </a-row>
      </a-col>

      <a-col :span="6" style="margin-top:20px;">

        <div class="box-white">
          <a-row>
            <div class="span-top">
              <span>快捷入口</span>
            </div>
          </a-row>
          <a-row>
            <a-col :span="8" class="quick-ico">
              <a href="javascript:;"  @click="jump_to_url('/stockin/StockinList')">
              <img src="/static/img/gn_rk.png"><br>
              <span>入库单</span>
              </a>
            </a-col>
            <a-col :span="8" class="quick-ico">
              <a href="javascript:;"  @click="jump_to_url('/stockout/StockoutList')">
              <img src="/static/img/gn_ck.png"><br>
              <span>出库单</span>
              </a>
            </a-col>
            <a-col :span="8" class="quick-ico">
              <a href="javascript:;"  @click="jump_to_url('/inv/query')">
              <img src="/static/img/gn_kccx.png"><br>
              <span>库存查询</span>
              </a>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="8" class="quick-ico" >
              <a href="javascript:;"  @click="jump_to_url('/inv/count')">
              <img src="/static/img/gn_pjb.png"><br>
              <span>盘点单</span>
              </a>
            </a-col>
            <a-col :span="8" class="quick-ico">
              <a href="javascript:;"  @click="jump_to_url('/async/query')">
              <img src="/static/img/gn_pjb.png"><br>
              <span>导入导出</span>
              </a>
            </a-col>
          </a-row>

          <a-row v-if="$store.vr_manager || $store.vr_finance">
            <a-col :span="8" class="quick-ico">
              <a href="javascript:;"  @click="jump_to_url('/finance/FinanceList')">
              <img src="/static/img/gn_cwtj.png"><br>
              <span>所有费用</span>
              </a>
            </a-col>
            <a-col :span="8" class="quick-ico" v-if="$store.vr_manager || $store.vr_finance">
              <a href="javascript:;"  @click="jump_to_url('/finance/FinanceSummary')">
              <img src="/static/img/gn_cwtj.png"><br>
              <span>款项汇总</span>
              </a>
            </a-col>
          </a-row>
        </div>

        <div class="box-white">
          <a-row>
            <a-col :span="24">
              <a-row>
                <div style="margin-bottom:20px;" class="span-top">
                  <span>库存告警</span>
                </div>
              </a-row>
              <a-row>
                <a-col :span="8">
                  <a-statistic title="可用库存总数" :value="inv.all" :value-style="{ color: '#666666' }" >
                  </a-statistic>
                </a-col>
                <a-col :span="8">
                  <a-statistic title="高库存告警" :value="inv.high" :value-style="{ color: '#cf1322' }" >
                  </a-statistic>
                </a-col>
                <a-col :span="8">
                  <a-statistic title="低库存告警" :value="inv.low" :value-style="{ color: '#feb64d' }" >
                  </a-statistic>
                </a-col>
              </a-row>
            </a-col>
          </a-row>
        </div>

      </a-col>
    </a-row>

  </div>
</template>

<script>
import echarts from 'echarts'
export default {
  name: 'Dash',
  data () {
    return {
      headStyle: {'background-color':'#efefef'},
      bodyStyle: {'font-size': '20px'},
      inv: {},
      stock: {},
      sale: {},
      purchase: {},
    }
  },
  methods:{
    jump_to_url(url){
      this.$router.push({path:url})
    },

    // load charts
    load_charts(){
      var env = this

      env.$http.get('/chart/order/count').then(function(resp){
        env.inv = resp.data.inv
        env.stock = resp.data.stock

        env.sale = resp.data.sale
        env.purchase = resp.data.pc

        // ---------- stockin --------
        var data1 = [
                  {value:resp.data.in.create, name:'未处理'},
                  {value:resp.data.in.doing, name:'处理中'},
                  {value:resp.data.in.done, name:'已完成'},
                  {value:resp.data.in.cancel, name:'已取消'},
              ]
        var title1 = {
          textStyle: {color:'#666666'},
          text: resp.data.in.all,
          textAlign:'center',
          subtext: '总单数',
          top: 'middle',
          left: '49%',
        }
        var legend1 = ['未处理', '处理中', '已完成', '已取消']
        env.$nextTick(function (){
          env.new_pie_chart('stockin_pie', title1, legend1, data1)
        })
        // -------- stockout --------
        var data2 = [
                  {value:resp.data.out.create, name:'未处理'},
                  {value:resp.data.out.doing, name:'处理中'},
                  {value:resp.data.out.done, name:'已完成'},
                  {value:resp.data.out.cancel, name:'已取消'},
              ]
        var title2 = {
          textStyle: {color:'#666666'},
          text: resp.data.out.all,
          textAlign:'center',
          subtext: '总单数',
          top: 'middle',
          left: '49%',
        }
        var legend2 = ['未处理', '处理中', '已完成', '已取消']
        env.$nextTick(function (){
          env.new_pie_chart('stockout_pie', title2, legend2, data2)
        })
      })

      // pay
      env.$http.get('/chart/money/count/pay').then(function(resp){
        var legend = ['应付总额', '实付总额', '未付总额']
        var xaxis = resp.data.xaxis
        var data = [
              {
                  name: '应付总额',
                  type: 'line',
                  stack: '总额',
                  data: resp.data.amount_list,
              },
              {
                  name: '实付总额',
                  type: 'line',
                  stack: '总额',
                  data: resp.data.real_list,
              },
              {
                  name: '未付总额',
                  type: 'line',
                  stack: '总额',
                  data: resp.data.un_list,
              },
          ]
        env.$nextTick(function (){
          env.new_line_chart('pay_line', '', legend, xaxis, data)
        })
      })

      // recv
      env.$http.get('/chart/money/count/recv').then(function(resp){
        var legend = ['应收总额', '实收总额', '未收总额']
        var xaxis = resp.data.xaxis
        var data = [
              {
                  name: '应收总额',
                  type: 'line',
                  stack: '总额',
                  data: resp.data.amount_list,
              },
              {
                  name: '实收总额',
                  type: 'line',
                  stack: '总额',
                  data: resp.data.real_list,
              },
              {
                  name: '未收总额',
                  type: 'line',
                  stack: '总额',
                  data: resp.data.un_list,
              },
          ]
        env.$nextTick(function (){
          env.new_line_chart('recv_line', '', legend, xaxis, data)
        })
      })
    },
    // new pie chart
    new_pie_chart(id, title, legend, data){
      var env = this
      var option = {
          title: title,
          color: ['#60acfc', '#32d3eb', '#5bc49f', '#feb64d', '#ff7c7c', '#9287e7'],
          tooltip: {
              trigger: 'item',
              formatter: '{b}: {c} ({d}%)'
          },
          legend: {
              orient: 'vertical',
              left: 10,
              top: 'middle',
              data: legend, //['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
          },
          series: [
              {
                  name: title,//'访问来源',
                  type: 'pie',
                  radius: ['50%', '70%'],
                  avoidLabelOverlap: false,
                  label: {
                      show: false,
                      position: 'center'
                  },
                  emphasis: {
                      label: {
                          show: true,
                          fontSize: '30',
                          fontWeight: 'bold'
                      }
                  },
                  labelLine: {
                      show: false
                  },
                  data: data,
              }
          ]
      }
      var dom = document.getElementById(id)
      if(dom){
        var chart = echarts.init(dom)
        chart.setOption(option)
      }
    },
    // new line chart
    new_line_chart(id, title, legend, xaxis, data){
      var option = {
          tooltip: {
              trigger: 'axis'
          },
          legend: {
              data: legend,
          },
          grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
          },
          toolbox: {
              feature: {
                  saveAsImage: {}
              }
          },
          xAxis: {
              type: 'category',
              boundaryGap: false,
              data: xaxis
          },
          yAxis: {
              type: 'value'
          },
          series: data,
      };
      var dom = document.getElementById(id)
      if(dom){
        var chart = echarts.init(dom)
        chart.setOption(option)
      }
    },
    // new bar chart
    new_bar_chart(id, title, legend, xaxis, data, color){
      color = color || '#3398DB'
      var option = {
          color: [color],
          tooltip: {
              trigger: 'axis',
              axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                  type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
              }
          },
          legend: {
              data: legend,
          },
          grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
          },
          xAxis: {
              type: 'category',
              data: xaxis,
              axisTick: {
                alignWithLabel: true
              },
          },
          yAxis: {
              type: 'value',
              minInterval: 1,
          },
          series: [{
              data: data,
              type: 'bar',
              barWidth: '40%',
          }]
      };
      var dom = document.getElementById(id)
      if(dom){
        var chart = echarts.init(dom)
        chart.setOption(option)
      }
    },
  },
  // before render
  created:function() {
    var env = this
    if(env.$store.has_agent_perm){
      this.$router.push({path:'/system/company'})
    }
  },
  // after render
  mounted: function(){
    var env = this
    if(!env.$store.has_agent_perm){
        env.load_charts()
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.ant-card {margin: 0 0px 10px 0px;}
.ant-card-head {background-color: #efefef !important;}
.box{background-color:#efefef;}
.box-white{background-color:white;margin-bottom:20px;border-radius:10px;}
.span-top{padding: 5px 10px 5px 10px;font-size: 16px;border: 1px #efefef solid;font-weight:600;}
.box-white .ant-statistic{margin-left:10px;}

.quick-ico{padding:5px;margin-top:20px;text-align:center;}
.quick-ico img{width:60px;border-radius:30px;margin-bottom:10px;}
.quick-ico span{font-weight:400;}

.quick div{text-align:center;font-size:16px;}
.quick img{border-radius:10px;}
.quick .q-name{padding:10px;}
.quick a{width: 100px;display: block;margin: 0px auto;}
.quick.link a{display: inline;}
.quick .q-box{float:left;display:block;width:80px;height:80px;background-color:#f7faf9;border-radius:10px;margin-right:10px;}
.quick .q-box span{font-size:27px;}
.quick .q-box .q-name{font-size:14px;color:#666;}
/* ['#60acfc', '#32d3eb', '#5bc49f', '#feb64d', '#ff7c7c', '#9287e7']*/
.c1{color:#666666;}.c2{color:#cf1322;}.c3{color:#feb64d;}.c4{color:#5bc49f;}
</style>
