$(function(){

  var option = {
    //url: '../sys/menu/list',
    url: 'http://localhost:8892/showTestResultByParam',
    pagination: true,	//显示分页条
    sidePagination: 'client',//服务器端分页,
    totalRows: 0, // server side need to set
    pageNumber: 1,
    pageSize: 10,
    pageList: [10, 25, 50, 100],
    //contentType: 'application/json',
    //dataType: 'jsonp',
    dataType: 'json',
    ajaxOptions: {},
    queryParams:queryParams,
    showRefresh: false,  //显示刷新按钮
    search: false,//是否显示表格搜索
    toolbar: '#toolbar',
    striped : true,     //设置为true会有隔行变色效果
    method:'post',
    contentType: "application/x-www-form-urlencoded",//要加上 application/json    application/x-www-form-urlencoded
    onLoadSuccess:function(){
      //鼠标悬停显示全部内容~
      $('.bootstrap-table tr td').each(function () {
        $(this).attr("title", $(this).text());
        $(this).css("cursor", 'pointer');
      });
    },

    columns: [
      {
        title: '序号',
        field: 'resultId',
        width: 40,
        formatter: function(value, row, index) {
          var pageSize = $('#mytable').bootstrapTable('getOptions').pageSize;
          var pageNumber = $('#mytable').bootstrapTable('getOptions').pageNumber;
          return pageSize * (pageNumber - 1) + index + 1;
        }
      },
      {checkbox:true},
      { title: '系统标识', field: 'systemFlag'},
      { title: '系统环境', field:'systemEnv'},
      { title: '接口名称', field: 'serviceId'}, 
      { title: '用户ID', field: 'merchId'}, 
      { title: '接口请求体', field: 'reqBody',formatter:operateOpinionFormatter}, 
      { title: '响应结果', field: 'result',formatter:operateOpinionFormatter}, 
      { title: '执行结果', field: 'ispass'},
      { title: '执行时间', field: 'createTime',formatter:changeDateFormat},
    ]};
  $('#mytable').bootstrapTable(option);
});

//格式化时间
function changeDateFormat(cellval) {
  if (cellval != null) {
    var d = new Date(cellval);
    var timestr = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
    return timestr;
  } else {
    return cellval;
  }
}

//请求体,响应结果字数超过20,悬浮
function  operateOpinionFormatter(value, row, index){
  if(value.length>5){
    return "<span title='"+value+"'>"+value.substring(0,30)+"..."+"</span>";
  }else{
    return "<span title='"+value+"'>"+value.substring(0,value.length)+"</span>";
  }
}

//请求服务数据时所传参数
function queryParams(queryParams){
  return{
    //pageSize: queryParams.limit,
    //pageIndex:queryParams.pageNumber,
    sysFlag:$('#sea_systemFlag').val(),
    sysEnv:$('#sea_systemEnv').val(),
    merchId:$('#sea_merchId').val(),
    serviceId:$('#sea_serviceId').val(),
    isPass:$('#sea_isPass').val(),
    startDate:$('#startDate').val(),
    endDate:$('#endDate').val(),
  }

  console.log(startDate);
  console.log(endDate);
}

//字符串转成Time(dateDiff)所需方法
function stringToTime(string){
  var f = string.split(' ', 2);
  var d = (f[0] ? f[0] : '').split('-', 3);
  var t = (f[1] ? f[1] : '').split(':', 3);
  return (new Date(
    parseInt(d[0], 10) || null,
    (parseInt(d[1], 10) || 1)-1,
    parseInt(d[2], 10) || null,
    parseInt(t[0], 10) || null,
    parseInt(t[1], 10) || null,
    parseInt(t[2], 10) || null
  )).getTime();
}
//计算时间差
function dateDiff(date1, date2){
  var type1 = typeof date1, type2 = typeof date2;
  if(type1 == 'string')
    date1 = stringToTime(date1);
  else if(date1.getTime)
    date1 = date1.getTime();
  if(type2 == 'string')
    date2 = stringToTime(date2);
  else if(date2.getTime)
    date2 = date2.getTime();
  return (date1 - date2) / (1000 * 60 * 60 * 24);//除1000是毫秒，不加是秒
}
//将字符串时间(yyyy-MM-dd HH:mm:ss)转换成毫秒
function getDateMillsByDateString(timeId){
  var timeStr = $("#" + timeId).val();
  var dateAndTimeArray = timeStr.split(" ");
  var dateArray = dateAndTimeArray[0].split("-");
  var timeArray = dateAndTimeArray[1].split(":");
  var date = new Date(dateArray[0],dateArray[1],dateArray[2],timeArray[0],timeArray[1],timeArray[2]);
  var dateMills = date.getTime();
  return dateMills;
}

function checkDate(){
  var startTime = $('#startDate').val();
  var endTime = $('#endDate').val();
  //如果选择开始或结束日期中的一个   则另外一个也需要选择
  if(startTime != null && (endTime == null || endTime == '')){
    layer.alert("结束时间不能为空")
    return false;
  }
  if(endTime != null && (startTime == null || startTime == '')) {
    layer.alert("开始时间不能为空")
    return false;
  }

  //开始时间和结束时间 时间间隔
  var startTimeMills = getDateMillsByDateString("startDate");
  var endTIimeMills =  getDateMillsByDateString("endDate");

  if(startTimeMills < endTIimeMills ){
    return true;
  }else{
    layer.alert("起始时间需要小于结束时间");
    return false;
  }
}



var ztree;
var vm;
vm = new Vue({

  el: '#dtapp',
  data: {
    showList: true,
    title: null,
    sysFlagList: {},
    sysEnvList: {},
    merchIdList: {},
    serviceIdList: {},

  },

  created: function () {
    this.systemFlagSelected();
    this.systemEnvSelected();
    this.merchIdSelected();
    this.serviceIdSelected();
  },
  methods: {
    deleteRecord: function () {
      var rows = getSelectedRows();
      console.log(rows)
      if (rows == null) {
        return;
      }
      //columns 分页默认的值是id
      var id = 'id';
      //提示确认框
      layer.confirm('您确定要删除所选数据吗？', {
        btn: ['确定', '取消'] //可以无限个按钮
      }, function (index, layero) {
        var ids = new Array();

          //遍历所有选择的行数据，取每条数据对应的ID
        $.each(rows, function (i, row) {
          ids[i] = row[id];
        });
      axios({
          url: 'http://localhost:8892/deleteTestResult',
          method: 'post',
          data: {
            "resultIds":JSON.stringify(ids),
          },
        }).then(res7 => {
          if(res7.data==="success"){
            //console.log(res7.data);
            layer.alert('删除成功');
            $('#mytable').bootstrapTable('refresh');
          }else{
            layer.alert("删除失败")
          }
        })
      });
    },

    //查询按钮事件
    search_submit: function () {
      if(checkDate() == true){
        $('#mytable').bootstrapTable('refresh', {url: 'http://localhost:8892/showTestResultByParam'});
      }else{
        return ;
      }

    },

    //选择系统标识
    systemFlagSelected: function () {
      axios({
        url: 'http://localhost:8892/showSysFlag',
        method: 'post',
        //发送格式为json
        data: {}
      }).then(res => {
        this.sysFlagList = res.data;
      })
    },

    //选择系统环境
    systemEnvSelected: function () {
      axios({
        url: 'http://localhost:8892/showSysEnv',
        method: 'post',
        data: {}
      }).then(res1 => {
        this.sysEnvList = res1.data;
      })
    },

    //选择用户ID
    merchIdSelected: function () {
      axios({
        url: 'http://localhost:8892/showMerchId',
        method: 'post',
        data: {},
      }).then(res3 => {
        this.merchIdList = res3.data;
      })
    },

    //选择接口ID
    serviceIdSelected: function () {
      axios({
        url: 'http://localhost:8892/showServiceId',
        method: 'post',
        data: {},
      }).then(res2 => {
        this.serviceIdList = res2.data;
      })
    },

  }
});





