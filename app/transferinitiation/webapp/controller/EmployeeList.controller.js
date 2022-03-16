sap.ui.define([
    "./BaseController",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, MessageBox, History, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("transferinitiation.controller.EmployeeList", {

        handleRouteMatched: function (oEvent) {
            var oParams = oEvent.getParameters();
            this.currentRouteName = oParams.name;
            var sContext;
            this._avatarPress = false;
            if (oParams.arguments.beginContext) {
                sContext = oParams.arguments.beginContext;
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
            var sContextModelProperty = "/beginContext";

            if (sContext) {

                var oPath = {
                    path: "/" + sContext,
                    parameters: {}
                };

                this.getView().bindObject(oPath);
                this.oFclModel.setProperty(sContextModelProperty, sContext);
            }

            this.oView.getModel('fclButton').setProperty('/visible', false);

            if (oEvent.mParameters.arguments.layout && oEvent.mParameters.arguments.layout.includes('FullScreen')) {
                this.oFclModel.setProperty('/expandIcon/img', 'sap-icon://exit-full-screen');
                this.oFclModel.setProperty('/expandIcon/tooltip', 'Exit Full Screen Mode');
            } else {
                this.oFclModel.setProperty('/expandIcon/img', 'sap-icon://full-screen');
                this.oFclModel.setProperty('/expandIcon/tooltip', 'Enter Full Screen Mode');
            }

            // this.oFclModel.setProperty('/headerExpanded', true);

        },
        _onTableItemPress: function (oEvent) {
            console.log(1);
            if (!this._avatarPress) {

                var oBindingContext = oEvent.getParameter("listItem").getBindingContext("oData");
                this.setCustProperty("EmployeeContext", oBindingContext);
                this._employeeContext = oBindingContext;
                return new Promise(function (fnResolve) {
                    var sBeginContext = this.oFclModel.getProperty("/beginContext");
                    var sMidContext = oEvent.getParameter("listItem").getBindingContext("oData").getPath();
                    var oNextUIState = this.getOwnerComponent().getSemanticHelper().getNextUIState(1);
                    var sNextLayout = oNextUIState.layout;
                    //  this.oFclModel.setProperty('/headerExpanded', false);
                    //this.doNavigate("Page7", oBindingContext, fnResolve, "", 1);
                    this.oRouter.navTo("OpenPositions", {
                        ID: oBindingContext.getProperty("Employee_ID"),
                        //context: oBindingContext, 
                        beginContext: sBeginContext,
                        midContext: sMidContext,
                        layout: sNextLayout
                    }, false);
                    this.oFclModel.setProperty('/headerExpanded', false);
                    this.oFclModel.setProperty('/footerVisible', false);
                }.bind(this)).catch(function (err) {
                    if (err !== undefined) {
                        MessageBox.error(err.message);
                    }
                });


            }
        },

        _onRowPress: function (oEvent) {

            var oBindingContext = oEvent.getSource().getBindingContext();

            return new Promise(function (fnResolve) {

                this.doNavigate("Page7", oBindingContext, fnResolve, "", 1);
            }.bind(this)).catch(function (err) {
                if (err !== undefined) {
                    MessageBox.error(err.message);
                }
            });

        },
        avatarInitialsFormatter: function (sFirst, sLast) {
            return (typeof sFirst === 'string' && typeof sLast === 'string') ? sLast.substr(0, 1) + sFirst.substr(0, 1) : undefined;

        },
        productCount: function(sText, oList){
            if(oList !== undefined){
            return sText + "(" + oList.length + ")" ;
            } else{
                return sText + "(0)" ;
            }
        },
        _onAvatarPress: function (oEvent) {

            var oBindingContext = oEvent.getSource().getBindingContext();

            return new Promise(function (fnResolve) {

                this.doNavigate("Page8", oBindingContext, fnResolve, "", 0);
            }.bind(this)).catch(function (err) {
                if (err !== undefined) {
                    MessageBox.error(err.message);
                }
            });

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
        _onAvatarPress1: function (oEvent) {
            console.log("HI");
            this._avatarPress = true;

        },
        onSearch : function(oEvent) {
          var oModel =  this.getModel("oData");
          console.log("abcd");
        },
        onInit: function () {

            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.attachRouteMatched(this.handleRouteMatched, this);
            this.oFclModel = this.getOwnerComponent().getModel("FclRouter");
            this.oFclModel.setProperty('/targetAggregation', 'beginColumnPages');
            this.oFclModel.setProperty('/expandIcon', {});
            this.oFclModel.setProperty('/headerExpanded', true);
            this.oFclModel.setProperty('/footerVisible', false);

            this.oView.setModel(new sap.ui.model.json.JSONModel({}), 'fclButton');
            this.oView.setModel(new sap.ui.model.json.JSONModel({
                filter: {
                    position: "",
                    department: "",
                    class: "",
                    type: "",
                    location: "",
                    supervisor: ""
                },
                position: [{
                    ID: 1,
                    name: "Position 1"
                }, {
                    ID: 2,
                    name: "Position 2"
                }, {
                    ID: 3,
                    name: "Position 3"
                }],
                department: [{
                    ID: 1,
                    name: "Department 1"
                }, {
                    ID: 2,
                    name: "Department 2"
                }, {
                    ID: 3,
                    name: "Department 3"
                }, {
                    ID: 4,
                    name: "Department 4"
                }, {
                    ID: 5,
                    name: "Department 5"
                }, {
                    ID: 6,
                    name: "Department 6"
                }, {
                    ID: 7,
                    name: "Department 7"
                }],
                class: [{
                    ID: 1,
                    name: "Class 1"
                }, {
                    ID: 2,
                    name: "Class 2"
                }, {
                    ID: 3,
                    name: "Class 3"
                }],
                type: [{
                    ID: 1,
                    name: "Permenant"
                }, {
                    ID: 2,
                    name: "Contract"
                }]
            }), 'filter');
            this.onEmployeeInit();
           // this.setCustProperty("EmployeeOpenPositions", {});
           // this.setCustProperty("OpenPositionsEmployee", {});

        },
        onAfterRendering: function () {
            var oInput = this.getView().byId("fDepartment");
            jQuery.sap.delayedCall(0, this, function () {
                oInput.focus();
            });
        },
        onSuggest: function (oEvent) {
            var sTerm = oEvent.getParameter("suggestValue");
            var aFilters = [];
            if (sTerm) {
                aFilters.push(new Filter("name", FilterOperator.Contains, sTerm));
            }

            oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
        },
        initiateTransfer: function(){
            var flex = {};
        },
        cancelSimulation: function(){},
        onExit: function () {

            // to destroy templates for bound aggregations when templateShareable is true on exit to prevent duplicateId issue
            var aControls = [{
                "controlId": "sap_Table_Page_0-content-build_simple_Table-2",
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

        }
        
    });
});