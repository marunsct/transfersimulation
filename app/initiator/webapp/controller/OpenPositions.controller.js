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
    "sap/ui/Device"
], function (BaseController, MessageBox, History, Button, Dialog, ButtonType, Text, Filter, FilterOperator, Device) {
    "use strict";

    return BaseController.extend("initiator.controller.OpenPositions", {

        handleRouteMatched: function (oEvent) {
            var oParams = oEvent.getParameters();
            this.currentRouteName = oParams.name;
            var sContext;
            this._employeeId = oParams.arguments.ID;

           // var oContext = this.getCustProperty("EmployeeContext");
            this._employeeName =  "" ;//oContext.oModel !== undefined ? oContext.oModel.getProperty(oContext.sPath + "/First_Name") : "";
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
            if((this.getCustProperty("OpenPositionsEmployee") !== undefined || this.getCustProperty("EmployeeOpenPositions") !== undefined) && this.getModel("OP")){
                var mData = this.getModel("OP").getData();
                var newData =[];
                mData.OpenPositions.result.forEach((currentValue) => {
                  
                        currentValue.ID1 = "";
                        currentValue.Name1 = "";
                
                    newData.push(currentValue);
                });
                mData.OpenPositions.result = newData;
                this.getModel("OP").setData(mData);
            }
            if(!this.byId("table0").getModel("OP").getData().OpenPositions.result.length){
                this.byId("table0").setBusy(true);
            }
        },
        _onPageNavButtonPress: function () {
            this.setCustProperty("Back", true);
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
           // var oQueryParams = this.getQueryParameters(window.location);
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("EmployeeList", true);

/*
            this.oFclModel.setProperty('/headerExpanded', true);
            if (Object.keys(this._openPositions).length !== 0) {
                this.oFclModel.setProperty('/footerVisible', true);
            } else {
                this.oFclModel.setProperty('/footerVisible', false);
            }
            
        if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
            window.history.go(-1);
        } else {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("EmployeeList", true);
        }
*/
        },

        avatarInitialsFormatter: function (sTextValue) {
            return typeof sTextValue === 'string' ? sTextValue.substr(0, 2) : undefined;

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
        _onTableItemPress: function (oEvent) {

            //console.log(oEvent);
            this._oAssignment = {};
            this._oAssignment = oEvent.getParameter("listItem").getBindingContext("OP");
            //var employee, openPositions;
            var posId = this._oAssignment.getProperty("code");
            var posName = this._oAssignment.getProperty("externalName_defaultValue")

            var aCells = oEvent.getParameter("listItem").getCells();


            this._preDialog(posId, posName, this._employeeId, this._employeeName, this._oAssignment.sPath);

        },

        _preDialog: function (posId, posName, employeeId, employeeName, sPath) {

            var i18n = this.oView.getModel("i18n");
            var sTitle = i18n.getResourceBundle().getText("confirm");
            var sFirstButton = i18n.getResourceBundle().getText("yes");
            var sSecondButton = i18n.getResourceBundle().getText("cancel");
            if (this._openPositions[posId] !== undefined) {

                this._createDialog(sTitle, i18n.getResourceBundle().getText("positionExists", this._openPositions[posId].employeeId), sFirstButton, sSecondButton, false, posId, posName, employeeId, employeeName, sPath);

            } else if (this._employee[employeeId] !== undefined) { //   || this._employee[this._employeeId].positionId !== undefined) {
                this._createDialog(sTitle, i18n.getResourceBundle().getText("employeeExists",
                    this._employee[employeeId].positionName), sFirstButton, sSecondButton, false, posId, posName, employeeId, employeeName, sPath);
            } else {
                this._createDialog(sTitle, i18n.getResourceBundle().getText("assignconfiration", [posName, employeeName]), sFirstButton, sSecondButton, true, posId, posName, employeeId, employeeName, sPath);

            }

        },
        _createDialog: function (sTitle, sText, sFirstButton, sSecondButton, sNew, posId, posName, employeeId, employeeName, sPath) {
            var dialog = new Dialog({
                title: sTitle,
                type: 'Message',
                content: new Text({ text: sText }),
                beginButton: new Button({
                    type: ButtonType.Emphasized,
                    text: sFirstButton,
                    press: function () {
                        this._onDialogConfirmation(sNew, this, posId, posName, employeeId, employeeName, sPath);
                        dialog.close();
                    }.bind(this)

                }),
                endButton: new Button({
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

        _onDialogConfirmation: function (sNew, sThat, posId, posName, employeeId, employeeName, sPath) {
            //var posId = this._oAssignment.getProperty("Position_ID");
            // var posName = this._oAssignment.getProperty("Position_Title")
            if (sNew) {
                // sThat._oAssignment.setProperty("Name1", );
                // sThat._oAssignment.setProperty("ID1", this._employeeId);
                sThat.getModel("OP").setProperty(sPath + "/ID1", employeeId);
                sThat.getModel("OP").setProperty(sPath + "/Name1", employeeName);
                sThat._employee[employeeId] = {};
                sThat._openPositions[posId] = {};
                sThat._openPositions[posId].employeeId = employeeId;
                sThat._openPositions[posId].employeeName = employeeName;
                sThat._employee[employeeId].positionId = posId;
                sThat._employee[employeeId].positionName = posName;
                sThat.setCustProperty("EmployeeOpenPositions", sThat._employee);
                sThat.setCustProperty("OpenPositionsEmployee", sThat._openPositions);
            } else {
                var mData = sThat.getModel("OP").getData();
                let newData = [];
                if (sThat._openPositions[posId] !== undefined) {
                    sThat._clearId = "";
                    if (sThat._openPositions[posId].employeeId !== employeeId) {
                        delete sThat._employee[sThat._openPositions[posId].employeeId];
                        delete sThat._openPositions[posId];
                        if (sThat._employee[employeeId] !== undefined) {
                            if (sThat._employee[employeeId].positionId !== posId) {
                                mData.OpenPositions.result.forEach((currentValue) => {
                                    if (currentValue.code === sThat._employee[employeeId].positionId) {
                                        currentValue.ID1 = "";
                                        currentValue.Name1 = "";
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
                        sThat.setCustProperty("EmployeeOpenPositions", sThat._employee);
                        sThat.setCustProperty("OpenPositionsEmployee", sThat._openPositions);
                    }
                } else if (sThat._employee[employeeId] !== undefined) {
                    if (sThat._employee[employeeId].positionId !== posId) {
                        mData.OpenPositions.result.forEach((currentValue) => {
                            if (currentValue.code === sThat._employee[employeeId].positionId) {
                                currentValue.ID1 = "";
                                currentValue.Name1 = "";
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
                        sThat.setCustProperty("EmployeeOpenPositions", sThat._employee);
                        sThat.setCustProperty("OpenPositionsEmployee", sThat._openPositions);
                    }
                }
            }
        },
        onDropSelectedEmployee: function (oEvent) {
            var oDraggedItem = oEvent.getParameter("draggedControl");
            var oDraggedItemContext = oDraggedItem.getBindingContextPath();
            var oDroppedItem = oEvent.getParameter("droppedControl");
            var oDroppedItemContext = oDroppedItem.getBindingContextPath();
            var posId = this.getModel("OP").getProperty(oDroppedItemContext + "/code");
            var posName = this.getModel("OP").getProperty(oDroppedItemContext + "/externalName_defaultValue");
            var employeeId = this.getModel("oData").getProperty(oDraggedItemContext + "/userId");
            var employeeName = this.getModel("oData").getProperty(oDraggedItemContext + "/First_Name");


            this._preDialog(posId, posName, employeeId, employeeName, oDroppedItemContext);

        },

        onInit: function () {

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
                height : (Math.round(Device.resize.height * 0.68 )) + 'px'
            };
            this.oView.setModel(new sap.ui.model.json.JSONModel(this._vData), 'OP');
            this.oFclModel.setProperty('/headerExpanded', false);
            this.byId("table0").setBusy(true);

        },
        onAfterRendering: function () {

            this.onOdataCall([new Filter("vacant", FilterOperator.EQ, true)]);

            var sp4ID = this.byId('hp4');
            var sp3ID = this.byId('hp3');
            var sp2ID = this.byId('hp2');
            var sp1ID = this.byId('hp1');
            var sp0ID = this.byId('hp0');

            sp4ID.addStyleClass(this.performanceColor('A'));
            sp3ID.addStyleClass(this.performanceColor('B'));
            sp2ID.addStyleClass(this.performanceColor('C'));
            sp1ID.addStyleClass(this.performanceColor('B'));
            sp0ID.addStyleClass(this.performanceColor('D'));
        },

        onOdataCall: function (oFilters) {
            this.byId("table0").setBusy(true);
            var oViewModel = this.getView().getModel('OP');
            var oDataModel = this.getView().getModel("oData");
            oDataModel.read("/Position",
                {
                    async: true,
                    urlParameters: {
                        "$top": 20,
                    },
                    filters: oFilters,
                    success: function (sData, sResult) {
                        var mModel = this.getView().getModel('OP');
                        var mData = mModel.getData();
                        // console.log(args);
                        //this.getView().getModel('OP').setData({ "OpenPositions": sData.results });
                        mData.OpenPositions.result = sData.results;
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
        performanceColor: function(sGrade){
            switch (sGrade){
                case "A":
                    return "performanceNegative";
                case "B":
                    return "performanceNeutral";
                case "C":
                    return "performanceNeutralM";
                case "D":
                    return "performancePositive";
                default:
                    return "performanceNeutral";            

            }
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
        }
    });
});