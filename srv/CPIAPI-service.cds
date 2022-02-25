namespace srv;

using {db} from '../db/CPI_API';
using {ECEmploymentInformation} from './external/ECEmploymentInformation.csn';
using {ECPositionManagement} from './external/ECPositionManagement.csn';

@requires : 'authenticated-user'
//@Capabilities.KeyAsSegmentSupported : true
service CPI_API {

    entity Employees       as projection on db.Employees;

    @readonly
    entity CurrentWeather  as projection on db.Weather;

    @readonly
    entity EmployeeJobs
                           //  @(restrict: [{ to: 'Manager' },{to: 'Admin'}])
                           as projection on ECEmploymentInformation.EmpJob {
        seqNumber, startDate, userId, location, costCenter, event, eventReason, department, employeeClass, employmentType, managerId, position

    };

    @readonly
    entity Position
                           // @(restrict: [{ to: 'Manager' },{to: 'Admin'}])
                           as projection on ECPositionManagement.Position {
        code, positionTitle, employeeClass, cust_employmentType, department, location, standardHours, effectiveStartDate, businessUnit, vacant,
        externalName_defaultValue, externalName_localized, externalName_ja_JP, externalName_en_US, jobTitle 
       // departmentNav: redirected to FODepartment {externalCode, startDate
        
    };

    @readonly
    entity FODepartment    as projection on ECPositionManagement.FODepartment {
        externalCode,  name, name_defaultValue, name_en_DEBUG, name_en_US, name_ja_JP, name_localized, parent, status
    };

    @readonly
    entity FOLocation      as projection on ECPositionManagement.FOLocation {
        externalCode, startDate, name, description, status, nameTranslationNav : redirected to FoTranslation

    };

    @readonly
    entity FoTranslation   as projection on ECPositionManagement.FoTranslation {
        externalCode as ID, foField, value_defaultValue, value_ja_JP, value_en_US, value_localized
    }


    @readonly
    entity User            as projection on ECPositionManagement.User {
        userId, email, firstName, username, lastName, defaultFullName, department
    };

    @readonly
    entity PickListValueV2 as projection on ECPositionManagement.PickListValueV2 {
        PickListV2_effectiveStartDate, PickListV2_id, externalCode, externalStandardizedCode, lValue, label_defaultValue, label_en_US, label_ja_JP, label_localized, status
    };

    type userScopes {
        identified    : Boolean;
        authenticated : Boolean;
        Viewer        : Boolean;
        Admin         : Boolean;
    };

    type user {
        user   : String;
        locale : String;
        scopes : userScopes;
    };

    function userInfo() returns user;

}
