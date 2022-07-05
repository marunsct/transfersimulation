sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library",
    'sap/m/Button',
    'sap/m/Dialog',
    'sap/m/ButtonType',
    'sap/m/Text',
    "sap/m/TablePersoController",
    "./TablePersonalisation/TablePersoService"
], function (Controller, UIComponent, mobileLibrary, Button, Dialog, ButtonType, Text, TablePersoController, TablePersoService) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;
    var ResetAllMode =  mobileLibrary.ResetAllMode;

    return Controller.extend("transferinitiation.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },
		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
        onShareEmailPress: function () {
            var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
            URLHelper.triggerEmail(
                null,
                oViewModel.getProperty("/shareSendEmailSubject"),
                oViewModel.getProperty("/shareSendEmailMessage")
            );
        },
        /**
         * 
         * 
         */
        onEmployeeInit: function () {
            this._employeeContext = {};
        },

        /**
         * This method will be used to pass data between the views by assigning
         * the data to Model of the parent controll (APP)
        **/
        setCustProperty: function (oProperty, oContext) {
            var self = this;
            self.resetInactivityTimeout();
            var oData = this.getModel("applicationModel").getData();
            oData[oProperty] = oContext
            this.getModel("applicationModel").setProperty("/", oData);
        },
        /**
         * This method will be used to pass data between the views by assigning
         * the data to Model of the parent controll (APP)
        **/
        getCustProperty: function (oProperty) {
            var self = this;
            self.resetInactivityTimeout();
            if (this.getModel("applicationModel")) {
                return this.getModel("applicationModel").getProperty("/" + oProperty);
            } else {
                return "";
            }
        },
        resetCustProperty: function () {
            this.getModel("applicationModel").setData({});
        },
        /**
         * This method is used for fetching the current language of the application
        **/
        getLocale: function () {
            var sCurrentLocale = sap.ui.getCore().getConfiguration().getLanguage();
            if (sCurrentLocale.includes("ja")) {
                this._lang = "JA";
            } else if (sCurrentLocale.includes("en")) {
                this._lang = "EN";
            } else {
                this._lang = "DEFAULT";
            }
            return this._lang;
        },
        _onMessageClose: function (sThat) {
            sThat._oPopover.close();
        },
        /**
         * This method will be reused for creatinf Dialog box throughout the application
        **/
        _createDialog: function (sTitle, sText, sFirstButton, sSecondButton, pressCallback, endCallback, sThat) {

            var dialog;
            if (sSecondButton !== undefined) {
                dialog = new Dialog({
                    title: sTitle,
                    type: 'Message',
                    content: new Text({ text: sText }),
                    beginButton: new Button({
                        type: ButtonType.Emphasized,
                        text: sFirstButton,
                        press: function () {
                            if (pressCallback !== undefined) {
                                pressCallback.bind(sThat)();
                            }
                            dialog.destroy();
                        }

                    }),
                    endButton: new Button({
                        text: sSecondButton,
                        type: ButtonType.Ghost,
                        press: function () {
                            if (endCallback !== undefined) {
                                endCallback.bind(sThat)();
                            }

                            dialog.destroy();
                        }
                    }),
                    afterClose: function () {
                        dialog.destroy();
                    }
                });
            } else {
                dialog = new Dialog({
                    title: sTitle,
                    type: 'Message',
                    content: new Text({ text: sText }),
                    beginButton: new Button({
                        type: ButtonType.Emphasized,
                        text: sFirstButton,
                        press: function () {
                            if (pressCallback !== undefined) {
                                pressCallback.bind(sThat)();
                            }
                            dialog.destroy();
                        }

                    }),
                    afterClose: function () {
                        dialog.destroy();
                    }
                });
            }
            dialog.open();
        },
        /**
         * This method will be reused for Initialliasing Table personalisation controller
        **/
        _initializeTablePersonalization: function (oTable, oTablePersoService) {
            // init and activate controller
            var oTPC = new TablePersoController({
                table: oTable,
                //specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
                componentName: "component",
                resetAllMode: ResetAllMode.ServiceReset,
                persoService: oTablePersoService
            }).activate();
            return oTPC;
        },
        /**
          * This method is implemented for calling the API in ASYNC mode.
         **/
        asyncAjax: async function (sUrl) {
            var self = this;
            self.resetInactivityTimeout();
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: sUrl,
                    headers: {
                        "Accept": "application/json",
                        "accept": "application/json"
                    },
                    success: function (result) {
                        console.log('Call answered by server'); //Second text in console
                        resolve(result);
                    },
                    error: function (request, status, errorThrown) {
                        console.log(status);
                        reject({
                            error: errorThrown,
                            status: status,
                            request: request,
                            data: 'API returns an error'
                        });
                    }
                });
            });
        },
        _getUser: async function () {
            try {
                let user = await this.asyncAjax("/getuserinfo");
                console.log(user);
                this.setCustProperty("UserInfo", JSON.parse(user));
            } catch (error) {
                console.log(error);
                this._timeoutError()

            }
        },
        _timeoutError: function () {
            var i18n = this.oView.getModel("i18n");
            var sTitle = i18n.getResourceBundle().getText("serror");
            var sFirstButton = i18n.getResourceBundle().getText("reload");
            var sText = i18n.getResourceBundle().getText("expire");
            this._createDialog(sTitle, sText, sFirstButton, undefined, () => { window.location.reload(); }, undefined, this);
        },
        /**
         *
         *
         */
        onInit: function () {
            this._TransferList = {};

        },
        /**
 * Set to correspond to something less than the SESSION_TIMEOUT value that you set for your approuter
 * @see https://help.sap.com/viewer/4505d0bdaf4948449b7f7379d24d0f0d/2.0.04/en-US/5f77e58ec01b46f6b64ee1e2afe3ead7.html
 */
        countdown: 840000,  /* 14 minutes; SESSION_TIMEOUT defaults to 15 minutes */

        resetCountdown: 840000,

        /**
         * Return number of milliseconds left till automatic logout
         */
        getInactivityTimeout: function () {
            return this.countdown;
        },

        /**
         * Set number of minutes left till automatic logout
         */
        setInactivityTimeout: function (timeout_millisec) {
            this.countdown = timeout_millisec;
            this.resetCountdown = this.countdown;
        },

        /**
         * Set number of minutes left till automatic logout
         */
        resetInactivityTimeout: function () {
            this.countdown = this.resetCountdown;
        },

        /**
         * Begin counting tracking inactivity
         */
        startInactivityTimer: function (nTime) {
            if (nTime === 0) {
                nTime = 15;
            }
            this.setInactivityTimeout(nTime * 60 * 1000);
            var self = this;
            this.intervalHandle = setInterval(function () {
                self._inactivityCountdown();
            }, 10000);
        },

        stopInactivityTimer: function () {
            if (this.intervalHandle != null) {
                clearInterval(this.intervalHandle);
                this.intervalHandle = null;
            }
        },

        _inactivityCountdown: function () {
            this.countdown -= 10000;
            if (this.countdown <= 0) {
                this.stopInactivityTimer();
                this.resetInactivityTimeout();
                var i18n = this.oView.getModel("i18n");
                var sTitle = i18n.getResourceBundle().getText("serror");
                var sText = i18n.getResourceBundle().getText("expire");
                var sFirstButton = i18n.getResourceBundle().getText("reload");
                this._createDialog(sTitle, sText, sFirstButton, undefined, () => { window.location.reload(); }, undefined, this);
            }
        },

        _onSuggestDepart : function (sTerm) {
            let filterUrl = "(startswith(name_en_US,'" + sTerm +"') or startswith(name,'" + sTerm +"') or startswith(externalCode,'" + sTerm +"') or startswith(name_ja_JP,'" + sTerm +"'))"

                // new Filter("status", FilterOperator.EQ, 'A')
                // this.getModel('oData').read("/FODepartment?$top=20&$filter=startswith(externalCode,'" + sTerm + "') eq true or startswith(name_ja_JP,'" + sTerm + "') eq true or startswith(name,'" + sTerm + "')",

                this.getModel('oData').read( "/FODepartment",
                    {
                        async: true,
                        urlParameters: {
                            "$top": 20,
                            "$filter":filterUrl
                            //  "test": "((substringof('"+ sTerm + "',externalCode) or substringof('" + sTerm + "',name)) and status eq 'A'"
                        },
                        //filters: aFilters,
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
        },
        _onSuggestPosition : function (sTerm) {
            let filterUrl = "startswith(externalName_ja_JP,'" + sTerm +"') or startswith(externalName_en_US,'" + sTerm +"') or startswith(code,'" + sTerm +"') or startswith(externalName_defaultValue,'" + sTerm +"')"
            this.getModel('oData').read("/Position",
                    {
                        async: true,
                        urlParameters: {
                            "$top": 20,
                            "$filter":filterUrl
                        },
                       // filters: aFilters,
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

        }
    });

});