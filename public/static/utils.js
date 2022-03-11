function formatJSON(obj, indent) {
    var result = [];
    indent = (indent || '') + '  ';
    var type = $.isArray(obj)
        ? 'array' 
        : (obj === null)
            ? 'null'
            : typeof obj;
            
    switch (type) {
        case 'object':
            result.push('{ ');
            for (var i in obj) {
                result.push('"' + i + '" : ' + formatJSON(obj[i], indent) + ',');
            }
            var last = result.pop();
            result.push(last.substr(0, last.length - 1));
            result.push('}');
            break;
            
        case 'array':
            result.push('[ ');
            for (var i = 0; i < obj.length; i++) {
                result.push(formatJSON(obj[i], indent) + ',');
            }
            var last = result.pop();
            result.push(last.substr(0, last.length - 1));
            result.push(']');
            break;
            
        case 'string':
            result.push('"' + obj + '"');
            break;
            
        default:
            result.push(obj + '');
            break;
    }
    
     return result.join('\n' + indent);
}

// 格式化成金钱格式
Number.prototype.mfmt = function(c, d, t){
  var n = this, 
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
    j = (j = i.length) > 3 ? j % 3 : 0;
  return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 }

function mfmt(n, c, d, t){
  var s, i, j;
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
    j = (j = i.length) > 3 ? j % 3 : 0;
  return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}

Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

Date.prototype.addDate = function(day){
    this.setDate(this.getDate() + day)
    return this
}
// var date= new Date().format("yyyy-MM-dd");//Format("输入你想要的时间格式:yyyy-MM-dd,yyyyMMdd")


function cleanArray(actual) {
   const newArray = []
   for (let i = 0; i < actual.length; i++) {
     if (actual[i]) {
       newArray.push(actual[i])
     }
   }
   return newArray
}
// 把 对象(object/json) 变成url 参数
function to_querystring(json){
   if (!json) return ''
   return cleanArray(Object.keys(json).map(key => {
     if (json[key] === undefined) return ''
      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
   })).join('&')
}

function playOk(){
    var audio = new Audio("/static/audio/dong.wav");
    audio.volume = 1;
    audio.play();
}
function playErr(){
    var audio = new Audio("/static/audio/err.wav");
    audio.volume = 1;
    audio.play();
}


function PieChart(title, name, data){
  var option = {
      backgroundColor: '#ffffff',

      title: {
          text: title,
          left: 'center',
          top: 5,
          textStyle: {
              color: '#ccc'
          }
      },

      tooltip : {
          trigger: 'item',
          formatter: "{a} <br/>{b} : {c} ({d}%)"
      },

      // visualMap: {
      //     show: false,
      //     min: 80,
      //     max: 600,
      //     inRange: {
      //         colorLightness: [0, 1]
      //     }
      // },
      series : [
          {
              name: name,
              type:'pie',
              radius : '45%', // 图形大小
              // center: ['50%', '50%'],
              data:data, //.sort(function (a, b) { return a.value - b.value; }),
              // roseType: 'radius',
              // label: {
              //     normal: {
              //         textStyle: {
              //             color: 'rgba(255, 255, 255, 0.3)'
              //         }
              //     }
              // },
              // labelLine: {
              //     normal: {
              //         lineStyle: {
              //             color: 'rgba(255, 255, 255, 0.3)'
              //         },
              //         smooth: 0.2,
              //         length: 10,
              //         length2: 20
              //     }
              // },
              // itemStyle: {
              //     normal: {
              //         color: '#c23531',
              //         shadowBlur: 200,
              //         shadowColor: 'rgba(0, 0, 0, 0.5)'
              //     }
              // },

              // animationType: 'scale',
              // animationEasing: 'elasticOut',
              // animationDelay: function (idx) {
              //     return Math.random() * 200;
              // }
          }
      ]
  };
  return option;
}


function BarChart(title, legend, category, grid, ynames, data, interval){
  var yaxis = [] 
  for(var i=0; i<ynames.length; i++){
    yaxis.push({
              type: 'value',
              name: ynames[i],
              min: 0,
              // max: 250,
              // interval: inerval || 50,
              axisLabel: {
                  formatter: '{value}'
              }
          })
  }
  var option = {
      title: {
          text: title,
          left: 'center',
          top: 30,
          textStyle: {
              color: '#ccc'
          }
      },
      tooltip: {
          trigger: 'axis',
          axisPointer: {
              type: 'cross',
              crossStyle: {
                  color: '#999'
              }
          }
      },
      toolbox: {
          feature: {
              dataView: {show: true, readOnly: false},
              magicType: {show: true, type: ['line', 'bar']},
              restore: {show: true},
              saveAsImage: {show: true}
          }
      },
      legend: {
          data: legend
      },
      grid: grid, // 设高度
      xAxis: [
          {
              type: 'category',
              data: category,
              boundaryGap: false,
              axisPointer: {
                  type: 'shadow'
              }
          }
      ],
      yAxis: yaxis,
      series: data
  };
  return option;
}