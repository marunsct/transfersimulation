sap.ui.define([
    "./BaseController",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    'sap/m/Button',
    'sap/m/Dialog',
    'sap/m/ButtonType',
    'sap/m/Text',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/Device",
    "sap/ui/export/Spreadsheet",
    "./TablePersonalisation/OP_TablePersoService",
    "sap/ui/core/util/File",
    "sap/ui/core/BusyIndicator"
], function (BaseController, MessageBox, History, Button, Dialog, ButtonType, Text, Filter,
    FilterOperator, Device, Spreadsheet, TablePersoService, File, BusyIndicator) {
    "use strict";

    return BaseController.extend("transferinitiation.controller.OpenPositions", {

        handleRouteMatched: function (oEvent) {
            var oParams = oEvent.getParameters();
            this.currentRouteName = oParams.name;
            var sContext;
            this._employeeId = oParams.arguments.ID;

            var oContext = this.getCustProperty("EmployeeContext");
            if (oContext == undefined) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("EmployeeList", true);
            }
            this._employeeName = (oContext !== undefined && oContext.oModel !== undefined) ?
                (oContext.oModel.getProperty(oContext.sPath + "/lastName") + ' ' + oContext.oModel.getProperty(oContext.sPath + "/firstName")) : "";
            //this._employeeContext = oParams.arguments.context;
            if (oParams.arguments.midContext) {
                sContext = oParams.arguments.midContext;
            } else {
                if (this.getOwnerComponent().getComponentData()) {
                    var patternConvert = function (oParam) {
                        if (Object.keys(oParam).length !== 0) {
                            for (var prop in oParam) {
                                if (prop !== "sourcePrototype") {
                                    return prop + "(" + oParam[prop][0] + ")";
                                }
                            }
                        }
                    };

                    sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);
                }
            }
            var sContextModelProperty = "/midContext";

            if (sContext) {

                var oPath = {
                    path: "/" + sContext,
                    parameters: {}
                };

                this.getView().bindObject(oPath);
                this.oFclModel.setProperty(sContextModelProperty, sContext);
            }

            var pageName = this.oView.sViewName.split('.');
            pageName = pageName[pageName.length - 1];

            if (pageName === this.currentRouteName) {
                this.oView.getModel('fclButton').setProperty('/visible', true);
            } else {
                this.oView.getModel('fclButton').setProperty('/visible', false);
            }

            if (oEvent.mParameters.arguments.layout && oEvent.mParameters.arguments.layout.includes('FullScreen')) {
                this.oFclModel.setProperty('/expandIcon/img', 'sap-icon://exit-full-screen');
                this.oFclModel.setProperty('/expandIcon/tooltip', 'Exit Full Screen Mode');
            } else {
                this.oFclModel.setProperty('/expandIcon/img', 'sap-icon://full-screen');
                this.oFclModel.setProperty('/expandIcon/tooltip', 'Enter Full Screen Mode');
            }


            this._openPositions = this.getCustProperty("OpenPositionsEmployee") !== undefined ? this.getCustProperty("OpenPositionsEmployee") : {};
            this._employee = this.getCustProperty("EmployeeOpenPositions") !== undefined ? this.getCustProperty("EmployeeOpenPositions") : {};

        },
        _onPageNavButtonPress: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            var oQueryParams = this.getQueryParameters(window.location);
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("EmployeeList", true);


            this.oFclModel.setProperty('/headerExpanded', true);
            if (Object.keys(this._openPositions).length !== 0) {
                this.oFclModel.setProperty('/footerVisible', true);
            } else {
                this.oFclModel.setProperty('/footerVisible', false);
            }
            /*
        if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
            window.history.go(-1);
        } else {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("EmployeeList", true);
        }
*/
        },
        getQueryParameters: function (oLocation) {
            var oQuery = {};
            var aParams = oLocation.search.substring(1).split("&");
            for (var i = 0; i < aParams.length; i++) {
                var aPair = aParams[i].split("=");
                oQuery[aPair[0]] = decodeURIComponent(aPair[1]);
            }
            return oQuery;

        },
        _onExpandButtonPress: function () {
            var endColumn = this.getOwnerComponent().getSemanticHelper().getCurrentUIState().columnsVisibility.endColumn;
            var isFullScreen = this.getOwnerComponent().getSemanticHelper().getCurrentUIState().isFullScreen;
            var nextLayout;
            var actionsButtonsInfo = this.getOwnerComponent().getSemanticHelper().getCurrentUIState().actionButtonsInfo;
            if (endColumn && isFullScreen) {
                nextLayout = actionsButtonsInfo.endColumn.exitFullScreen;
                nextLayout = nextLayout ? nextLayout : this.getOwnerComponent().getSemanticHelper().getNextUIState(2).layout;
            }
            if (!endColumn && isFullScreen) {
                nextLayout = actionsButtonsInfo.midColumn.exitFullScreen;
                nextLayout = nextLayout ? nextLayout : this.getOwnerComponent().getSemanticHelper().getNextUIState(1).layout;
            }
            if (endColumn && !isFullScreen) {
                nextLayout = actionsButtonsInfo.endColumn.fullScreen;
                nextLayout = nextLayout ? nextLayout : this.getOwnerComponent().getSemanticHelper().getNextUIState(3).layout;
            }
            if (!endColumn && !isFullScreen) {
                nextLayout = actionsButtonsInfo.midColumn.fullScreen;
                nextLayout = nextLayout ? nextLayout : 'MidColumnFullScreen'
            }
            var pageName = this.oView.sViewName.split('.');
            pageName = pageName[pageName.length - 1];
            this.oRouter.navTo(pageName, {
                layout: nextLayout
            });

        },
        _onCloseButtonPress: function () {
            var endColumn = this.getOwnerComponent().getSemanticHelper().getCurrentUIState().columnsVisibility.endColumn;
            var nextPage;
            var nextLevel = 0;

            var actionsButtonsInfo = this.getOwnerComponent().getSemanticHelper().getCurrentUIState().actionButtonsInfo;

            var nextLayout = actionsButtonsInfo.midColumn.closeColumn;
            nextLayout = nextLayout ? nextLayout : this.getOwnerComponent().getSemanticHelper().getNextUIState(0).layout;

            if (endColumn) {
                nextLevel = 1;
                nextLayout = actionsButtonsInfo.endColumn.closeColumn;
                nextLayout = nextLayout ? nextLayout : this.getOwnerComponent().getSemanticHelper().getNextUIState(1).layout;
            }

            var pageName = this.oView.sViewName.split('.');
            pageName = pageName[pageName.length - 1];
            var routePattern = this.oRouter.getRoute(pageName).getPattern().split('/');
            var contextFilter = new RegExp('^:.+:$');
            var pagePattern = routePattern.filter(function (pattern) {
                var contextPattern = pattern.match(contextFilter);
                return contextPattern === null || contextPattern === undefined;
            });

            var nextPage = pagePattern[nextLevel];
            this.oRouter.navTo(nextPage, {
                layout: nextLayout
            });

        },
        _onTableItemPress: async function (oEvent) {

            //console.log(oEvent);
            this._oAssignment = {};
            this._oAssignment = oEvent.getParameter("listItem").getBindingContext("OP");
            //var employee, openPositions;
            var posId = this._oAssignment.getProperty("PositionID");
            var posName = this._oAssignment.getProperty("ExternalName")

            var aCells = oEvent.getParameter("listItem").getCells();
            this._employeeName = this._employeeName ? this._employeeName : this._employeeId;
            let empData = this.getCustProperty("EmployeeContext").oModel.getProperty(this.getCustProperty("EmployeeContext").sPath);

            let dependentCheck;
            let posDepartment = this._oAssignment.getProperty("DepartmentID");
            this.byId("table0").setBusy(true);
            dependentCheck = await this._checkDependant(posDepartment, this._employeeId);
            this.byId("table0").setBusy(false);
            if (!dependentCheck) {
                // this._preDialog(posId, posName, this._employeeId, this._employeeName, this._oAssignment.sPath, empData);
                var i18n = this.oView.getModel("i18n");
                let sFirstButton = i18n.getResourceBundle().getText("ok");
                let sSecondButton = i18n.getResourceBundle().getText("cancel");
                let sTitle = i18n.getResourceBundle().getText("warning");
                let sText = i18n.getResourceBundle().getText("dependentCheck");

                this._createDialog(sTitle, sText, sFirstButton, sSecondButton, () => {
                    this._preDialog(posId, posName, this._employeeId, this._employeeName, this._oAssignment.sPath, empData);
                }, this.callBackFunc, this);
            } else {
                this._preDialog(posId, posName, this._employeeId, this._employeeName, this._oAssignment.sPath, empData);
            }

        },
        /**
         * This method is implemented for handling the event Update started during Pagination.
         * The API is called with parameter Top and Skip
        **/
        onUpdateStarted: function (oEvent) {
            if (oEvent.getParameter("reason") === "Growing") {
                this.byId("table0").setBusy(true);
                var filters = this.getModel("filter").getData().filter;
                var oFilters = this._builFilters(filters);
                var mModel = this.getView().getModel('OP');
                var mData = mModel.getData();
                let _url = oFilters !== undefined ? '/http/getOpenPositionList?' + oFilters : '/http/getOpenPositionList?';
                this._cpiAPI(_url, (this.getView().byId("table0").getGrowingThreshold()), mData.OpenPositions.result.length);
            }
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
        _preDialog: function (posId, posName, employeeId, employeeName, sPath, sEmpData) {

            var i18n = this.oView.getModel("i18n");
            var sTitle = i18n.getResourceBundle().getText("confirm");
            var sFirstButton = i18n.getResourceBundle().getText("yes");
            var sSecondButton = i18n.getResourceBundle().getText("cancel");
            if (this._openPositions[posId] !== undefined) {
                if (this._openPositions[posId].employeeId === employeeId) {
                    return;
                }
                this.createDialog(sTitle, i18n.getResourceBundle().getText("positionExists", [this._openPositions[posId].employeeName,
                this._openPositions[posId].employeeId]), sFirstButton, sSecondButton, false, posId, posName, employeeId, employeeName,
                    sPath, sEmpData);

            } else if (this._employee[employeeId] !== undefined) { //   || this._employee[this._employeeId].positionId !== undefined) {
                this.createDialog(sTitle, i18n.getResourceBundle().getText("employeeExists",
                    [this._employee[employeeId].positionName, this._employee[employeeId].positionId]), sFirstButton, sSecondButton, false, posId, posName, employeeId, employeeName, sPath, sEmpData);
            } else {
                this.createDialog(sTitle, i18n.getResourceBundle().getText("assignconfiration", [posName, posId, employeeName, employeeId]), sFirstButton, sSecondButton, true, posId, posName, employeeId, employeeName, sPath, sEmpData);

            }

        },
        createDialog: function (sTitle, sText, sFirstButton, sSecondButton, sNew, posId, posName, employeeId, employeeName, sPath, sEmpData) {
            var dialog = new Dialog({
                title: sTitle,
                type: 'Message',
                content: new Text({ text: sText }),
                beginButton: new Button({
                    type: ButtonType.Emphasized,
                    text: sFirstButton,
                    press: function () {
                        this._onDialogConfirmation(sNew, this, posId, posName, employeeId, employeeName, sPath, sEmpData);
                        dialog.close();
                    }.bind(this)

                }),
                endButton: new Button({
                    type: ButtonType.Ghost,
                    text: sSecondButton,
                    press: function () {
                        dialog.close();
                    }
                }),
                afterClose: function () {
                    dialog.destroy();
                }
            });

            dialog.open();
        },
        _onDialogConfirmation: function (sNew, sThat, posId, posName, employeeId, employeeName, sPath, sEmpData) {
            //var posId = this._oAssignment.getProperty("Position_ID");
            // var posName = this._oAssignment.getProperty("Position_Title")
            if (sNew) {
                // sThat._oAssignment.setProperty("Name1", );
                // sThat._oAssignment.setProperty("ID1", this._employeeId);
                sThat.getModel("OP").setProperty(sPath + "/ID1", employeeId);
                sThat.getModel("OP").setProperty(sPath + "/Name1", employeeName);
                sThat.getModel("OP").setProperty(sPath + "/status", "assigned");
                sThat.getModel("OP").setProperty(sPath + "/icon", 'sap-icon://private');
                sThat._employee[employeeId] = {};
                sThat._openPositions[posId] = {};
                sThat._openPositions[posId].employeeId = employeeId;
                sThat._openPositions[posId].employeeName = employeeName;
                sThat._employee[employeeId].positionId = posId;
                sThat._employee[employeeId].positionName = posName;
                let selected = sThat.getModel("OP").getData().selected + 1;
                sThat.getModel("OP").setProperty("/selected", selected);

            } else {
                var mData = sThat.getModel("OP").getData();
                let newData = [];
                if (sThat._openPositions[posId] !== undefined && sThat._employee[employeeId] !== undefined) {
                    let selected = sThat.getModel("OP").getData().selected - 1;
                    sThat.getModel("OP").setProperty("/selected", selected);
                }

                if (sThat._openPositions[posId] !== undefined) {
                    sThat._clearId = "";
                    if (sThat._openPositions[posId].employeeId !== employeeId) {
                        delete sThat._employee[sThat._openPositions[posId].employeeId];
                        delete sThat._openPositions[posId];
                        if (sThat._employee[employeeId] !== undefined) {
                            if (sThat._employee[employeeId].positionId !== posId) {
                                mData.OpenPositions.result.forEach((currentValue) => {
                                    if (currentValue.PositionID === sThat._employee[employeeId].positionId) {
                                        currentValue.ID1 = "";
                                        currentValue.Name1 = "";
                                        currentValue.status = "";
                                        currentValue.icon = "";
                                    }
                                    newData.push(currentValue);
                                }, sThat);
                                mData.OpenPositions.result = newData;
                                delete sThat._openPositions[sThat._employee[employeeId].positionId];
                                delete sThat._employee[employeeId];
                                sThat.getModel("OP").setData(mData);
                            }
                        }
                        sThat._openPositions[posId] = {};
                        sThat._openPositions[posId].employeeId = employeeId;
                        sThat._openPositions[posId].employeeName = employeeName;
                        sThat._employee[employeeId] = {};
                        sThat._employee[employeeId].positionId = posId;
                        sThat._employee[employeeId].positionName = posName;
                        sThat.getModel("OP").setProperty(sPath + "/ID1", employeeId);
                        sThat.getModel("OP").setProperty(sPath + "/Name1", employeeName);
                        sThat.getModel("OP").setProperty(sPath + "/status", "assigned");
                        sThat.getModel("OP").setProperty(sPath + "/icon", 'sap-icon://private');

                    }
                } else if (sThat._employee[employeeId] !== undefined) {
                    if (sThat._employee[employeeId].positionId !== posId) {
                        mData.OpenPositions.result.forEach((currentValue) => {
                            if (currentValue.PositionID === sThat._employee[employeeId].positionId) {
                                currentValue.ID1 = "";
                                currentValue.Name1 = "";
                                currentValue.status = "";
                                currentValue.icon = "";
                            }
                            newData.push(currentValue);
                        }, sThat);
                        mData.OpenPositions.result = newData;
                        delete sThat._openPositions[sThat._employee[employeeId].positionId];
                        delete sThat._employee[employeeId];
                        sThat._openPositions[posId] = {};
                        sThat._openPositions[posId].employeeId = employeeId;
                        sThat._openPositions[posId].employeeName = employeeName;
                        sThat._employee[employeeId] = {};
                        sThat._employee[employeeId].positionId = posId;
                        sThat._employee[employeeId].positionName = posName;
                        sThat.getModel("OP").setData(mData);
                        sThat.getModel("OP").setProperty(sPath + "/ID1", employeeId);
                        sThat.getModel("OP").setProperty(sPath + "/Name1", employeeName);
                        sThat.getModel("OP").setProperty(sPath + "/status", "assigned");
                        sThat.getModel("OP").setProperty(sPath + "/icon", 'sap-icon://private');
                    }
                }
            }
            let psLevel = sThat.getModel("OP").getProperty(sPath + '/psLevelL') !== "" ? sThat.getModel("OP").getProperty(sPath + '/psLevelL') : sEmpData.psLevelL;
            let psGroup = sThat.getModel("OP").getProperty(sPath + '/psGroupL') !== "" ? sThat.getModel("OP").getProperty(sPath + '/psGroupL') : sEmpData.psGroupL;
            let etype = sThat.getModel("OP").getProperty(sPath + '/EmploymentTypeID');
            let eclass = sThat.getModel("OP").getProperty(sPath + '/EmployeeClassID');
            let transferSettings = this.getCustProperty("TransferSettings");
            let transferData = {
                "__metadata": {
                    "uri": "cust_TransferSimResult"
                },
                externalCode: employeeId,
                effectiveStartDate: transferSettings.effectiveStartDate,
                cust_TRANSFER_DATE: transferSettings.cust_TransferDate,
                cust_STATUS: "10",
                cust_NEW_POSITION_ID: posId,
                cust_OLD_POSITION_ID: sEmpData.position,
                cust_DEPARTMENT: sThat.getModel("OP").getProperty(sPath + '/DepartmentID'),
                cust_CURRENT_MANAGER_ID: sEmpData.managerId,
                cust_FUTURE_MANAGER_ID: sThat.getModel("OP").getProperty(sPath + '/manager') !== "" ? sThat.getModel("OP").getProperty(sPath + '/manager') : null,
                cust_ELIGIBITY_STATUS: sEmpData.eligibility === 'Warning' ? "20" : "10",
                cust_ELIGIBITY_DESCRIPTION: sEmpData.description,
                cust_Previous_Department: sEmpData.department,
                cust_PS_Level: psLevel !== "" ? psLevel : null,
                cust_PS_Group: psGroup !== "" ? psGroup : null,
                cust_EMPLOYEE_CLASS: eclass !== "" ? eclass : null,
                externalName: employeeName,
                cust_EMPLOYMENT_LOCATION: sThat.getModel("OP").getProperty(sPath + '/LocationID'),
                cust_EMPLOYMENT_TYPE: etype !== "" ? etype : null,
                cust_Company: sThat.getModel("OP").getProperty(sPath + '/company'),
                cust_OTYPE: sEmpData.customString6
            };
            sThat._employee[employeeId].transferData = transferData;
            sThat.setCustProperty("EmployeeOpenPositions", sThat._employee);
            sThat.setCustProperty("OpenPositionsEmployee", sThat._openPositions);
        },
        onDropSelectedEmployee: async function (oEvent) {
            var oDraggedItem = oEvent.getParameter("draggedControl");
            var oDraggedItemContext = oDraggedItem.getBindingContextPath();
            var oDroppedItem = oEvent.getParameter("droppedControl");
            var oDroppedItemContext = oDroppedItem.getBindingContextPath();
            if (oDraggedItem.getParent().getModel("OP").getProperty(oDraggedItemContext + "/eligibility") === 'Error' ||
                oDraggedItem.getParent().getModel("OP").getProperty(oDraggedItemContext + "/transferStatus") !== "") {
                return;
            }
            var posId = this.getModel("OP").getProperty(oDroppedItemContext + "/PositionID");
            var posName = this.getModel("OP").getProperty(oDroppedItemContext + "/ExternalName");
            var employeeId = oDraggedItem.getParent().getModel("OP").getProperty(oDraggedItemContext + "/userId");
            var employeeName = (oDraggedItem.getParent().getModel("OP").getProperty(oDraggedItemContext + "/lastName")
                + ' ' + oDraggedItem.getParent().getModel("OP").getProperty(oDraggedItemContext + "/firstName"));
            let empData = oDraggedItem.getParent().getModel("OP").getProperty(oDraggedItemContext);
            let dependentCheck;
            let posDepartment = this.getModel("OP").getProperty(oDroppedItemContext + "/DepartmentID");
            this.byId("table0").setBusy(true);
            dependentCheck = await this._checkDependant(posDepartment, employeeId);
            this.byId("table0").setBusy(false);
            if (!dependentCheck) {
                var i18n = this.oView.getModel("i18n");
                let sFirstButton = i18n.getResourceBundle().getText("ok");
                let sSecondButton = i18n.getResourceBundle().getText("cancel");
                let sTitle = i18n.getResourceBundle().getText("warning");
                let sText = i18n.getResourceBundle().getText("dependentCheck");

                this._createDialog(sTitle, sText, sFirstButton, sSecondButton, () => {
                    this._preDialog(posId, posName, employeeId, employeeName, oDroppedItemContext, empData);
                }, this.callBackFunc, this);

            } else {
                this._preDialog(posId, posName, employeeId, employeeName, oDroppedItemContext, empData);
            }
        },
        onReset: function () {
            var i18n = this.oView.getModel("i18n");
            let sFirstButton = i18n.getResourceBundle().getText("yes");
            let sSecondButton = i18n.getResourceBundle().getText("cancel");
            let sTitle = i18n.getResourceBundle().getText("warning");
            let sText = i18n.getResourceBundle().getText("initiateWarning", [this._vData.selected]);
            this._createDialog(sTitle, sText, sFirstButton, sSecondButton, this.resetAssignments, this.callBackFunc, this);

        },
        resetAssignments: function () {
            var mData = this.getModel("OP").getData();
            let newData = [];
            mData.OpenPositions.result.forEach((currentValue) => {
                if (currentValue.ID1) {
                    currentValue.ID1 = "";
                    currentValue.Name1 = "";
                    currentValue.status = "";
                    currentValue.icon = "";
                }
                newData.push(currentValue);
            }, this);
            mData.OpenPositions.result = newData;
            mData.selected = 0;
            this.getModel("OP").setData(mData);
            this._openPositions = {};
            this._employee = {};
            this.setCustProperty("EmployeeOpenPositions", this._employee);
            this.setCustProperty("OpenPositionsEmployee", this._openPositions);
            this.setCustProperty("TransferInitiated", true);
        },
        intiateTransfer: async function () {
            BusyIndicator.show(0);
            let postData = [];
            let aKeys = Object.keys(this._employee);
            for (let i = 0; i < aKeys.length; i++) {
                postData.push(this._employee[aKeys[i]].transferData);
            }
            try {
                let i18n = this.oView.getModel("i18n");
                let userInfo = this.getCustProperty("UserInfo") ? this.getCustProperty("UserInfo") : null;
                if (userInfo === null) {
                    await this._getUser();
                    userInfo = this.getCustProperty("UserInfo");
                }
                if (userInfo.Manager === true || userInfo.Admin === true) {
                    let results = await this._asyncInitiate(postData);
                    this._downLog = ""
                    let messages = results.d;
                    let failedTransfers = "";
                    let successTransfers = "";
                    for (let j = 0; j < messages.length; j++) {
                        if (messages[j].httpCode !== 200) {
                            failedTransfers = failedTransfers + messages[j].key.split('externalCode=')[1];
                            if (this._downLog === "") {

                                this._downLog = i18n.getResourceBundle().getText("employeeId") + '\t\t' + i18n.getResourceBundle().getText("log");
                            }
                            this._downLog = this._downLog + '\n' + messages[j].key.split('externalCode=')[1] + '\t\t' + messages[j].message;

                        } else if (messages[j].httpCode === 200) {
                            if (successTransfers !== "") {
                                successTransfers = successTransfers + ", " + messages[j].key.split('externalCode=')[1];
                            } else {
                                successTransfers = successTransfers + messages[j].key.split('externalCode=')[1];
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
                    }
                    if (failedTransfers !== "") {
                        sText = sText + i18n.getResourceBundle().getText("transferError", [Counter, failedTransfers]);
                    }
                    this.resetAssignments();
                    BusyIndicator.hide();
                    this._createDialog(sTitle, sText, sFirstButton, sSecondButton, this._onPageNavButtonPress, this.downloadLog, this);
                    var url = '/http/getOpenPositionList?';
                    this._cpiAPI(url, 100, 0);
                    //this._onPageNavButtonPress();  
                } else {
                    this.resetAssignments();
                    BusyIndicator.hide();
                    let i18n = this.oView.getModel("i18n");
                    let sTitle = i18n.getResourceBundle().getText("error");
                    let sText = i18n.getResourceBundle().getText("authError", [userInfo.user]);
                    let sFirstButton = i18n.getResourceBundle().getText("ok");
                    this._createDialog(sTitle, sText, sFirstButton, undefined, this.callBackFunc, undefined, this);
                }
            } catch (error) {
                BusyIndicator.hide();
                console.log(error)
            }
            // 
        },
        downloadLog: function () {
            File.save(this._downLog, "LOG", "txt", "text/txt");
        },
        onInitiateTransfer: function (oEvent) {
            // var tbl = this.getView().byId('TransferReqTable');
            var i18n = this.oView.getModel("i18n");
            let sTitle = i18n.getResourceBundle().getText("confirm");
            // var sText = i18n.getResourceBundle().getText("reject");
            let sFirstButton = i18n.getResourceBundle().getText("yes");
            let sSecondButton = i18n.getResourceBundle().getText("cancel");
            let sText = i18n.getResourceBundle().getText("initiate", [this._vData.selected]);

            this._createDialog(sTitle, sText, sFirstButton, sSecondButton, this.intiateTransfer, this.callBackFunc, this);
        },
        callBackFunc: function () {
            console.log("Dialog Method");
            //   this._onPageNavButtonPress();
        },
        onClearFilter: function () {
            let filter = this.getModel("filter").getData();
            filter.filter = {
                position: "",
                department: "",
                EmploymentClass: "",
                EmploymentType: "",
                location: "",
                supervisor: "",
                employee: ""
            };
            this.getModel("filter").setData(filter);
        },
        onInit: async function () {

            // initialize and activate Table persolation controller
            this._oTPC = this._initializeTablePersonalization(this.byId("table0"), TablePersoService);
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.attachRouteMatched(this.handleRouteMatched, this);
            this.oFclModel = this.getOwnerComponent().getModel("FclRouter");
            this.oFclModel.setProperty('/targetAggregation', 'midColumnPages');
            this.oFclModel.setProperty('/expandIcon', {});
            this.oView.setModel(new sap.ui.model.json.JSONModel({}), 'fclButton');
            this._openPositions = {};
            this._employee = {};
            this._vData = {
                // This is property will be bound to the filter

                filter: {
                    limit: 30,
                    offset: 0,
                },
                // Following is the payload structure of the reply
                OpenPositions: {
                    "code": "",
                    "msg": "",
                    "result": [],
                    "hText": "Result ",
                    "hNumbers": "(0)"
                },
                selected: 0,
                count: 0
            };
            this.oView.setModel(new sap.ui.model.json.JSONModel(this._vData), 'OP');
            this.filter = {
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
                location: []
            };
            this.oView.setModel(new sap.ui.model.json.JSONModel(this.filter), 'filter');
            this.oFclModel.setProperty('/headerExpanded', false);
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
            let transferSettings = this.getCustProperty("TransferSettings") !== undefined ? this.getCustProperty("TransferSettings") : null;
            if (transferSettings === null) {
                transferSettings = {};
                transferSettings = await this.asyncAjax("/SFSF/odata/v2/cust_TransferSimSettings");
                this.setCustProperty("TransferSettings", transferSettings.d.results[0]);
            }
            this.startInactivityTimer(14);
        },
        onAfterRendering: async function () {

            //this.onOdataCall([new Filter("vacant", FilterOperator.EQ, true)]);
            var url = '/http/getOpenPositionList?';
            var oInput = this.getView().byId("fposition");
            let transferSettings = this.getCustProperty("TransferSettings") !== undefined ? this.getCustProperty("TransferSettings") : null;
            if (transferSettings === null) {
                transferSettings = {};
                transferSettings = await this.asyncAjax("/SFSF/odata/v2/cust_TransferSimSettings");
                this.setCustProperty("TransferSettings", transferSettings.d.results[0]);
            }
            jQuery.sap.delayedCall(1000, this, function () {
                oInput.focus();
            });
            try {
                this._cpiAPI(url, 100, 0);
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
            this.startInactivityTimer(14);

        },

        positionsCount: function (sSelected, sCount) {
            return sSelected + ' of ' + sCount + ' Open Positions assigned';
        },
        onOdataCall: function (oFilters) {
            this.byId("table0").setBusy(true);
            var oViewModel = this.getView().getModel('OP');
            var oDataModel = this.getView().getModel("oData");
            oDataModel.read("/Position",
                {
                    async: true,
                    urlParameters: {
                        "$top": 100,
                    },
                    filters: oFilters,
                    success: function (sData, sResult) {
                        var mModel = this.getView().getModel('OP');
                        var mData = mModel.getData();
                        mData.OpenPositions.result = sData.results;

                        let newData = [];

                        mData.OpenPositions.result.forEach((currentValue) => {
                            if (this._openPositions[currentValue.code]) {
                                currentValue.ID1 = this._openPositions[currentValue.code].employeeId;
                                currentValue.Name1 = this._openPositions[currentValue.code].employeeName;
                                currentValue.status = "assigned";
                                currentValue.icon = "sap-icon://private";
                            } else {
                                currentValue.ID1 = "";
                                currentValue.Name1 = "";
                                currentValue.status = "not assigned";
                                currentValue.icon = "";
                            }
                            newData.push(currentValue);
                        }, this);
                        mData.OpenPositions.result = newData;

                        mModel.setData(mData);
                        this.byId("table0").setBusy(false);
                    }.bind(this),
                    error: function (sData, sResult) {
                        console.log(sData);
                        this.oGlobalBusyDialog.close();
                        this.byId("table0").setBusy(false);
                    }
                })
        },

        onExit: function () {

            // to destroy templates for bound aggregations when templateShareable is true on exit to prevent duplicateId issue
            /*
            var aControls = [{
                "controlId": "sap_Table_Page_0-content-build_simple_Table-2-m08xwflqma1v5ynhgx4fnbsv6_S6",
                "groups": ["items"]
            }];
            
            for (var i = 0; i < aControls.length; i++) {
                var oControl = this.getView().byId(aControls[i].controlId);
                if (oControl) {
                    for (var j = 0; j < aControls[i].groups.length; j++) {
                        var sAggregationName = aControls[i].groups[j];
                        var oBindingInfo = oControl.getBindingInfo(sAggregationName);
                        if (oBindingInfo) {
                            var oTemplate = oBindingInfo.template;
                            oTemplate.destroy();
                        }
                    }
                }
            }
*/
        },
        onExcelDownload: function () {
            var i18n = this.oView.getModel("i18n");
            var aColumns = [];
            aColumns.push({
                label: i18n.getResourceBundle().getText("position"),
                property: "PositionID"
            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("positionTitle"),
                property: "ExternalName",

            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("departmentId"),
                property: "DepartmentID"
            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("positionDepartment"),
                property: "Department"
            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("classId"),
                property: "EmployeeClassID",

            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("positionClass"),
                property: "EmployeeClass",

            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("typeId"),
                property: "EmploymentTypeID"
            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("positionType"),
                property: "EmploymentType"
            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("locationId"),
                property: "LocationId",

            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("positionLocation"),
                property: "Location",

            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("standardHours"),
                property: "StandardHours"
            });

            var mSettings = {
                workbook: {
                    columns: aColumns,
                    context: {
                        application: 'Initate transfers',
                        version: '1.98.0',
                        title: 'Open Positions List',
                        modifiedBy: 'Logged in User',
                        sheetName: 'Open Positions'
                    },
                    hierarchyLevel: 'level'
                },
                dataSource: this.getModel("OP").getData().OpenPositions.result,
                fileName: "Open Positions.xlsx"
            };
            var oSpreadsheet = new Spreadsheet(mSettings);
            oSpreadsheet.onprogress = function (iValue) {
                ("Export: %" + iValue + " completed");
            };
            oSpreadsheet.build()
                .then(function () { ("Export is finished"); })
                .catch(function (sMessage) { ("Export error: " + sMessage); });
            var self = this;
            self.resetInactivityTimeout();
        },

        onSuggest: function (oEvent) {
            var sTerm = oEvent.getParameter("suggestValue");
            var aFilters = [];
            if (sTerm) {
                aFilters.push(new Filter("name", FilterOperator.Contains, sTerm));
            }

            oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
        },

        onSuggestClass: async function (oEvent) {
            var sTerm = oEvent.getParameter("suggestValue");
            var aFilters = [];
            var filter1 = new Filter({
                filters: [new Filter("PickListV2_id", FilterOperator.EQ, 'EMPLOYEECLASS'),
                new Filter("status", FilterOperator.EQ, 'A')], and: true
            });


            let filter2 = new Filter({
                filters: [
                    new Filter("externalCode", FilterOperator.Contains, sTerm),
                    new Filter("label_defaultValue", FilterOperator.Contains, sTerm),
                    new Filter("label_en_US", FilterOperator.Contains, sTerm),
                    new Filter("label_ja_JP", FilterOperator.Contains, sTerm)
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
            try {
                var pClass = await this.onAsyncoDatacall("/PickListValueV2", aFilters, 25, 0, this);

                var mModel = this.getView().getModel('filter');
                var mData = mModel.getData();
                mData.EmploymentClass = [];
                let desc;
                let sData = pClass;
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


            } catch (error) {
                console.log("Error while fecting Class data");
                console.log(error);
            }

        },
        onSuggestType: async function (oEvent) {
            var sTerm = oEvent.getParameter("suggestValue");
            var aFilters = [];
            var filter1 = new Filter({
                filters: [new Filter("PickListV2_id", FilterOperator.EQ, 'employmentType'),
                new Filter("status", FilterOperator.EQ, 'A')], and: true
            });
            let filter2 = new Filter({
                filters: [
                    new Filter("externalCode", FilterOperator.Contains, sTerm),
                    new Filter("label_defaultValue", FilterOperator.Contains, sTerm),
                    new Filter("label_en_US", FilterOperator.Contains, sTerm),
                    new Filter("label_ja_JP", FilterOperator.Contains, sTerm)
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

            try {
                var pType = await this.onAsyncoDatacall("/PickListValueV2", aFilters, 25, 0, this);

                var mModel = this.getView().getModel('filter');
                var mData = mModel.getData();
                mData.EmploymentType = [];
                let desc;
                let sData = pType;
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


            } catch (error) {
                console.log("Error while fecting Typr data");
                console.log(error);
            }

        },
        onSuggestDepart: async function (oEvent) {
            var sTerm = oEvent.getParameter("suggestValue");
            var aFilters = [];
            if (sTerm.length > 1) {

                var filter1 = new Filter({
                    filters: [
                        new Filter("externalCode", FilterOperator.Contains, sTerm),
                        new Filter("name_ja_JP", FilterOperator.Contains, sTerm),
                        new Filter("name_en_US", FilterOperator.Contains, sTerm),
                        new Filter("name", FilterOperator.Contains, sTerm)
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
                try {
                    var depart = await this.onAsyncoDatacall("/FODepartment", aFilters, 25, 0, this);

                    var mModel = this.getView().getModel('filter');
                    var mData = mModel.getData();
                    mData.department = [];
                    let desc;
                    let sData = depart;
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


                } catch (error) {
                    console.log("Error while fecting Department data");
                    console.log(error);
                }

            }

        },
        onSuggestPosition: async function (oEvent) {
            var sTerm = oEvent.getParameter("suggestValue");
            var aFilters = [];
            if (sTerm.length > 1) {
                this.oGlobalBusyDialog = new sap.m.BusyDialog();
                // this.oGlobalBusyDialog.open();
                //aFilters.push(new Filter("name", FilterOperator.Contains, sTerm));

                var filter1 = new Filter({
                    filters: [new Filter("code", FilterOperator.Contains, sTerm),
                    new Filter("externalName_ja_JP", FilterOperator.Contains, sTerm),
                    new Filter("externalName_en_US", FilterOperator.Contains, sTerm),
                    new Filter("externalName_defaultValue", FilterOperator.Contains, sTerm)
                    ], and: false
                });

                aFilters.push(
                    new Filter({
                        filters: [
                            new Filter("vacant", FilterOperator.EQ, true),
                            filter1
                        ], and: true
                    })
                );

                try {
                    var position = await this.onAsyncoDatacall("/Position", aFilters, 30, 0, this);

                    var mModel = this.getView().getModel('filter');
                    var mData = mModel.getData();
                    mData.position = [];
                    let desc;
                    let sData = position;
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


                } catch (error) {
                    console.log("Error while fecting position data");
                    console.log(error);
                }

                //oGlobalBusyDialog.close();
            }
        },
        _builFilters: function (filters) {
            let _url = '';
            let oFilters = [];
            if (filters.department) {
                oFilters.push(new Filter("department", FilterOperator.EQ, filters.department.split(' ')[0]));
                _url = _url + 'department=' + filters.department.split(' ')[0] + '&';
            }
            if (filters.location) {
                oFilters.push(new Filter("location", FilterOperator.EQ, filters.location.split(' ')[0]));
                _url = _url + 'location=' + filters.location.split(' ')[0] + '&';
            }
            if (filters.position) {
                oFilters.push(new Filter("code", FilterOperator.EQ, filters.position.split(' ')[0]));
                _url = _url + 'code=' + filters.position.split(' ')[0] + '&';
            }
            if (filters.EmploymentClass) {
                oFilters.push(new Filter("employeeClass", FilterOperator.EQ, filters.EmploymentClass.split(' ')[0]));
                _url = _url + 'employeeClass=' + filters.EmploymentClass.split(' ')[0] + '&';
            }
            if (filters.EmploymentType) {
                oFilters.push(new Filter("cust_employmentType", FilterOperator.EQ, filters.EmploymentType.split(' ')[0]));
                _url = _url + 'cust_employmentType=' + filters.EmploymentType.split(' ')[0] + '&';
            }

            return _url;
        },
        onSearch: function (oEvent) {
            //var oModel = this.getModel("oData");
            var url = '/http/getOpenPositionList?';
            var filters = this.getModel("filter").getData().filter;
            var oFilters = this._builFilters(filters);
            console.log(oFilters);
            if (oFilters.length > 0) {
                this._oFilters = oFilters;
                let _url = oFilters !== undefined ? url + oFilters : url;
                this._cpiAPI(_url, 100, 0);
            } else {
                this._cpiAPI(url, 100, 0);
            }
        },
        onAsyncoDatacall: async function (sUrl, sFilters, sTop, sSkip, sThat) {
            return new Promise(function (resolve, reject) {
                sThat.getView().getModel('oData').read(sUrl,
                    {
                        async: true,
                        urlParameters: {
                            "$top": sTop,
                            "$skip": sSkip
                        },
                        filters: sFilters,
                        success: function (sData, sResult) {
                            resolve(sData);
                        }.bind(sThat),
                        error: function (sData, sResult) {
                            console.log(sData);
                            reject(sData);
                        }.bind(sThat)
                    });
            });
        },
        /**
         * This method is implemented for modularising the repeated API calls.
        **/
        _cpiAPI: async function (sUrl, oTop, oSkip) {
            try {
                this.byId("table0").setBusy(true);
                let _urlHandle, _url;
                if (sap.ui.getCore().getConfiguration().getLanguage() === 'ja') {
                    _url = sUrl + 'lang=ja_JP&'
                } else {
                    _url = sUrl + 'lang=en_US&'
                }
                _urlHandle = _url + 'top=' + oTop + '&skip=' + oSkip;
                let result = await this.asyncAjax(_urlHandle);
                result = JSON.parse(result)
                if (result !== "" && !result.Position.hasOwnProperty(length)) {
                    result.Position = [result.Position];
                } else if (result === "") {
                    result = {};
                    result.Position = [];
                }
                for (let i = 0; i < result.Position.length; i++) {
                    result.Position[i].status = 'unassigned';
                    if (this._openPositions[result.Position[i].PositionID] !== undefined) {
                        result.Position[i].ID1 = this._openPositions[result.Position[i].PositionID].employeeId;
                        result.Position[i].status = 'assigned';
                    }
                }
                var mModel = this.getView().getModel('OP');
                var mData = mModel.getData();
                if (oSkip === 0) {
                    mData.OpenPositions.result = result.Position;
                } else {
                    mData.OpenPositions.result.push.apply(mData.OpenPositions.result, result.Position);
                }
                mData.count = mData.OpenPositions.result.length;
                mModel.setData(mData);
                this.resetInactivityTimeout();
                this.byId("table0").setBusy(false);

            } catch (error) {
                this.resetInactivityTimeout();
                console.log(error);
                this.byId("table0").setBusy(false);
                throw error;
            }

            return;
        },

        _checkDependant: async function (sDepartment, sUser) {
            try {
                let url = '/http/dependentCheck?department=' + sDepartment + '&personIdExternal=' + sUser;
                let result = await this.asyncAjax(url);
                // result = JSON.parse(result)
                if (result.includes("Success")) { //(result.status === 'Success') {
                    return true;
                } else {

                    return false;
                }
            } catch{
                console.log(error);
                this.byId("table0").setBusy(false);
                throw error;
            }
        },
        _asyncInitiate: async function (aBody) {
            var self = this;
            self.resetInactivityTimeout();
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
        }
    });
})