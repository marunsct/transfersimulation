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
            var oData = this.getModel("applicationModel").getData();
            oData[oProperty] = oContext
            this.getModel("applicationModel").setProperty("/", oData);
        },
        /**
         * This method will be used to pass data between the views by assigning
         * the data to Model of the parent controll (APP)
        **/
        getCustProperty: function (oProperty) {

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
                persoService: oTablePersoService
            }).activate();
            return oTPC;
        },
        /**
          * This method is implemented for calling the API in ASYNC mode.
         **/
        asyncAjax: async function (sUrl) {

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
            var sTitle = i18n.getResourceBundle().getText("error");
            var sFirstButton = i18n.getResourceBundle().getText("reload");
            thia._createDialog(sTitle, sText, sFirstButton, undefined, ()=> {window.location.reload();}, undefined, this);
        },
        onInit: function () {
            this._TransferList = {};
        }
    });

});