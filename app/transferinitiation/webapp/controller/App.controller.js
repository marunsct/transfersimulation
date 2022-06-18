sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, JSONModel) {
        "use strict";

        return BaseController.extend("transferinitiation.controller.App", {
            onInit: function () {

                var oViewModel,
                    iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

                oViewModel = new JSONModel({
                    busy: true,
                    delay: 0
                });
                this.getView().setModel(oViewModel, "appView")
                // apply content density mode to root view
                this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

                //FCL
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.attachRouteMatched(this.onRouteMatched, this);
                this.oFclModel = this.getOwnerComponent().getModel("FclRouter");
                oViewModel.setProperty("/busy", false);
                oViewModel.setProperty("/delay", iOriginalBusyDelay);
            },

            onRouteMatched: function (oEvent) {
                var sRouteName = oEvent.getParameter("name");
                var sLayout = oEvent.getParameters().arguments.layout;
                this._updateUIState(sLayout);
                this.currentRouteName = sRouteName;
            },
            /**
             * Event handler to display the selected row(in first page) in User View after navigation to 
             * two column layout.
            **/
            onResize: function (oEvent) {
                console.log("resize event triggered");
                if (oEvent.getParameter('beginColumn') && this.oFclModel.getProperty('/uiSelected')) {
                    this.oFclModel.getProperty('/uiSelected').scrollIntoView({ block: "center" });
                }
            },
            onStateChanged: function (oEvent) {
                var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
                    sLayout = oEvent.getParameter("layout"),
                    sBeginContext = this.oFclModel.getProperty("/beginContext"),
                    sMidContext = this.oFclModel.getProperty("/midContext"),
                    sEndContext = this.oFclModel.getProperty("/endContext");

                if (bIsNavigationArrow) {
                    var oNavProperties = {
                        layout: sLayout,
                        beginContext: sBeginContext,
                        midContext: sMidContext,
                        endContext: sEndContext
                    };
                    //  this.oRouter.navTo(this.currentRouteName, oNavProperties, true);
                }
            },
            onLogout: async function () {
                window.location.href = "/my/logout";
                
                //  window.location.href = "/app/logout";
               // window.location.replace('/app/logout');
               // const token = await this.getToken();
               /*
               $.ajax({
                    url: "/app/logout",
                    success: function (result) {
                        console.log('Call answered by server'); //Second text in console
                        //resolve(result);
                    },
                    error: function (request, status, errorThrown) {
                        console.log(status);
                        //reject({ data: 'Example 6 returns an error' });
                    }
                });
                jQuery.ajax({
                    type: "POST",
                    url: "app/logout",
                    headers: {
                        "X-CSRF-Token": token,
                        contentType: "application/json",
                    },
                    success: function (data) {
                        window.location.href = data;
                    }
                });
                */
            },
            getToken: async function () {
                return new Promise((resolve) => {
                    jQuery.ajax({
                        type: "GET",
                        url: 'app/logout',
                        headers: {
                            "X-CSRF-Token": 'fetch',
                            contentType: "application/json",
                        },
                        success: function (data, textStatus, request) {
                            resolve(request.getResponseHeader('X-CSRF-Token'));
                        },
                    });
                });
            },
            _updateUIState: function (sNewLayout) {
                var oUIState = this.getOwnerComponent().getSemanticHelper().getCurrentUIState();
                this.oFclModel.setProperty('/uiState', oUIState);
                this.oFclModel.setProperty("/uiState/layout", sNewLayout);
            },

            /**
             * Event handler to change the language user after the user click on the button.
            **/
            onLanguageChange: function () {
                if (sap.ui.getCore().getConfiguration().getLanguage() === 'ja') {
                    sap.ui.getCore().getConfiguration().setLanguage('en');
                } else {
                    sap.ui.getCore().getConfiguration().setLanguage('ja');
                }
            }
        });
    });
