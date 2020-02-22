# soms
Simple, Opinionated Message Schema


## AST Structure

### Types
- `boolean`
- `int64`
- `double`
- `string`
- `user-defined type (UDT)`
- `Array<boolean | int64 | double | string | UDT>`

All types are nullable except `Array`s, which may be zero-length.


### Constants
In principle these will be treated as closely as the target language allows to the platonic ideal of `static const` in
the context of whichever containing structures they appear in.

- name : `string`
  - Description: the name of the constant.
- type : `boolean | int64 | double | string | UDT | Array<boolean | int64 | double | string | UDT>`
  - Description: the type of the constant.
- value: `string`
  - Description: the serialized form of the value of the constant.

 
### Fields
- name : `string`
  - Description: the name of the field.
- type : `"boolean" | "int64" | "double" | "string" | <UDT-name> | "Array<" <boolean | int64 | double | string | UDT> ">"`
  - Description: the type of the field.
- (optional) position : `int64`
  - Description: the zero-indexed position of the field in its containing structure. 
  - Default value: the order in which the field is declared within its containing structure in the AST.
- (optional) optional : `boolean`
  - Description: whether the field may be absent in serialized form.
  Optional fields are implicitly assumed to be present and `default-value`d.
  Deserialization must not require optional fields, but serialization must output them.
  The point of this is to balance ease of hand-writing objects with simplicity of serde implementation.
  - Default value: `false`
- (optional) default-value : `boolean | int64 | double | string | UDT | Array<boolean | int64 | double | string | UDT>`
  - Description: the default value to use for implicitly specified values.
  - Default value: `null` for `boolean | int64 | double | string | UDT`, zero-length `Array` for `Array` types.


### User-Defined Types (UDTs)
- name : `string`
  - Description: the name of the UDT (i.e., the class name).
- (optional) constants : `Array<Constant>`
  - Description: whatever `static const` things you want in the UDT.
  - Default value: zero-length `Array<Constant>`.
- (optional) fields : `Array<Field>`
  - Description: whatever fields you want in the UDT.
  - Default value: zero-length `Array<Field>`.


### Packages
- name : `string`
  - Description: dot-delimited name of the package (or module, or namespace, or whatever makes most sense in the target language).
- (optional) constants : `Array<Constant>`
  - Description: whatever `static const` things you want in the package.
  - Default value: zero-length `Array<Constant>`.
- (optional) udts : `Array<UDT>`
  - Description: whatever `UDT`s you want in the package.
  - Default value: zero-length `Array<UDT>`


### Specifications
- packages: `Array<Package>`


## File Formats
soms uses the `.jsoms` file suffix, which is just JSON with the addition of comment lines denoted by `<whitespace characters>* "//" <your comment text>`.
