sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library",
    'sap/m/Button',
    'sap/m/Dialog',
    'sap/m/ButtonType',
    'sap/m/Text'
], function (Controller, UIComponent, mobileLibrary, Button, Dialog, ButtonType, Text) {
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
        setCustProperty: function (oProperty, oContext) {
            var oData = this.getModel("applicationModel").getData();
            //oData =　Object.keys(oData).length !== 0 ? oData : {"tmpData" :{}};
            oData[oProperty] = oContext
            this.getModel("applicationModel").setProperty("/", oData);
        },
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
                            pressCallback.bind(sThat)();
                            dialog.destroy();
                        }

                    }),
                    endButton: new Button({
                        text: sSecondButton,
                        type: ButtonType.Ghost,
                        press: function () {
                            endCallback.bind(sThat)();
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
                            pressCallback.bind(sThat)();
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

        onInit: function () {
            this._TransferList = {};
        }
    });

});