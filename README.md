# MT-WMS系统前端

MT-WMS 是开源的WMS(仓储管理系统)
遵循Apache License 2.0协议，前后端分离，可以支持多仓多货主，订单入库出库, 波次合并拣货出库.

系统可以当作WMS来使用, 管理货物; 也可以充当ERP来使用, 进行进销存管理. 电商用户可以自行开发对接奇门QIMEN, 京东JD等电商的接口, 接收平台订单. 也可以联系作者进行功能定制, 添加新的统计图表等. 添加BOM功能和相应的生产流程后, 亦可充当MES使用. 定制系统请联系(QQ 3527477665)

[MT-WMS后端项目地址](https://github.com/shuxiang/MT-WMS)

[文档地址](https://www.m-front.cn/docs#/dash)

线上测试用户信息: 公司 test 用户名 test  密码 123456 [线上测试帐户登录地址](https://wms.m-front.cn/auth/login)

线上免费注册即可使用[免费注册地址](https://wms.m-front.cn/auth/register)


## 开发运行/部署


### 环境初始化
前端版本 VUE 2.6.11 antd-design-vue 1.6.2


```
npm install
npm run serve
npm run build
```

### 部署
修改main.js的baseURL的地址, 或自行添加环境区分文件
建议配置Nginx进行前端文件的处理
