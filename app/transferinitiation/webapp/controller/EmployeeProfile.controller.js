sap.ui.define([
    "./BaseController",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox"


], function (BaseController, History, MessageBox) {
    "use strict";

    
    return BaseController.extend("transferinitiation.controller.EmployeeProfile", { 
    
        handleRouteMatched: function (oEvent) {
            var oParams = oEvent.getParameters()
            this._employeeId = oParams.arguments.ID;
			this.currentRouteName = oParams.name;
			var sContext;
			if (oParams.arguments.beginContext) {
				sContext = oParams.arguments.beginContext;
			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function(oParam) {
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
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.attachRouteMatched(this.handleRouteMatched, this);
            this.oFclModel = this.getOwnerComponent().getModel("FclRouter");
			this.oFclModel.setProperty('/targetAggregation', 'beginColumnPages');
			this.oFclModel.setProperty('/expandIcon', {});
			this.oView.setModel(new sap.ui.model.json.JSONModel({}), 'fclButton');
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
        }
    });
});