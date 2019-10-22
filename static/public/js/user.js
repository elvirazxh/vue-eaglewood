$(function(){

  var option = {
    //url: '../sys/menu/list',
    url: 'http://localhost:8892/showUserByParam',
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
      { title: '用户ID', field: 'merchid'}, 
      { title: '用户私钥', field: 'privateKey',formatter:operateOpinionFormatter}, //
      { title: '备注信息', field: 'remark'}, 

    ]};
  $('#mytable').bootstrapTable(option);
});



//请求服务数据时所传参数
function queryParams(queryParams){
  return{
    //pageSize: queryParams.limit,
    //pageIndex:queryParams.pageNumber,
    sysFlag:$('#sea_systemFlag').val(),
    sysEnv:$('#sea_systemEnv').val(),
    merchId:$('#sea_merchId').val(),
  }
}
function checkEmpty(){
  var sysFlag = $('#systemFlag').val();
  var sysEnv = $('#systemEnv').val();
  var merchId = $('#merchId').val();
  var serviceId = $('#serviceId').val();

  if(sysFlag == "" || sysFlag == null){
    layer.alert("系统标识不能为空");
    return false;
  }
  if(sysEnv == "" || sysEnv == null){
    layer.alert("系统环境不能为空");
    return false;
  }
  if(merchId == "" || merchId == null){
    layer.alert("商户ID不能为空");
    return false;
  }
  if(serviceId == "" || serviceId == null){
    layer.alert("用户私钥不能为空");
    return false;
  }
}

//请求体,响应结果字数超过20,悬浮
function  operateOpinionFormatter(value, row, index){
  if(value.length>60){
    return "<span title='"+value+"'>"+value.substring(0,60)+"..."+"</span>";
  }else{
    return "<span title='"+value+"'>"+value.substring(0,value.length)+"</span>";
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
    merchIdForUpdate: null,
    updateMerchInfoRecord:{},

  },

  created: function () {
    this.systemFlagSelected();
    this.systemEnvSelected();
    this.merchIdSelected();
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
          url: 'http://localhost:8892/deleteMerchInfo',
          method: 'post',
          data: {
            "resultIds":JSON.stringify(ids),
          },
        }).then(res7 => {
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
      vm.merchIdForUpdate = "";
    },

    update: function (event) {
      vm.merchIdForUpdate = getSelectedRow();
      console.log(vm.merchIdForUpdate);
      if (vm.merchIdForUpdate == null) {
        return;
      }
      vm.showList = false;
      vm.title = "修改";


      axios({
        url: 'http://localhost:8892/getMerchInfoById',
        method: 'post',
        data: {"merchIdForUpdate":vm.merchIdForUpdate,},
      }).then(res8 => {
        this.updateMerchInfoRecord = res8.data;
        console.log(this.updateMerchInfoRecord)
      })
    },

    saveOrUpdate: function (event) {
      if(checkEmpty() == false){
        return;
      }else{
        var url =  "http://localhost:8892/insertOrUpdateMerchInfo";
        axios({
          url: url,
          method: 'post',
          data: {
            "userId":vm.merchIdForUpdate,
            "sysFlag":$('#systemFlag').val(),
            "sysEnv":$('#systemEnv').val(),
            "merchId":$('#merchId').val(),
            "publicKey":$('#publicKey').val(),
            "privateKey":$('#privateKey').val(),
            "remark":$('#remark').val(),
          },

        }).then(res6 => {
          console.log(res6.data)
          if(res6.data==="success"){
            if(vm.merchIdForUpdate == "" || null ){
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
        $('#mytable').bootstrapTable('refresh', {url: 'http://localhost:8892/showUserByParam'});
    },

    //选择系统标识
    systemFlagSelected: function () {
      axios({
        url: 'http://localhost:8892/showSysFlag',
        method: 'post',
        //发送格式为json
        data: {},
      }).then(res => {
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
        //console.log("输出信息是什么,res3=  ",res3);
        this.merchIdList = res3.data;

      })
    },

  }
});





