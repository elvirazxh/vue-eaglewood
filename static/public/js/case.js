$(function(){

  var option = {
    //url: '../sys/menu/list',
    url: 'http://localhost:8892/showCaseByParam',
    pagination: true,	//显示分页条
    sidePagination: 'client', //分页方式：client客户端分页，server服务端分页（*）
    queryParams:queryParams,
    sortable: true,                     //是否启用排序
    sortOrder: "desc",                   //排序方式
    showRefresh: false,  //显示刷新按钮
    search: false,
    toolbar: '#toolbar',
    striped : true,     //设置为true会有隔行变色效果
    method:'post',
    contentType: "application/x-www-form-urlencoded",//要加上
    //dataType: 'jsonp',  // 请求方式为jsonp
    //idField: 'menuId',
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
        field: 'caseId',
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
      { title: '交易类型', field: 'txnType'},
      { title: '支付类型', field: 'pmtType'},
      { title: '业务类型', field: 'bizType'}, 
      { title: '接口请求参数', field: 'reqParams',formatter:operateOpinionFormatter}, 
      { title: '期望结果值', field: 'expect'}, 
      { title: '是否可用', field: 'status'}, 
      { title: '扩展字段', field: 'extend'},
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
    serviceId:$('#sea_serviceId').val(),
    status:$('#sea_status').val(),
    txnType:$('#sea_txnType').val(),
    pmtType:$('#sea_pmtType').val(),
  }
}

//请求体,响应结果字数超过20,悬浮
function  operateOpinionFormatter(value, row, index){
  if(value.length>40){
    return "<span title='"+value+"'>"+value.substring(0,40)+"..."+"</span>";
  }else{
    return "<span title='"+value+"'>"+value.substring(0,value.length)+"</span>";
  }
}


function checkEmpty(){
  var sysFlag = $('#add_systemFlag').val();
  var sysEnv = $('#add_systemEnv').val();
  var serviceId = $('#add_serviceId').val();
  var merchId = $('#add_merchId').val();
  var txnType = $('#add_txnType').val();
  var pmtType = $('#add_pmtType').val();
  var reqParams = $('#add_reqParams').val();
  var expect = $('#add_expect').val();
  var status = $('#add_status').val();

  if(sysFlag == "" || sysFlag == null){
    layer.alert("系统标识不能为空");
    return false;
  }
  if(sysEnv == "" || sysEnv == null){
    layer.alert("系统环境不能为空");
    return false;
  }
  if(serviceId == "" || serviceId == null){
    layer.alert("接口ID不能为空");
    return false;
  }
  if(merchId == "" || merchId == null){
    layer.alert("用户Id不能为空");
    return false;
  }
  if(txnType == "" || txnType == null){
    layer.alert("交易类型不能为空");
    return false;
  }
  if(pmtType == "" || pmtType == null){
    layer.alert("支付类型不能为空");
    return false;
  }
  if(reqParams == "" || reqParams == null){
    layer.alert("接口请求参数不能为空");
    return false;
  }
  if(expect == "" || expect == null){
    layer.alert("预期结果值不能为空");
    return false;
  }
  if(status == "" || status == null){
    layer.alert("是否执行状态不能为空");
    return false;
  }
}



var ztree;
//import qs from 'qs'
var vm;
vm = new Vue({

  el: '#dtapp',
  data: {
    showList: true,
    title: null,
    caseIdForUpdate: null,
    updateCaseRecord:{
      sysFlag:'',
      sysEnv:'',
      merchId:'',
      serviceId:'',
      txnType:'',
      pmtType:'',
      bizType:'',
      reqParams:'',
      expect:'',
      status:'',
      extend:'',
    },

    addCase:{
      sysFlag:'',
      sysEnv:'',
      merchId:'',
      serviceId:'',
      txnType:'',
      pmtType:'',
      bizType:'',
      reqParams:'',
      expect:'',
      status:'',
      extend:'',
    },

    sysFlagList: {},
    sysEnvList: {},
    merchIdList: {},
    serviceIdList: {},
    txnTypeList: {},
    pmtTypeList: {},


  },

  created: function () {
    this.systemFlagSelected();
    this.systemEnvSelected();
    this.merchIdSelected();
    this.serviceIdSelected();
    this.txnTypeSelected();
    this.pmtTypeSelected();
    //this.update();

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
          url: 'http://localhost:8892/deleteCase',
          method: 'post',
          data: {
            "caseIds":JSON.stringify(ids),
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
      vm.caseIdForUpdate = "";
    },
    update: function (event) {
      vm.showList = false;
      vm.title = "修改";
      vm.caseIdForUpdate = getSelectedRow()["id"];
      console.log(vm.caseIdForUpdate);
      if (vm.caseIdForUpdate == null) {
        return;
      }

      axios({
        url: 'http://localhost:8892/getCaseById',
        method: 'post',
        data: {"caseIdForUpdate":vm.caseIdForUpdate,},
      }).then((res8) => {
        this.updateCaseRecord = res8.data;
        console.log(this.updateCaseRecord)
      })
    },


    saveOrUpdate: function (event) {
      if(checkEmpty() == false){
        return ;
      }else{
        var url = vm.caseIdForUpdate == "" || null ? "http://localhost:8892/insertCase" : "http://localhost:8892/updateCase";
        axios({
          url: url,
          method: 'post',
          data: {
            "caseId":vm.caseIdForUpdate,
            "sysFlag":$('#add_systemFlag').val(),
            "sysEnv":$('#add_systemEnv').val(),
            "merchId":$('#add_merchId').val(),
            "serviceId":$('#add_serviceId').val(),
            "txnType":$('#add_txnType').val(),
            "pmtType":$('#add_pmtType').val(),
            "bizType":$('#add_bizType').val(),
            "reqParams":$('#add_reqParams').val(),
            "expect":$('#add_expect').val(),
            "status":$('#add_status').val(),
            "extend":$('#add_sextend').val(),

          },

        }).then((res6) => {
          console.log(res6.data)
          if(res6.data==="success"){
            if(vm.caseIdForUpdate == "" || null ){
              layer.alert('新增成功');
            }else{
              layer.alert('修改成功');
            }
            vm.reload();
          }else{
            layer.alert('操作失败');

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
      $('#mytable').bootstrapTable('refresh', {url: 'http://localhost:8892/showCaseByParam'});
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
        data: {
          //'sysEnvList':this.sysEnvList,
        }
      }).then(res1 => {
        this.sysEnvList = res1.data;
      })
    },

    //选择用户ID
    merchIdSelected: function () {
      //var params = new URLSearchParams();
      //params.append('sysFlag', $('#sea_systemFlag').val());       //你要传给后台的参数值 key/value
      //params.append('sysEnv', $('#sea_systemEnv').val());
      //
      //console.log(params);
      //
      //let sysFlag = $('#sea_systemFlag').val();
      //let sysEnv = $('#sea_systemEnv').val();

      axios({
        url: 'http://localhost:8892/showMerchId',
        method: 'post',
        data: {
          //sysFlag:this.sysFlag,
          //sysEnv:this.sysEnv,
        }
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
        vm.serviceIdList = res2.data;
      });
    },


    //选择交易类型
    txnTypeSelected: function () {
      axios({
        url: 'http://localhost:8892/showTxnType',
        method: 'post',
        data: {},
      }).then(res4 => {
        this.txnTypeList = res4.data;
      })
    },


    //选择支付类型
    pmtTypeSelected:function(){
      axios({
        url: 'http://localhost:8892/showPmtType',
        method: 'post',
        data: {},
      }).then(res5 => {
        this.pmtTypeList = res5.data;
      })
    },


  }
});





