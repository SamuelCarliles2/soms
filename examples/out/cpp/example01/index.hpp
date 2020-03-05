#pragma once
#include <string>
#include <vector>
#include <algorithm>
#include <iterator>
#include <KataCore/JsonSerializer.h>
#include <json/reader.h>

namespace Soms {


	enum FooglarType { FooglarTypeNONE, ART, CAT, JEWEL };

	static std::string FooglarTypeStrArray[] = { "","ART","CAT","JEWEL" };
	class Fooglar {
	public:
		const std::string getMESSAGE_SCHEMA_VERSION() const {
			return this->MESSAGE_SCHEMA_VERSION.MESSAGE_SCHEMA_VERSION;
		};

		const bool getDEFAULT_CATCH() const {
			return this->DEFAULT_CATCH.DEFAULT_CATCH;
		};

		const FooglarType getDEFAULT_FOOGLAR_TYPE() const {
			return this->DEFAULT_FOOGLAR_TYPE.DEFAULT_FOOGLAR_TYPE;
		};

		const double getDISCOUNT_RATE() const {
			return this->DISCOUNT_RATE.DISCOUNT_RATE;
		};

		const int64_t getMIN_HAUL() const {
			return this->MIN_HAUL.MIN_HAUL;
		};

		const std::string getname() const {
			return this->name.name;
		};

		void setname(std::string value) {
			this->name.name = value;
		};
		const int64_t getyearOfBirth() const {
			return this->yearOfBirth.yearOfBirth;
		};

		void setyearOfBirth(int64_t value) {
			this->yearOfBirth.yearOfBirth = value;
		};
		const FooglarType getfooglarType() const {
			return this->fooglarType.fooglarType;
		};

		void setfooglarType(FooglarType value) {
			this->fooglarType.fooglarType = value;
		};
		const double getheightInKm() const {
			return this->heightInKm.heightInKm;
		};

		void setheightInKm(double value) {
			this->heightInKm.heightInKm = value;
		};
		const std::vector<std::string> getaliases() const {
			return this->aliases.aliases;
		};

		void setaliases(std::vector<std::string> value) {
			this->aliases.aliases = value;
		};
		const std::vector<std::vector<std::string>> getaliasAliases() const {
			return this->aliasAliases.aliasAliases;
		};

		void setaliasAliases(std::vector<std::vector<std::string>> value) {
			this->aliasAliases.aliasAliases = value;
		};
		const std::vector<std::vector<std::vector<double>>> getthreedeeDouble() const {
			return this->threedeeDouble.threedeeDouble;
		};

		void setthreedeeDouble(std::vector<std::vector<std::vector<double>>> value) {
			this->threedeeDouble.threedeeDouble = value;
		};
		const std::vector<std::vector<std::vector<int64_t>>> getintsAPoppin() const {
			return this->intsAPoppin.intsAPoppin;
		};

		void setintsAPoppin(std::vector<std::vector<std::vector<int64_t>>> value) {
			this->intsAPoppin.intsAPoppin = value;
		};
	private:
		struct FieldMESSAGE_SCHEMA_VERSION {
			std::string MESSAGE_SCHEMA_VERSION = "1.0.0";
			bool optional = false;
			int dimensionality = 0;
			std::string typeIdentifier = "string";
			bool staticConstValue = true;
		} MESSAGE_SCHEMA_VERSION;
		struct FieldDEFAULT_CATCH {
			bool DEFAULT_CATCH = false;
			bool optional = true;
			int dimensionality = 0;
			std::string typeIdentifier = "boolean";
			bool staticConstValue = true;
		} DEFAULT_CATCH;
		struct FieldDEFAULT_FOOGLAR_TYPE {
			FooglarType DEFAULT_FOOGLAR_TYPE = FooglarType(0);
			bool optional = true;
			int dimensionality = 0;
			std::string typeIdentifier = "FooglarType";
			bool staticConstValue = true;
		} DEFAULT_FOOGLAR_TYPE;
		struct FieldDISCOUNT_RATE {
			double DISCOUNT_RATE = 0.1;
			bool optional = true;
			int dimensionality = 0;
			std::string typeIdentifier = "double";
			bool staticConstValue = true;
		} DISCOUNT_RATE;
		struct FieldMIN_HAUL {
			int64_t MIN_HAUL = 100000;
			bool optional = true;
			int dimensionality = 0;
			std::string typeIdentifier = "int64";
			bool staticConstValue = true;
		} MIN_HAUL;
		struct Fieldname {
			std::string name;
			bool optional = false;
			int dimensionality = 0;
			std::string typeIdentifier = "string";
			bool staticConstValue = false;
		} name;
		struct FieldyearOfBirth {
			int64_t yearOfBirth;
			bool optional = true;
			int dimensionality = 0;
			std::string typeIdentifier = "int64";
			bool staticConstValue = false;
		} yearOfBirth;
		struct FieldfooglarType {
			FooglarType fooglarType = FooglarType(0);
			bool optional = false;
			int dimensionality = 0;
			std::string typeIdentifier = "FooglarType";
			bool staticConstValue = false;
		} fooglarType;
		struct FieldheightInKm {
			double heightInKm;
			bool optional = false;
			int dimensionality = 0;
			std::string typeIdentifier = "double";
			bool staticConstValue = false;
		} heightInKm;
		struct Fieldaliases {
			std::vector<std::string> aliases;
			bool optional = false;
			int dimensionality = 1;
			std::string typeIdentifier = "string";
			bool staticConstValue = false;
		} aliases;
		struct FieldaliasAliases {
			std::vector<std::vector<std::string>> aliasAliases;
			bool optional = false;
			int dimensionality = 2;
			std::string typeIdentifier = "string";
			bool staticConstValue = false;
		} aliasAliases;
		struct FieldthreedeeDouble {
			std::vector<std::vector<std::vector<double>>> threedeeDouble;
			bool optional = false;
			int dimensionality = 3;
			std::string typeIdentifier = "double";
			bool staticConstValue = false;
		} threedeeDouble;
		struct FieldintsAPoppin {
			std::vector<std::vector<std::vector<int64_t>>> intsAPoppin;
			bool optional = false;
			int dimensionality = 3;
			std::string typeIdentifier = "int64";
			bool staticConstValue = false;
		} intsAPoppin;
		bool bToJson = false;
	public:
		void Serialize(JsonSerializer& s) {
			s.Serialize("name", name.name);
			s.Serialize("yearOfBirth", yearOfBirth.yearOfBirth);
			if (this->bToJson) {
				unsigned int FooglarTypeenumIndex = 0;
				unsigned int FooglarTypelength = sizeof(FooglarTypeStrArray) / sizeof(std::string);
				for (int i = 0; i < FooglarTypelength; i++) {
					if (FooglarTypeStrArray[i].find(FooglarTypeStrArray[fooglarType.fooglarType], 0) != std::string::npos) {
						FooglarTypeenumIndex = i;
						break;
					}
				}
				s.Serialize("fooglarType", FooglarTypeStrArray[fooglarType.fooglarType]);
			}
			else {
				std::string enumValue;
				s.Serialize("fooglarType", enumValue);
				unsigned int FooglarTypeenumIndex = 0;
				unsigned int FooglarTypelength = sizeof(FooglarTypeStrArray) / sizeof(std::string);
				for (int i = 0; i < FooglarTypelength; i++) {
					if (FooglarTypeStrArray[i].find(enumValue, 0) != std::string::npos) {
						FooglarTypeenumIndex = i;
						break;
					}
				}
				fooglarType.fooglarType = FooglarType(FooglarTypeenumIndex);
			}
			s.Serialize("heightInKm", heightInKm.heightInKm);
			s.Serialize("aliases", aliases.aliases);
			s.Serialize("aliasAliases", aliasAliases.aliasAliases);
			s.Serialize("threedeeDouble", threedeeDouble.threedeeDouble);
			s.Serialize("intsAPoppin", intsAPoppin.intsAPoppin);
		};

		bool fromJson(const char* json) {
			Json::Value  root;

			Json::Reader reader;
			if (!reader.parse(json, root)) {}

			if (!root.isMember("DEFAULT_CATCH")) {
				if (!this->DEFAULT_CATCH.optional) {
					return false;
				}
			}
			if (!root.isMember("name")) {
				if (!this->name.optional) {
					return false;
				}
			}
			if (!root.isMember("yearOfBirth")) {
				if (!this->yearOfBirth.optional) {
					return false;
				}
			}
			if (!root.isMember("fooglarType")) {
				if (!this->fooglarType.optional) {
					return false;
				}
			}
			if (!root.isMember("heightInKm")) {
				if (!this->heightInKm.optional) {
					return false;
				}
			}
			if (!root.isMember("aliases")) {
				if (!this->aliases.optional) {
					return false;
				}
			}
			if (!root.isMember("aliasAliases")) {
				if (!this->aliasAliases.optional) {
					return false;
				}
			}
			if (!root.isMember("threedeeDouble")) {
				if (!this->threedeeDouble.optional) {
					return false;
				}
			}
			if (!root.isMember("intsAPoppin")) {
				if (!this->intsAPoppin.optional) {
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
			s.Serialize("DEFAULT_CATCH", DEFAULT_CATCH.DEFAULT_CATCH);
			s.Serialize("name", name.name);
			s.Serialize("yearOfBirth", yearOfBirth.yearOfBirth);
			s.Serialize("fooglarType", FooglarTypeStrArray[fooglarType.fooglarType]);
			s.Serialize("heightInKm", heightInKm.heightInKm);
			s.Serialize("aliases", aliases.aliases);
			s.Serialize("aliasAliases", aliasAliases.aliasAliases);
			s.Serialize("threedeeDouble", threedeeDouble.threedeeDouble);
			s.Serialize("intsAPoppin", intsAPoppin.intsAPoppin);
			return s.JsonValue;
		}
	};

	class Case {
	public:
		const std::string getMESSAGE_SCHEMA_VERSION() const {
			return this->MESSAGE_SCHEMA_VERSION.MESSAGE_SCHEMA_VERSION;
		};

		const int64_t getid() const {
			return this->id.id;
		};

		void setid(int64_t value) {
			this->id.id = value;
		};
		const std::string getdescription() const {
			return this->description.description;
		};

		void setdescription(std::string value) {
			this->description.description = value;
		};
		const std::vector<Fooglar> getsuspects() const {
			return this->suspects.suspects;
		};

		void setsuspects(std::vector<Fooglar> value) {
			this->suspects.suspects = value;
		};
	private:
		struct FieldMESSAGE_SCHEMA_VERSION {
			std::string MESSAGE_SCHEMA_VERSION = "1.0.0";
			bool optional = false;
			int dimensionality = 0;
			std::string typeIdentifier = "string";
			bool staticConstValue = true;
		} MESSAGE_SCHEMA_VERSION;
		struct Fieldid {
			int64_t id;
			bool optional = false;
			int dimensionality = 0;
			std::string typeIdentifier = "int64";
			bool staticConstValue = false;
		} id;
		struct Fielddescription {
			std::string description;
			bool optional = false;
			int dimensionality = 0;
			std::string typeIdentifier = "string";
			bool staticConstValue = false;
		} description;
		struct Fieldsuspects {
			std::vector<Fooglar> suspects;
			bool optional = false;
			int dimensionality = 1;
			std::string typeIdentifier = "Fooglar";
			bool staticConstValue = false;
		} suspects;
		bool bToJson = false;
	public:
		void Serialize(JsonSerializer& s) {
			s.Serialize("id", id.id);
			s.Serialize("description", description.description);
			s.Serialize("suspects", suspects.suspects);
		};

		bool fromJson(const char* json) {
			Json::Value  root;

			Json::Reader reader;
			if (!reader.parse(json, root)) {}

			if (!root.isMember("id")) {
				if (!this->id.optional) {
					return false;
				}
			}
			if (!root.isMember("description")) {
				if (!this->description.optional) {
					return false;
				}
			}
			if (!root.isMember("suspects")) {
				if (!this->suspects.optional) {
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
			s.Serialize("id", id.id);
			s.Serialize("description", description.description);
			s.Serialize("suspects", suspects.suspects);
			return s.JsonValue;
		}
	};

	class Footective {
	public:
		const std::string getMESSAGE_SCHEMA_VERSION() const {
			return this->MESSAGE_SCHEMA_VERSION.MESSAGE_SCHEMA_VERSION;
		};

		const std::string getname() const {
			return this->name.name;
		};

		void setname(std::string value) {
			this->name.name = value;
		};
		const bool getalcoholic() const {
			return this->alcoholic.alcoholic;
		};

		void setalcoholic(bool value) {
			this->alcoholic.alcoholic = value;
		};
		const bool getlooseCannon() const {
			return this->looseCannon.looseCannon;
		};

		void setlooseCannon(bool value) {
			this->looseCannon.looseCannon = value;
		};
		const std::vector<Case> getcases() const {
			return this->cases.cases;
		};

		void setcases(std::vector<Case> value) {
			this->cases.cases = value;
		};
		const std::vector<Footective> getdirectReports() const {
			return this->directReports.directReports;
		};

		void setdirectReports(std::vector<Footective> value) {
			this->directReports.directReports = value;
		};
	private:
		struct FieldMESSAGE_SCHEMA_VERSION {
			std::string MESSAGE_SCHEMA_VERSION = "1.0.0";
			bool optional = false;
			int dimensionality = 0;
			std::string typeIdentifier = "string";
			bool staticConstValue = true;
		} MESSAGE_SCHEMA_VERSION;
		struct Fieldname {
			std::string name;
			bool optional = false;
			int dimensionality = 0;
			std::string typeIdentifier = "string";
			bool staticConstValue = false;
		} name;
		struct Fieldalcoholic {
			bool alcoholic;
			bool optional = true;
			int dimensionality = 0;
			std::string typeIdentifier = "boolean";
			bool staticConstValue = false;
		} alcoholic;
		struct FieldlooseCannon {
			bool looseCannon;
			bool optional = true;
			int dimensionality = 0;
			std::string typeIdentifier = "boolean";
			bool staticConstValue = false;
		} looseCannon;
		struct Fieldcases {
			std::vector<Case> cases;
			bool optional = false;
			int dimensionality = 1;
			std::string typeIdentifier = "Case";
			bool staticConstValue = false;
		} cases;
		struct FielddirectReports {
			std::vector<Footective> directReports;
			bool optional = false;
			int dimensionality = 1;
			std::string typeIdentifier = "Footective";
			bool staticConstValue = false;
		} directReports;
		bool bToJson = false;
	public:
		void Serialize(JsonSerializer& s) {
			s.Serialize("name", name.name);
			s.Serialize("alcoholic", alcoholic.alcoholic);
			s.Serialize("looseCannon", looseCannon.looseCannon);
			s.Serialize("cases", cases.cases);
			s.Serialize("directReports", directReports.directReports);
		};

		bool fromJson(const char* json) {
			Json::Value  root;

			Json::Reader reader;
			if (!reader.parse(json, root)) {}

			if (!root.isMember("name")) {
				if (!this->name.optional) {
					return false;
				}
			}
			if (!root.isMember("alcoholic")) {
				if (!this->alcoholic.optional) {
					return false;
				}
			}
			if (!root.isMember("looseCannon")) {
				if (!this->looseCannon.optional) {
					return false;
				}
			}
			if (!root.isMember("cases")) {
				if (!this->cases.optional) {
					return false;
				}
			}
			if (!root.isMember("directReports")) {
				if (!this->directReports.optional) {
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
			s.Serialize("name", name.name);
			s.Serialize("alcoholic", alcoholic.alcoholic);
			s.Serialize("looseCannon", looseCannon.looseCannon);
			s.Serialize("cases", cases.cases);
			s.Serialize("directReports", directReports.directReports);
			return s.JsonValue;
		}
	};

};