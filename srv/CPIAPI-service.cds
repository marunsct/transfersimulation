namespace srv;

using {db} from '../db/CPI_API';
using {ECEmploymentInformation} from './external/ECEmploymentInformation.csn';
using {ECPositionManagement} from './external/ECPositionManagement.csn';

@requires : 'authenticated-user'
//@Capabilities.KeyAsSegmentSupported : true
service CPI_API {

    entity Employees       as projection on db.Employees;

    entity EmpJob as projection on db.EmpJob;

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
        PickListV2_effectiveStartDate, PickListV2_id, externalCode, externalStandardizedCode, lValue, label_defaultValue, label_en_US, 
        label_ja_JP, label_localized, status
    };

    @readonly
    entity TransferSettings as projection on ECEmploymentInformation.cust_TransferSimSettings{
        externalCode, effectiveStartDate, cust_DateofAnnouncement, cust_formTemplateIdY1, cust_formTemplateIdY2, cust_formTemplateIdY3,
        cust_EffectiveMonth, cust_formTitleY3, cust_formTitleY2, cust_formTitleY1
    };
    
    entity createTransferPlan as projection on ECEmploymentInformation.cust_TransferSimResult{
        externalCode,effectiveStartDate,cust_ELIGIBITY_DESCRIPTION,lastModifiedDateTime,mdfSystemEffectiveEndDate,
        cust_TRANSFER_DOC_FLAG,createdDateTime,cust_NEW_POSITION_ID,cust_PS_Group,cust_FUTURE_MANAGER_ID,externalName,
        cust_EMPLOYMENT_LOCATION,cust_EMPLOYMENT_TYPE,cust_DOC_GENERATION_DT,cust_TRANSFER_DATE,mdfSystemRecordStatus,
        cust_CURRENT_MANAGER_ID,cust_REMARKS,cust_STATUS,cust_OLD_POSITION_ID,cust_EMPLOYEE_CLASS,cust_DEPARTMENT,cust_PS_Level,
        cust_Company,cust_OTYPE,cust_DOC_GENERATED_BY,cust_SEQUENCE_NO,cust_HR_ID,lastModifiedBy,cust_Previous_Department,
        cust_APPROVED_DT,createdBy,cust_ELIGIBITY_STATUS

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
