sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("transferapproval.controller.App", {
           
            onInit: function () {

                document.addEventListener('touchstart', function(){}, {passive: true});
                var oViewModel,
                    oListSelector = this.getOwnerComponent().oListSelector,
                    iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

                oViewModel = new JSONModel({
                    busy: true,
                    delay: 0
                });
                this.getView().setModel(oViewModel, "appView")
                // apply content density mode to root view
                this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.attachRouteMatched(this.onRouteMatched, this);
                oViewModel.setProperty("/busy", false);
                oViewModel.setProperty("/delay", iOriginalBusyDelay);


            },

            onLogout: function(){

               window.location.href = "/my/logout";

            },
            onRouteMatched: function (oEvent) {
                var sRouteName = oEvent.getParameter("name");
                var sLayout = oEvent.getParameters().arguments.layout;
              //  this._updateUIState(sLayout);
              //  this.currentRouteName = sRouteName;
            },
            onLanguageChange: function(){
                if(sap.ui.getCore().getConfiguration().getLanguage() === 'ja'){
                    sap.ui.getCore().getConfiguration().setLanguage('en');

                }else{
                    sap.ui.getCore().getConfiguration().setLanguage('ja') ;
                   
                }
            }
        });
    });
