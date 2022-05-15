namespace db;

type WeatherCondition : {
    description : String;
    temperature : Decimal(5, 2);
    humidity    : Decimal(4, 1);
    windSpeed   : Decimal(3, 1);
};

entity Weather {
    key id      : Integer64;
        city    : String;
        country : String;
        current : WeatherCondition
};

entity Employees {
    key userId         : String;
        firstName      : String;
        lastName       : String;
        photo          : String;
        department     : String;
        employeeClass  : String;
        employmentType : String;
        location       : String;
        managerId      : String;
        criteria       : String;
        position       : String;
};

entity EmpJob {
    userId                 : String;
    personIdExternal       : String;
    department             : String;
    departmentName         : String;
    departmentEntryDate    : String;
    managerId              : String;
    managerName            : String;
    employmentType         : String;
    employmentTypeName     : String;
    employeeClass          : String;
    employeeClassName      : String;
    location               : String;
    locationName           : String;
    position               : String;
    positionTitle          : String;
    lastName               : String;
    lastNameAlt1           : String;
    lastNameAlt2           : String;
    firstName              : String;
    firstNameAlt1          : String;
    firstNameAlt2          : String;
    eligibility            : String;
    description            : String;
    transferStatus         : String;
    transferInitiationDate : String;
    newPosition            : String;
};
