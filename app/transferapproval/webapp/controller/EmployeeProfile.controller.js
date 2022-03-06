sap.ui.define([
    "./BaseController",
    "sap/ui/core/routing/History",


], function (BaseController, History) {
    "use strict";

    
    return BaseController.extend("transferapproval.controller.EmployeeProfile", { 
    
        handleRouteMatched: function (oEvent) {
            var oParams = oEvent.getParameters()
            this._employeeId = oParams.arguments.ID;

        },
        _onPageNavButtonPress: function () {
            this.setCustProperty("Back", true);
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
                this.oRouter.navTo("OpenPositions", { ID: this._employeeId }, false);
            }
           // var oQueryParams = this.getQueryParameters(window.location);
           // var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
           
        },
        onInit: function () { 
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.attachRouteMatched(this.handleRouteMatched, this);
        },
        onAfterRendering: function(){
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
        },
        performanceColor: function(sGrade){
            switch (sGrade){
                case "A":
                    return "performanceNegative";
                case "B":
                    return "performanceNeutral";
                case "C":
                    return "performanceNeutralM";
                case "D":
                    return "performancePositive";
                default:
                    return "performanceNeutral";            

            }
        }
    });
});