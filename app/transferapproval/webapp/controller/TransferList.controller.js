sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/Device",
    "sap/ui/model/Filter"

],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (Controller, Device, Filter) {
        "use strict";

        return Controller.extend("transferapproval.controller.TransferList", {

            onInit: function () {
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this.oRouter.attachRouteMatched(this.handleRouteMatched, this);
                this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
                try {
                    var sPath = jQuery.sap.getModulePath("transferapproval", "/controller/Data.json");
                    var oModel = new sap.ui.model.json.JSONModel(sPath);

                    // Load JSON in model
                    this.getView().setModel(oModel, "data");

                    this._vData = {
                        // This is property will be bound to the filter

                        filter: {
                            position: "",
                            department: "",
                            EmploymentClass: "",
                            EmploymentType: "",
                            location: "",
                            supervisor: "",
                            employee: ""
                        },
                        position: [],
                        department: [],
                        EmploymentClass: [],
                        EmploymentType: [],
                        location: [],
                        // Following is the payload structure of the reply
                        OpenPositions: {
                            "code": "",
                            "msg": "",
                            "result": [],
                            "hText": "Result ",
                            "hNumbers": "(0)"

                        },
                        selectedCount: 0,
                        height: (Math.round(Device.resize.height * 0.695)) + 'px',
                        height1: (Math.round(Device.resize.height * 0.7)) + 'px'

                    };

                    this.getView().setModel(new sap.ui.model.json.JSONModel(this._vData), 'OP');


                } catch (error) {
                    console.log(error);
                }
            },
            handleRouteMatched: function (oEvent) {
                var oParams = oEvent.getParameters();
                this.currentRouteName = oParams.name;
                var sContext;
                this._avatarPress = false;

                // this.oFclModel.setProperty('/headerExpanded', true);

            },
            _onPageNavButtonPress: function () {
                this.getView().getModel("jsonFile");
            },
            onLoad: function () {
                // disable checkboxes
                var tbl = this.getView().byId('TransferReqTable');
                var header = tbl.$().find('thead');
                var selectAllCb = header.find('.sapMCb');
                //selectAllCb.remove();
                //sap.ui.getCore().byId(selectAllCb.attr('id')).setEnabled(false);


                tbl.getItems().forEach(function (r) {
                    var obj = r.getBindingContext("data").getObject();
                    var oStatus = obj.Status;
                    var cb = r.$().find('.sapMCb');
                    var oCb = sap.ui.getCore().byId(cb.attr('id'));
                    if (oStatus !== "Pending") {
                        oCb.setEnabled(false);
                    } else {
                        oCb.setEnabled(true);
                    }
                });
            },
            onFilterSelect: function (oEvent) {
                var tbl = this.getView().byId('TransferReqTable');
                var header = tbl.$().find('thead');
                var selectAllCb = header.find('.sapMCb');
                //selectAllCb.remove();

                var oBinding = this.byId("TransferReqTable").getBinding("items"),
                    sKey = oEvent.getParameter("key"),
                    // Array to combine filters
                    aFilters = [];
                // Values for Filter
                sap.ui.getCore().byId(selectAllCb.attr('id')).setEnabled(false);
                if (sKey === "pending") {
                    aFilters.push(
                        new Filter([
                            new Filter("Status", "EQ", "Pending")
                        ], false)
                    );
                    sap.ui.getCore().byId(selectAllCb.attr('id')).setEnabled(true);
                } else if (sKey === "approved") {
                    aFilters.push(
                        new Filter([
                            new Filter("Status", "EQ", "Approved")
                        ], false)
                    );
                    sap.ui.getCore().byId(selectAllCb.attr('id')).setEnabled(false);
                } else if (sKey === "rejected") {
                    aFilters.push(
                        new Filter([
                            new Filter("Status", "EQ", "Rejected")
                        ], false)
                    );
                    sap.ui.getCore().byId(selectAllCb.attr('id')).setEnabled(false);
                }

                oBinding.filter(aFilters);
            },
            onSelection: function (oEvent) {
               // var tbl = this.getView().byId('TransferReqTable');
                var oModel = this.getView().getModel('OP');
                var oData = oModel.getData();
                oData.selectedCount = oEvent.getSource().getSelectedItems().length;
                oModel.setData(oData);
            },
            onAfterRendering: function () {
                var tbl = this.getView().byId('TransferReqTable');
                var header = tbl.$().find('thead');
                var selectAllCb = header.find('.sapMCb');
                sap.ui.getCore().byId(selectAllCb.attr('id')).setEnabled(false);
            }
        });
    });
