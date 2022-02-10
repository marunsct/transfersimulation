sap.ui.define([
    "sap/ui/core/mvc/Controller",
     "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (Controller, Filter, FilterOperator) {
        "use strict";

        return Controller.extend("initiator.controller.View1", {
            onInit: function () {

               var oModel = this.getView().getModel();
                var bFilters = [];
                bFilters.push(new Filter("externalCode", FilterOperator.Contains, "3000"));
                oModel.read("/FODepartment",
                    {
                        filters: bFilters,
                        success: function (sData, sResult) {
                            // var mModel = this.getView().getModel('OP');
                            //var mData = mModel.getData();
                            // console.log(args);
                            //this.getView().getModel('OP').setData({ "OpenPositions": sData.results });
                            // mData.OpenPositions.result = sData.results;
                            // mModel.setData(mData);
                            console.log(sData);
                        }.bind(this),
                        error: function (sData, sResult) {
                            // var mModel = this.getView().getModel('OP');
                            //var mData = mModel.getData();
                            // console.log(args);
                            //this.getView().getModel('OP').setData({ "OpenPositions": sData.results });
                            // mData.OpenPositions.result = sData.results;
                            // mModel.setData(mData);
                            console.log(sData);
                        }.bind(this)
                    })

            }
        });
    });
