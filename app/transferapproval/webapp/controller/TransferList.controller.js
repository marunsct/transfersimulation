sap.ui.define([
    "./BaseController",
    "sap/ui/Device",
    "sap/ui/model/Filter",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageBox"

],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, Device, Filter, Spreadsheet, MessageBox) {
        "use strict";

        return BaseController.extend("transferapproval.controller.TransferList", {

            onInit: function () {
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this.oRouter.attachRouteMatched(this.handleRouteMatched, this);
                this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
                try {
                    var sPath = jQuery.sap.getModulePath("transferapproval", "/controller/Data.json");
                    var oModel = new sap.ui.model.json.JSONModel(sPath);
                    //var oData = oModel.getData();
                    //oData.
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
                        height: (Math.round(Device.resize.height * 0.665)) + 'px',
                        height1: (Math.round(Device.resize.height * 0.7)) + 'px'

                    };

                    this.getView().setModel(new sap.ui.model.json.JSONModel(this._vData), 'OP');


                } catch (error) {
                    console.log(error);
                }

                this.oFilterBar = this.byId("filterbar0");

                this.oFilterBar.registerFetchData(this.fFetchData);
                this.oFilterBar.registerApplyData(this.fApplyData);
                this.oFilterBar.registerGetFiltersWithValues(this.fGetFiltersWithValues);

                this.fVariantStub();
                //this.onToggleSearchField();
                this.oFilterBar.fireInitialise();
                this._sHeader = this.oFilterBar.getHeader();
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
                        oCb.setSelected(false)
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
                var sStatus = oEvent.getParameter('listItem').getBindingContext('data').getProperty('Status');
                if (sStatus === 'Pending') {
                    var oModel = this.getView().getModel('OP');
                    var oData = oModel.getData();
                    oData.selectedCount = oEvent.getSource().getSelectedItems().length;
                    oModel.setData(oData);
                } else {
                    oEvent.getParameter('listItem').setProperty('selected', false);
                }
            },
            onItemPress: function(oEvent){
                oEvent.getParameter('listItem').setProperty('selected', false);
                var sId = oEvent.getParameter('listItem').getBindingContext('data').getProperty("employeeid");
                this.oRouter.navTo("TransferDetail", {
                    ID: sId
                }, false);
            },
            _onTableItemPress: function (oEvent) {
                var sId = oEvent.getSource().getBindingContext("data").getProperty("employeeid");
                this.oRouter.navTo("TransferDetail", {
                    ID: sId
                }, false);
            },
            onAfterRendering: function () {
                var tbl = this.getView().byId('TransferReqTable');
                var header = tbl.$().find('thead');
                var selectAllCb = header.find('.sapMCb');
                var selectedKey = tbl.getParent().getParent().getSelectedKey();
                if (selectedKey !== 'pending') {
                    sap.ui.getCore().byId(selectAllCb.attr('id')).setEnabled(false);
                } else {
                    sap.ui.getCore().byId(selectAllCb.attr('id')).setEnabled(true);
                }
            },
            fFetchData: function () {
                var oJsonParam;
                var oJsonData = [];
                var sGroupName;
                var oItems = this.getAllFilterItems(true);

                for (var i = 0; i < oItems.length; i++) {
                    oJsonParam = {};
                    sGroupName = null;
                    if (oItems[i].getGroupName) {
                        sGroupName = oItems[i].getGroupName();
                        oJsonParam.groupName = sGroupName;
                    }

                    oJsonParam.name = oItems[i].getName();

                    var oControl = this.determineControlByFilterItem(oItems[i]);
                    if (oControl) {
                        oJsonParam.value = oControl.getValue();
                        oJsonData.push(oJsonParam);
                    }
                }

                return oJsonData;
            },

            fApplyData: function (oJsonData) {

                var sGroupName;

                for (var i = 0; i < oJsonData.length; i++) {

                    sGroupName = null;

                    if (oJsonData[i].groupName) {
                        sGroupName = oJsonData[i].groupName;
                    }

                    var oControl = this.determineControlByName(oJsonData[i].name, sGroupName);
                    if (oControl) {
                        oControl.setValue(oJsonData[i].value);
                    }
                }
            },

            fGetFiltersWithValues: function () {
                var i;
                var oControl;
                var aFilters = this.getFilterGroupItems();

                var aFiltersWithValue = [];

                for (i = 0; i < aFilters.length; i++) {
                    oControl = this.determineControlByFilterItem(aFilters[i]);
                    if (oControl && oControl.getValue && oControl.getValue()) {
                        aFiltersWithValue.push(aFilters[i]);
                    }
                }

                return aFiltersWithValue;
            },

            fVariantStub: function () {
                var oVM = this.oFilterBar._oVariantManagement;
                oVM.initialise = function () {
                    this.fireEvent("initialise");
                    this._setStandardVariant();

                    this._setSelectedVariant();
                };

                var nKey = 0;
                var mMap = {};
                var sCurrentVariantKey = null;
                oVM._oVariantSet = {

                    getVariant: function (sKey) {
                        return mMap[sKey];
                    },
                    addVariant: function (sName) {
                        var sKey = "" + nKey++;

                        var oVariant = {
                            key: sKey,
                            name: sName,
                            getItemValue: function (s) {
                                return this[s];
                            },
                            setItemValue: function (s, oObj) {
                                this[s] = oObj;
                            },
                            getVariantKey: function () {
                                return this.key;
                            }
                        };
                        mMap[sKey] = oVariant;

                        return oVariant;
                    },

                    setCurrentVariantKey: function (sKey) {
                        sCurrentVariantKey = sKey;
                    },

                    getCurrentVariantKey: function () {
                        return sCurrentVariantKey;
                    },

                    delVariant: function (sKey) {
                        if (mMap[sKey]) {
                            delete mMap[sKey];
                        }
                    }
                }

            },
            onClear: function (oEvent) {
                var oItems = this.oFilterBar.getAllFilterItems(true);
                for (var i = 0; i < oItems.length; i++) {
                    var oControl = this.oFilterBar.determineControlByFilterItem(oItems[i]);
                    if (oControl) {
                        oControl.setValue("");
                    }
                }
            },
            onAccept: function (oEvent) {
                var tbl = this.getView().byId('TransferReqTable');
                var i18n = this.oView.getModel("i18n");
                var sTitle = i18n.getResourceBundle().getText("confirm");

                var sFirstButton = i18n.getResourceBundle().getText("yes");
                var sSecondButton = i18n.getResourceBundle().getText("cancel");
                if (tbl.getSelectedItems().length > 0) {
                    let sText = i18n.getResourceBundle().getText("approve");
                    this._createDialog(sTitle, sText, sFirstButton, sSecondButton, this.callBackFunc, this.callBackFunc, this);
                } else {
                    let sFirstButton = i18n.getResourceBundle().getText("ok");
                    let sText = i18n.getResourceBundle().getText("selectTransfer");
                    this._createDialog(sTitle, sText, sFirstButton, undefined, this.callBackFunc, this.callBackFunc, this);
                }
            },
            onReject: function (oEvent) {
                var tbl = this.getView().byId('TransferReqTable');
                var i18n = this.oView.getModel("i18n");
                let sTitle = i18n.getResourceBundle().getText("confirm");
                // var sText = i18n.getResourceBundle().getText("reject");
                let sFirstButton = i18n.getResourceBundle().getText("yes");
                let sSecondButton = i18n.getResourceBundle().getText("cancel");

                if (tbl.getSelectedItems().length > 0) {
                    let sText = i18n.getResourceBundle().getText("reject");

                    this._createDialog(sTitle, sText, sFirstButton, sSecondButton, this.callBackFunc, this.callBackFunc, this);
                } else {
                    let sFirstButton = i18n.getResourceBundle().getText("ok");
                    let sText = i18n.getResourceBundle().getText("selectTransfer");
                    sTitle = i18n.getResourceBundle().getText("warning");
                    this._createDialog(sTitle, sText, sFirstButton, undefined, this.callBackFunc, this.callBackFunc, this);
                }
            },
            callBackFunc: function () {
                console.log("Dialog Method");
            },
            onExcelDownload: function () {
                var i18n = this.oView.getModel("i18n");
                var aColumns = [];
                aColumns.push({
                    label: i18n.getResourceBundle().getText("employeeId"),
                    property: "employeeid"
                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("name"),
                    property: "name",

                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("department"),
                    property: "department"
                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("type"),
                    property: "employmentType",

                });

                aColumns.push({
                    label: i18n.getResourceBundle().getText("supervisor"),
                    property: "supervisor"
                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("criteria"),
                    property: "eliginility",

                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("cposition"),
                    property: "currentpos"
                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("nposition"),
                    property: "newpos",

                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("comments"),
                    property: "comments"
                });



                var mSettings = {
                    workbook: {
                        columns: aColumns,
                        context: {
                            application: 'Transfer Plan Approval',
                            version: '1.98.0',
                            title: 'Transfer Plan Approval',
                            modifiedBy: 'Logged in User',
                            sheetName: 'Transfer Plan Approval'
                        },
                        hierarchyLevel: 'level'
                    },
                    dataSource: this.getModel("data").getData().TransferReq,
                    fileName: "Trafer List.xlsx"
                };
                var oSpreadsheet = new Spreadsheet(mSettings);
                oSpreadsheet.onprogress = function (iValue) {
                    ("Export: %" + iValue + " completed");
                };
                oSpreadsheet.build()
                    .then(function () { ("Export is finished"); })
                    .catch(function (sMessage) { ("Export error: " + sMessage); });
            },
            onViewProfile: function (oEvent) {
                var oBindingContext = oEvent.getSource().getParent().oBindingContexts.data;
                return new Promise(function (fnResolve) {

                    this.oRouter.navTo("EmployeeProfile", {
                        ID: oBindingContext.getProperty("employeeid"),
                    }, false);

                }.bind(this)).catch(function (err) {
                    if (err !== undefined) {
                        MessageBox.error(err.message);
                    }
                });
            }

        });
    });
