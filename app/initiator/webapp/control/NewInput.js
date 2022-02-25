sap.ui.define([
    "sap/m/Input"
  ], function(I) {
    "use strict";
    var d = I.extend("demo.NewInput", {
      renderer: function(oRM, oControl) { // static function
          sap.m.InputRenderer.render(oRM, oControl);
        }
    })
      d._DEFAULTFILTER= function(v, i) {
        //  q.sap.startsWithIgnoreCase(i.getText(), v);
        var Q = v.toLowerCase();
        //Model Contains
        var s = i.getText().toLowerCase().indexOf(Q) !== -1;
        return s;
      };
      d.prototype.init = function() {
          I.prototype.init.call(this);
          this._fnFilter = d._DEFAULTFILTER;
          this._bUseDialog = sap.ui.Device.system.phone;
          this._bFullScreen = sap.ui.Device.system.phone;
          this._iSetCount = 0;
      };
      d.prototype.setFilterFunction = function(f) {
          if (f === null || f === undefined) {
              this._fnFilter = d._DEFAULTFILTER;
              return this;
          }
          this._fnFilter = f;
          return this;
      };
      return d;
  });