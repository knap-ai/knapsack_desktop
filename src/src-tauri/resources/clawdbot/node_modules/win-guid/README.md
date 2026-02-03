[![NPM version](https://img.shields.io/npm/v/win-guid.svg)](https://npmjs.org/package/win-guid)
[![Node.js CI](https://github.com/Borewit/win-guid/actions/workflows/nodejs-ci.yml/badge.svg)](https://github.com/Borewit/win-guid/actions/workflows/nodejs-ci.yml)
[![npm downloads](http://img.shields.io/npm/dm/win-guid.svg)](https://npmcharts.com/compare/win-guid?start=365)

# win-guid

A module for decoding and encoding Windows GUIDs in the **Windows GUID byte layout** used by COM, OLE, and Compound File Binary Format (CFBF), and converting them back to the canonical string form when needed.

This is useful when dealing with Microsoft file formats such as `.asf`, `.doc`, `.xls`, `.ppt`, OLE/COM Structured Storage (CFBF), or other binary formats that store GUIDs in Windows order.

## Windows GUID byte layout vs RFC 9562 UUID byte layout

The table below shows how GUID `00112233-4455-6677-8899-AABBCCDDEEFF` is serialized as an [RFC 9562](https://www.rfc-editor.org/rfc/rfc9562.html) UUID versus a Windows GUID:

| UUID / GUID type        | Serialized byte layout (hexadecimal)              |
|-------------------------|---------------------------------------------------|
| RFC 9562 UUID layout    | `00 11 22 33 44 55 66 77 88 99 AA BB CC DD EE FF` |
| Windows GUID layout     | `33 22 11 00 55 44 77 66 88 99 AA BB CC DD EE FF` |

Windows GUID layout reorders only the first three fields (32-bit, 16-bit, 16-bit). The remaining 8 bytes are stored as-is.

For RFC 9562 compliant UUIDs (network byte order), use [uuid](https://github.com/uuidjs/uuid) instead.

## Installation

```bash
npm install win-guid
```

## Usage

### Parse a GUID string

```js
import { parseWindowsGuid } from "win-guid";

const bytes = parseWindowsGuid("00020906-0000-0000-C000-000000000046");

// Uint8Array(16) in Windows GUID byte order
```

### Use the Guid helper class

```js
import { Guid } from "win-guid";

const guid = Guid.fromString("00020906-0000-0000-C000-000000000046");
```

## API

`parseWindowsGuid(guid: string): Uint8Array`

Parses a canonical GUID string:
```js
const bytes = parseWindowsGuid("00020906-0000-0000-C000-000000000046");
```

into a 16-byte `Uint8Array` using Windows GUID byte order.

- Input is validated strictly
- Case-insensitive
- Throws Error on invalid input

`class Guid`

Creates a GUID from a canonical GUID string.

```js
const guid = Guid.fromString("00020906-0000-0000-C000-000000000046");
```

`guid.toString(): string`

Converts the GUID back into the canonical string form.

- Always uppercase
- Round-trips cleanly with fromString

```js
guid.toString();
```
Outputs something like:
```
00020906-0000-0000-C000-000000000046`
```

`guid.bytes: Uint8Array`

Provides access to the raw 16-byte GUID in Windows / CFBF byte order.

Notes:
- The returned value is a `Uint8Array(16)`
- It represents the Windows GUID byte layout (as stored in COM, OLE, CFBF, and related formats)

```js
const bytes = guid.bytes;
```

## Licence

This project is licensed under the [MIT License](LICENSE.txt). Feel free to use, modify, and distribute as needed.
