## Test.hpp


### SomsPackage input

```ts
let testEnum  : soms.SomsEnum = new soms.SomsEnum();
testEnum.name = "TestEnum";
testEnum.values = ["ALWAYS", "TESTY"];

let testEnum2 : soms.SomsEnum = new soms.SomsEnum();
testEnum2.name = "OrderOfOperations";
testEnum2.values = ["PLEASE", "EXCUSE", "MY", "DEAR", "AUNT", "SALLY"];

let testClass : soms.SomsClass = new soms.SomsClass();
testClass.name = "TypeOne"
testClass.fields.push(new soms.SomsField("apiVersion", "int64", false, true, "1", 0, 0))
testClass.fields.push(new soms.SomsField("age", "int64", false, false, null, 0, 1));
testClass.fields.push(new soms.SomsField("personsName", "string", false, false, "jack", 2));
testClass.fields.push(new soms.SomsField("isDumb", "boolean", false, false, "false", 3));
testClass.fields.push(new soms.SomsField("testEnum1", "TestEnum", false, false, null, 4));
testClass.fields.push(new soms.SomsField("testEnum2", "OrderOfOperations", false, false, null, 5))

let testClass2 : soms.SomsClass = new soms.SomsClass();
testClass2.name = "TypeTwo"
testClass2.fields.push(new soms.SomsField("typeOne", "TypeOne", false, false, null, 0, 0))
testClass2.fields.push(new soms.SomsField("personName", "string", false, false, "jack", 1));

let testClass3 : soms.SomsClass = new soms.SomsClass();
testClass3.name = "TypeThree"
testClass3.fields.push(new soms.SomsField("apiVersion", "int64", false, true, "1", 0, 0));
testClass3.fields.push(new soms.SomsField("age", "int64", false, false, null, 1, 0));
testClass3.fields.push(new soms.SomsField("personsName", "string", false, false, null, 2, 0));
testClass3.fields.push(new soms.SomsField("isDumb", "boolean", false, false, "false", 3));
testClass3.fields.push(new soms.SomsField("testEnum1", "TestEnum", false, false, null, 4));
testClass3.fields.push(new soms.SomsField("testEnum2", "OrderOfOperations", false, false, null, 5));
testClass3.fields.push(new soms.SomsField("typeTwo", "TypeTwo", false, false, null, 0, 0));

let somsPackage = new soms.SomsPackage();
somsPackage.name = "derpin";
somsPackage.enums.push(testEnum);
somsPackage.enums.push(testEnum2);
somsPackage.classes.push(testClass);
somsPackage.classes.push(testClass2);
somsPackage.classes.push(testClass3);
```

### Example Usage of generated binding

```cpp
#include "test.hpp"

...

Soms::TypeOne typeOne;
typeOne.setage(vector<int64_t>() = { 1, 2, 3 });
typeOne.setisDumb(true);
typeOne.setpersonsName("derp");
typeOne.settestEnum1(Soms::TestEnum::ALWAYS);
typeOne.settestEnum2(Soms::OrderOfOperations::PLEASE);

Json::Value v = typeOne.toJson();

std::cout << v << std::endl;

Soms::TypeTwo typeTwo;
typeTwo.setpersonName("Frank");
typeTwo.settypeOne(typeOne);

v = typeTwo.toJson();

std::cout << v << std::endl;

auto s3 = v.toStyledString();

typeTwo.fromJson(s3.c_str());

Soms::TypeThree typeThree;
typeThree.setage(24);
typeThree.setisDumb(true);
typeThree.setpersonsName("Joey");
typeThree.settypeTwo(typeTwo);

v = typeThree.toJson();

std::string s = v.toStyledString();
std::cout << s << std::endl;

Soms::TypeThree typeThree2;
typeThree2.fromJson(s.c_str());

std::cout << s.c_str() << std::endl;
```
