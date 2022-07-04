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
    "sap/m/library",
    "sap/ui/core/Fragment",
    "sap/ui/Device",
    "sap/ui/export/Spreadsheet",
    "sap/m/TablePersoController",
    "./TablePersonalisation/TablePersoService"
], function (BaseController, MessageBox, History, Filter, FilterOperator, Button, Dialog, ButtonType, Text, JSONModel,
    BindingMode, cMessage, library, Fragment, Device, Spreadsheet, TablePersoController, TablePersoService) {
    "use strict";

    return BaseController.extend("transferinitiation.controller.EmployeeList", {
        
        /**
         * This method is implemented for handling intial seeting when the route 
         * for this page is called
        **/
        handleRouteMatched: function (oEvent) {
            var oParams = oEvent.getParameters();
            this.currentRouteName = oParams.name;
            var sContext;

            // Multiple Coulm layout related settings on navigation
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
            // Data settings for two column layout
            this.oView.getModel('fclButton').setProperty('/visible', false);

            if (oEvent.mParameters.arguments.layout && oEvent.mParameters.arguments.layout.includes('FullScreen')) {
                this.oFclModel.setProperty('/expandIcon/img', 'sap-icon://exit-full-screen');
                this.oFclModel.setProperty('/expandIcon/tooltip', 'Exit Full Screen Mode');
            } else {
                this.oFclModel.setProperty('/expandIcon/img', 'sap-icon://full-screen');
                this.oFclModel.setProperty('/expandIcon/tooltip', 'Enter Full Screen Mode');
            }

            if (this.getCustProperty("TransferInitiated")) {
                this.onSearch();
                this.setCustProperty("TransferInitiated", false);
            }

        },
        /**
         * This method is implemented for handling the even onPress  
         * for the table. The context for the two column layout and user id is paased to the router.
        **/
        _onTableItemPress: function (oEvent) {
            console.log(111);
            var oBindingContext = oEvent.getParameter("listItem") ? oEvent.getParameter("listItem").getBindingContext("OP") : oEvent.getSource().getParent().getBindingContext('OP');
            this.setCustProperty("EmployeeContext", oBindingContext);
            this._employeeContext = oBindingContext;
            this.oFclModel = this.getOwnerComponent().getModel("FclRouter");
            this.oFclModel.setProperty('/uiSelected', (oEvent.getParameter("listItem") ? oEvent.getParameter("listItem").getDomRef() : oEvent.getSource().getParent().getDomRef()));
            var oSettingsModel = this.getView().getModel('settings');
            oSettingsModel.setProperty("/navigatedItem", oBindingContext.getProperty("userId"));

            return new Promise(function (fnResolve) {
                var sBeginContext = this.oFclModel.getProperty("/beginContext");
                var sMidContext = oBindingContext.getPath();
                var oNextUIState = this.getOwnerComponent().getSemanticHelper().getNextUIState(1);
                var sNextLayout = oNextUIState.layout;
                this.oRouter.navTo("OpenPositions", {
                    ID: oBindingContext.getProperty("userId"),
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

        },
        /**
         * This method is implemented for handling the event Update started during Pagination.
         * The API is called with parameter Top and Skip
        **/
        onUpdateStarted: function (oEvent) {
            if (oEvent.getParameter("reason") === "Growing") {
                var filters = this.getModel("filter").getData().filter;
                var oFilters = this._builFilters(filters);
                var mModel = this.getView().getModel('OP');
                var mData = mModel.getData();
                // this._onOdataCall('EmployeeJobs', oFilters, (this._sCount + 2), mData.EmployeeJobs.length);
                let _url = oFilters !== undefined ? '/http/getEmpData?' + oFilters : '/http/getEmpData?';
                this._cpiAPI(_url, (this._sCount), (this._skipCount * this._sCount));
                mData.currentLength = mData.EmployeeJobs.length + this._sCount;
            }
        },
        handlePagination: function () {
            var filters = this.getModel("filter").getData().filter;
            var oFilters = this._builFilters(filters);
            var mModel = this.getView().getModel('OP');
            var mData = mModel.getData();
            if (mData.Count === mData.currentLength) {
                return;
            }
            // this._onOdataCall('EmployeeJobs', oFilters, (this._sCount + 2), mData.EmployeeJobs.length);
            let _url = oFilters !== undefined ? '/http/getEmpData?' + oFilters : '/http/getEmpData?';
            this._cpiAPI(_url, (this._sCount), (this._skipCount * this._sCount));
            mData.currentLength = mData.EmployeeJobs.length + this._sCount;
        },
        /**
         * This method is implemented for handling the event onPress on employee profile link
         * The context for the two column layout and user id is paased to the router.
        **/
        onViewProfile: function (oEvent) {
            var oBindingContext = oEvent.getSource().getParent().oBindingContexts.OP;
            return new Promise(function (fnResolve) {
                var sBeginContext = this.oFclModel.getProperty("/beginContext");
                var sMidContext = oEvent.getSource().getBindingContext("OP").getPath();
                var oNextUIState = this.getOwnerComponent().getSemanticHelper().getNextUIState(1);
                var sNextLayout = oNextUIState.layout;
                this.setCustProperty("EmployeeProfile", oBindingContext.getProperty(""));
                this.oRouter.navTo("EmployeeProfile", {
                    ID: oBindingContext.getProperty("userId"),
                    beginContext: sBeginContext,
                    midContext: sMidContext,
                    layout: sNextLayout
                }, false);

            }.bind(this)).catch(function (err) {
                if (err !== undefined) {
                    MessageBox.error(err.message);
                }
            });
        },
        /**
         * This method is implemented for handling the clear event of the filterbar
        **/
        _onClear: function (oEvent) {
            var fData = this.getModel("filter").getData();
            fData.filter = {
                position: "",
                department: "",
                EmploymentClass: "",
                EmploymentType: "",
                location: "",
                supervisor: ""
            };
            this.getModel("filter").setData(fData);
            var fModel = this.getView().getModel('filter');
            var fData = fModel.getData();
            fData.currentPage = 0;
            fModel.setData(fData);
            //this._onOdataCall('EmployeeJobs', [], this._sCount, 0);
        },
        /**
         * This method is implemented for handling the clear event of the filterbar
        **/
        onClear: function (oEvent) {
            //this.oFilterBar = this.byId("filterbar0"); 
            var oItems = this.oFilterBar.getAllFilterItems(true);
            for (var i = 0; i < oItems.length; i++) {
                var oControl = this.oFilterBar.determineControlByFilterItem(oItems[i]);
                if (oControl) {
                    oControl.setValue("");
                }
            }
        },
        /**
         * This method is implemented for handling the download action of the search result.
        **/
        onExcelDownload: function () {
            var i18n = this.oView.getModel("i18n");
            var aColumns = [];
            aColumns.push({
                label: i18n.getResourceBundle().getText("employee"),
                property: "userId"
            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("employeeName"),
                property: ['lastName', 'firstName'],
                template: '{0} {1}'

            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("departmentId"),
                property: "department"
            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("department"),
                property: "departmentName"
            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("classId"),
                property: "employeeClass",

            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("class"),
                property: "employeeClassName",

            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("typeId"),
                property: "employmentType"
            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("type"),
                property: "employmentTypeName"
            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("locationId"),
                property: "location",

            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("location"),
                property: "locationName",

            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("supervisorId"),
                property: "managerId"
            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("supervisor"),
                property: "managerName"
            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("criteria"),
                property: ['eligibility', 'description'],
                template: '{0} : {1}'

            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("positionId"),
                property: "position"
            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("position"),
                property: "positionTitle"
            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("newPosition"),
                property: "newPosition"
            });
            aColumns.push({
                label: i18n.getResourceBundle().getText("status"),
                property: "transferStatus"
            });

            var mSettings = {
                workbook: {
                    columns: aColumns,
                    context: {
                        application: 'Transfer Plan Open',
                        version: '1.98.0',
                        title: 'Transfer Plan Initiation',
                        modifiedBy: 'Logged in User',
                        sheetName: 'Employee Information'
                    },
                    hierarchyLevel: 'level'
                },
                dataSource: this.getModel("OP").getData().EmployeeJobs,
                fileName: "Employee Information.xlsx"
            };
            var oSpreadsheet = new Spreadsheet(mSettings);
            oSpreadsheet.onprogress = function (iValue) {
                ("Export: %" + iValue + " completed");
            };
            oSpreadsheet.build()
                .then(function () { ("Export is finished"); })
                .catch(function (sMessage) { ("Export error: " + sMessage); });
        },
        /**
         * This method is implemented for handling the routing of flexible column layout.
        **/
        doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation, iNextLevel) {
            var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
            var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

            var routePattern = this.oRouter.getRoute(sRouteName).getPattern().split('/');
            var contextFilter = new RegExp('^:.+:$');
            var pagePattern = routePattern.filter(function (pattern) {
                var contextPattern = pattern.match(contextFilter);
                return contextPattern === null || contextPattern === undefined;
            });
            iNextLevel = iNextLevel !== undefined ? iNextLevel : pagePattern ? pagePattern.length - 1 : 0;
            this.oFclModel = this.oFclModel ? this.oFclModel : this.getOwnerComponent().getModel("FclRouter");

            var sEntityNameSet;
            var oNextUIState = this.getOwnerComponent().getSemanticHelper().getNextUIState(iNextLevel);
            var sBeginContext, sMidContext, sEndContext;
            if (iNextLevel === 0) {
                sBeginContext = sPath;
            }

            if (iNextLevel === 1) {
                sBeginContext = this.oFclModel.getProperty("/beginContext");
                sMidContext = sPath;
            }

            if (iNextLevel === 2) {
                sBeginContext = this.oFclModel.getProperty("/beginContext");
                sMidContext = this.oFclModel.getProperty("/midContext");
                sEndContext = sPath;
            }

            var sNextLayout = oNextUIState.layout;

            if (sPath !== null && sPath !== "") {
                if (sPath.substring(0, 1) === "/") {
                    sPath = sPath.substring(1);
                    if (iNextLevel === 0) {
                        sBeginContext = sPath;
                    } else if (iNextLevel === 1) {
                        sMidContext = sPath;
                    } else {
                        sEndContext = sPath;
                    }
                }
                sEntityNameSet = sPath.split("(")[0];
            }
            var sNavigationPropertyName;
            if (sEntityNameSet !== null) {
                sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet, sRouteName);
            }
            if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
                if (sNavigationPropertyName === "") {
                    this.oRouter.navTo(sRouteName, {
                        beginContext: sBeginContext,
                        midContext: sMidContext,
                        endContext: sEndContext,
                        layout: sNextLayout
                    }, false);
                } else {
                    oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function (bindingContext) {
                        if (bindingContext) {
                            sPath = bindingContext.getPath();
                            if (sPath.substring(0, 1) === "/") {
                                sPath = sPath.substring(1);
                            }
                        } else {
                            sPath = "undefined";
                        }
                        if (iNextLevel === 0) {
                            sBeginContext = sPath;
                        } else if (iNextLevel === 1) {
                            sMidContext = sPath;
                        } else {
                            sEndContext = sPath;
                        }

                        // If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
                        if (sPath === "undefined") {
                            this.oRouter.navTo(sRouteName, {
                                layout: sNextLayout
                            });
                        } else {
                            this.oRouter.navTo(sRouteName, {
                                beginContext: sBeginContext,
                                midContext: sMidContext,
                                endContext: sEndContext,
                                layout: sNextLayout
                            }, false);
                        }
                    }.bind(this));
                }
            } else {
                this.oRouter.navTo(sRouteName, {
                    layout: sNextLayout
                });
            }

            if (typeof fnPromiseResolve === "function") {

                fnPromiseResolve();
            }

        },
        /**
         * This method is implemented for handling the Expand event of flexible column layout.
        **/
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
        /**
         * This method is implemented for handling the Close button action of flexible column layout.
        **/
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
        /**
         * This method is implemented for handling the search event of the filterbar.
        **/
        onSearch: async function (oEvent) {
            var fModel = this.getView().getModel('filter');
            var fData = fModel.getData();
            var filters = fData.filter;
            filters.eligible = false;
            this.onEligibleCB();
            fModel.setData(fData);
            var oFilters = this._builFilters(filters);
            var mModel = this.getView().getModel('OP');
            var mData = mModel.getData();
            console.log(oFilters);
            try {

                if (oFilters.length > 0) {

                    fData.currentPage = 0;
                    fModel.setData(fData);
                    this._oFilters = oFilters;
                    //this._onOdataCall('EmployeeJobs', oFilters, this._sCount, 0);
                    let _url = oFilters !== undefined ? '/http/getEmpData?' + oFilters : "/http/getEmpData?";
                    var _countURL = oFilters !== undefined ? '/http/getEmpCount?' + oFilters : "/http/getEmpCount?";
                    this._cpiAPI(_url, (this._sCount), 0);
                    mData.currentLength = this._sCount;
                    mData.Count = await this.asyncAjax(_countURL);
                    if (mData.Count.hasOwnProperty('length') && mData.Count !== "") {
                        mData.Count = parseInt(mData.Count);
                    }
                } else {
                    mData = this.getModel('OP').getData();
                    var _countURL = '/http/getEmpCount?';
                    var url = '/http/getEmpData?';
                    mData.Count = await this.asyncAjax(_countURL);
                    if (mData.Count.hasOwnProperty('length') && mData.Count !== "") {
                        mData.Count = parseInt(mData.Count);
                    }
                    mData.currentLength = this._sCount;
                    this._cpiAPI(url, (this._sCount), 0);
                }
            } catch (error) {
                throw error;
            }
        },
        /**
         * This method is implemented for creating the url by building filter values.
        **/
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
                oFilters.push(new Filter("position", FilterOperator.EQ, filters.position.split(' ')[0]));
                _url = _url + 'position=' + filters.position.split(' ')[0] + '&';
            }
            if (filters.EmploymentClass) {
                oFilters.push(new Filter("employeeClass", FilterOperator.EQ, filters.EmploymentClass.split(' ')[0]));
                _url = _url + 'employeeClass=' + filters.EmploymentClass.split(' ')[0] + '&';
            }
            if (filters.EmploymentType) {
                oFilters.push(new Filter("employmentType", FilterOperator.EQ, filters.EmploymentType.split(' ')[0]));
                _url = _url + 'employmentType=' + filters.EmploymentType.split(' ')[0] + '&';
            }
            if (filters.employee) {
                oFilters.push(new Filter("userId", FilterOperator.EQ, filters.employee.split(' ')[0]));
                _url = _url + 'user=' + filters.employee.split(' ')[0] + '&';
            }
            return _url;
        },
        /**
         * This method is implemented for marking Navigated property.
        **/
        isNavigated: function (sNavigatedItemId, sItemId) {
            return sNavigatedItemId === sItemId;
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
        /**
         * This method is implemented for formatting the table header text.
        **/
        employeeCount: function (sText, sCount, sCurrentLength) {
            return sText + ' ( ' + sCurrentLength + ' / ' + sCount + ' ) :'
        },
        onEligibleCB: function (oEvent) {
            this.byId("table0").setBusy(true);
            var eligibleFilter;
            if (this.getModel('filter').getData().filter.eligible) {
                eligibleFilter = new Filter('eligibility', FilterOperator.NE, 'Error');
                this.byId("table0").getBinding("items").filter([eligibleFilter]);
            } else {
                if (this._nonEligible.length > 0) {
                    var mModel = this.getView().getModel('OP');
                    var mData = mModel.getData();
                    mData.EmployeeJobs.push.apply(mData.EmployeeJobs, this._nonEligible);
                    mModel.setData(mData);
                    this._nonEligible = [];
                }
                eligibleFilter = new Filter('eligibility', FilterOperator.NE, '');
                this.byId("table0").getBinding("items").filter([eligibleFilter]);
            }
            this.byId("table0").setBusy(false);
        },
        /**
         * This method is implemented for handling the Global lifecycle method onINIT.
        **/
        onInit: async function () {

            sap.ui.getCore().attachLocalizationChanged(function (oEvent) {
                var oChanges = oEvent.getParameter("changes");
                if (oChanges && oChanges.language) {
                    // this._bundle = sap.ui.getCore().getLibraryResourceBundle(oChanges.language);
                    // this.byId("filterbar0").rerender();
                    //  this.rerender();
                    let oView = sap.ui.getCore().byId("EmployeeList");
                }
            }.bind(this));
            this._sCount = Math.round(((Device.resize.height - 10 - 285) / 40)) - 1;

            if (!this.oView) {
                this.oView = this.getView();
            }
            // initialize and activate Table persolation controller
            this._oTPC = this._initializeTablePersonalization(this.byId("table0"), TablePersoService);
            // initialize router and attach route handler
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.attachRouteMatched(this.handleRouteMatched, this);
            // Load control density based on the device
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
            // initialize the model for two column layout
            this.oFclModel = this.getOwnerComponent().getModel("FclRouter");
            this.oFclModel.setProperty('/targetAggregation', 'beginColumnPages');
            this.oFclModel.setProperty('/expandIcon', {});
            this.oFclModel.setProperty('/headerExpanded', true);
            this.oFclModel.setProperty('/footerVisible', false);
            this.mData = {
                filter: {
                    position: "",
                    department: "",
                    EmploymentClass: "",
                    EmploymentType: "",
                    location: "",
                    supervisor: "",
                    employee: "",
                    eligible: false
                },
                position: [],
                department: [],
                EmploymentClass: [],
                EmploymentType: [],
                location: [],
                totalPage: 0,
                currentPage: 0,
                pageText: '',
                top: (Math.round(((Device.resize.height - 10 - 285) / 40)) - 2)
            };
            this.oView.setModel(new sap.ui.model.json.JSONModel({}), 'fclButton');
            this.oView.setModel(new JSONModel(this.mData), 'filter');
            this.oView.setModel(new JSONModel({ Count: 0, currentLength: 0, EmployeeJobs: [] }), 'OP');
            this.onEmployeeInit();
            this._skipCount = 1;
            this._nonEligible = [];
            this._oFilters = [];

            var oMessageManager;
            // set message model
            oMessageManager = sap.ui.getCore().getMessageManager();
            this.oView.setModel(oMessageManager.getMessageModel(), "message");

            // or just do it for the whole view
            oMessageManager.registerObject(this.oView, true);
            this.oFilterBar = this.byId("filterbar0");
            this.byId("table0").setBusy(true);
            var oSettingsModel = new JSONModel({ navigatedItem: "" });
            this.getView().setModel(oSettingsModel, 'settings');
            await this._getUser();
            this.startInactivityTimer(14);
        },
        /**
         * This method is implemented for handling the Global lifecycle method onAfterRendering.
        **/
        onAfterRendering: async function () {
            this._sCount = Math.round(((Device.resize.height - 10 - (225 + this.getView().byId("filterbar0").$().height())) / 40));
            this.getView().byId("table0").setGrowingThreshold(this._sCount);
            var fModel = this.getView().getModel('OP');
            var fData = fModel.getData();
            var filters = this.getModel("filter").getData().filter;
            var url = this._builFilters(filters);
            var _countURL = url !== undefined ? '/http/getEmpCount?' + url : '/http/getEmpCount?';
            url = url !== undefined ? '/http/getEmpData?' + url : '/http/getEmpData?';

            try {
                if (this.getCustProperty("Back") !== true) {

                    this.setCustProperty("Back", false);
                    // this._onOdataCall('EmployeeJobs', [], this._sCount, 0);
                    // this._onOdataCall('EmployeeJobs', [], (this._sCount + 2), 0);
                    fData.Count = await this.asyncAjax(_countURL);
                    fData.currentLength = this._sCount;
                    this._cpiAPI(url, (this._sCount ), 0);
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
                    var oInput = this.getView().byId("fDepartment");
                    jQuery.sap.delayedCall(1000, this, function () {
                        oInput.focus();
                    });

                } else {

                    // fData.currentPage = 0;
                    fModel.setData(fData);
                    if (fData.EmployeeJobs.length === 0) {
                        // this._onOdataCall('EmployeeJobs', [], this._sCount, 0);
                        //this._onOdataCall('EmployeeJobs', [], (this._sCount + 2), 0);
                        fData.Count = await this.asyncAjax(_countURL);
                        fData.currentLength = this._sCount;
                        this._cpiAPI(url, (this._sCount), 0);
                    }
                }
            } catch (error) {
                throw error;
            }
            var self = this;
            this.startInactivityTimer(14);
            /**
             * Each time a request is issued, reset the inactivity countdown
             */
            this.getModel('oData').attachRequestCompleted(function (oEvent) {
                self.resetInactivityTimeout();
            }, this);
        },
        /**
         * This method is implemented for handling the Global lifecycle method onEXIT.
        **/
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
                            "$top": 20,
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
            // var sTerm = oEvent.getParameter("suggestValue");
            //var aFilters = [];
            //aFilters.push(new Filter("status", FilterOperator.EQ, 'A'));
            this.getModel('oData').read("/FOLocation",
                {
                    async: true,
                    urlParameters: {
                        // "$top": 20,
                        //  "test": "((substringof('"+ sTerm + "',externalCode) or substringof('" + sTerm + "',name)) and status eq 'A'"
                    },
                    filters: aFilters,
                    success: function (sData, sResult) {
                        var mModel = this.getView().getModel('filter');
                        var mData = mModel.getData();
                        mData.location = [];
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
                            mData.location.push({
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
        //################ Private APIs ###################
        /**
         * This method is implemented for modularising the repeated Odata calls.
        **/
        _onOdataCall: async function (oUrl, oFilters, oTop, oSkip) {
            this.byId("table0").setBusy(true);
            // var oViewModel = this.getView().getModel('OP');
            var oDataModel = this.getView().getModel("oData");
            this._oSkip = oSkip;
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
                        if (this._oSkip === 0) {
                            mData.EmployeeJobs = sData.results;
                        } else {
                            mData.EmployeeJobs.push.apply(mData.EmployeeJobs, sData.results);;
                        }

                        mModel.setData(mData);
                        var fModel = this.getView().getModel('filter');
                        var fData = fModel.getData();
                        fData.totalPage = Math.ceil(mData.Count / this._sCount);
                        fData.currentPage = fData.currentPage + 1;
                        fModel.setData(fData);
                        this.byId("table0").setBusy(false);
                    }.bind(this),
                    error: function (sData, sResult) {
                        console.log(sData);
                        //this.oGlobalBusyDialog.close();
                        this.byId("table0").setBusy(false);
                    }
                })
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
                if (result !== "" && !result.EmpJob.hasOwnProperty(length)) {
                    result.EmpJob = [result.EmpJob];
                } else if (result === "") {
                    result = {};
                    result.EmpJob = [];
                }
                var mModel = this.getView().getModel('OP');
                var mData = mModel.getData();

                // console.log(args);
                //this.getView().getModel('OP').setData({ "OpenPositions": sData.results });
                if (oSkip === 0) {
                    mData.EmployeeJobs = result.EmpJob;
                    this._skipCount = 1;
                } else {
                    var eligibility = this.getModel('filter').getData().filter.eligible;
                    var resultFilter = [];
                    if (eligibility) {
                        for (let i = 0; i < result.EmpJob.length; i++) {
                            if (result.EmpJob.eligibility !== 'Error') {
                                resultFilter.push(result.EmpJob[i]);
                            } else {
                                this._nonEligible.push(result.EmpJob);
                            }
                        }
                    } else {
                        resultFilter = result.EmpJob;
                    }
                    mData.EmployeeJobs.push.apply(mData.EmployeeJobs, resultFilter);
                    this._skipCount += 1;
                }
                if (mData.currentLength > (mData.EmployeeJobs.length + this._nonEligible.length)) {
                    mData.currentLength = mData.EmployeeJobs.length;
                }
                mModel.setData(mData);
                // this.onEligibleCB();
                this.resetInactivityTimeout();
                this.byId("table0").setBusy(false);
                // this.onEligibleCB();

            } catch (error) {
                this.resetInactivityTimeout();
                console.log(error);
                this.byId("table0").setBusy(false);
                throw error;
            }
            
            return;
        }
    });
});