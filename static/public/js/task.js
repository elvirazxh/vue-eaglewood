$(function(){

  var option = {
    //url: '../sys/menu/list',
    url: 'http://localhost:8892/showTaskInfoByParam',
    pagination: true,	//显示分页条
    singleSelect : true, // 单选checkbox
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
      { title: '任务ID', field: 'serviceId'}, 
      { title: '备注信息', field: 'cronExpress'}, 

    ]};

  $('#mytable').bootstrapTable(option);
});


function checkEmpty(){
  var sysFlag = $('#systemFlag').val();
  var sysEnv = $('#systemEnv').val();
  var serviceId = $('#serviceId').val();
  var cronExpress = $('#cronExpress').val();

  if(sysFlag == "" || sysFlag == null){
    layer.alert("系统标识不能为空");
    return false;
  }
  if(sysEnv == "" || sysEnv == null){
    layer.alert("系统环境不能为空");
    return false;
  }
  if(serviceId == "" || serviceId == null){
    layer.alert("任务ID不能为空");
    return false;
  }
  if(cronExpress == "" || cronExpress == null){
    layer.alert("任务表达式不能为空");
    return false;
  }
}

//请求服务数据时所传参数
function queryParams(queryParams){
  return{
    //pageSize: queryParams.limit,
    //pageIndex:queryParams.pageNumber,
    sysFlag:$('#sea_systemFlag').val(),
    sysEnv:$('#sea_systemEnv').val(),
    serviceId:$('#sea_serviceId').val(),
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
    serviceIdList:{},
    taskFlag: null,
    updateTaskInfoRecord:{},

  },

  created: function () {
    this.systemFlagSelected();
    this.systemEnvSelected();
    this.serviceIdSelected();

  },
  methods: {

    deleteRecord: function () {
      var resultObj = getSelectedRows();
      if (resultObj == null) {
        return;
      }
      //columns 分页默认的值是id

      //提示确认框
      layer.confirm('您确定要删除所选数据吗？', {
        btn: ['确定', '取消'] //可以无限个按钮
      }, function (index, layero) {

      axios({
          url: 'http://localhost:8892/deleteTaskInfo',
          method: 'post',
          data: {
            "resultObj":JSON.stringify(resultObj[0]),
          },
        }).then((res7) => {
          if(res7.data==="success"){
            console.log(res7.data);
            layer.alert('删除成功');
            $('#mytable').bootstrapTable('refresh');
          }else{
            layer.alert("删除失败")
          }
        })
      });
    },

    add: function (res8) {
      vm.showList = false;
      vm.title = "新增";
      vm.taskFlag = "";
    },

    update: function (event) {
      vm.taskFlag = getSelectedRows();//值为true
      console.log($('#systemFlag').val());
      if (vm.taskFlag == null || vm.taskFlag == "") {
        return;
      }
      vm.showList = false;
      vm.title = "修改";
      axios({
        url: 'http://localhost:8892/getTaskInfo',
        method: 'post',
        data: {
          "taskFlag":vm.taskFlag[0],//有值修改,无值新增
          },
      }).then((res8) => {
        this.updateTaskInfoRecord = res8.data;
        console.log(this.updateTaskInfoRecord)
      })
    },

    saveOrUpdate: function (event) {
      if(checkEmpty() == false){
        return ;
      }else{
        var updateTask = null;
        if(!(vm.taskFlag=='' || vm.taskFlag ==null)) {
          updateTask = getSelectedRows()[0];
        }
        var url =  "http://localhost:8892/insertOrUpdateTaskInfo";
        console.log(url);
        axios({
          url: url,
          method: 'post',
          data: {
            "taskFlag":vm.taskFlag[0],
            "sysFlag":$('#systemFlag').val(),
            "sysEnv":$('#systemEnv').val(),
            "serviceId":$('#serviceId').val(),
            "cronExpress":$('#cronExpress').val(),
          },

        }).then((res6) => {
          console.log(res6.data)
          if(res6.data==="success"){
            if(vm.taskFlag == "" || null ){
              layer.alert('新增成功');
            }else{
              layer.alert('修改成功');
            }
            vm.reload();
          }else{
            layer.alert(res6.data);
          }
        })
      }


    },

    reload: function (event) {
      vm.showList = true;
      $("#mytable").bootstrapTable('refresh');
    },


    //查询按钮事件
    search_submit: function () {
        $('#mytable').bootstrapTable('refresh', {url: 'http://localhost:8892/showTaskInfoByParam'});
    },

    //选择系统标识
    systemFlagSelected: function () {
      axios({
        url: 'http://localhost:8892/showSysFlag',
        method: 'post',
        //发送格式为json
        data: {},
      }).then((res) => {
        this.sysFlagList = res.data;
      })
    },

    //选择系统环境
    systemEnvSelected: function () {
      axios({
        url: 'http://localhost:8892/showSysEnv',
        method: 'post',
        data: {
          //'sysEnvList':this.sysEnvList,
        },
      }).then((res1) => {
        this.sysEnvList = res1.data;
      })
    },


    //选择接口ID
    serviceIdSelected: function () {
      axios({
        url: 'http://localhost:8892/showTaskId',
        method: 'post',
        data: {},
      }).then((res2) => {
        this.serviceIdList = res2.data;
      })
    },


  }
});





