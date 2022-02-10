sap.ui.define([
    "./BaseController",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/m/Button',
    'sap/m/Dialog',
    'sap/m/ButtonType',
    'sap/m/Text',
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/BindingMode",
    "sap/ui/core/message/Message",
    "sap/ui/core/library",
    "sap/ui/core/Fragment",
    "sap/ui/Device"

], function (BaseController, MessageBox, History, Filter, FilterOperator, Button, Dialog, ButtonType, Text, JSONModel, BindingMode, cMessage, library, Fragment, Device) {
    "use strict";

    // shortcut for sap.ui.core.MessageType
    var MessageType = library.MessageType;

    return BaseController.extend("initiator.controller.EmployeeList", {

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

                var oBindingContext = oEvent.getParameter("listItem").getBindingContext("OP");
                this.setCustProperty("EmployeeContext", oBindingContext);
                this._employeeContext = oBindingContext;
                return new Promise(function (fnResolve) {
                    // var sBeginContext = this.oFclModel.getProperty("/beginContext");
                    // var sMidContext = oEvent.getParameter("listItem").getBindingContext("OP").getPath();
                    // var oNextUIState = this.getOwnerComponent().getSemanticHelper().getNextUIState(1);
                    // var sNextLayout = oNextUIState.layout;
                    //  this.oFclModel.setProperty('/headerExpanded', false);
                    //this.doNavigate("Page7", oBindingContext, fnResolve, "", 1);
                    this.oRouter.navTo("OpenPositions", {
                        ID: oBindingContext.getProperty("userId"),
                        //context: oBindingContext, 
                        // beginContext: sBeginContext,
                        // midContext: sMidContext,
                        // layout: sNextLayout
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
        avatarInitialsFormatter: function (sFirst, sLast, sBoolean) {
            if (!sBoolean) {
                return (typeof sFirst === 'string' && typeof sLast === 'string') ? sLast.substr(0, 1) + sFirst.substr(0, 1) : 'NA';
            }
        },
        productCount: function (sText, sCount, sCurrentPage, sTop) {
            var sCurrent = sCurrentPage;
            var sLast = Math.ceil(sCount / sTop)
            if (sCurrentPage === 0) {
                sCurrent = 1;
            }
            if (sCurrentPage !== sLast) {
                return sText + ' ( ' + ((sTop * (sCurrent - 1)) + 1) + ' - ' + (sTop * sCurrent) + ' ) : ';
            } else {
                return sText + ' ( ' + ((sTop * (sCurrent - 1)) + 1) + ' - ' + sCount + ' ) : ';
            }

        },
        pageText: function (sCurrent, sLast) {
            return 'Page ' + sCurrent + ' of ' + sLast;
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
        onSearch: function (oEvent) {
            var oModel = this.getModel("oData");
            console.log("abcd");
        },
        onInit: function () {

            sap.ui.getCore().attachLocalizationChanged(function (oEvent) {
                var oChanges = oEvent.getParameter("changes");
                if (oChanges && oChanges.language) {
                    // this._bundle = sap.ui.getCore().getLibraryResourceBundle(oChanges.language);
                    // this.byId("filterbar0").rerender();
                    //  this.rerender();
                }
            }.bind(this));
            this._sCount = Math.round(((Device.resize.height - 250) / 40)) - 2;
            if (!this.oView) {
                this.oView = this.getView();
            }
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.attachRouteMatched(this.handleRouteMatched, this);
            this.oFclModel = this.getOwnerComponent().getModel("FclRouter");
            this.oFclModel.setProperty('/targetAggregation', 'beginColumnPages');
            this.oFclModel.setProperty('/expandIcon', {});
            this.oFclModel.setProperty('/headerExpanded', true);
            this.oFclModel.setProperty('/footerVisible', false);

            this.oView.setModel(new JSONModel({}), 'fclButton');
            this.oView.setModel(new JSONModel({
                filter: {
                    position: "",
                    department: "",
                    EmploymentClass: "",
                    EmploymentType: "",
                    location: "",
                    supervisor: ""
                },
                position: [],
                department: [],
                EmploymentClass: [],
                EmploymentType: [],
                location: [],
                totalPage: 0,
                currentPage: 0,
                pageText: '',
                top: (Math.round(((Device.resize.height - 250) / 40)) - 2)
            }), 'filter');
            this.oView.setModel(new JSONModel({ Count: 100, EmployeeJobs: [] }), 'OP');
            this.onEmployeeInit();
            // this.setCustProperty("EmployeeOpenPositions", {});
            // this.setCustProperty("OpenPositionsEmployee", {});

            var oMessageManager, oView;



            // set message model
            oMessageManager = sap.ui.getCore().getMessageManager();
            this.oView.setModel(oMessageManager.getMessageModel(), "message");

            // or just do it for the whole view
            oMessageManager.registerObject(this.oView, true);

            this.byId("table0").setBusy(true);


        },
        onAfterRendering: async function () {
            /*
                        this.getModel('oData').read("/FOLocation",
                            {
                                async: true,
                                urlParameters: {
                                     "$top": 20,
                                },
                                
                                success: function (sData, sResult) {
                                    var mModel = this.getView().getModel('filter');
                                    var mData = mModel.getData();
                                    mData.location = [];
                                    let desc;
                                    for (var i = 0; i < sData.results.length; i++) {
                                        switch (this.getLocale()) {
                                            case "JA":
                                                desc = (sData.results[i].nameTranslationNav.value_ja_JP !== null) ? sData.results[i].nameTranslationNav.value_ja_JP : sData.results[i].nameTranslationNav.value_defaultValue;
                                                break;
                                            case "EN":
                                                desc = (sData.results[i].nameTranslationNav.value_en_US !== null) ? sData.results[1].nameTranslationNav.value_en_US : sData.results[i].nameTranslationNav.value_defaultValue;
                                                break;
                                            default:
                                                desc = sData.results[i].nameTranslationNav.value_defaultValue;
                                                break;
                                        }
                                        mData.location.push({
                                            "ID": sData.results[i].externalCode,
                                            "name": sData.results[i].externalCode + ' ' +  desc
                                        });
                                    }
            
                                    mModel.setData(mData);
            
                                }.bind(this),
                                error: function (sData, sResult) {
                                    console.log(sData);
            
                                }
                            });
            */
            if (this.getCustProperty("Back") !== true) {
                this.setCustProperty("Back", false);
                var location = await this.asyncAjax("/v2/cpi-api/FOLocation");
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
                            desc = (sData.results[i].nameTranslationNav.value_en_US !== null) ? sData.results[1].nameTranslationNav.value_en_US : sData.results[i].nameTranslationNav.value_defaultValue;
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

                var oInput = this.getView().byId("fDepartment");
                jQuery.sap.delayedCall(1000, this, function () {
                    oInput.focus();
                });
                
            } else {
                var fModel = this.getView().getModel('filter');
                var fData = fModel.getData();
                fData.currentPage = 0;
                fModel.setData(fData);
            }
            this._onOdataCall('EmployeeJobs', [], this._sCount, 0);
        },
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

        },
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
                        "$top": 20,
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
                                    desc = (sData.results[i].label_en_US !== null) ? sData.results[1].label_en_US : sData.results[i].label_defaultValue;
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
                        "$top": 20,
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
                                    desc = (sData.results[i].label_en_US !== null) ? sData.results[1].label_en_US : sData.results[i].label_defaultValue;
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
        onSuggestDepart: async function (oEvent) {
            var sTerm = oEvent.getParameter("suggestValue");
            var aFilters = [];
            if (sTerm.length > 1) {
                this.oGlobalBusyDialog = new sap.m.BusyDialog();
                // this.oGlobalBusyDialog.open();
                //aFilters.push(new Filter("name", FilterOperator.Contains, sTerm));

                var filter1 = new Filter({
                    filters: [new Filter("startswith(externalCode,'" + sTerm + "')", FilterOperator.EQ, true),
                    new Filter("startswith(name_ja_JP,'" + sTerm + "')", FilterOperator.EQ, true),
                    new Filter("startswith(name_en_US,'" + sTerm + "')", FilterOperator.EQ, true),
                    new Filter("startswith(name,'" + sTerm + "')", FilterOperator.EQ, true),
                    new Filter("substringof('" + sTerm + "',externalCode)")
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
                            "$top": 20,
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
                                        desc = (sData.results[i].name_en_US !== null) ? sData.results[1].name_en_US : sData.results[i].name;
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
                            /*
                                                     mData.department = sData.results.map(item => {
                                                         return {
                                                             "ID": item.externalCode,
                                                             "name": item.name
                                                         };
                                                     });
                                                     */
                            mModel.setData(mData);
                            this.oGlobalBusyDialog.close();
                        }.bind(this),
                        error: function (sData, sResult) {
                            console.log(sData);
                            this.oGlobalBusyDialog.close();
                        }
                    });

                oGlobalBusyDialog.close();
            }
            /*
                var url = "/v2/cpi-api/FODepartment?$top=20&$filter=startswith(externalCode,'" + sTerm + "') eq true or startswith(name_ja_JP,'" + sTerm + "') eq true or startswith(name,'" + sTerm + "')";
                var a = await this.asyncAjax(url);
                var result = await this.asyncOdata(aFilters);
                console.log(result);
                if (result) {
                    var mModel = this.getView().getModel('filter');
                    var mData = mModel.getData();
                    mData.department = result;
                    mModel.setData(mData);
                }
                //}
                aFilters.push(new Filter({
                    filters: [new Filter("name", FilterOperator.Contains, sTerm),
                    new Filter("ID", FilterOperator.Contains, sTerm)], and: false
                }));
    
                oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
                */
        },
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
                            "$top": 20,
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
                                        desc = (sData.results[i].externalName_en_US !== null) ? sData.results[1].externalName_en_US : sData.results[i].externalName_defaultValue;
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
        onSuggestLocation: async function (oEvent) {
            var sTerm = oEvent.getParameter("suggestValue");
            var aFilters = [];
            aFilters.push(new Filter("status", FilterOperator.EQ, 'A'));
        },
        asyncAjax: async function (sUrl) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: sUrl,
                    success: function (result) {
                        console.log('Call answered by server'); //Second text in console
                        resolve(result);
                    },
                    error: function (request, status, errorThrown) {
                        console.log(status);
                        reject({ data: 'Example 6 returns an error' });
                    }
                });
            });
        },
        asyncOdata: async function (aFilters) {
            var oModel = this.getModel('oData');
            var that = this;
            return new Promise(function (resolve, reject) {
                oModel.read("/FODepartment",
                    {
                        async: true,
                        urlParameters: {
                            "$top": 20,

                        },
                        filters: aFilters,
                        success: function (sData, sResult) {

                            var department = sData.results.map(item => {
                                return {
                                    "ID": item.externalCode,
                                    "name": item.name
                                };
                            });

                            resolve(department);
                        },
                        error: function (sData, sResult) {
                            console.log(sData);
                            resolve(false);
                        }
                    });
            });
        },
        onSuggestLoc: function (oEvent) {
            var sTerm = oEvent.getParameter("suggestValue");
            var aFilters = [];
            if (sTerm) {
                aFilters.push(new Filter("name", FilterOperator.Contains, sTerm));
            }

            oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
        },
        initiateTransfer: function () {
            var flex = {};

            var i18n = this.oView.getModel("i18n");
            var sText = i18n.getResourceBundle().getText("initiateTransfer");
            var sFirstButton = i18n.getResourceBundle().getText("yes");
            var sSecondButton = i18n.getResourceBundle().getText("cancel");
            var sTitle = i18n.getResourceBundle().getText("confirm");

            this._createDialog(sTitle, sText, sFirstButton, sSecondButton, true);

        },
        cancelSimulation: function () {
            var i18n = this.oView.getModel("i18n");
            var sText = i18n.getResourceBundle().getText("transfercancel");
            var sFirstButton = i18n.getResourceBundle().getText("yes");
            var sSecondButton = i18n.getResourceBundle().getText("cancel");
            var sTitle = i18n.getResourceBundle().getText("confirm");

            this._createDialog(sTitle, sText, sFirstButton, sSecondButton, false);
        },
        onMessagePopoverPress: function (oEvent) {
            var oSourceControl = oEvent.getSource();
            this._getMessagePopover().then(function (oMessagePopover) {
                oMessagePopover.openBy(oSourceControl);
            });
        },
        onClearPress: function () {
            // does not remove the manually set ValueStateText we set in onValueStatePress():
            sap.ui.getCore().getMessageManager().removeAllMessages();
        },
        onMessageClose: function () {
            this._oPopover = this.getView().byId("popover");
            this._onMessageClose(this);
        },
        onNext: function () {
            var fData = this.getView().getModel('filter').getData();
            this._onOdataCall('EmployeeJobs', [], this._sCount, fData.currentPage * this._sCount);
        },
        onPrevious: function () {
            var fData = this.getView().getModel('filter').getData();
            this._onOdataCall('EmployeeJobs', [], this._sCount, (fData.currentPage - 2) * this._sCount);
            fData.currentPage = fData.currentPage - 2;
        },
        //################ Private APIs ###################

        _getMessagePopover: function () {
            var oView = this.getView();

            // create popover lazily (singleton)
            if (!this._pMessagePopover) {
                this._pMessagePopover = Fragment.load({
                    id: oView.getId(),
                    //name: "initiator.view.fragments.MessagePopover"
                    name: "initiator.view.fragments.MessagePopover"
                }).then(function (oMessagePopover) {
                    oView.addDependent(oMessagePopover);
                    return oMessagePopover;
                });
            }
            return this._pMessagePopover;
        },
        _createTransferPlan: async function () {
            this.onClearPress();
            // do async post
            if (Math.round(Math.random()) === 1) {
                var oMessage = new cMessage({
                    message: "My generated success message",
                    description: "",
                    additionalText: "Generaal",
                    type: MessageType.Success,
                    processor: this.getView().getModel()
                });
                sap.ui.getCore().getMessageManager().addMessages(oMessage);
                oMessage = new cMessage({
                    message: "My generated success message1",
                    description: "",
                    additionalText: "Generaal",
                    type: MessageType.Success,
                    processor: this.getView().getModel()
                });
                sap.ui.getCore().getMessageManager().addMessages(oMessage);
                oMessage = new cMessage({
                    message: "My generated success message",
                    description: "",
                    additionalText: "Employee 1119008",
                    type: MessageType.Error,
                    processor: this.getView().getModel()
                });
                sap.ui.getCore().getMessageManager().addMessages(oMessage);

            } else {
                var oMessage = new cMessage({
                    message: "My generated success message",
                    type: MessageType.Error,
                    processor: this.getView().getModel()
                });
                sap.ui.getCore().getMessageManager().addMessages(oMessage);
            }
        },
        _createDialog: function (sTitle, sText, sFirstButton, sSecondButton, sTransfer) {
            var dialog = new Dialog({
                title: sTitle,
                type: 'Message',
                content: new Text({ text: sText }),
                beginButton: new Button({
                    type: ButtonType.Emphasized,
                    text: sFirstButton,
                    press: function () {
                        if (sTransfer) {

                            this._createTransferPlan();


                        } else {
                            this.resetCustProperty();
                            this.oFclModel.setProperty('/footerVisible', false);
                        }

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
        _onOdataCall: function (oUrl, oFilters, oTop, oSkip) {
            this.byId("table0").setBusy(true);
            var oViewModel = this.getView().getModel('OP');
            var oDataModel = this.getView().getModel("oData");
            oDataModel.read("/" + oUrl,
                {
                    async: true,
                    urlParameters: {
                        "$top": oTop,
                        "$skip": oSkip
                    },
                    filters: oFilters,
                    success: function (sData, sResult) {
                        var mModel = this.getView().getModel('OP');
                        var mData = mModel.getData();
                        // console.log(args);
                        //this.getView().getModel('OP').setData({ "OpenPositions": sData.results });
                        mData.EmployeeJobs = sData.results;
                        mModel.setData(mData);
                        var fModel = this.getView().getModel('filter');
                        var fData = fModel.getData();
                        fData.totalPage = Math.ceil(mData.Count / fData.top);
                        fData.currentPage = fData.currentPage + 1;
                        fModel.setData(fData);
                        if (fData.currentPage > 1) {
                            this.byId("bPrevious").setEnabled(true);
                        } else {
                            this.byId("bPrevious").setEnabled(false);
                        }
                        if (fData.currentPage !== fData.totalPage) {
                            this.byId("bNext").setEnabled(true);
                        } else {
                            this.byId("bNext").setEnabled(false);
                        }
                        this.byId("table0").setBusy(false);
                    }.bind(this),
                    error: function (sData, sResult) {
                        console.log(sData);
                        //this.oGlobalBusyDialog.close();
                        this.byId("table0").setBusy(false);
                    }
                })
        }


    });
});


//oData>Employee_Photo