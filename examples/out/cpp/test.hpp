#include <string>
#include <vector>
#include <algorithm>
#include <iterator>
#include <KataCore/JsonSerializer.h>
#include <json/reader.h>

namespace Soms {
    

enum TestEnum {TestEnumNONE,ALWAYS,TESTY};
    
std::string TestEnumStrArray[] = {"","ALWAYS","TESTY"};
    

enum OrderOfOperations {OrderOfOperationsNONE,PLEASE,EXCUSE,MY,DEAR,AUNT,SALLY};
    
std::string OrderOfOperationsStrArray[] = {"","PLEASE","EXCUSE","MY","DEAR","AUNT","SALLY"};
    class TypeOne {
    public:
        const int64_t getapiVersion() const {
            return this->apiVersion.apiVersion;
        };

        const std::vector<int64_t> getage() const {
            return this->age.age;
        };

        void setage(std::vector<int64_t> value) {
            this->age.age = value;
        };
        const std::string getpersonsName() const {
            return this->personsName.personsName;
        };

        void setpersonsName(std::string value) {
            this->personsName.personsName = value;
        };
        const bool getisDumb() const {
            return this->isDumb.isDumb;
        };

        void setisDumb(bool value) {
            this->isDumb.isDumb = value;
        };
        const TestEnum gettestEnum1() const {
            return this->testEnum1.testEnum1;
        };

        void settestEnum1(TestEnum value) {
            this->testEnum1.testEnum1 = value;
        };
        const OrderOfOperations gettestEnum2() const {
            return this->testEnum2.testEnum2;
        };

        void settestEnum2(OrderOfOperations value) {
            this->testEnum2.testEnum2 = value;
        };
    private:
        struct FieldapiVersion {
            static const int64_t apiVersion = 1;
            bool optional = false;
            int dimensionality = 0;
            std::string typeIdentifier = "int64";
            bool staticConstValue = true;
        } apiVersion;

        struct Fieldage {
            std::vector<int64_t> age;
            bool optional = false;
            int dimensionality = 1;
            std::string typeIdentifier = "int64";
            bool staticConstValue = false;
        } age;

        struct FieldpersonsName {
            std::string personsName = "jack";
            bool optional = false;
            int dimensionality = 0;
            std::string typeIdentifier = "string";
            bool staticConstValue = false;
        } personsName;

        struct FieldisDumb {
            bool isDumb = false;
            bool optional = false;
            int dimensionality = 0;
            std::string typeIdentifier = "boolean";
            bool staticConstValue = false;
        } isDumb;

        struct FieldtestEnum1 {
            TestEnum testEnum1= TestEnum(0);
            bool optional = false;
            int dimensionality = 0;
            std::string typeIdentifier = "TestEnum";
            bool staticConstValue = false;
        } testEnum1;

        struct FieldtestEnum2 {
            OrderOfOperations testEnum2= OrderOfOperations(0);
            bool optional = false;
            int dimensionality = 0;
            std::string typeIdentifier = "OrderOfOperations";
            bool staticConstValue = false;
        } testEnum2;

        bool bToJson = false;
    public:
        void Serialize(JsonSerializer& s) {
            s.Serialize("age", age.age);
            s.Serialize("personsName", personsName.personsName);
            s.Serialize("isDumb", isDumb.isDumb);
            if (this->bToJson) {
                unsigned int TestEnumenumIndex = 0;
                unsigned int TestEnumlength = sizeof(TestEnumStrArray) / sizeof(std::string);
                for (int i = 0; i < TestEnumlength; i++) {
                    if (TestEnumStrArray[i].find(TestEnumStrArray[testEnum1.testEnum1], 0) != std::string::npos) {
                        TestEnumenumIndex = i;
                        break;
                    }
                }
                s.Serialize("testEnum1",TestEnumStrArray[testEnum1.testEnum1]);
            }
            else {
                std::string enumValue;
                s.Serialize("testEnum1", enumValue);
                unsigned int TestEnumenumIndex = 0;
                unsigned int TestEnumlength = sizeof(TestEnumStrArray) / sizeof(std::string);
                for (int i = 0; i < TestEnumlength; i++) {
                    if (TestEnumStrArray[i].find(enumValue, 0) != std::string::npos) {
                        TestEnumenumIndex = i;
                        break;
                    }
                }
                testEnum1.testEnum1 = TestEnum(TestEnumenumIndex);
            }
            if (this->bToJson) {
                unsigned int OrderOfOperationsenumIndex = 0;
                unsigned int OrderOfOperationslength = sizeof(OrderOfOperationsStrArray) / sizeof(std::string);
                for (int i = 0; i < OrderOfOperationslength; i++) {
                    if (OrderOfOperationsStrArray[i].find(OrderOfOperationsStrArray[testEnum2.testEnum2], 0) != std::string::npos) {
                        OrderOfOperationsenumIndex = i;
                        break;
                    }
                }
                s.Serialize("testEnum2",OrderOfOperationsStrArray[testEnum2.testEnum2]);
            }
            else {
                std::string enumValue;
                s.Serialize("testEnum2", enumValue);
                unsigned int OrderOfOperationsenumIndex = 0;
                unsigned int OrderOfOperationslength = sizeof(OrderOfOperationsStrArray) / sizeof(std::string);
                for (int i = 0; i < OrderOfOperationslength; i++) {
                    if (OrderOfOperationsStrArray[i].find(enumValue, 0) != std::string::npos) {
                        OrderOfOperationsenumIndex = i;
                        break;
                    }
                }
                testEnum2.testEnum2 = OrderOfOperations(OrderOfOperationsenumIndex);
            }
        };

        bool fromJson(const char* json) {
            Json::Value  root;

            Json::Reader reader;
            if (!reader.parse(json, root)) {}

            if (!root.isMember("age")) {
                if (!this->age.optional) {
                    return false;
                }
            }
            if (!root.isMember("personsName")) {
                if (!this->personsName.optional) {
                    return false;
                }
            }
            if (!root.isMember("isDumb")) {
                if (!this->isDumb.optional) {
                    return false;
                }
            }
            if (!root.isMember("testEnum1")) {
                if (!this->testEnum1.optional) {
                    return false;
                }
            }
            if (!root.isMember("testEnum2")) {
                if (!this->testEnum2.optional) {
                    return false;
                }
            }
            this->bToJson = false;
            JsonSerializer s(false);
            s.JsonValue = root;
            this->Serialize(s);
            return true;
        };

        Json::Value toJson() {
            JsonSerializer s(true);
            this->bToJson = true;
            s.Serialize("age", age.age);
            s.Serialize("personsName", personsName.personsName);
            s.Serialize("isDumb", isDumb.isDumb);
            s.Serialize("testEnum1", TestEnumStrArray[testEnum1.testEnum1]);
            s.Serialize("testEnum2", OrderOfOperationsStrArray[testEnum2.testEnum2]);
            return s.JsonValue;
        }
    };

    class TypeTwo {
    public:
        const TypeOne gettypeOne() const {
            return this->typeOne.typeOne;
        };

        void settypeOne(TypeOne value) {
            this->typeOne.typeOne = value;
        };
        const std::string getpersonName() const {
            return this->personName.personName;
        };

        void setpersonName(std::string value) {
            this->personName.personName = value;
        };
    private:
        struct FieldtypeOne {
            TypeOne typeOne;
            bool optional = false;
            int dimensionality = 0;
            std::string typeIdentifier = "TypeOne";
            bool staticConstValue = false;
        } typeOne;

        struct FieldpersonName {
            std::string personName = "jack";
            bool optional = false;
            int dimensionality = 0;
            std::string typeIdentifier = "string";
            bool staticConstValue = false;
        } personName;

        bool bToJson = false;
    public:
        void Serialize(JsonSerializer& s) {
            s.Serialize("typeOne", typeOne.typeOne);
            s.Serialize("personName", personName.personName);
        };

        bool fromJson(const char* json) {
            Json::Value  root;

            Json::Reader reader;
            if (!reader.parse(json, root)) {}

            if (!root.isMember("typeOne")) {
                if (!this->typeOne.optional) {
                    return false;
                }
            }
            if (!root.isMember("personName")) {
                if (!this->personName.optional) {
                    return false;
                }
            }
            this->bToJson = false;
            JsonSerializer s(false);
            s.JsonValue = root;
            this->Serialize(s);
            return true;
        };

        Json::Value toJson() {
            JsonSerializer s(true);
            this->bToJson = true;
            s.Serialize("typeOne", typeOne.typeOne);
            s.Serialize("personName", personName.personName);
            return s.JsonValue;
        }
    };

    class TypeThree {
    public:
        const int64_t getapiVersion() const {
            return this->apiVersion.apiVersion;
        };

        const int64_t getage() const {
            return this->age.age;
        };

        void setage(int64_t value) {
            this->age.age = value;
        };
        const std::string getpersonsName() const {
            return this->personsName.personsName;
        };

        void setpersonsName(std::string value) {
            this->personsName.personsName = value;
        };
        const bool getisDumb() const {
            return this->isDumb.isDumb;
        };

        void setisDumb(bool value) {
            this->isDumb.isDumb = value;
        };
        const TestEnum gettestEnum1() const {
            return this->testEnum1.testEnum1;
        };

        void settestEnum1(TestEnum value) {
            this->testEnum1.testEnum1 = value;
        };
        const OrderOfOperations gettestEnum2() const {
            return this->testEnum2.testEnum2;
        };

        void settestEnum2(OrderOfOperations value) {
            this->testEnum2.testEnum2 = value;
        };
        const TypeTwo gettypeTwo() const {
            return this->typeTwo.typeTwo;
        };

        void settypeTwo(TypeTwo value) {
            this->typeTwo.typeTwo = value;
        };
    private:
        struct FieldapiVersion {
            static const int64_t apiVersion = 1;
            bool optional = false;
            int dimensionality = 0;
            std::string typeIdentifier = "int64";
            bool staticConstValue = true;
        } apiVersion;

        struct Fieldage {
            int64_t age;
            bool optional = false;
            int dimensionality = 0;
            std::string typeIdentifier = "int64";
            bool staticConstValue = false;
        } age;

        struct FieldpersonsName {
            std::string personsName;
            bool optional = false;
            int dimensionality = 0;
            std::string typeIdentifier = "string";
            bool staticConstValue = false;
        } personsName;

        struct FieldisDumb {
            bool isDumb = false;
            bool optional = false;
            int dimensionality = 0;
            std::string typeIdentifier = "boolean";
            bool staticConstValue = false;
        } isDumb;

        struct FieldtestEnum1 {
            TestEnum testEnum1= TestEnum(0);
            bool optional = false;
            int dimensionality = 0;
            std::string typeIdentifier = "TestEnum";
            bool staticConstValue = false;
        } testEnum1;

        struct FieldtestEnum2 {
            OrderOfOperations testEnum2= OrderOfOperations(0);
            bool optional = false;
            int dimensionality = 0;
            std::string typeIdentifier = "OrderOfOperations";
            bool staticConstValue = false;
        } testEnum2;

        struct FieldtypeTwo {
            TypeTwo typeTwo;
            bool optional = false;
            int dimensionality = 0;
            std::string typeIdentifier = "TypeTwo";
            bool staticConstValue = false;
        } typeTwo;

        bool bToJson = false;
    public:
        void Serialize(JsonSerializer& s) {
            s.Serialize("age", age.age);
            s.Serialize("personsName", personsName.personsName);
            s.Serialize("isDumb", isDumb.isDumb);
            if (this->bToJson) {
                unsigned int TestEnumenumIndex = 0;
                unsigned int TestEnumlength = sizeof(TestEnumStrArray) / sizeof(std::string);
                for (int i = 0; i < TestEnumlength; i++) {
                    if (TestEnumStrArray[i].find(TestEnumStrArray[testEnum1.testEnum1], 0) != std::string::npos) {
                        TestEnumenumIndex = i;
                        break;
                    }
                }
                s.Serialize("testEnum1",TestEnumStrArray[testEnum1.testEnum1]);
            }
            else {
                std::string enumValue;
                s.Serialize("testEnum1", enumValue);
                unsigned int TestEnumenumIndex = 0;
                unsigned int TestEnumlength = sizeof(TestEnumStrArray) / sizeof(std::string);
                for (int i = 0; i < TestEnumlength; i++) {
                    if (TestEnumStrArray[i].find(enumValue, 0) != std::string::npos) {
                        TestEnumenumIndex = i;
                        break;
                    }
                }
                testEnum1.testEnum1 = TestEnum(TestEnumenumIndex);
            }
            if (this->bToJson) {
                unsigned int OrderOfOperationsenumIndex = 0;
                unsigned int OrderOfOperationslength = sizeof(OrderOfOperationsStrArray) / sizeof(std::string);
                for (int i = 0; i < OrderOfOperationslength; i++) {
                    if (OrderOfOperationsStrArray[i].find(OrderOfOperationsStrArray[testEnum2.testEnum2], 0) != std::string::npos) {
                        OrderOfOperationsenumIndex = i;
                        break;
                    }
                }
                s.Serialize("testEnum2",OrderOfOperationsStrArray[testEnum2.testEnum2]);
            }
            else {
                std::string enumValue;
                s.Serialize("testEnum2", enumValue);
                unsigned int OrderOfOperationsenumIndex = 0;
                unsigned int OrderOfOperationslength = sizeof(OrderOfOperationsStrArray) / sizeof(std::string);
                for (int i = 0; i < OrderOfOperationslength; i++) {
                    if (OrderOfOperationsStrArray[i].find(enumValue, 0) != std::string::npos) {
                        OrderOfOperationsenumIndex = i;
                        break;
                    }
                }
                testEnum2.testEnum2 = OrderOfOperations(OrderOfOperationsenumIndex);
            }
            s.Serialize("typeTwo", typeTwo.typeTwo);
        };

        bool fromJson(const char* json) {
            Json::Value  root;

            Json::Reader reader;
            if (!reader.parse(json, root)) {}

            if (!root.isMember("age")) {
                if (!this->age.optional) {
                    return false;
                }
            }
            if (!root.isMember("personsName")) {
                if (!this->personsName.optional) {
                    return false;
                }
            }
            if (!root.isMember("isDumb")) {
                if (!this->isDumb.optional) {
                    return false;
                }
            }
            if (!root.isMember("testEnum1")) {
                if (!this->testEnum1.optional) {
                    return false;
                }
            }
            if (!root.isMember("testEnum2")) {
                if (!this->testEnum2.optional) {
                    return false;
                }
            }
            if (!root.isMember("typeTwo")) {
                if (!this->typeTwo.optional) {
                    return false;
                }
            }
            this->bToJson = false;
            JsonSerializer s(false);
            s.JsonValue = root;
            this->Serialize(s);
            return true;
        };

        Json::Value toJson() {
            JsonSerializer s(true);
            this->bToJson = true;
            s.Serialize("age", age.age);
            s.Serialize("personsName", personsName.personsName);
            s.Serialize("isDumb", isDumb.isDumb);
            s.Serialize("testEnum1", TestEnumStrArray[testEnum1.testEnum1]);
            s.Serialize("testEnum2", OrderOfOperationsStrArray[testEnum2.testEnum2]);
            s.Serialize("typeTwo", typeTwo.typeTwo);
            return s.JsonValue;
        }
    };

};
