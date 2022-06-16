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
					text: "PositionID",
					visible: true
				},{
					id: "component-table0-column3",
					order: 3,
					text: "ExternalName",
					visible: true
				}, {
					id: "component-table0-column4",
					order: 4,
					text: "DepartmentID",
					visible: false
				},{
					id: "component-table0-column5",
					order: 5,
					text: "Department",
					visible: true
				}, {
					id: "component-table0-column6",
					order: 6,
					text: "EmployeeClassID",
					visible: false
				},{
					id: "component-table0-column7",
					order: 7,
					text: "EmployeeClass",
					visible: true
				}, {
					id: "component-table0-column8",
					order: 8,
					text: "EmploymentTypeID",
					visible: false
				}, {
					id: "component-table0-column9",
					order: 9,
					text: "EmploymentType",
					visible: true
				}, {
					id: "component-table0-column10",
					order: 10,
					text: "LocationID",
					visible: false
				}, {
					id: "component-table0-column11",
					order: 11,
					text: "Location",
					visible: true
				}, {
					id: "component-table0-column12",
					order: 12,
					text: "StandardHours",
					visible: false
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
                        text: "PositionID",
                        visible: true
                    },{
                        id: "component-table0-column3",
                        order: 3,
                        text: "ExternalName",
                        visible: true
                    }, {
                        id: "component-table0-column4",
                        order: 4,
                        text: "DepartmentID",
                        visible: false
                    },{
                        id: "component-table0-column5",
                        order: 5,
                        text: "Department",
                        visible: true
                    }, {
                        id: "component-table0-column6",
                        order: 6,
                        text: "EmployeeClassID",
                        visible: false
                    },{
                        id: "component-table0-column7",
                        order: 7,
                        text: "EmployeeClass",
                        visible: true
                    }, {
                        id: "component-table0-column8",
                        order: 8,
                        text: "EmploymentTypeID",
                        visible: false
                    }, {
                        id: "component-table0-column9",
                        order: 9,
                        text: "EmploymentType",
                        visible: true
                    }, {
                        id: "component-table0-column10",
                        order: 10,
                        text: "LocationID",
                        visible: false
                    }, {
                        id: "component-table0-column11",
                        order: 11,
                        text: "Location",
                        visible: true
                    }, {
                        id: "component-table0-column12",
                        order: 12,
                        text: "StandardHours",
                        visible: false
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