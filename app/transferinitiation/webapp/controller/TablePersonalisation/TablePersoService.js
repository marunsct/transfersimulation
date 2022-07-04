sap.ui.define(["jquery.sap.global"],
	function (jQuery) {
		"use strict";

		// Very simple page-context personalization

		var TablePersoService = {

			oData: {
				_persoSchemaVersion: "1.0",
				aColumns: [{
					id: "component-table0-column1",
					order: 1,
					text: "userId",
					visible: true
				},{
					id: "component-table0-column2",
					order: 2,
					text: "name",
					visible: true
				},{
					id: "component-table0-column13",
					order: 3,
					text: "department",
					visible: false
				}, {
					id: "component-table0-column3",
					order: 4,
					text: "departmentName",
					visible: true
				},{
					id: "component-table0-column14",
					order: 5,
					text: "employeeClass",
					visible: false
				}, {
					id: "component-table0-column4",
					order: 6,
					text: "employeeClassName",
					visible: true
				},{
					id: "component-table0-column15",
					order: 7,
					text: "employmentType",
					visible: false
				}, {
					id: "component-table0-column5",
					order: 8,
					text: "employmentTypeName",
					visible: true
				}, {
					id: "component-table0-column16",
					order: 9,
					text: "location",
					visible: false
				}, {
					id: "component-table0-column6",
					order: 10,
					text: "locationName",
					visible: true
				}, {
					id: "component-table0-column17",
					order: 11,
					text: "managerId",
					visible: false
				}, {
					id: "component-table0-column7",
					order: 12,
					text: "managerName",
					visible: true
				}, {
					id: "component-table0-column8",
					order: 13,
					text: "eligibility",
					visible: true
				},{
					id: "component-table0-column18",
					order: 14,
					text: "positionId",
					visible: false
				}, {
					id: "component-table0-column9",
					order: 15,
					text: "positionTitle",
					visible: true
				}, {
					id: "component-table0-column10",
					order: 16,
					text: "newPosition",
					visible: true
				}, {
					id: "component-table0-column11",
					order: 17,
					text: "transferStatus",
					visible: true
				}, {
					id: "component-table0-column12",
					order: 18,
					text: "arrow",
					visible: true
				}]
			},
            oResetData : {
                _persoSchemaVersion: "1.0",
                aColumns : [{
					id: "component-table0-column1",
					order: 1,
					text: "userId",
					visible: true
				},{
					id: "component-table0-column2",
					order: 2,
					text: "name",
					visible: true
				},{
					id: "component-table0-column13",
					order: 3,
					text: "department",
					visible: false
				}, {
					id: "component-table0-column3",
					order: 4,
					text: "departmentName",
					visible: true
				},{
					id: "component-table0-column14",
					order: 5,
					text: "employeeClass",
					visible: false
				}, {
					id: "component-table0-column4",
					order: 6,
					text: "employeeClassName",
					visible: true
				},{
					id: "component-table0-column15",
					order: 7,
					text: "employmentType",
					visible: false
				}, {
					id: "component-table0-column5",
					order: 8,
					text: "employmentTypeName",
					visible: true
				}, {
					id: "component-table0-column16",
					order: 9,
					text: "location",
					visible: false
				}, {
					id: "component-table0-column6",
					order: 10,
					text: "locationName",
					visible: true
				}, {
					id: "component-table0-column17",
					order: 11,
					text: "managerId",
					visible: false
				}, {
					id: "component-table0-column7",
					order: 12,
					text: "managerName",
					visible: true
				}, {
					id: "component-table0-column8",
					order: 13,
					text: "eligibility",
					visible: true
				},{
					id: "component-table0-column18",
					order: 14,
					text: "positionId",
					visible: false
				}, {
					id: "component-table0-column9",
					order: 15,
					text: "positionTitle",
					visible: true
				}, {
					id: "component-table0-column10",
					order: 16,
					text: "newPosition",
					visible: true
				}, {
					id: "component-table0-column11",
					order: 17,
					text: "transferStatus",
					visible: true
				}, {
					id: "component-table0-column12",
					order: 18,
					text: "arrow",
					visible: true
				}]
            },
			getPersData: function () {
				var oDeferred = new jQuery.Deferred();
				if (!this._oBundle) {
					this._oBundle = this.oData;
				}
				var oBundle = this._oBundle;
				oDeferred.resolve(oBundle);
				return oDeferred.promise();
			},

			setPersData: function (oBundle) {
				var oDeferred = new jQuery.Deferred();
				this._oBundle = oBundle;
				oDeferred.resolve();
				return oDeferred.promise();
			},
            getResetPersData : function () {
                var oDeferred = new jQuery.Deferred();
    
                // oDeferred.resolve(this.oResetData);
    
                setTimeout(function() {
                    oDeferred.resolve(this.oResetData);
                }.bind(this), 2000);
    
                return oDeferred.promise();
            },
			resetPersData: function () {
				var oDeferred = new jQuery.Deferred();
				var oInitialData = {
                    _persoSchemaVersion: "1.0",
                    aColumns: [{
                        id: "component-table0-column1",
                        order: 1,
                        text: "userId",
                        visible: true
                    },{
                        id: "component-table0-column2",
                        order: 2,
                        text: "name",
                        visible: true
                    },{
                        id: "component-table0-column13",
                        order: 3,
                        text: "department",
                        visible: false
                    }, {
                        id: "component-table0-column3",
                        order: 4,
                        text: "departmentName",
                        visible: true
                    },{
                        id: "component-table0-column14",
                        order: 5,
                        text: "employeeClass",
                        visible: false
                    }, {
                        id: "component-table0-column4",
                        order: 6,
                        text: "employeeClassName",
                        visible: true
                    },{
                        id: "component-table0-column15",
                        order: 7,
                        text: "employmentType",
                        visible: false
                    }, {
                        id: "component-table0-column5",
                        order: 8,
                        text: "employmentTypeName",
                        visible: true
                    }, {
                        id: "component-table0-column16",
                        order: 9,
                        text: "location",
                        visible: false
                    }, {
                        id: "component-table0-column6",
                        order: 10,
                        text: "locationName",
                        visible: true
                    }, {
                        id: "component-table0-column17",
                        order: 11,
                        text: "managerId",
                        visible: false
                    }, {
                        id: "component-table0-column7",
                        order: 12,
                        text: "managerName",
                        visible: true
                    }, {
                        id: "component-table0-column8",
                        order: 13,
                        text: "eligibility",
                        visible: true
                    },{
                        id: "component-table0-column18",
                        order: 14,
                        text: "positionId",
                        visible: false
                    }, {
                        id: "component-table0-column9",
                        order: 15,
                        text: "positionTitle",
                        visible: true
                    }, {
                        id: "component-table0-column10",
                        order: 16,
                        text: "newPosition",
                        visible: true
                    }, {
                        id: "component-table0-column11",
                        order: 17,
                        text: "transferStatus",
                        visible: true
                    }, {
                        id: "component-table0-column12",
                        order: 18,
                        text: "arrow",
                        visible: true
                    }]
                };

				//set personalization
				this._oBundle = oInitialData;

				//reset personalization, i.e. display table as defined
				//		this._oBundle = null;

				oDeferred.resolve();
				return oDeferred.promise();
			}
		};

		return TablePersoService;

	}, /* bExport= */ true);