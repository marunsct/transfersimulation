sap.ui.define([
    "./BaseController",
    "sap/ui/Device",
    "sap/ui/model/Filter",
    "sap/ui/core/routing/History",
    "sap/suite/ui/commons/networkgraph/layout/LayeredLayout",
    "sap/suite/ui/commons/networkgraph/layout/ForceBasedLayout",
    "sap/suite/ui/commons/networkgraph/ActionButton",
    "sap/suite/ui/commons/networkgraph/Node",
    "sap/ui/core/Fragment",
    'sap/ui/model/json/JSONModel'

],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (Controller, Device, Filter, History, LayeredLayout, ForceBasedLayout, ActionButton, Node, Fragment, JSONModel) {
        "use strict";
        var STARTING_PROFILE = "Dinter";
        var TransferRequests= {
            "TransferReq": [
                {
                    "employeeid": "1001",
                    "name": "Employee Name",
                    "department": "Department A",
                    "employmentType": "Employment Type",
                    "supervisor": "Supervisor Name",
                    "eliginility": "eligible",
                    "currentpos": "Current Position",
                    "newpos": "New Position",
                    "Status": "Pending",
                    "comments": ""
                },
                {
                    "employeeid": "1002",
                    "name": "Employee Name",
                    "department": "Department A",
                    "employmentType": "Employment Type",
                    "supervisor": "Supervisor Name",
                    "eliginility": "warning",
                    "currentpos": "Current Position",
                    "newpos": "New Position",
                    "Status": "Approved",
                    "comments": "The transfer request for this employees is approved"
                },
                {
                    "employeeid": "1003",
                    "name": "Employee Name",
                    "department": "Department A",
                    "employmentType": "Employment Type",
                    "supervisor": "Supervisor Name",
                    "eliginility": "eligble",
                    "currentpos": "Current Position",
                    "newpos": "New Position",
                    "Status": "Pending",
                    "comments": ""
                },
                {
                    "employeeid": "1004",
                    "name": "Employee Name",
                    "department": "Department A",
                    "employmentType": "Employment Type",
                    "supervisor": "Supervisor Name",
                    "eliginility": "eligble",
                    "currentpos": "Current Position",
                    "newpos": "New Position",
                    "Status": "Pending",
                    "comments": ""
                },
                {
                    "employeeid": "1005",
                    "name": "Employee Name",
                    "department": "Department A",
                    "employmentType": "Employment Type",
                    "supervisor": "Supervisor Name",
                    "eliginility": "warning",
                    "currentpos": "Current Position",
                    "newpos": "New Position",
                    "Status": "Pending",
                    "comments": ""
                },
                {
                    "employeeid": "1006",
                    "name": "Employee Name",
                    "department": "Department A",
                    "employmentType": "Employment Type",
                    "supervisor": "Supervisor Name",
                    "eliginility": "eligble",
                    "currentpos": "Current Position",
                    "newpos": "New Position",
                    "Status": "Approved",
                    "comments": "The transfer request for this employees is approved"
                },
                {
                    "employeeid": "1007",
                    "name": "Employee Name",
                    "department": "Department A",
                    "employmentType": "Employment Type",
                    "supervisor": "Supervisor Name",
                    "eliginility": "eligble",
                    "currentpos": "Current Position",
                    "newpos": "New Position",
                    "Status": "Pending",
                    "comments": ""
                },
                {
                    "employeeid": "1008",
                    "name": "Employee Name",
                    "department": "Department A",
                    "employmentType": "Employment Type",
                    "supervisor": "Supervisor Name",
                    "eliginility": "warning",
                    "currentpos": "Current Position",
                    "newpos": "New Position",
                    "Status": "Approved",
                    "comments": "The transfer request for this employees is approved"
                },
                {
                    "employeeid": "1009",
                    "name": "Employee Name",
                    "department": "Department A",
                    "employmentType": "Employment Type",
                    "supervisor": "Supervisor Name",
                    "eliginility": "eligble",
                    "currentpos": "Current Position",
                    "newpos": "New Position",
                    "Status": "Rejected",
                    "comments": "The transfer request for this employees is approved"
                },
                {
                    "employeeid": "1010",
                    "name": "Employee Name",
                    "department": "Department A",
                    "employmentType": "Employment Type",
                    "supervisor": "Supervisor Name",
                    "eliginility": "eligble",
                    "currentpos": "Current Position",
                    "newpos": "New Position",
                    "Status": "Pending",
                    "comments": ""
                },
                {
                    "employeeid": "1011",
                    "name": "Employee Name",
                    "department": "Department A",
                    "employmentType": "Employment Type",
                    "supervisor": "Supervisor Name",
                    "eliginility": "warning",
                    "currentpos": "Current Position",
                    "newpos": "New Position",
                    "Status": "Pending",
                    "comments": ""
                },
                {
                    "employeeid": "1012",
                    "name": "Employee Name",
                    "department": "Department A",
                    "employmentType": "Employment Type",
                    "supervisor": "Supervisor Name",
                    "eliginility": "eligble",
                    "currentpos": "Current Position",
                    "newpos": "New Position",
                    "Status": "Approved",
                    "comments": "The transfer request for this employees is approved"
                },
                {
                    "employeeid": "1013",
                    "name": "Employee Name",
                    "department": "Department A",
                    "employmentType": "Employment Type",
                    "supervisor": "Supervisor Name",
                    "eliginility": "eligble",
                    "currentpos": "Current Position",
                    "newpos": "New Position",
                    "Status": "Pending",
                    "comments": ""
                },
                {
                    "employeeid": "1014",
                    "name": "Employee Name",
                    "department": "Department A",
                    "employmentType": "Employment Type",
                    "supervisor": "Supervisor Name",
                    "eliginility": "warning",
                    "currentpos": "Current Position",
                    "newpos": "New Position",
                    "Status": "Rejected",
                    "comments": "The transfer request for this employees is rejected"
                }
            ]
        };
        return Controller.extend("transferapproval.controller.TransferDetail", {

            onInit: function () {
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this.oRouter.attachRouteMatched(this.handleRouteMatched, this);
                this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
                try {
                    var sPath = jQuery.sap.getModulePath("transferapproval", "/controller/Data.json");
                    var oModel = new sap.ui.model.json.JSONModel(sPath);

                    // Load JSON in model
                    this.getView().setModel(oModel, "data");

                    // Load JSON in model
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
                        TransferReq1: [{
                            "employeeid": "1003",
                            "name": "Employee Name",
                            "department": "Department A",
                            "employmentType": "Employment Type",
                            "supervisor": "Supervisor Name",
                            "eliginility": "eligble",
                            "currentpos": "Current Position",
                            "newpos": "New Position",
                            "Status": "Pending"
                        }],
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
                        enabled: false,
                        height: (Math.round(Device.resize.height * 0.695)) + 'px',
                        height1: (Math.round(Device.resize.height * 0.7)) + 'px'

                    };

                    this.getView().setModel(new sap.ui.model.json.JSONModel(this._vData), 'OP');
                    this.getView().setModel(new sap.ui.model.json.JSONModel(this._vData), 'data1');


                } catch (error) {
                    console.log(error);
                }

                /*    */
                this._oModel = new sap.ui.model.json.JSONModel({
                    "nodes": [
                        {
                            "id": "Dinter",
                            "lid": 1,
                            "lane": 0,
                            "title": "Sophie Dinter",
                            "visible": true,
                            "children": [2],
                            "src": "https://sapui5.hana.ondemand.com/sdk/test-resources/sap/suite/ui/commons/demokit/images/people/i2.jpg",
                            "attributes": [
                                {
                                    "label": 35,
                                    "value": ""
                                }
                            ],
                            "team": 3,
                            "location": "Walldorf",
                            "position": "Global Solutions Manager",
                            "email": "sophie.dinter@example.com",
                            "phone": "+000 423 230 000"
                        },
                        {
                            "id": "Ninsei",
                            "lid": 2,
                            "lane": 1,
                            "children": [3],
                            "visible": true,
                            "title": "Yamasaki Ninsei",
                            "src": "https://sapui5.hana.ondemand.com/sdk/test-resources/sap/suite/ui/commons/demokit/images/people/male_GordonR.jpg",
                            "attributes": [
                                {
                                    "label": 9,
                                    "value": ""
                                }
                            ],
                            "supervisor": "Dinter",
                            "team": 2,
                            "location": "Walldorf",
                            "position": "Lead Markets Manager",
                            "email": "yamasaki.ninsei@example.com",
                            "phone": "+000 423 230 002"
                        },
                        {
                            "id": "Mills",
                            "lid": 3,
                            "lane": 2,
                            "children": [],
                            "visible": false,
                            "title": "Henry Mills",
                            "src": "https://sapui5.hana.ondemand.com/sdk/test-resources/sap/suite/ui/commons/demokit/images/people/male_MillerM.jpg",
                            "attributes": [
                                {
                                    "label": 4,
                                    "value": ""
                                }
                            ],
                            "supervisor": "Ninsei",
                            "team": 0,
                            "location": "Praha",
                            "position": "Sales Manager",
                            "email": "henry.mills@example.com",
                            "phone": "+000 423 232 003"

                        }],
                    "lines": [
                        {
                            "from": "Dinter",
                            "to": "Ninsei"
                        },
                        {
                            "from": "Ninsei",
                            "to": "Mills"
                        }
                    ],
                    "lanes": [
                        {
                            "id": "0",
                            "position": 0,

                        },
                        {
                            "id": "1",
                            "position": 1,

                        },
                        {
                            "id": "2",
                            "position": 2,

                        }
                    ]
                });
                //this._oModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);

                this._sTopSupervisor = STARTING_PROFILE;
                this._mExplored = [this._sTopSupervisor];

                this._graph = this.byId("graph");
                this.getView().setModel(this._oModel, "graph");

                this._setFilter();

                this._graph.attachEvent("beforeLayouting", function (oEvent) {
                    // nodes are not rendered yet (bOutput === false) so their invalidation triggers parent (graph) invalidation
                    // which results in multiple unnecessary loading
                    this._graph.preventInvalidation(true);
                    this._graph.getNodes().forEach(function (oNode) {
                        var oExpandButton, oDetailButton, oUpOneLevelButton,
                            sTeamSize = this._getCustomDataValue(oNode, "team"),
                            sSupervisor;

                        oNode.removeAllActionButtons();

                        if (!sTeamSize) {
                            // employees without team - hide expand buttons
                            oNode.setShowExpandButton(false);
                        } else {
                            if (this._mExplored.indexOf(oNode.getKey()) === -1) {
                                // managers with team but not yet expanded
                                // we create custom expand button with dynamic loading
                                oNode.setShowExpandButton(false);

                                // this renders icon marking collapse status
                                oNode.setCollapsed(true);
                                oExpandButton = new ActionButton({
                                    title: "Expand",
                                    icon: "sap-icon://sys-add",
                                    press: function () {
                                        oNode.setCollapsed(false);
                                        this._loadMore(oNode.getKey());
                                    }.bind(this)
                                });
                                oNode.addActionButton(oExpandButton);
                            } else {
                                // manager with already loaded data - default expand button
                                oNode.setShowExpandButton(true);
                            }
                        }

                        // add detail link -> custom popover
                        oDetailButton = new ActionButton({
                            title: "Detail",
                            icon: "sap-icon://person-placeholder",
                            press: function (oEvent) {
                                this._openDetail(oNode, oEvent.getParameter("buttonElement"));
                            }.bind(this)
                        });
                        oNode.addActionButton(oDetailButton);

                        // if current user is root we can add 'up one level'
                        if (oNode.getKey() === this._sTopSupervisor) {
                            sSupervisor = this._getCustomDataValue(oNode, "supervisor");
                            if (sSupervisor) {
                                oUpOneLevelButton = new ActionButton({
                                    title: "Up one level",
                                    icon: "sap-icon://arrow-top",
                                    press: function () {
                                        var aSuperVisors = oNode.getCustomData().filter(function (oData) {
                                            return oData.getKey() === "supervisor";
                                        }),
                                            sSupervisor = aSuperVisors.length > 0 && aSuperVisors[0].getValue();

                                        this._loadMore(sSupervisor);
                                        this._sTopSupervisor = sSupervisor;
                                    }.bind(this)
                                });
                                oNode.addActionButton(oUpOneLevelButton);
                            }
                        }
                    }, this);
                    this._graph.preventInvalidation(false);
                }.bind(this));
            },
            _getCustomDataValue: function (oNode, sName) {
                var aItems = oNode.getCustomData().filter(function (oData) {
                    return oData.getKey() === sName;
                });

                return aItems.length > 0 && aItems[0].getValue();
            },
            onNodePress: function (oEvent) {
                console.log(oEvent);
                var oNode = oEvent.getParameters();
                if (oNode.getBindingContext("graph").getProperty("visible")) {

                    if (!this._oQuickView) {
                        Fragment.load({
                            name: "transferapproval.view.TooltipFragment",
                            type: "XML"
                        }).then(function (oFragment) {
                            this._oQuickView = oFragment;
                            this._oQuickView.setModel(new JSONModel({
                                icon: oNode.getBindingContext("graph").getProperty("src"),
                                title: oNode.getBindingContext("graph").getProperty("title"),
                                description: oNode.getBindingContext("graph").getProperty("position"),
                                location: oNode.getBindingContext("graph").getProperty("location"),
                                showTeam: !!oNode.getBindingContext("graph").getProperty("team"),
                                teamSize: oNode.getBindingContext("graph").getProperty("team"),
                                email: oNode.getBindingContext("graph").getProperty("email"),
                                phone: oNode.getBindingContext("graph").getProperty("phone")
                            }));

                            setTimeout(function () {
                                this._oQuickView.openBy(oNode);
                            }.bind(this), 0);
                        }.bind(this));
                    } else {
                        this._oQuickView.setModel(new JSONModel({
                            icon: oNode.getBindingContext("graph").getProperty("src"),
                            title: oNode.getBindingContext("graph").getProperty("title"),
                            description: oNode.getBindingContext("graph").getProperty("position"),
                            location: oNode.getBindingContext("graph").getProperty("location"),
                            showTeam: !!oNode.getBindingContext("graph").getProperty("team"),
                            teamSize: oNode.getBindingContext("graph").getProperty("team"),
                            email: oNode.getBindingContext("graph").getProperty("email"),
                            phone: oNode.getBindingContext("graph").getProperty("phone")
                        }));

                        setTimeout(function () {
                            this._oQuickView.openBy(oNode);
                        }.bind(this), 0);
                    }
                } else {
                    //oNode.getBindingContext("graph").setProperty("visible", true);
                    let sPath = oNode.getBindingContext("graph").sPath + "/visible";
                    this.getView().getModel("graph").setProperty(sPath, true)
                }
            },
            _openDetail: function (oNode, oButton) {
                var sTeamSize = this._getCustomDataValue(oNode, "team");

                if (!this._oQuickView) {
                    Fragment.load({
                        name: "transferapproval.view.TooltipFragment",
                        type: "XML"
                    }).then(function (oFragment) {
                        this._oQuickView = oFragment;
                        this._oQuickView.setModel(new JSONModel({
                            icon: this._getCustomDataValue(oNode, "src"),
                            title: oNode.getDescription(),
                            description: this._getCustomDataValue(oNode, "position"),
                            location: this._getCustomDataValue(oNode, "location"),
                            showTeam: !!sTeamSize,
                            teamSize: sTeamSize,
                            email: this._getCustomDataValue(oNode, "email"),
                            phone: this._getCustomDataValue(oNode, "phone")
                        }));

                        setTimeout(function () {
                            this._oQuickView.openBy(oButton);
                        }.bind(this), 0);
                    }.bind(this));
                } else {
                    this._oQuickView.setModel(new JSONModel({
                        icon: this._getCustomDataValue(oNode, "src"),
                        title: oNode.getDescription(),
                        description: this._getCustomDataValue(oNode, "position"),
                        location: this._getCustomDataValue(oNode, "location"),
                        showTeam: !!sTeamSize,
                        teamSize: sTeamSize,
                        email: this._getCustomDataValue(oNode, "email"),
                        phone: this._getCustomDataValue(oNode, "phone")
                    }));

                    setTimeout(function () {
                        this._oQuickView.openBy(oButton);
                    }.bind(this), 0);
                }
            },
            search: function (oEvent) {
                var sKey = oEvent.getParameter("key");

                if (sKey) {
                    this._mExplored = [sKey];
                    this._sTopSupervisor = sKey;
                    this._graph.destroyAllElements();
                    this._setFilter();

                    oEvent.bPreventDefault = true;
                }
            },
            suggest: function (oEvent) {
                var aSuggestionItems = [],
                    aItems = this._oModel.getData().nodes,
                    aFilteredItems = [],
                    sTerm = oEvent.getParameter("term");

                sTerm = sTerm ? sTerm : "";

                aFilteredItems = aItems.filter(function (oItem) {
                    var sTitle = oItem.title ? oItem.title : "";
                    return sTitle.toLowerCase().indexOf(sTerm.toLowerCase()) !== -1;
                });

                aFilteredItems.sort(function (oItem1, oItem2) {
                    var sTitle = oItem1.title ? oItem1.title : "";
                    return sTitle.localeCompare(oItem2.title);
                }).forEach(function (oItem) {
                    aSuggestionItems.push(new sap.m.SuggestionItem({
                        key: oItem.id,
                        text: oItem.title
                    }));
                });

                this._graph.setSearchSuggestionItems(aSuggestionItems);
                oEvent.bPreventDefault = true;
            },
            _setFilter: function () {
                var aNodesCond = [],
                    aLinesCond = [];
                var fnAddBossCondition = function (sBoss) {
                    aNodesCond.push(new sap.ui.model.Filter({
                        path: 'id',
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: sBoss
                    }));

                    aNodesCond.push(new sap.ui.model.Filter({
                        path: 'supervisor',
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: sBoss
                    }));
                };

                var fnAddLineCondition = function (sLine) {
                    aLinesCond.push(new sap.ui.model.Filter({
                        path: "from",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: sLine
                    }));
                };

                this._mExplored.forEach(function (oItem) {
                    fnAddBossCondition(oItem);
                    fnAddLineCondition(oItem);
                });

                this._graph.getBinding("nodes").filter(new sap.ui.model.Filter({
                    filters: aNodesCond,
                    and: false
                }));

                this._graph.getBinding("lines").filter(new sap.ui.model.Filter({
                    filters: aLinesCond,
                    and: false
                }));
            },
            _loadMore: function (sName) {
                this._graph.deselect();
                this._mExplored.push(sName);
                this._graph.destroyAllElements();
                this._setFilter();
            },
            linePress: function (oEvent) {
                oEvent.bPreventDefault = true;
            },
            handleRouteMatched: function (oEvent) {
                var oParams = oEvent.getParameters();
                this.currentRouteName = oParams.name;
                this._employeeId = oParams.arguments.ID;
                var sContext;
                this._avatarPress = false;

                // this.oFclModel.setProperty('/headerExpanded', true);

            },
            _onPageNavButtonPress: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();

                if (sPreviousHash !== undefined) {
                    // window.history.go(-1);
                    this.oRouter.navTo("TransferList");
                } else {
                    this.oRouter.navTo("TransferList");
                }
            },
            onViewProfile: function () {
                this.oRouter.navTo("EmployeeProfile", {
                    ID: this._employeeId
                }, false);
            },

            onFilterSelect: function (oEvent) {

            },
            editPosition: function (oEvent) {
                var sId = oEvent.getSource().getBindingContext("data1").getProperty("employeeid");
                this.oRouter.navTo("OpenPositions", {
                    ID: sId
                }, false);
            },
            performanceColor: function (sGrade) {
                switch (sGrade) {
                    case "D":
                        return "performanceNegative";
                    case "C":
                        return "performanceNeutral";
                    case "B":
                        return "performanceNeutralM";
                    case "A":
                        return "performancePositive";
                    default:
                        return "performanceNeutral";

                }
            },

            onAfterRendering: function () {
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

                var oData =  this.getModel("data1").getData();
                oData.TransferReq1 = [];
                TransferRequests.TransferReq.forEach( item => {
                    if (item.employeeid == this._employeeId ){
                        oData.TransferReq1.push(item);
                    }
                })
                oData.enabled = oData.TransferReq1[0].Status === 'Pending' ? true : false;
                this.getModel("data1").setData(oData);

            },
            onAccept: function (oEvent) {
                // var tbl = this.getView().byId('TransferReqTable');
                var i18n = this.oView.getModel("i18n");
                let sTitle = i18n.getResourceBundle().getText("confirm");
                // var sText = i18n.getResourceBundle().getText("reject");
                let sFirstButton = i18n.getResourceBundle().getText("yes");
                let sSecondButton = i18n.getResourceBundle().getText("cancel");
                let sText = i18n.getResourceBundle().getText("approve");

                this._createDialog(sTitle, sText, sFirstButton, sSecondButton, this._onPageNavButtonPress, this.callBackFunc, this);
            },
            onReject: function (oEvent) {
                // var tbl = this.getView().byId('TransferReqTable');
                var i18n = this.oView.getModel("i18n");
                let sTitle = i18n.getResourceBundle().getText("confirm");
                // var sText = i18n.getResourceBundle().getText("reject");
                let sFirstButton = i18n.getResourceBundle().getText("yes");
                let sSecondButton = i18n.getResourceBundle().getText("cancel");
                let sText = i18n.getResourceBundle().getText("reject");

                this._createDialog(sTitle, sText, sFirstButton, sSecondButton, this._onPageNavButtonPress, this.callBackFunc, this);

            },
            callBackFunc: function () {
                console.log("Dialog Method");
               // this._onPageNavButtonPress();
            }
        });
    });
