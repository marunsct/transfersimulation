sap.ui.define([
    "./BaseController",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator"
], function (BaseController, History, MessageBox, BusyIndicator) {
    "use strict";


    return BaseController.extend("transferinitiation.controller.EmployeeProfile", {

        handleRouteMatched: function (oEvent) {
           // BusyIndicator.show();
            var oParams = oEvent.getParameters()
            this._employeeId = oParams.arguments.ID;
            this.currentRouteName = oParams.name;
            var sContext;
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
            if (this._employeeId !== undefined) {
                //this.getEmpJob(this._employeeId);
                this.getEmployyeProfile(this._employeeId);
            }

        },
        _onPageNavButtonPress: function () {
            this.setCustProperty("Back", true);
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            try {
                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    this.oRouter.navTo("EmployeeList", {}, false);
                }
            } catch (error) {
                if (err !== undefined) {
                    MessageBox.error(err.message);
                }
            }

            // var oQueryParams = this.getQueryParameters(window.location);
            // var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

        },
        onInit: function () {
           // BusyIndicator.show(0);
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.attachRouteMatched(this.handleRouteMatched, this);
            this.oFclModel = this.getOwnerComponent().getModel("FclRouter");
            this.oFclModel.setProperty('/targetAggregation', 'beginColumnPages');
            this.oFclModel.setProperty('/expandIcon', {});
            this.oView.setModel(new sap.ui.model.json.JSONModel({}), 'fclButton');
            let data = {
                EmpJob: {
                    "userId": "",
                    "personIdExternal": "",
                    "department": "",
                    "departmentName": "",
                    "departmentEntryDate": "",
                    "managerId": "",
                    "managerName": "",
                    "employmentType": "",
                    "employmentTypeName": "",
                    "employeeClass": "",
                    "employeeClassName": "",
                    "location": "",
                    "locationName": "",
                    "position": "",
                    "positionTitle": "",
                    "lastName": "",
                    "lastNameAlt1": "",
                    "lastNameAlt2": "",
                    "firstName": "",
                    "firstNameAlt1": "",
                    "firstNameAlt2": "",
                    "eligibility": "",
                    "description": "",
                    "transferStatus": "",
                    "transferInitiationDate": "",
                    "newPosition": "",
                    "psGroup": "",
                    "psLevel": "",
                    "company": "",
                    "customString6": "",
                    "lastTransDate":"",
                    "psGroupL":"",
                    "psLevelL":""
                },
                Performance: {
                    rating1: "",
                    rating2: "",
                    rating3: "",
                    ry1:"",
                    ry2:"",
                    ry3: ""
                },
                PerPerson: {
                    personIdExternal: "",
                    dateOfBirth: "",
                    phoneNum: "",
                    email: "",
                    date60: "",
                    hireDate: "",
                    photo: "",
                    gender: ""
                },
                Nomination: [{
                    id: "NA",
                    rank: "NA",
                    ready: "NA",
                    note: "NA"
                }],
                Photo: {},
                prevDepartment: {
                    id:"NA",
                    dept:""
                },
                AdditionalInfo: {
                    user: "",
                    leadership: "",
                    leadershipText: "",
                    performance: "",
                    performanceText: "",
                    bEye: "",
                    bEyeText: "",
                    reform: "",
                    reformText: "",
                    empDev: "",
                    empDevText: "",
                    q1: "",
                    q2: ""
                },
                Academy: "NA"

            };
            
            this.oView.setModel(new sap.ui.model.json.JSONModel(data), 'PR');

            sap.ui.getCore().attachLocalizationChanged(function (oEvent) {
                var oChanges = oEvent.getParameter("changes");
                if (oChanges && oChanges.language) {
                    // this._bundle = sap.ui.getCore().getLibraryResourceBundle(oChanges.language);
                    // this.byId("filterbar0").rerender();
                    //  this.rerender();
                    if (this._employeeId !== undefined) {
                        //this.getEmpJob(this._employeeId);
                        this.setCustProperty("EmployeeProfile", undefined);
                        this.getEmployyeProfile(this._employeeId);
                    }
                }
            }.bind(this));

        },
        onAfterRendering: async function () {
            //  var sp4ID = this.byId('hp4');
            //  var sp3ID = this.byId('hp3');
            //  sp4ID.addStyleClass(this.performanceColor('A'));
            //  sp3ID.addStyleClass(this.performanceColor('B'));
            let performance = this.getModel('PR').getProperty("/Performance")
            var sp2ID = this.byId('hp2');
            var sp1ID = this.byId('hp1');
            var sp0ID = this.byId('hp0');
            this.removeStyle(sp0ID);
            this.removeStyle(sp1ID);
            this.removeStyle(sp2ID);
            //sp2ID.addStyleClass(this.performanceColor(performance.rating3));
            //sp1ID.addStyleClass(this.performanceColor(performance.rating2));
            //sp0ID.addStyleClass(this.performanceColor(performance.rating1));

            let transferSettings = this.getCustProperty("TransferSettings") !== undefined ? this.getCustProperty("TransferSettings") : null;
            if (transferSettings === null) {
                transferSettings = {};
                transferSettings = await this.asyncAjax("/SFSF/odata/v2/cust_TransferSimSettings");
                this.setCustProperty("TransferSettings", transferSettings.d.results[0]);
            }
        },
        onExit: function () {
            this.getView().destroy();
        },
        removeStyle: function (sId) {
            sId.removeStyleClass("performancePositive");
            sId.removeStyleClass("performanceNegative");
            sId.removeStyleClass("performanceNegativeM");
            sId.removeStyleClass("performanceNeutralM");
            sId.removeStyleClass("performanceNeutral");

        },
        performanceColor: function (sGrade) {
            switch (sGrade) {
                case "0":
                    return "performanceNegative";
                case "1":
                    return "performanceNegativeM";
                case "2":
                    return "performanceNeutral";
                case "3":
                    return "performanceNeutralM";
                case "4":
                    return "performancePositive";
                default:
                    return "performanceNeutral";

            }
        },
        additionalInfo: function (sGrade) {
            switch (sGrade) {
                case "03":
                    return "performancePositive";
                case "02":
                    return "performanceNeutral";
                case "01":
                    return "performanceNegative";
                default:
                    return "performanceNeutral";

            }
        },
        getEmployyeProfile: async function (sUser) {
            BusyIndicator.show();
            this._count = 0;
            var oModel = this.getModel("PR");
            let mData = oModel.getData();
            this._count += 1;
            if (this.getCustProperty("EmployeeProfile") !== undefined) {
                mData.EmpJob = this.getCustProperty("EmployeeProfile");
                this._count += 1;
                this.getNomination(mData.EmpJob.position)
                this.getPrevDepart(mData.EmpJob.userId,mData.EmpJob.position, this.getFDate(mData.EmpJob.lastTransDate))
            } else {
                this.getEmpJob(sUser);
            }
            this.getPerPerson(sUser);
            this.getAddInfo(sUser);
            this.getAcadInfo(sUser);
            let transferSettings = this.getCustProperty("m") !== undefined ? this.getCustProperty("TransferSettings") : null;
            if (transferSettings === null) {
                transferSettings = {};
                transferSettings = await this.asyncAjax("/SFSF/odata/v2/cust_TransferSimSettings");
                this.setCustProperty("TransferSettings", transferSettings.d.results[0]);
                transferSettings = this.getCustProperty("TransferSettings")
                let sUrl = "/SFSF/odata/v2/FormHeader?$top=10&$filter=(formTemplateId eq '" + transferSettings.cust_formTemplateIdY1 + "' or formTemplateId eq '" + transferSettings.cust_formTemplateIdY2 + "' or formTemplateId eq '" + transferSettings.cust_formTemplateIdY3 + "') and isRated eq true and formSubjectId eq '" + sUser + "'";
                this.getPerformance(sUrl);
            } else {
                let sUrl = "/SFSF/odata/v2/FormHeader?$top=10&$filter=(formTemplateId eq '" + transferSettings.cust_formTemplateIdY1 + "' or formTemplateId eq '" + transferSettings.cust_formTemplateIdY2 + "' or formTemplateId eq '" + transferSettings.cust_formTemplateIdY3 + "') and isRated eq true and formSubjectId eq '" + sUser + "'";
                this.getPerformance(sUrl);
            }
            oModel.setData(mData);
        },
        setBusy: function (sCount) {
            console.log(sCount);
            if (sCount >= 7) {
                BusyIndicator.hide()
            }
        },
        getFDate: function (sDate) {
            let day,month, year;
            day =sDate.substring(8,10);
            month = sDate.substring(5,7);
            year = sDate.substring(0,4);

            if(day === "01"){
                day = "30";
                if(month === "01"){
                    month = "12";
                    year = parseInt(year) - 1;
                }else{
                    month = parseInt(month) - 1;
                    month = month + "";
                    if(month.length ===1){
                        month = "0" + month;
                    }
                }

            }else{
                day = "01";
            }

            return (year + "-" + month + "-" + day)
        },
        getEmpJob: function (sUserId) {
            let lang;
            if (sap.ui.getCore().getConfiguration().getLanguage() === 'ja') {
                lang = 'lang=ja_JP';
            } else {
                lang = 'lang=en_US';
            }
            let url = '/http/getEmpData?' + lang + '&top=2&skip=0&user=' + sUserId;
            $.ajax({
                url: url,
                method: "GET",
                this: this,
                contentType: "application/json",
                headers: {
                    "Accept": "application/json"
                },

                success: function (result) {
                    console.log(result);
                    this.getModel("PR").setProperty("/EmpJob", JSON.parse(result).EmpJob);
                    // BusyIndicator.hide();
                    this._count += 1;
                    let fres = JSON.parse(result).EmpJob;
                    this.getNomination(fres.position);
                    this.getPrevDepart(fres.userId,fres.position, this.getFDate(fres.lastTransDate));
                    this.setBusy(this._count);
                }.bind(this),
                error: function (request, status, errorThrown) {
                    this._count += 1;
                    this.setBusy(this._count);
                    console.log(request);
                    // BusyIndicator.hide();
                }.bind(this)
            });

        },
        getAddInfo: function (sUserId) {
            let url = "/SFSF/odata/v2/cust_Transfer_sim_additional_info?$expand=cust_EmployeeDevelopmentNav,cust_LeadershipNav,cust_PerformanceContributionNav,cust_ReformorientedNav,cust_BirdseyeviewNav&$filter=externalCode eq '" + sUserId + "'";
            $.ajax({
                url: url,
                method: "GET",
                this: this,
                contentType: "application/json",
                headers: {
                    "Accept": "application/json"
                },

                success: function (result) {
                    console.log(result);
                    let lang;
                    var ai2ID = this.byId('ai2');
                    var ai1ID = this.byId('ai1');
                    var ai3ID = this.byId('ai3');
                    var ai4ID = this.byId('ai4');
                    var ai5ID = this.byId('ai5');
                    this.removeStyle(ai1ID);
                    this.removeStyle(ai2ID);
                    this.removeStyle(ai3ID);
                    this.removeStyle(ai4ID);
                    this.removeStyle(ai5ID);
                    if (sap.ui.getCore().getConfiguration().getLanguage() === 'ja') {
                        lang = 'ja_JP';
                    } else {
                        lang = 'en_US';
                    }
                    if (result.d.results.length === 0) {
                        let AdditionalInfo = {
                            user: "NA",
                            leadership: "NA",
                            leadershipText: "NA",
                            performance: "NA",
                            performanceText: "NA",
                            bEye: "NA",
                            bEyeText: "NA",
                            reform: "NA",
                            reformText: "NA",
                            empDev: "NA",
                            empDevText: "NA",
                            q1: "NA",
                            q2: "NA"
                        }
                        ai1ID.addStyleClass(this.additionalInfo('0'));
                        ai2ID.addStyleClass(this.additionalInfo('0'));
                        ai3ID.addStyleClass(this.additionalInfo('0'));
                        ai4ID.addStyleClass(this.additionalInfo('0'));
                        ai5ID.addStyleClass(this.additionalInfo('0'));
                        this.getModel("PR").setProperty("/AdditionalInfo", AdditionalInfo);
                        return;
                    }
                    let addInfo = {

                        user: result.d.results[0].externalCode,
                        leadership: result.d.results[0].cust_Leadership,
                        leadershipText: (lang === 'ja_JP' && result.d.results[0].cust_LeadershipNav.label_ja_JP !== null) ? result.d.results[0].cust_LeadershipNav.label_ja_JP :
                            (lang === 'en_US' && result.d.results[0].cust_LeadershipNav.label_en_US !== null) ? result.d.results[0].cust_LeadershipNav.label_en_US :
                                result.d.results[0].cust_LeadershipNav.label_defaultValue,
                        performance: result.d.results[0].cust_PerformanceContribution,
                        performanceText: (lang === 'ja_JP' && result.d.results[0].cust_PerformanceContributionNav.label_ja_JP !== null) ? result.d.results[0].cust_PerformanceContributionNav.label_ja_JP :
                            (lang === 'en_US' && result.d.results[0].cust_PerformanceContributionNav.label_en_US !== null) ? result.d.results[0].cust_PerformanceContributionNav.label_en_US :
                                result.d.results[0].cust_PerformanceContributionNav.label_defaultValue,
                        bEye: result.d.results[0].cust_Birdseyeview,
                        bEyeText: (lang === 'ja_JP' && result.d.results[0].cust_BirdseyeviewNav.label_ja_JP !== null) ? result.d.results[0].cust_BirdseyeviewNav.label_ja_JP :
                            (lang === 'en_US' && result.d.results[0].cust_BirdseyeviewNav.label_en_US !== null) ? result.d.results[0].cust_BirdseyeviewNav.label_en_US :
                                result.d.results[0].cust_BirdseyeviewNav.label_defaultValue,
                        reform: result.d.results[0].cust_Reformoriented,
                        reformText: (lang === 'ja_JP' && result.d.results[0].cust_ReformorientedNav.label_ja_JP !== null) ? result.d.results[0].cust_ReformorientedNav.label_ja_JP :
                            (lang === 'en_US' && result.d.results[0].cust_ReformorientedNav.label_en_US !== null) ? result.d.results[0].cust_ReformorientedNav.label_en_US :
                                result.d.results[0].cust_ReformorientedNav.label_defaultValue,
                        empDev: result.d.results[0].cust_EmployeeDevelopment,
                        empDevText: (lang === 'ja_JP' && result.d.results[0].cust_EmployeeDevelopmentNav.label_ja_JP !== null) ? result.d.results[0].cust_EmployeeDevelopmentNav.label_ja_JP :
                            (lang === 'en_US' && result.d.results[0].cust_EmployeeDevelopmentNav.label_en_US !== null) ? result.d.results[0].cust_EmployeeDevelopmentNav.label_en_US :
                                result.d.results[0].cust_EmployeeDevelopmentNav.label_defaultValue,
                        q1: result.d.results[0].cust_Question1,
                        q2: result.d.results[0].cust_Question2
                    };
                    this.getModel("PR").setProperty("/AdditionalInfo", addInfo);
                    ai1ID.addStyleClass(this.additionalInfo(addInfo.empDev));
                    ai2ID.addStyleClass(this.additionalInfo(addInfo.leadership));
                    ai3ID.addStyleClass(this.additionalInfo(addInfo.performance));
                    ai4ID.addStyleClass(this.additionalInfo(addInfo.bEye));
                    ai5ID.addStyleClass(this.additionalInfo(addInfo.reform));
                    this._count += 1;
                    this.setBusy(this._count);
                    console.log(addInfo);
                    // this.getModel("PR").setProperty("/EmpJob", JSON.parse(result).EmpJob);
                    // BusyIndicator.hide();

                }.bind(this),
                error: function (request, status, errorThrown) {
                    console.log(request);
                    this._count += 1;
                    this.setBusy(this._count);
                    // BusyIndicator.hide();
                }.bind(this)
            });

        },
        getAcadInfo: function (sUserId) {
            let url = "/SFSF/odata/v2/Background_Education?$expand=majorNav,degreeNav,majorNav/picklistLabels&$top=2&$filter=userId eq '" + sUserId + "'";
            $.ajax({
                url: url,
                method: "GET",
                this: this,
                contentType: "application/json",
                headers: {
                    "Accept": "application/json"
                },

                success: function (result) {
                    console.log(result);
                    let lang, acad;
                    if (result.d.results.length < 1) {
                        this._count += 1;
                        this.setBusy(this._count);
                        return;

                    }
                    if (sap.ui.getCore().getConfiguration().getLanguage() === 'ja') {
                        lang = 'ja_JP';
                    } else {
                        lang = 'en_US';
                    }

                    let major = "", degree;

                    degree = result.d.results[0].degree;

                    for (let i = 0; i < result.d.results[0].majorNav.picklistLabels.results.length; i++) {
                        if (result.d.results[0].majorNav.picklistLabels.results[i].locale === lang) {
                            major = result.d.results[0].majorNav.picklistLabels.results[i].label;
                        } else {
                            major = result.d.results[0].majorNav.picklistLabels.results[i].label;
                        }
                    }
                    if (degree !== null || degree !== "") {
                        major = major + " ( " + degree + " )"
                    }
                    this.getModel("PR").setProperty("/Academy", major);
                    this._count += 1;
                    this.setBusy(this._count);
                    // this.getModel("PR").setProperty("/EmpJob", JSON.parse(result).EmpJob);
                    // BusyIndicator.hide();
                }.bind(this),
                error: function (request, status, errorThrown) {
                    this._count += 1;
                    this.setBusy(this._count);
                    console.log(request);

                }.bind(this)
            });

        },
        getNomination: function (sPositionId) {
            let url = "/SFSF/odata/v2/Position?$top=1&$expand=successorNav,successorNav/nomineeHistoryNav&$filter=code eq '" + sPositionId + "'";
            $.ajax({
                url: url,
                method: "GET",
                this: this,
                contentType: "application/json",
                headers: {
                    "Accept": "application/json"
                },

                success: function (result) {
                    console.log(result);
                    let lang, nominee = [];
                    if (result.d.results.length < 1 || result.d.results[0].successorNav.results.length < 1) {
                        this._count += 1;
                        this.setBusy(this._count);
                        return;
                    }
                    let nomResult = result.d.results[0].successorNav.results;
                    if (sap.ui.getCore().getConfiguration().getLanguage() === 'ja') {
                        lang = 'ja_JP';
                    } else {
                        lang = 'en_US';
                    }

                    let item;

                    for (let i = 0; i < nomResult.length; i++) {
                        item = {
                            id: nomResult[i].nomineeUserId,
                            rank: nomResult[i].statusLabel,
                            ready: nomResult[i].readinessLabel,
                            note: nomResult[i].note === null ? "NA" : nomResult[i].note
                        }
                        nominee.push(item);
                    }

                    this.getModel("PR").setProperty("/Nomination", nominee);
                    // this.getModel("PR").setProperty("/EmpJob", JSON.parse(result).EmpJob);
                    // BusyIndicator.hide();
                    this._count += 1;
                    this.setBusy(this._count);
                }.bind(this),
                error: function (request, status, errorThrown) {
                    console.log(request);
                    this._count += 1;
                    this.setBusy(this._count);
                    // BusyIndicator.hide();
                }.bind(this)
            });

        },
        getPrevDepart: function (sUser,sPositionId,sDate) {
            let url = "/SFSF/odata/v2/EmpJob?$top=1&$expand=departmentNav&$filter=userId eq '"+sUser+"' and position ne '"+sPositionId+"'&fromDate=" + sDate;
            $.ajax({
                url: url,
                method: "GET",
                this: this,
                contentType: "application/json",
                headers: {
                    "Accept": "application/json"
                },

                success: function (result) {

                    let dept ={
                        id:"NA",
                        dept:""
                    };
                    if(result.d.results.length < 1){
                        this._count += 1;
                        this.setBusy(this._count);
                        return;
                    }
                    if (sap.ui.getCore().getConfiguration().getLanguage() === 'ja') {
                        dept.dept = result.d.results[0].departmentNav.name_ja_JP;
                    } else {
                        dept.dept = result.d.results[0].departmentNav.name_en_US;
                    }
                    dept.id = result.d.results[0].department;
                    this.getModel("PR").setProperty("/prevDepartment", dept);
                    // BusyIndicator.hide();
                    this._count += 1;
                    this.setBusy(this._count);
                }.bind(this),
                error: function (request, status, errorThrown) {
                    console.log(request);
                    this._count += 1;
                    this.setBusy(this._count);
                    // BusyIndicator.hide();
                }.bind(this)
            });

        },
        getPerformance: function (sUrl) {
            let url = sUrl;
            $.ajax({
                url: url,
                method: "GET",
                this: this,
                contentType: "application/json",
                headers: {
                    "Accept": "application/json"
                },

                success: function (result) {
                    console.log(result);
                    let performance = {};
                    var sp2ID = this.byId('hp2');
                    var sp1ID = this.byId('hp1');
                    var sp0ID = this.byId('hp0');
                    var rp2ID = this.byId('rp2');
                    var rp1ID = this.byId('rp1');
                    var rp0ID = this.byId('rp0');
                    this.removeStyle(sp0ID);
                    this.removeStyle(sp1ID);
                    this.removeStyle(sp2ID);
                    this.removeStyle(rp0ID);
                    this.removeStyle(rp1ID);
                    this.removeStyle(rp2ID);
                    performance.rating1 = 'NA';
                    performance.rating2 = 'NA';
                    performance.rating3 = 'NA';
                    performance.ry1 = 'YYYY';
                    performance.ry2 = 'YYYY';
                    performance.ry3 = 'YYYY';
                    if (result.d.results.length === 0) {
                        this.getModel("PR").setProperty("/Performance", performance);

                        sp2ID.addStyleClass(this.performanceColor(performance.rating3));
                        sp1ID.addStyleClass(this.performanceColor(performance.rating2));
                        sp0ID.addStyleClass(this.performanceColor(performance.rating1));
                        rp2ID.addStyleClass(this.performanceColor(performance.rating3));
                        rp1ID.addStyleClass(this.performanceColor(performance.rating2));
                        rp0ID.addStyleClass(this.performanceColor(performance.rating1));

                        console.log(performance);
                        this._count += 1;
                        this.setBusy(this._count);
                        return;
                    }
                    let perf = result.d.results;
                    let lang;
                    if (sap.ui.getCore().getConfiguration().getLanguage() === 'ja') {
                        lang = 'ja_JP';
                    } else {
                        lang = 'en_US';
                    }
                    let transferSettings = this.getCustProperty("TransferSettings");
                    performance.ry1 = transferSettings.cust_Year1;
                    performance.ry2 = transferSettings.cust_Year2;
                    performance.ry3 = transferSettings.cust_Year3;
                    for (let i = 0; i < perf.length; i++) {
                        if (perf[i].formTemplateId === transferSettings.cust_formTemplateIdY1) {
                            performance.rating1 = perf[i].rating;
                        }
                        if (perf[i].formTemplateId === transferSettings.cust_formTemplateIdY1) {
                            performance.rating2 = '3';//perf[i].rating;
                        }
                        if (perf[i].formTemplateId === transferSettings.cust_formTemplateIdY1) {
                            performance.rating3 = perf[i].rating;
                        }
                    }
                    this.getModel("PR").setProperty("/Performance", performance);
                    sp2ID.addStyleClass(this.performanceColor(performance.rating3));
                    sp1ID.addStyleClass(this.performanceColor(performance.rating2));
                    sp0ID.addStyleClass(this.performanceColor(performance.rating1));
                    rp2ID.addStyleClass(this.performanceColor(performance.rating3));
                    rp1ID.addStyleClass(this.performanceColor(performance.rating2));
                    rp0ID.addStyleClass(this.performanceColor(performance.rating1));
                    console.log(performance);
                    // this.getModel("PR").setProperty("/EmpJob", JSON.parse(result).EmpJob);
                    // BusyIndicator.hide();
                    this._count += 1;
                    this.setBusy(this._count);
                }.bind(this),
                error: function (request, status, errorThrown) {
                    console.log(request);
                    this._count += 1;
                    this.setBusy(this._count);
                    // BusyIndicator.hide();
                }.bind(this)
            });

        },
        taskDate: function (sDate) {
            var d = (new Date(sDate) + '').split(' ');
            d[2] = d[2] + ',';

            return [d[0], d[1], d[2], d[3]].join(' ');
        },
        getPerPerson: function (sUserId) {
            let url = "/SFSF/odata/v2/EmpEmployment?$expand=photoNav,personNav,userNav,personNav/personalInfoNav,personNav/emailNav,personNav/phoneNav&$filter=userId eq '" + sUserId + "'";
            $.ajax({
                url: url,
                method: "GET",
                this: this,
                contentType: "application/json",
                headers: {
                    "Accept": "application/json"
                },

                success: function (sResult) {
                    let result = sResult.d.results[0].personNav;
                    let hdate = sResult.d.results[0].startDate;
                    let perPerson = {};
                    let dob = result.dateOfBirth;
                    let photo = null;
                    let d60 = "";
                    let phone = "NA", email = "NA";
                    if (result.phoneNav.results.length > 0) {
                        phone = result.phoneNav.results[0].phoneNumber;
                    }
                    if (result.emailNav.results.length > 0) {
                        email = result.emailNav.results[0].emailAddress
                    }
                    if (dob) {
                        d60 = new Date(Number(dob.match(/\d+/)[0]));
                        d60.setFullYear(d60.getFullYear() + 60);
                        d60 = this.taskDate(Date.parse(d60));
                    }
                    if (hdate) {
                        hdate = new Date(Number(hdate.match(/\d+/)[0]));
                        hdate = this.taskDate(Date.parse(hdate));
                    }
                    if (sResult.d.results[0].photoNav.results.length > 0) {
                        photo = sResult.d.results[0].photoNav.results[0].photo;
                    }
                    perPerson = {
                        personIdExternal: result.personIdExternal,
                        dateOfBirth: result.dateOfBirth,
                        phoneNum: phone,
                        email: email,
                        date60: d60,
                        hireDate: hdate,
                        photo: photo,
                        gender: result.personalInfoNav.results[0].gender
                    }
                    this.getModel("PR").setProperty("/PerPerson", perPerson);
                    this._count += 1;
                    this.setBusy(this._count);
                    console.log(perPerson);
                }.bind(this),
                error: function (request, status, errorThrown) {
                    this._count += 1;
                    this.setBusy(this._count);
                    console.log(request);
                }.bind(this)
            });

        }
    });
});