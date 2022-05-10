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

                return new Promise(function (fnResolve) {

                    var oModel, aPromises = [];
                    oModel = this.getOwnerComponent().getModel("oData");
                    aPromises.push(oModel.metadataLoaded);
                    return Promise.all(aPromises).then(function () {
                        oViewModel.setProperty("/busy", false);
                        oViewModel.setProperty("/delay", iOriginalBusyDelay);
                        fnResolve();
                    });
                }.bind(this));
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
            onResize:function(oEvent){
                console.log("resize event triggered");
              if ( oEvent.getParameter('beginColumn') &&  this.oFclModel.getProperty('/uiSelected')){
                this.oFclModel.getProperty('/uiSelected').scrollIntoView({block: "center"});
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
            onLogout: function () {
                window.location.href = "/my/logout";
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
