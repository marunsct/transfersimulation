sap.ui.define(["jquery.sap.global"],
	function (jQuery) {
		"use strict";

		// Very simple page-context personalization

		var TablePersoService = {

			oData: {
				_persoSchemaVersion: "1.0",
				aColumns: [{
					id: "component-TransferReqTable-column1",
					order: 1,
					text: "employeeId",
					visible: true
				},{
					id: "component-TransferReqTable-column2",
					order: 2,
					text: "name",
					visible: true
				},{
					id: "component-TransferReqTable-column3",
					order: 5,
					text: "departmentId",
					visible: false
				}, {
					id: "component-TransferReqTable-column4",
					order: 6,
					text: "department",
					visible: true
				},{
					id: "component-TransferReqTable-column15",
					order: 3,
					text: "pdepartmentId",
					visible: false
				},
                {
					id: "component-TransferReqTable-column16",
					order: 4,
					text: "pdepartment",
					visible: true
				},                
                {
					id: "component-TransferReqTable-column5",
					order: 7,
					text: "typeId",
					visible: false
				}, {
					id: "component-TransferReqTable-column6",
					order: 8,
					text: "type",
					visible: false
				},{
					id: "component-TransferReqTable-column7",
					order: 9,
					text: "supervisorId",
					visible: false
				}, {
					id: "component-TransferReqTable-column8",
					order: 10,
					text: "supervisor",
					visible: true
				},{
					id: "component-TransferReqTable-column19",
					order: 11,
					text: "nsupervisorId",
					visible: false
				}, {
					id: "component-TransferReqTable-column20",
					order: 12,
					text: "nsupervisor",
					visible: true
				}, {
					id: "component-TransferReqTable-column9",
					order: 13,
					text: "criteria",
					visible: false
				}, {
					id: "component-TransferReqTable-column10",
					order: 14,
					text: "cpositionId",
					visible: false
				}, {
					id: "component-TransferReqTable-column11",
					order: 15,
					text: "cposition",
					visible: true
				}, {
					id: "component-TransferReqTable-column12",
					order: 16,
					text: "npositionId",
					visible: false
				}, {
					id: "component-TransferReqTable-column13",
					order: 17,
					text: "nposition",
					visible: true
				}, {
					id: "component-TransferReqTable-column17",
					order: 18,
					text: "locationId",
					visible: false
				}, {
					id: "component-TransferReqTable-column18",
					order: 19,
					text: "location",
					visible: true
				}, {
					id: "component-TransferReqTable-column14",
					order: 20,
					text: "comments",
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

			resetPersData: function () {
				var oDeferred = new jQuery.Deferred();
				var oInitialData = {
                    _persoSchemaVersion: "1.0",
                    aColumns: [{
                        id: "component-TransferReqTable-column1",
                        order: 1,
                        text: "employeeId",
                        visible: true
                    },{
                        id: "component-TransferReqTable-column2",
                        order: 2,
                        text: "name",
                        visible: true
                    },{
                        id: "component-TransferReqTable-column3",
                        order: 5,
                        text: "departmentId",
                        visible: false
                    }, {
                        id: "component-TransferReqTable-column4",
                        order: 6,
                        text: "department",
                        visible: true
                    },{
                        id: "component-TransferReqTable-column15",
                        order: 3,
                        text: "pdepartmentId",
                        visible: false
                    },
                    {
                        id: "component-TransferReqTable-column16",
                        order: 4,
                        text: "pdepartment",
                        visible: true
                    },                
                    {
                        id: "component-TransferReqTable-column5",
                        order: 7,
                        text: "typeId",
                        visible: false
                    }, {
                        id: "component-TransferReqTable-column6",
                        order: 8,
                        text: "type",
                        visible: false
                    },{
                        id: "component-TransferReqTable-column7",
                        order: 9,
                        text: "supervisorId",
                        visible: false
                    }, {
                        id: "component-TransferReqTable-column8",
                        order: 10,
                        text: "supervisor",
                        visible: true
                    },{
                        id: "component-TransferReqTable-column19",
                        order: 11,
                        text: "nsupervisorId",
                        visible: false
                    }, {
                        id: "component-TransferReqTable-column20",
                        order: 12,
                        text: "nsupervisor",
                        visible: true
                    }, {
                        id: "component-TransferReqTable-column9",
                        order: 13,
                        text: "criteria",
                        visible: false
                    }, {
                        id: "component-TransferReqTable-column10",
                        order: 14,
                        text: "cpositionId",
                        visible: false
                    }, {
                        id: "component-TransferReqTable-column11",
                        order: 15,
                        text: "cposition",
                        visible: true
                    }, {
                        id: "component-TransferReqTable-column12",
                        order: 16,
                        text: "npositionId",
                        visible: false
                    }, {
                        id: "component-TransferReqTable-column13",
                        order: 17,
                        text: "nposition",
                        visible: true
                    }, {
                        id: "component-TransferReqTable-column17",
                        order: 18,
                        text: "locationId",
                        visible: false
                    }, {
                        id: "component-TransferReqTable-column18",
                        order: 19,
                        text: "location",
                        visible: true
                    }, {
                        id: "component-TransferReqTable-column14",
                        order: 20,
                        text: "comments",
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