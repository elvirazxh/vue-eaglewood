$(function(){

  var option = {
    //url: '../sys/menu/list',
    url: 'http://localhost:8892/showEmailByParam',
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
      { title: '邮箱账号', field: 'mailAddress'},
      { title: '是否可用', field:'status'},
      { title: '备注', field: 'remark'}, 
    ]};
  $('#mytable').bootstrapTable(option);
});



//请求服务数据时所传参数
function queryParams(queryParams){
  return{
    mailAddress:$('#sea_emailAccount').val(),
    status:$('#sea_status').val(),
  }
}
function checkEmpty(){
  var mailAddress = $('#mailAddress').val();
  var status = $('#status').val();

  if(mailAddress == "" || mailAddress == null){
    layer.alert("邮箱账号不能为空");
    return false;
  }
  if(status == "" || status == null){
    layer.alert("是否可用不能为空");
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
    emailAccountList: {},
    emailIdForUpdate: null,
    updateEmailInfoRecord:{},

  },

  created: function () {
    this.emailAccountSelected();
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
          url: 'http://localhost:8892/deleteEmailInfo',
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
      vm.emailIdForUpdate = "";
    },

    update: function (event) {
      vm.emailIdForUpdate = getSelectedRow();
      console.log(vm.emailIdForUpdate);
      if (vm.emailIdForUpdate == null) {
        return;
      }
      vm.showList = false;
      vm.title = "修改";

      var id = 'id';
      axios({
        url: 'http://localhost:8892/getEmailInfoById',
        method: 'post',
        data: {"emailIdForUpdate":vm.emailIdForUpdate[id],},
      }).then(res8 => {
        this.updateEmailInfoRecord = res8.data;
        console.log(this.updateEmailInfoRecord)
      })
    },

    saveOrUpdate: function (event) {
      if(checkEmpty() == false){
        return;
      }else{
        var id = 'id';
        var url =  "http://localhost:8892/insertOrUpdateEmailInfo";
        axios({
          url: url,
          method: 'post',
          data: {

            "emailId":vm.emailIdForUpdate[id],
            "mailAddress":$('#mailAddress').val(),
            "status":$('#status').val(),
            "remark":$('#remark').val(),
          },

        }).then(res6 => {
          console.log(res6.data)
          if(res6.data==="success"){
            if(vm.emailIdForUpdate == "" || null ){
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
        $('#mytable').bootstrapTable('refresh', {url: 'http://localhost:8892/showEmailByParam'});
    },

    //选择系统标识
    emailAccountSelected: function () {
      axios({
        url: 'http://localhost:8892/showEmailAccount',
        method: 'post',
        //发送格式为json
        data: {},
      }).then(res => {
        this.emailAccountList = res.data;
      })
    },

  }

});





