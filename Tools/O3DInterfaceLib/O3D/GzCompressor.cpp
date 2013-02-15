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


#include "StdAfx.h"

#include <assert.h>

#include "GzCompressor.h"

const size_t kChunkSize = 16384;

namespace o3d
{

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	GzCompressor::GzCompressor( StreamProcessor* _pClientCallback, bool _bBestCompression ) : m_pClientCallback( _pClientCallback ), m_bStreamIsClosed( false )
	{
		m_ZStream.zalloc = Z_NULL;
		m_ZStream.zfree = Z_NULL;
		m_ZStream.opaque = Z_NULL;

		// Store this, so we can later check if it's OK to start processing
		m_InitResult = deflateInit2(
		  &m_ZStream,
		  _bBestCompression ? Z_BEST_COMPRESSION : Z_BEST_SPEED,//Z_DEFAULT_COMPRESSION, <== DEFAULT is BEST anyway
		  Z_DEFLATED,
		  MAX_WBITS + 16,  // 16 means write out gzip header/trailer
		  DEF_MEM_LEVEL,
		  Z_DEFAULT_STRATEGY);
	}

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	void GzCompressor::Finalize()
	{
		if ( m_bStreamIsClosed )
			return;

		// Flush the compression _pStream
		MemoryReadStream	Stream( NULL, 0 );
		CompressBytes( &Stream, 0, true );

		// Deallocate resources
		deflateEnd( &m_ZStream );
		m_bStreamIsClosed = true;
	}

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	GzCompressor::~GzCompressor()
	{
		// Finalize() turns out to be a "nop" if the user has already called it
		Finalize();
	}

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	int GzCompressor::ProcessBytes(MemoryReadStream* _pStream, size_t _BytesToProcess)
	{
		// Basic sanity check
		if ( _pStream->GetDirectMemoryPointer() == NULL || _BytesToProcess == 0 )
			return	-1;

		return CompressBytes( _pStream, _BytesToProcess, false );
	}

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	int GzCompressor::CompressBytes( MemoryReadStream* _pStream, size_t _BytesToProcess, bool _bFlush )
	{
		// Don't even bother trying if we didn't get initialized properly
		if ( m_InitResult != Z_OK )
			return	m_InitResult;

		uint8 out[kChunkSize];
		int result = Z_OK;

		// Don't try to read more than our _pStream has
		int remaining = _pStream->GetRemainingByteCount();
		if ( _BytesToProcess > remaining )
			return Z_STREAM_ERROR;

		// Use direct memory access on the MemoryStream object
		const uint8*	pInputData = _pStream->GetDirectMemoryPointer();
		_pStream->Skip( _BytesToProcess );

		// Fill out the zlib z_stream struct
		m_ZStream.avail_in = _BytesToProcess;
		m_ZStream.next_in = const_cast<uint8*>( pInputData );

		// We need to _bFlush the _pStream when we reach the end
		int bFlushCode = _bFlush ? Z_FINISH : Z_NO_FLUSH;

		// Run inflate() on input until output buffer not full
		do
		{
			m_ZStream.avail_out = kChunkSize;
			m_ZStream.next_out = out;

			result = deflate(&m_ZStream, bFlushCode);

			// error check here - return error codes if necessary
			assert( result != Z_STREAM_ERROR );  // state not clobbered

			size_t	have = kChunkSize - m_ZStream.avail_out;

			// Callback with the compressed byte _pStream
			MemoryReadStream	decompressed_stream( out, have );
			if ( have > 0 && m_pClientCallback )
			{
				int client_result = m_pClientCallback->ProcessBytes( &decompressed_stream, have );

				if ( client_result != 0 )
					return client_result;  // propagate callback errors
			}
		} while ( m_ZStream.avail_out == 0 );

		return result;
	}

}  // namespace o3d
