/*
 * Copyright 2009, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


// This file contains definitions of common data types and conversion
// methods used by the O3D codebase.

#ifndef O3D_CORE_CROSS_TYPES_H_
#define O3D_CORE_CROSS_TYPES_H_

#include <assert.h>
#include <stdlib.h>
#include <stdio.h>
//#include <build/build_config.h>
#ifdef OS_WIN
#include <windows.h>
#endif

#include <string>

#include "basictypes.h"
//#include "base/logging.h"
//#include "base/string_util.h"
//#include "core/cross/math_types.h"
//#include "core/cross/float_n.h"

// Defines ---------------------------------
#ifdef _DEBUG
#define O3D_ASSERT(x)     assert((x))
#else
#define O3D_ASSERT(x)
#endif
// Add debug logging for the first N occurrences.
// Add debug logging for every N occurrences.
// TODO: delete this when logging.h is updated to include this
// functionality.
#ifdef NDEBUG
#define DONT_LOG while (false) NDEBUG_EAT_STREAM_PARAMETERS
#define DLOG_FIRST_N(severity, n) DONT_LOG

#define DLOG_EVERY_N(severity, n) DONT_LOG
#else  // NDEBUG
#define LOG_OCCURRENCES occurrences_ ## __LINE__
#define LOG_OCCURRENCES_MOD_N occurrences_mod_n_ ## __LINE__
// WARNING: DO NOT USE THIS IN A CONDITIONAL STATEMENT WITHOUT BRACES AROUND
// DLOG_FIRST_N AND ITS PARAMETERS (INCLUDING THE COMMENT STREAM)
// "severity.stream()" must be the last item in the macro in order to actually
// log the stream properly. Hence, the reason it must also be included in
// the braces as noted above.
#define SOME_KIND_OF_LOG_FIRST_N(severity, n)   \
  static int LOG_OCCURRENCES = 0;               \
  if (LOG_OCCURRENCES <= n)                     \
    ++LOG_OCCURRENCES;                          \
  if (LOG_OCCURRENCES <= n)                     \
    COMPACT_GOOGLE_LOG_ ## severity.stream()

#define SOME_KIND_OF_LOG_EVERY_N(severity, n)   \
  static int LOG_OCCURRENCES = 0;               \
  static int LOG_OCCURRENCES_MOD_N = 0;         \
  ++LOG_OCCURRENCES;                            \
  if (++LOG_OCCURRENCES_MOD_N > n)              \
    LOG_OCCURRENCES_MOD_N -= n;                 \
  if (LOG_OCCURRENCES_MOD_N == 1)               \
    COMPACT_GOOGLE_LOG_ ## severity.stream()

#define DLOG_FIRST_N(severity, n)               \
  SOME_KIND_OF_LOG_FIRST_N(severity, (n))

#define DLOG_EVERY_N(severity, n)               \
  SOME_KIND_OF_LOG_EVERY_N(severity, (n))
#endif  // NDEBUG

// Endian-ness for machine architecture
// Either IS_LITTLE_ENDIAN or IS_BIG_ENDIAN should be defined

// For now we build for x86 Win/Mac/Linux
// We can add more sophisticated per-platform #defines as necessary here
#define IS_LITTLE_ENDIAN 1

namespace o3d {

// String
//
typedef std::string String;

// ID used to uniquely identify objects
//
typedef unsigned int Id;

};  // namespace o3d

#endif  // O3D_CORE_CROSS_TYPES_H_
