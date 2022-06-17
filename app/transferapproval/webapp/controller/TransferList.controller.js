sap.ui.define([
    "./BaseController",
    "sap/ui/Device",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageBox",
    "sap/ui/core/util/File",
    "sap/ui/core/BusyIndicator",
    "./TablePersonalisation/TablePersoService"

],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, Device, Filter, FilterOperator, Spreadsheet, MessageBox, File, BusyIndicator, TablePersoService) {
        "use strict";

        return BaseController.extend("transferapproval.controller.TransferList", {

            onInit: async function () {
                document.addEventListener('touchstart', function(){}, {passive: true});
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this.oRouter.attachRouteMatched(this.handleRouteMatched, this);
                this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
                // initialize and activate Table persolation controller
                this._oTPC = this._initializeTablePersonalization(this.byId("TransferReqTable"), TablePersoService);
                try {
                    var sPath = jQuery.sap.getModulePath("transferapproval", "/controller/Data.json");

                    var oData = {
                        TransferReq: [],
                        approved: '0',
                        rejected: '0',
                        pending: '0',
                        total: '0',
                    }
                    //oData.
                    // Load JSON in model
                    var oModel = new sap.ui.model.json.JSONModel(oData);
                    this.getView().setModel(oModel, "data");

                    this._vData = {
                        // This is property will be bound to the filter

                        filter: {
                            position: "",
                            pposition: "",
                            department: "",
                            pdepartment: "",
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
                        height: Device.resize.height - 60 - (165 + this.getView().byId("idIconTabBar").$().height() + this.getView().byId("filterbar0").$().height()) + 'px',
                        height1: (Math.round(Device.resize.height * 0.7)) + 'px'

                    };
                    this.filter = {
                        filter: {
                            position: "",
                            pposition: "",
                            department: "",
                            pdepartment: "",
                            location: "",
                            supervisor: "",
                            employee: ""
                        },
                        position: [],
                        department: [],
                        EmploymentClass: [],
                        EmploymentType: [],
                        location: [],
                        enabled: false
                    };
                    this.oView.setModel(new sap.ui.model.json.JSONModel(this.filter), 'filter');
                    this.getView().setModel(new sap.ui.model.json.JSONModel(this._vData), 'OP');
                    let transferSettings = this.getCustProperty("TransferSettings") !== undefined ? this.getCustProperty("TransferSettings") : null;
                    if (transferSettings === null) {
                        transferSettings = {};
                        transferSettings = await this.asyncAjax("/SFSF/odata/v2/cust_TransferSimSettings");
                        this.setCustProperty("TransferSettings", transferSettings.d.results[0]);
                    }
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

                sap.ui.getCore().attachLocalizationChanged(async function (oEvent) {
                    var oChanges = oEvent.getParameter("changes");
                    if (oChanges && oChanges.language) {
                        this.fetchTransfers(await this._buildFilters());
                    }
                }.bind(this));
            },
            handleRouteMatched: function (oEvent) {
                var oParams = oEvent.getParameters();
                this.currentRouteName = oParams.name;
                var sContext;
                this._avatarPress = false;
            },
            /**
             * This method is implemented for Table personalisation.
            **/
            onPersoButtonPressed: function (oEvent) {
                // This fucction implents the OnPress event for the Table Personalisation Button
                var oI18n = this.getView().getModel("i18n");
                this._oTPC.openDialog(); // Implemented in Base Controller
            },
            /**
             * This method is implemented for resetting the table personalisation.
            **/
            onTablePersoRefresh: function () {
                // This fucction implents the OnPress event for the Table Personalisation refresh Button
                TablePersoService.resetPersData();
                this._oTPC.refresh();
            },
            _onPageNavButtonPress: function () {
                this.getView().getModel("jsonFile");
            },
            onLoad: function () {
                // disable checkboxes
                var tbl = this.getView().byId('TransferReqTable');
                var header = tbl.$().find('thead');
                var selectAllCb = header.find('.sapMCb');

                tbl.getItems().forEach(function (r) {
                    var obj = r.getBindingContext("data").getObject();
                    var oStatus = obj.Status;
                    var cb = r.$().find('.sapMCb');
                    var oCb = sap.ui.getCore().byId(cb.attr('id'));
                    if (oStatus !== "Initiated") {
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
                if (sKey === "Initiated") {
                    aFilters.push(
                        new Filter([
                            new Filter("Status", "EQ", "Initiated")
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
                if (sStatus === 'Initiated') {
                    var oModel = this.getView().getModel('OP');
                    var oData = oModel.getData();
                    oData.selectedCount = oEvent.getSource().getSelectedItems().length;
                    oModel.setData(oData);
                } else {
                    oEvent.getParameter('listItem').setProperty('selected', false);
                }
            },
            onItemPress: function (oEvent) {
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
                var selectedKey = this.getView().byId('idIconTabBar').getSelectedKey();
                if (selectedKey !== 'Initiated') {
                    sap.ui.getCore().byId(selectAllCb.attr('id')).setEnabled(false);
                } else {
                    sap.ui.getCore().byId(selectAllCb.attr('id')).setEnabled(true);
                }
                this.onSuggestLocation();

                this.fetchTransfers("");
            },
            fetchCount: async function () {
                let settings = await this.fetchSettings();
                let _url = await this._buildFilters();
                let sDate = (new Date(Number(settings.effectiveStartDate.match(/\d+/)[0]))).toISOString().substring(0, 10);
                let total = await this.asyncAjax("/SFSF/odata/v2/cust_TransferSimResult/$count?$filter="+_url+"effectiveStartDate eq '" + sDate + "'");
                let approved = await this.asyncAjax("/SFSF/odata/v2/cust_TransferSimResult/$count?$filter="+_url+"effectiveStartDate eq '" + sDate + "' and cust_STATUS eq '20'");
                let rejected = await this.asyncAjax("/SFSF/odata/v2/cust_TransferSimResult/$count?$filter="+_url+"effectiveStartDate eq '" + sDate + "' and cust_STATUS eq '30'");
                let pending = await this.asyncAjax("/SFSF/odata/v2/cust_TransferSimResult/$count?$filter="+_url+"effectiveStartDate eq '" + sDate + "' and cust_STATUS eq '10'");
                let oData = this.getModel('data').getData();
                oData.total = total;
                oData.approved = approved;
                oData.rejected = rejected;
                oData.pending = pending;
                //  this.getModel('data').setProperty('/approved', approved);
                //  this.getModel('data').setProperty('/rejected', rejected);
                //  this.getModel('data').setProperty('/pending', pending);
                this.getModel('data').setData(oData);
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
                    if (tbl.getSelectedItems().length > 20) {
                        sText = i18n.getResourceBundle().getText("wLength") + sText;
                        sTitle = i18n.getResourceBundle().getText("warning");
                    }
                    this._createDialog(sTitle, sText, sFirstButton, sSecondButton, this.onTransferApprove, this.callBackFunc, this);
                } else {
                    let sFirstButton = i18n.getResourceBundle().getText("ok");
                    let sText = i18n.getResourceBundle().getText("selectTransfer");
                    sTitle = i18n.getResourceBundle().getText("warning");
                    this._createDialog(sTitle, sText, sFirstButton, undefined, this.callBackFunc, this.callBackFunc, this);
                }
            },
            onTransferApprove: async function () {
                BusyIndicator.show();
                var tbl = this.getView().byId('TransferReqTable');
                let settings = await this.fetchSettings();
                let payload = {
                    "EmpJob": [],
                    "custMdf": []
                };
                
                let k = tbl.getSelectedItems().length < 21 ? tbl.getSelectedItems().length : 20;
                for (let i = 0; i < k; i++) {
                    let empItem = {};
                    let custItem = {}
                    let tblData = this.getModel('data').getProperty(tbl.getSelectedItems()[i].getBindingContextPath());
                    empItem.__metadata = {
                        "uri": "EmpJob"
                    };
                    empItem.userId = tblData.employeeid;
                    empItem.seqNumber = "1";
                    empItem.startDate = settings.cust_TransferDate;
                    empItem.location = tblData.locationId;
                    empItem.customString6 = tblData.customString6;
                    empItem.eventReason = "TR502";
                    empItem.position = tblData.newposId;
                    empItem.department = tblData.departmentId;
                    empItem.company = tblData.company;
                    if(tblData.nsupervisorId!== null && tblData.nsupervisorId !== ""){
                        empItem.managerId = tblData.nsupervisorId;
                    }
                    payload.EmpJob.push(empItem);

                    custItem.__metadata = {
                        "uri": tblData.metadata.uri.split('v2/')[1]
                    };
                    custItem.externalCode = tblData.employeeid;
                    custItem.effectiveStartDate = settings.effectiveStartDate;
                    custItem.cust_REMARKS = tblData.comments;
                    custItem.cust_STATUS = '20';
                    payload.custMdf.push(custItem);
                }
                console.log(JSON.stringify(payload));
                try {
                    tbl.removeSelections(true);
                    var i18n = this.oView.getModel("i18n");
                    let results = await this._cpiAPI(payload);
                    this._downLog = ""
                    let messages = results.d;
                    let failedTransfers = "";
                    let successTransfers = "";
                    for (let j = 0; j < messages.length; j++) {
                        if (messages[j].httpCode !== 200) {
                            if (failedTransfers !== "") {
                                failedTransfers = failedTransfers + ", " + messages[j].key.split('userId=')[1];
                            } else {
                                failedTransfers = failedTransfers + messages[j].key.split('userId=')[1];
                            }
                            if (this._downLog === "") {

                                this._downLog = i18n.getResourceBundle().getText("employeeId") + '\t\t' + i18n.getResourceBundle().getText("log");
                            }
                            this._downLog = this._downLog + '\n' + messages[j].key.split('userId=')[1] + '\t\t' + messages[j].message;

                        } else if (messages[j].httpCode === 200) {
                            if (successTransfers !== "") {
                                successTransfers = successTransfers + ", " + messages[j].key.split('userId=')[1];
                            } else {
                                successTransfers = successTransfers + messages[j].key.split('userId=')[1];
                            }
                        }
                    }
                    let Counter = 1;

                    let sFirstButton = i18n.getResourceBundle().getText("ok");
                    let sSecondButton = undefined;
                    if (this._downLog !== "") {
                        sSecondButton = i18n.getResourceBundle().getText("download")
                    }
                    let sTitle = i18n.getResourceBundle().getText("transferResult");
                    let sText = "";
                    if (successTransfers !== "") {
                        sText = sText + i18n.getResourceBundle().getText("transferSuccess", [Counter, successTransfers]);
                        Counter = Counter + 1;
                    } else if (failedTransfers !== "") {
                        sText = sText + i18n.getResourceBundle().getText("transferError", [Counter, failedTransfers]);
                    }
                    // this.resetAssignments();
                    BusyIndicator.hide();
                    this._createDialog(sTitle, sText, sFirstButton, sSecondButton, async function () { this.fetchTransfers(await this._buildFilters()) }, this.downloadLog, this);


                } catch (error) {
                    BusyIndicator.hide();
                    console.log(error)
                }
            },
            downloadLog: async function () {
                this.fetchTransfers(await this._buildFilters());
                File.save(this._downLog, "LOG", "txt", "text/txt");
                
            },
            onTransferReject: async function () {
                var tbl = this.getView().byId('TransferReqTable');
                let settings = await this.fetchSettings();
                let payload = [];
                for (let i = 0; i < tbl.getSelectedItems().length; i++) {

                    let custItem = {}
                    let tblData = this.getModel('data').getProperty(tbl.getSelectedItems()[i].getBindingContextPath());

                    custItem.__metadata = {
                        "uri": tblData.metadata.uri.split('v2/')[1]
                    };
                    custItem.externalCode = tblData.employeeid;
                    custItem.effectiveStartDate = settings.effectiveStartDate;
                    custItem.cust_REMARKS = tblData.comments;
                    custItem.cust_STATUS = '30';
                    payload.push(custItem);
                }
                console.log(JSON.stringify(payload));
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

                    this._createDialog(sTitle, sText, sFirstButton, sSecondButton, this.rejectTransfer, this.callBackFunc, this);
                } else {
                    let sFirstButton = i18n.getResourceBundle().getText("ok");
                    let sText = i18n.getResourceBundle().getText("selectTransfer");
                    sTitle = i18n.getResourceBundle().getText("warning");
                    this._createDialog(sTitle, sText, sFirstButton, undefined, this.callBackFunc, this.callBackFunc, this);
                }
            },
            rejectTransfer: async function () {
                BusyIndicator.show();
                var tbl = this.getView().byId('TransferReqTable');
                let settings = await this.fetchSettings();
                let payload = [];
                
                for (let i = 0; i < tbl.getSelectedItems().length; i++) {
                    let empItem = {};
                    let custItem = {}
                    let tblData = this.getModel('data').getProperty(tbl.getSelectedItems()[i].getBindingContextPath());

                    custItem.__metadata = {
                        "uri": tblData.metadata.uri.split('v2/')[1]
                    };
                    custItem.externalCode = tblData.employeeid;
                    custItem.effectiveStartDate = settings.effectiveStartDate;
                    custItem.cust_REMARKS = tblData.comments;
                    custItem.cust_STATUS = '30';
                    payload.push(custItem);
                }
                console.log(JSON.stringify(payload));
                try {
                    tbl.removeSelections(true);
                    var i18n = this.oView.getModel("i18n");
                    let results = await this.performUpsert(payload);
                    this._downLog = ""
                    let messages = results.d;
                    let failedTransfers = "";
                    let successTransfers = "";
                    for (let j = 0; j < messages.length; j++) {
                        if (messages[j].httpCode !== 200) {
                            if (failedTransfers !== "") {
                                failedTransfers = failedTransfers + ", " + messages[j].key.split('externalCode=')[1];
                            } else {
                                failedTransfers = failedTransfers + messages[j].key.split('externalCode=')[1];
                            }
                            if (this._downLog === "") {

                                this._downLog = i18n.getResourceBundle().getText("employeeId") + '\t\t' + i18n.getResourceBundle().getText("log");
                            }
                            this._downLog = this._downLog + '\n' + messages[j].key.split('externalCode=')[1] + '\t\t' + messages[j].message;

                        } else if (messages[j].httpCode === 200) {
                            successTransfers = successTransfers + messages[j].key.split('externalCode=')[1];
                        }
                    }
                    let Counter = 1;
                    let sFirstButton = i18n.getResourceBundle().getText("ok");
                    let sSecondButton = undefined;
                    if (this._downLog !== "") {
                        sSecondButton = i18n.getResourceBundle().getText("download")
                    }
                    let sTitle = i18n.getResourceBundle().getText("transferResult");
                    let sText = "";
                    if (successTransfers !== "") {
                        sText = sText + i18n.getResourceBundle().getText("rejectSuccess", [Counter, successTransfers]);
                        Counter = Counter + 1;
                    } else if (failedTransfers !== "") {
                        sText = sText + i18n.getResourceBundle().getText("rejectError", [Counter, failedTransfers]);
                    }
                    // this.resetAssignments();
                    BusyIndicator.hide();
                    this._createDialog(sTitle, sText, sFirstButton, sSecondButton, async function () { this.fetchTransfers(await this._buildFilters()) }, this.downloadLog, this);


                } catch (error) {
                    BusyIndicator.hide();
                    console.log(error)
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
                    label: i18n.getResourceBundle().getText("departmentId"),
                    property: "departmentId"
                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("department"),
                    property: "department"
                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("pdepartmentId"),
                    property: "pdepartmentId"
                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("pdepartment"),
                    property: "pdepartment"
                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("typeId"),
                    property: "employmentTypeId",

                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("type"),
                    property: "employmentType",

                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("supervisorId"),
                    property: "supervisorId"
                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("supervisor"),
                    property: "supervisor"
                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("nsupervisorId"),
                    property: "nsupervisorId"
                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("nsupervisor"),
                    property: "nsupervisor"
                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("criteria"),
                    property: "eligibility",

                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("cpositionId"),
                    property: "currentposId"
                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("cposition"),
                    property: "currentpos"
                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("npositionId"),
                    property: "newposId",

                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("nposition"),
                    property: "newpos",

                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("locationId"),
                    property: "locationId"
                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("location"),
                    property: "location",

                });
                aColumns.push({
                    label: i18n.getResourceBundle().getText("aStatus"),
                    property: "Status"
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
                    fileName: "Transfer List.xlsx"
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
            },
            /**
             * This method is implemented for suggest event for the Employment Class.
            **/
            onSuggestClass: async function (oEvent) {
                var sTerm = oEvent.getParameter("suggestValue");
                var aFilters = [];
                var filter1 = new Filter({
                    filters: [new Filter("PickListV2_id", FilterOperator.EQ, 'EMPLOYEECLASS'),
                    new Filter("status", FilterOperator.EQ, 'A')], and: true
                });
                var filter2 = new Filter({
                    filters: [
                        new Filter("startswith(externalCode,'" + sTerm + "')", FilterOperator.EQ, true),
                        new Filter("startswith(optionId,'" + sTerm + "')", FilterOperator.EQ, true),
                        new Filter("startswith(label_defaultValue,'" + sTerm + "')", FilterOperator.EQ, true),
                        new Filter("startswith(label_en_US,'" + sTerm + "')", FilterOperator.EQ, true),
                        new Filter("startswith(label_ja_JP,'" + sTerm + "')", FilterOperator.EQ, true)
                    ], and: false
                });
                aFilters.push(
                    new Filter({
                        filters: [
                            filter1,
                            filter2
                        ], and: true
                    })
                );

                this.getModel('oData').read("/PickListValueV2",
                    {
                        async: true,
                        urlParameters: {
                            "$top": 40,
                        },
                        filters: aFilters,
                        success: function (sData, sResult) {
                            var mModel = this.getView().getModel('filter');
                            var mData = mModel.getData();
                            mData.EmploymentClass = [];
                            let desc;
                            for (var i = 0; i < sData.results.length; i++) {
                                switch (this.getLocale()) {
                                    case "JA":
                                        desc = (sData.results[i].label_ja_JP !== null) ? sData.results[i].label_ja_JP : sData.results[i].label_defaultValue;
                                        break;
                                    case "EN":
                                        desc = (sData.results[i].label_en_US !== null) ? sData.results[i].label_en_US : sData.results[i].label_defaultValue;
                                        break;
                                    default:
                                        desc = sData.results[i].label_defaultValue;
                                        break;
                                }
                                mData.EmploymentClass.push({
                                    "ID": sData.results[i].externalCode,
                                    "name": desc
                                });
                            }
                            mModel.setData(mData);

                        }.bind(this),
                        error: function (sData, sResult) {
                            console.log(sData);

                        }
                    });


            },
            /**
             * This method is implemented for suggest event for the Employment Type.
            **/
            onSuggestType: async function (oEvent) {
                var sTerm = oEvent.getParameter("suggestValue");
                var aFilters = [];
                var filter1 = new Filter({
                    filters: [new Filter("PickListV2_id", FilterOperator.EQ, 'employmentType'),
                    new Filter("status", FilterOperator.EQ, 'A')], and: true
                });
                var filter2 = new Filter({
                    filters: [
                        new Filter("startswith(externalCode,'" + sTerm + "')", FilterOperator.EQ, true),
                        new Filter("startswith(label_defaultValue,'" + sTerm + "')", FilterOperator.EQ, true),
                        new Filter("startswith(label_en_US,'" + sTerm + "')", FilterOperator.EQ, true),
                        new Filter("startswith(label_ja_JP,'" + sTerm + "')", FilterOperator.EQ, true)
                    ], and: false
                });
                aFilters.push(
                    new Filter({
                        filters: [
                            filter1,
                            filter2
                        ], and: true
                    })
                );

                this.getModel('oData').read("/PickListValueV2",
                    {
                        async: true,
                        urlParameters: {
                            "$top": 40,
                        },
                        filters: aFilters,
                        success: function (sData, sResult) {
                            var mModel = this.getView().getModel('filter');
                            var mData = mModel.getData();
                            mData.EmploymentType = [];
                            let desc;
                            for (var i = 0; i < sData.results.length; i++) {
                                switch (this.getLocale()) {
                                    case "JA":
                                        desc = (sData.results[i].label_ja_JP !== null) ? sData.results[i].label_ja_JP : sData.results[i].label_defaultValue;
                                        break;
                                    case "EN":
                                        desc = (sData.results[i].label_en_US !== null) ? sData.results[i].label_en_US : sData.results[i].label_defaultValue;
                                        break;
                                    default:
                                        desc = sData.results[i].label_defaultValue;
                                        break;
                                }
                                mData.EmploymentType.push({
                                    "ID": sData.results[i].externalCode,
                                    "name": desc
                                });
                            }
                            mModel.setData(mData);

                        }.bind(this),
                        error: function (sData, sResult) {
                            console.log(sData);

                        }
                    });


            },
            /**
             * This method is implemented for suggest event for the Department.
            **/
            onSuggestDepart: async function (oEvent) {
                var sTerm = oEvent.getParameter("suggestValue");
                var aFilters = [];
                if (sTerm.length > 1) {

                    var filter1 = new Filter({
                        filters: [
                            new Filter("startswith(externalCode,'" + sTerm + "')", FilterOperator.EQ, true),
                            new Filter("startswith(name_ja_JP,'" + sTerm + "')", FilterOperator.EQ, true),
                            new Filter("startswith(name_en_US,'" + sTerm + "')", FilterOperator.EQ, true),
                            new Filter("startswith(name,'" + sTerm + "')", FilterOperator.EQ, true)
                            // new Filter("substringof('" + sTerm + "',externalCode)", FilterOperator.EQ, true),
                            // new Filter("substringof('" + sTerm + "',name)", FilterOperator.EQ, true)
                        ], and: false
                    });

                    aFilters.push(
                        new Filter({
                            filters: [
                                new Filter("status", FilterOperator.EQ, 'A'),
                                filter1
                            ], and: true
                        })
                    );


                    // new Filter("status", FilterOperator.EQ, 'A')
                    // this.getModel('oData').read("/FODepartment?$top=20&$filter=startswith(externalCode,'" + sTerm + "') eq true or startswith(name_ja_JP,'" + sTerm + "') eq true or startswith(name,'" + sTerm + "')",

                    this.getModel('oData').read("/FODepartment",
                        {
                            async: true,
                            urlParameters: {
                                "$top": 40,
                                //  "test": "((substringof('"+ sTerm + "',externalCode) or substringof('" + sTerm + "',name)) and status eq 'A'"
                            },
                            filters: aFilters,
                            success: function (sData, sResult) {
                                var mModel = this.getView().getModel('filter');
                                var mData = mModel.getData();
                                mData.department = [];
                                let desc;
                                for (var i = 0; i < sData.results.length; i++) {
                                    switch (this.getLocale()) {
                                        case "JA":
                                            desc = (sData.results[i].name_ja_JP !== null) ? sData.results[i].name_ja_JP : sData.results[i].name;
                                            break;
                                        case "EN":
                                            desc = (sData.results[i].name_en_US !== null) ? sData.results[i].name_en_US : sData.results[i].name;
                                            break;
                                        default:
                                            desc = sData.results[i].name;
                                            break;
                                    }
                                    mData.department.push({
                                        "ID": sData.results[i].externalCode,
                                        "name": desc
                                    });
                                }
                                mModel.setData(mData);
                                // this.oGlobalBusyDialog.close();
                            }.bind(this),
                            error: function (sData, sResult) {
                                console.log(sData);
                                // this.oGlobalBusyDialog.close();
                            }
                        });
                }

            },
            /**
             * This method is implemented for suggest event for the Position.
            **/
            onSuggestPosition: async function (oEvent) {
                var sTerm = oEvent.getParameter("suggestValue");
                var aFilters = [];
                if (sTerm.length > 1) {
                    this.oGlobalBusyDialog = new sap.m.BusyDialog();
                    // this.oGlobalBusyDialog.open();
                    //aFilters.push(new Filter("name", FilterOperator.Contains, sTerm));

                    var filter1 = new Filter({
                        filters: [new Filter("startswith(code,'" + sTerm + "')", FilterOperator.EQ, true),
                        new Filter("startswith(externalName_ja_JP,'" + sTerm + "')", FilterOperator.EQ, true),
                        new Filter("startswith(externalName_en_US,'" + sTerm + "')", FilterOperator.EQ, true),
                        new Filter("startswith(externalName_defaultValue,'" + sTerm + "')", FilterOperator.EQ, true)
                        ], and: false
                    });

                    aFilters.push(
                        new Filter({
                            filters: [
                                new Filter("vacant", FilterOperator.EQ, false),
                                filter1
                            ], and: true
                        })
                    );

                    this.getModel('oData').read("/Position",
                        {
                            async: true,
                            urlParameters: {
                                "$top": 40,
                            },
                            filters: aFilters,
                            success: function (sData, sResult) {
                                var mModel = this.getView().getModel('filter');
                                var mData = mModel.getData();
                                mData.position = [];
                                let desc;
                                for (var i = 0; i < sData.results.length; i++) {
                                    switch (this.getLocale()) {
                                        case "JA":
                                            desc = (sData.results[i].externalName_ja_JP !== null) ? sData.results[i].externalName_ja_JP : sData.results[i].externalName_defaultValue;
                                            break;
                                        case "EN":
                                            desc = (sData.results[i].externalName_en_US !== null) ? sData.results[i].externalName_en_US : sData.results[i].externalName_defaultValue;
                                            break;
                                        default:
                                            desc = sData.results[i].externalName_defaultValue;
                                            break;
                                    }
                                    mData.position.push({
                                        "ID": sData.results[i].code,
                                        "name": desc
                                    });
                                }
                                mModel.setData(mData);
                                // this.oGlobalBusyDialog.close();
                            }.bind(this),
                            error: function (sData, sResult) {
                                console.log(sData);
                                //this.oGlobalBusyDialog.close();
                            }
                        });

                    //oGlobalBusyDialog.close();
                }
            },
            /**
             * This method is implemented for suggest event for the Locatioin.
            **/
            onSuggestLocation: async function () {
                try {
                    // this._cpiAPI(url, (this.getView().byId("table0").getGrowingThreshold() + 2), 0);
                    var location = await this.asyncAjax("/SFSF/odata/v2/FOLocation?$select=externalCode,startDate,name,description,status,nameTranslationNav/externalCode,nameTranslationNav/foField,nameTranslationNav/value_defaultValue,nameTranslationNav/value_ja_JP,nameTranslationNav/value_en_US,nameTranslationNav/value_localized&$expand=nameTranslationNav&$top=1000&$filter=status eq 'A'");
                    var mModel = this.getView().getModel('filter');
                    var mData = mModel.getData();
                    mData.location = [];
                    let desc;
                    let sData = location.d;
                    for (var i = 0; i < sData.results.length; i++) {
                        switch (this.getLocale()) {
                            case "JA":
                                desc = (sData.results[i].nameTranslationNav.value_ja_JP !== null) ? sData.results[i].nameTranslationNav.value_ja_JP : sData.results[i].nameTranslationNav.value_defaultValue;
                                break;
                            case "EN":
                                desc = (sData.results[i].nameTranslationNav.value_en_US !== null) ? sData.results[i].nameTranslationNav.value_en_US : sData.results[i].nameTranslationNav.value_defaultValue;
                                break;
                            default:
                                desc = sData.results[i].nameTranslationNav.value_defaultValue;
                                break;
                        }
                        mData.location.push({
                            "ID": sData.results[i].externalCode,
                            "name": sData.results[i].externalCode + ' ' + desc
                        });
                    };

                    mModel.setData(mData);

                } catch (error) {
                    console.log("Error while fecting location data");
                    console.log(error);
                }
            },
            /**
             * This method is implemented for suggest event for the Location.
            **/
            onSuggestLoc: function (oEvent) {
                var sTerm = oEvent.getParameter("suggestValue");
                var aFilters = [];
                if (sTerm) {
                    aFilters.push(new Filter("name", FilterOperator.Contains, sTerm));
                }

                oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
            },
            fetchSettings: async function () {
                try {
                    let transferSettings = this.getCustProperty("TransferSettings") !== undefined ? this.getCustProperty("TransferSettings") : null;
                    if (transferSettings === null) {
                        transferSettings = {};
                        transferSettings = await this.asyncAjax("/SFSF/odata/v2/cust_TransferSimSettings");
                        transferSettings = transferSettings.d.results[0];
                        this.setCustProperty("TransferSettings", transferSettings);
                    }
                    if (new Date(Number(transferSettings.cust_DateofAnnouncement.match(/\d+/)[0])) < new Date()) {
                        this.getModel('filter').setProperty('/enabled', true);
                    }
                    return transferSettings;
                } catch (error) {
                    return null;
                }
            },
            onSearch: async function (){
                this.fetchTransfers( await this._buildFilters());  
            },
            _buildFilters: async function () {
                let filters = this.getModel('filter').getData().filter;
                let _url = '';

                if (filters.department) {
                    _url = _url + "cust_DEPARTMENT eq '" + filters.department.split(" ")[0] + "' and ";
                }
                if (filters.location) {
                    _url = _url + "cust_EMPLOYMENT_LOCATION eq '" + filters.location.split(" ")[0] + "' and ";
                }
                if (filters.position) {
                    _url = _url + "cust_NEW_POSITION_ID eq '" + filters.position.split(" ")[0] + "' and ";
                }
                if (filters.pdepartment) {
                    _url = _url + "cust_Previous_Department eq '" + filters.pdepartment.split(" ")[0] + "' and ";
                }
                if (filters.pposition) {
                    _url = _url + "cust_OLD_POSITION_ID eq '" + filters.pposition.split(" ")[0] + "' and ";
                }
                if (filters.employee) {
                    _url = _url + "externalCode eq '" + filters.employee + "' and ";
                }
                if (filters.supervisor) {
                    _url = _url + "cust_CURRENT_MANAGER_ID eq '" + filters.supervisor + "' and ";
                }
                return _url;
            },
            fetchTransfers: async function (sURL) {
                this.fetchCount();
                this.getView().byId("TransferReqTable").setBusy(true);
                let settings = await this.fetchSettings();
                var transDate = (new Date(Number(settings.effectiveStartDate.match(/\d+/)[0]))).toISOString().substring(0, 10)
                let surl = "/SFSF/odata/v2/cust_TransferSimResult?$expand=cust_STATUSNav,cust_ELIGIBITY_STATUSNav,cust_NEW_POSITION_IDNav,externalCodeNav,cust_FUTURE_MANAGER_IDNav,createdByNav,cust_CURRENT_MANAGER_IDNav,cust_EMPLOYEE_CLASSNav,cust_OLD_POSITION_IDNav,cust_Previous_DepartmentNav,cust_EMPLOYMENT_TYPENav,cust_EMPLOYMENT_LOCATIONNav,cust_PS_GroupNav,cust_CompanyNav,cust_DEPARTMENTNav&$filter=" + sURL + "effectiveStartDate eq '"
                    + transDate + "'";

                $.ajax({
                    url: surl,
                    method: "GET",
                    this: this,
                    contentType: "application/json",
                    headers: {
                        "Accept": "application/json"
                    },

                    success: function (result) {
                        console.log(result);
                        let results = result.d.results;
                        var oData = this.getModel("data").getData();
                        oData.TransferReq = [];
                        this.getModel("data").setData(oData);
                        let lang;
                        if (sap.ui.getCore().getConfiguration().getLanguage() === 'ja') {
                            lang = 'lang=ja_JP';
                        } else {
                            lang = 'lang=en_US';
                        }
                        for (let i = 0; i < results.length; i++) {
                            let item = {
                                employeeid: "",
                                name: "",
                                department: "",
                                departmentId: "",
                                pdepartment: "",
                                pdepartmentId: "",
                                employmentType: "",
                                employmentTypeId: "",
                                supervisor: "",
                                supervisorId: "",
                                nsupervisor: "",
                                nsupervisorId: "",
                                eligibility: "",
                                eligibilityId: "",
                                currentpos: "",
                                currentposId: "",
                                newpos: "",
                                newposId: "",
                                Status: "",
                                StatusId: "",
                                comments: "",
                                company: "",
                                customString6: "",
                                location: "",
                                locationId: ""
                            };
                            item.employeeid = results[i].externalCode;
                            item.departmentId = results[i].cust_DEPARTMENT;
                            item.pdepartmentId = results[i].cust_Previous_Department;
                            item.employmentTypeId = results[i].cust_EMPLOYMENT_TYPE;
                            item.supervisorId = results[i].cust_CURRENT_MANAGER_ID;
                            item.nsupervisorId = results[i].cust_FUTURE_MANAGER_ID;
                            item.eligibilityId = results[i].cust_ELIGIBITY_STATUS;
                            item.currentposId = results[i].cust_OLD_POSITION_ID;
                            item.newposId = results[i].cust_NEW_POSITION_ID;
                            item.StatusId = results[i].cust_STATUS;
                            item.comments = results[i].cust_REMARKS;
                            item.company = results[i].cust_Company;
                            item.customString6 = results[i].cust_OTYPE;
                            item.locationId = results[i].cust_EMPLOYMENT_LOCATION;
                            item.metadata = results[i].__metadata;

                            if (lang === 'lang=en_US') {
                                item.name = results[i].externalCodeNav !== null ? results[i].externalCodeNav.defaultFullName : null;
                               // item.department = results[i].cust_DEPARTMENTNav !== null ? results[i].cust_DEPARTMENTNav.name_en_US : null;
                                item.department  = results[i].cust_DEPARTMENTNav !== null ? (results[i].cust_DEPARTMENTNav.name_en_US !== null?results[i].cust_DEPARTMENTNav.name_en_US : results[i].cust_DEPARTMENTNav.name) : null;
                                item.pdepartment = results[i].cust_Previous_DepartmentNav !== null ? (results[i].cust_Previous_DepartmentNav.name_en_US !== null?results[i].cust_Previous_DepartmentNav.name_en_US : results[i].cust_Previous_DepartmentNav.name) : null;
                                item.employmentType = results[i].cust_EMPLOYMENT_TYPENav !== null ? results[i].cust_EMPLOYMENT_TYPENav.label_en_US : null;
                                item.supervisor = results[i].cust_CURRENT_MANAGER_IDNav !== null ? results[i].cust_CURRENT_MANAGER_IDNav.defaultFullName : null;
                                item.nsupervisor = results[i].cust_FUTURE_MANAGER_IDNav !== null ? results[i].cust_FUTURE_MANAGER_IDNav.defaultFullName : null;
                                item.eligibility = results[i].cust_ELIGIBITY_STATUSNav !== null ? results[i].cust_ELIGIBITY_STATUSNav.label_en_US : null;
                                item.currentpos = results[i].cust_OLD_POSITION_IDNav !== null ? (results[i].cust_OLD_POSITION_IDNav.externalName_en_US !== null ? results[i].cust_OLD_POSITION_IDNav.externalName_en_US : results[i].cust_OLD_POSITION_IDNav.externalName_defaultValue): null;
                                item.newpos = results[i].cust_NEW_POSITION_IDNav !== null ? (results[i].cust_NEW_POSITION_IDNav.externalName_en_US !== null ? results[i].cust_NEW_POSITION_IDNav.externalName_en_US : results[i].cust_NEW_POSITION_IDNav.externalName_defaultValue): null;
                                item.Status = results[i].cust_STATUSNav !== null ? results[i].cust_STATUSNav.label_defaultValue : null;
                                item.location = results[i].cust_EMPLOYMENT_LOCATIONNav !== null ? results[i].cust_EMPLOYMENT_LOCATIONNav.name : null;
                            } else {
                                item.name = results[i].externalCodeNav !== null ? results[i].externalCodeNav.defaultFullName : null;
                                //item.department = results[i].cust_DEPARTMENTNav !== null ? results[i].cust_DEPARTMENTNav.name_ja_JP : null;
                                //item.pdepartment = results[i].cust_Previous_DepartmentNav !== null ? results[i].cust_Previous_DepartmentNav.name_ja_JP : null;
                                item.department  = results[i].cust_DEPARTMENTNav !== null ? (results[i].cust_DEPARTMENTNav.name_ja_JP !== null?results[i].cust_DEPARTMENTNav.name_ja_JP : results[i].cust_DEPARTMENTNav.name) : null;
                                item.pdepartment = results[i].cust_Previous_DepartmentNav !== null ? (results[i].cust_Previous_DepartmentNav.name_ja_JP !== null?results[i].cust_Previous_DepartmentNav.name_ja_JP : results[i].cust_Previous_DepartmentNav.name) : null;
                                item.employmentType = results[i].cust_EMPLOYMENT_TYPENav !== null ? results[i].cust_EMPLOYMENT_TYPENav.label_ja_JP : null;
                                item.supervisor = results[i].cust_CURRENT_MANAGER_IDNav !== null ? results[i].cust_CURRENT_MANAGER_IDNav.defaultFullName : null;
                                item.nsupervisor = results[i].cust_FUTURE_MANAGER_IDNav !== null ? results[i].cust_FUTURE_MANAGER_IDNav.defaultFullName : null;                                
                                item.eligibility = results[i].cust_ELIGIBITY_STATUSNav !== null ? results[i].cust_ELIGIBITY_STATUSNav.label_ja_JP : null;
                                //item.currentpos = results[i].cust_OLD_POSITION_IDNav !== null ? results[i].cust_OLD_POSITION_IDNav.externalName_ja_JP : null;
                                //item.newpos = results[i].cust_NEW_POSITION_IDNav !== null ? results[i].cust_NEW_POSITION_IDNav.externalName_ja_JP : null;
                                item.currentpos = results[i].cust_OLD_POSITION_IDNav !== null ? (results[i].cust_OLD_POSITION_IDNav.externalName_ja_JP !== null ? results[i].cust_OLD_POSITION_IDNav.externalName_ja_JP : results[i].cust_OLD_POSITION_IDNav.externalName_defaultValue): null;
                                item.newpos = results[i].cust_NEW_POSITION_IDNav !== null ? (results[i].cust_NEW_POSITION_IDNav.externalName_ja_JP !== null ? results[i].cust_NEW_POSITION_IDNav.externalName_ja_JP : results[i].cust_NEW_POSITION_IDNav.externalName_defaultValue): null;
                                item.Status = results[i].cust_STATUSNav !== null ? results[i].cust_STATUSNav.label_defaultValue : null;
                                item.location = results[i].cust_EMPLOYMENT_LOCATIONNav !== null ? results[i].cust_EMPLOYMENT_LOCATIONNav.name : null;
                            }
                            oData.TransferReq.push(item);
                        }

                        this.getModel("data").setData(oData);
                        //("/EmpJob", JSON.parse(result).EmpJob);
                        // BusyIndicator.hide();
                        this._count += 1;
                        this.getView().byId("TransferReqTable").setBusy(false);;

                    }.bind(this),
                    error: function (request, status, errorThrown) {
                        this._count += 1;
                        this.setBusy(this._count);
                        console.log(request);
                        this.getView().byId("TransferReqTable").setBusy(false);
                        // BusyIndicator.hide();
                    }.bind(this)
                });

            },
            _asyncInitiate: async function (aBody) {
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        url: '/upsert',
                        method: "POST",
                        data: JSON.stringify(aBody),
                        contentType: "application/json",
                        headers: {
                            "Accept": "application/json",
                            "accept": "application/json"
                        },

                        success: function (result) {
                            console.log('API call to CPI is success'); //Second text in console
                            resolve(result);
                        },
                        error: function (request, status, errorThrown) {
                            console.log(status);
                            reject({
                                error: request,
                                status: status,
                                data: 'API returns an error'
                            });
                        }
                    });
                });
            },
            performUpsert: async function (oPayload) {
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        url: '/SFSF/odata/v2/upsert',
                        method: "POST",
                        data: JSON.stringify(oPayload),
                        contentType: "application/json",
                        headers: {
                            "Accept": "application/json"
                        },

                        success: function (result) {
                            console.log('API call to CPI is success'); //Second text in console
                            resolve(result);
                        },
                        error: function (request, status, errorThrown) {
                            console.log(status);
                            reject({
                                error: request,
                                status: status,
                                data: 'API returns an error'
                            });
                        }
                    });
                });
            },
            _cpiAPI: async function (aBody) {
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        url: '/http/UpsertJob',
                        method: "POST",
                        data: JSON.stringify(aBody),
                        contentType: "application/json",
                        headers: {
                            "Accept": "application/json"
                        },

                        success: function (result) {
                            console.log('API call to CPI is success'); //Second text in console
                            resolve(result);
                        },
                        error: function (request, status, errorThrown) {
                            console.log(status);
                            reject({
                                error: request,
                                status: status,
                                data: 'API returns an error'
                            });
                        }
                    });
                });
            }

        });
    });
