#pragma once
#include <string>
#include <vector>
#include <algorithm>
#include <iterator>
#include <KataCore/JsonSerializer.h>
#include <json/reader.h>

namespace Soms {
	class OneMore {
	public:
		const std::string getname() const {
			return this->name.name;
		};

		void setname(std::string value) {
			this->name.name = value;
		};
	private:
		struct Fieldname {
			std::string name;
			bool optional = false;
			int dimensionality = 0;
			std::string typeIdentifier = "string";
			bool staticConstValue = false;
		} name;
		bool bToJson = false;
	public:
		void Serialize(JsonSerializer& s) {
			s.Serialize("name", name.name);
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
			return s.JsonValue;
		}
	};

};