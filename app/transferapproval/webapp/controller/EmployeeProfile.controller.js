sap.ui.define([
    "./BaseController",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator"


], function (BaseController, History, MessageBox, BusyIndicator) {
    "use strict";


    return BaseController.extend("transferapproval.controller.EmployeeProfile", {

        handleRouteMatched: function (oEvent) {
            var oParams = oEvent.getParameters()
            this._employeeId = oParams.arguments.ID;
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


            this.oRouter.navTo("TransferList");

        },
        onInit: function () {
            document.addEventListener('touchstart', function () { }, { passive: true });
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.attachRouteMatched(this.handleRouteMatched, this);
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
                    "lastTransDate": "",
                    "psGroupL": "",
                    "psLevelL": ""
                },
                Performance: {
                    rating1: "",
                    rating2: "",
                    rating3: "",
                    ry1: "",
                    ry2: "",
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
                    id: "NA",
                    dept: ""
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
            this.startInactivityTimer(15);
        },
        onAfterRendering: async function () {
            let performance = this.getModel('PR').getProperty("/Performance")
            var sp2ID = this.byId('hp2');
            var sp1ID = this.byId('hp1');
            var sp0ID = this.byId('hp0');
            this.removeStyle(sp0ID);
            this.removeStyle(sp1ID);
            this.removeStyle(sp2ID);
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
                this.getPrevDepart(mData.EmpJob.userId, mData.EmpJob.position, this.getFDate(mData.EmpJob.lastTransDate), mData.EmpJob.lastTransDate.substring(0, 10))
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
            }
            let sUrl = "/SFSF/odata/v2/FormHeader?$top=10&$filter=(formTemplateId eq '" + transferSettings.cust_formTemplateIdY1 + 
                            "' or formTemplateId eq '" + transferSettings.cust_formTemplateIdY2 + "' or formTemplateId eq '" + transferSettings.cust_formTemplateIdY3 + 
                            "' or formTemplateId eq '" + transferSettings.cust_formTitleY1 + "' or formTemplateId eq '" + transferSettings.cust_formTitleY2 +"' or formTemplateId eq '" + transferSettings.cust_formTitleY3 +
                            "') and isRated eq true and formSubjectId eq '" + sUser + "'";
            this.getPerformance(sUrl);

            oModel.setData(mData);
        },
        setBusy: function (sCount) {
            console.log(sCount);
            if (sCount >= 8) {
                BusyIndicator.hide()
                var self = this;
                self.resetInactivityTimeout();
            }
        },
        getFDate: function (sDate) {
            let day, month, year;
            day = sDate.substring(8, 10);
            month = sDate.substring(5, 7);
            year = sDate.substring(0, 4);
            /*
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
            */
            return (parseInt(year) - 5 + "-" + month + "-" + day)
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
                    this.getPrevDepart(fres.userId, fres.position, this.getFDate(fres.lastTransDate), fres.lastTransDate.substring(0, 10));
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
                        this._count += 1;
                        this.setBusy(this._count);
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
            let url = "/SFSF/odata/v2/Background_Education?$expand=majorNav,degreeNav,degreeNav/picklistLabels,majorNav/picklistLabels&$top=10&$filter=userId eq '" + sUserId + "'";
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

                    let major = "", degree = "", acdInfo = "";
                    for (let j = 0; j < result.d.results.length; j++) {
                        // degree = result.d.results[0].degree;
                        for (let i = 0; i < result.d.results[j].degreeNav.picklistLabels.results.length; i++) {
                            if (result.d.results[j].degreeNav.picklistLabels.results[i].locale === lang) {
                                degree = result.d.results[j].degreeNav.picklistLabels.results[i].label;
                                break;
                            } else {
                                degree = result.d.results[j].degreeNav.picklistLabels.results[i].label;
                            }
                        }
                        for (let i = 0; i < result.d.results[j].majorNav.picklistLabels.results.length; i++) {
                            if (result.d.results[j].majorNav.picklistLabels.results[i].locale === lang) {
                                major = result.d.results[j].majorNav.picklistLabels.results[i].label;
                                break;
                            } else {
                                major = result.d.results[j].majorNav.picklistLabels.results[i].label;
                            }
                        }
                        if (degree !== null || degree !== "") {
                            if (acdInfo !== "") {
                                acdInfo = acdInfo + ", ";
                            }
                            acdInfo = acdInfo + major + " ( " + degree + " )"
                        }
                    }
                    this.getModel("PR").setProperty("/Academy", acdInfo);
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
        getPrevDepart: function (sUser, sPositionId, sDate, sLdate) {
            let url = "/SFSF/odata/v2/EmpJob?$expand=departmentNav&$filter=userId eq '" + sUser + "'  and startDate lt '" + sLdate + "'&fromDate=" + sDate;
            $.ajax({
                url: url,
                method: "GET",
                this: this,
                contentType: "application/json",
                headers: {
                    "Accept": "application/json"
                },

                success: function (result) {

                    let pDept = {
                        id: "NA",
                        dept: ""
                    };
                    if (result.d.results.length < 1) {
                        this._count += 1;
                        this.setBusy(this._count);
                        return;
                    }
                    let date, dept = result.d.results;
                    for (let i = 0; i < dept.length; i++) {
                        if (date === undefined) {
                            date = new Date(parseInt(dept[i].startDate.split('(')[1].split(')')[0]));
                            //new Date(Number(dept[i].startDate.match(/\d+/)[0]));
                            console.log(date, dept[i].department);
                            if (sap.ui.getCore().getConfiguration().getLanguage() === 'ja') {
                                pDept.dept = dept[i].departmentNav.name_ja_JP;
                            } else {
                                pDept.dept = dept[i].departmentNav.name_en_US;
                            }
                            pDept.id = dept[i].department;
                        } else {
                            if (date < new Date(parseInt(dept[i].startDate.split('(')[1].split(')')[0]))) {
                                //(date < new Date(Number(dept[i].startDate.match(/\d+/)[0]))) {
                                date = new Date(parseInt(dept[i].startDate.split('(')[1].split(')')[0]));
                                //new Date(Number(dept[i].startDate.match(/\d+/)[0]));

                                pDept.id = dept[i].department;
                                if (sap.ui.getCore().getConfiguration().getLanguage() === 'ja') {
                                    pDept.dept = dept[i].departmentNav.name_ja_JP !== null ? dept[i].departmentNav.name_ja_JP : dept[i].departmentNav.name;
                                } else {
                                    pDept.dept = dept[i].departmentNav.name_en_US !== null ? dept[i].departmentNav.name_en_US : dept[i].departmentNav.name;
                                }
                                //   pDept.dept = dept[i].department;
                                // console.log(date, dept[i].department);
                            }
                        }
                    };

                    // dept.id = result.d.results[k].department;
                    this.getModel("PR").setProperty("/prevDepartment", pDept);
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
                        if (perf[i].formTemplateId === transferSettings.cust_formTemplateIdY1 || perf[i].formTemplateId === transferSettings.cust_formTitleY1 ) {
                            performance.rating1 = perf[i].rating;
                        }
                        if (perf[i].formTemplateId === transferSettings.cust_formTemplateIdY2 || perf[i].formTemplateId === transferSettings.cust_formTitleY2) {
                            performance.rating2 = perf[i].rating;
                        }
                        if (perf[i].formTemplateId === transferSettings.cust_formTemplateIdY3 || perf[i].formTemplateId === transferSettings.cust_formTitleY3) {
                            performance.rating3 = perf[i].rating;
                        }
                    }
                    this.getModel("PR").setProperty("/Performance", performance);
                    sp2ID.addStyleClass(this.performanceColor(performance.rating3));
                    sp1ID.addStyleClass(this.performanceColor(performance.rating2));
                    sp0ID.addStyleClass(this.performanceColor(performance.rating1));
                    rp2ID.addStyleClass(this.performanceColor(performance.rating1));
                    rp1ID.addStyleClass(this.performanceColor(performance.rating2));
                    rp0ID.addStyleClass(this.performanceColor(performance.rating3));
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
            let url = "/SFSF/odata/v2/EmpEmployment?$expand=photoNav,personNav,userNav,personNav/personalInfoNav,personNav/emailNav,personNav/phoneNav,personNav/emailNav/emailTypeNav,personNav/phoneNav/phoneTypeNav&$filter=userId eq '" + sUserId + "'";
            $.ajax({
                url: url,
                method: "GET",
                this: this,
                contentType: "application/json",
                headers: {
                    "Accept": "application/json"
                },

                success: function (sResult) {
                    let perPerson = {
                        personIdExternal: 'NA',
                        dateOfBirth: 'NA',
                        phoneNum: 'NA',
                        email: 'NA',
                        date60: 'NA',
                        hireDate: 'NA',
                        photo: '',
                        gender: 'NA'
                    }
                    if (sResult.d.results.length < 1) {

                        this.getModel("PR").setProperty("/PerPerson", perPerson);
                        this._count += 1;
                        this.setBusy(this._count);
                        return;
                    }
                    let result = sResult.d.results[0].personNav;
                    let hdate = sResult.d.results[0].startDate;
                    let dob = result.dateOfBirth;
                    let photo = null;
                    let d60 = "";
                    let phone = "NA", email = "NA";
                    if (result.phoneNav.results.length > 0) {
                        let phoneArr = result.phoneNav;
                        for (let i = 0; i < phoneArr.results.length; i++) {

                            if (phoneArr.results[i].phoneTypeNav.externalCode === 'B') {
                                phone = result.phoneNav.results[i].phoneNumber;
                            }

                        }                        //phone = result.phoneNav.results[0].phoneNumber;
                    }
                    if (result.emailNav.results.length > 0) {
                        let emailArr = result.emailNav;
                        for (let i = 0; i < emailArr.results.length; i++) {

                            if (emailArr.results[i].emailTypeNav.externalCode === 'B') {
                                email = result.emailNav.results[i].emailAddress;
                            }

                        }
                        //email = result.emailNav.results[0].emailAddress
                    }
                    if (dob) {
                        d60 = new Date(parseInt(dob.split('(')[1].split(')')[0]));
                        //new Date(Number(dob.match(/\d+/)[0]));
                        d60.setFullYear(d60.getFullYear() + 60);
                        d60 = d60.toISOString().substring(0, 10);
                        //d60 = this.taskDate(Date.parse(d60));
                    }
                    if (hdate) {
                        hdate = new Date(parseInt(hdate.split('(')[1].split(')')[0])).toISOString().substring(0, 10);
                        //new Date(Number(hdate.match(/\d+/)[0])).toISOString().substring(0, 10);
                        //hdate = this.taskDate(Date.parse(hdate));
                    }
                    if (sResult.d.results[0].photoNav.results.length > 0) {
                        let photoArr = sResult.d.results[0].photoNav.results;
                        for (let j = 0; j < photoArr.length; j++) {
                            if (photoArr[j].photoType === 26) {
                                photo = "data:" + photoArr[j].mimeType + ";base64," + photoArr[j].photo;
                            }
                        }
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