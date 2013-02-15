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

#include "TarGenerator.h"
#include "MemoryBuffer.h"

using std::string;

namespace o3d
{
	const int kMaxFilenameSize        = 100;

	const int kFileNameOffset         = 0;
	const int kFileModeOffset         = 100;
	const int kUserIDOffset           = 108;
	const int kGroupIDOffset          = 116;
	const int kFileSizeOffset         = 124;
	const int kModifyTimeOffset       = 136;
	const int kHeaderCheckSumOffset   = 148;
	const int kLinkFlagOffset         = 156;
	const int kMagicOffset            = 257;
	const int kUserNameOffset         = 265;
	const int kGroupNameOffset        = 297;

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	void TarGenerator::AddFile(const std::string& _FileName, size_t _FileSize)
	{
		AddDirectoryEntryIfNeeded( _FileName );
		AddEntry( _FileName, _FileSize, false );
	}

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	void TarGenerator::AddDirectory( const std::string& _FileName )
	{
		AddEntry( _FileName, 0, true );
	}

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// We keep a map so we add a particular directory entry only once
	void TarGenerator::AddDirectoryEntryIfNeeded(const std::string& _FileName)
	{
		string::size_type index = _FileName.find_last_of( '/' );
		if ( index == string::npos )
			return;

		std::string	DirectoryName = _FileName.substr(0, index + 1);  // keep the '/' at end
		if ( !m_DirectoryMap[DirectoryName] )
		{
			m_DirectoryMap[DirectoryName] = true;
			AddDirectory( DirectoryName );
		}
	}

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	void TarGenerator::AddEntry(const std::string& _FileName, size_t _FileSize, bool _bIsDirectory )
	{
		// first write out last data block from last file (if any)
		FlushDataBuffer( true );

		// next fill out a tar header
		MemoryBuffer<uint8>	header(TAR_HEADER_SIZE);  // initializes header to zeroes

		// leave room for NULL-termination
		uint8*	h = header;
		char*	p = reinterpret_cast<char*>(h);

		// File name
		strncpy( p, _FileName.c_str(), kMaxFilenameSize - 1 );

		// File mode
		_snprintf( p + kFileModeOffset, 8, "%07o", _bIsDirectory ? 0755 : 0644 );

		// UserID
		_snprintf( p + kUserIDOffset, 8, "%07o", 0765 );

		// GroupID
		_snprintf( p + kGroupIDOffset, 8, "%07o", 0204 );

		// File size
		_snprintf( p + kFileSizeOffset, 12, "%011o", _FileSize );

		// Modification time
		// TODO: write the correct current time here...
		_snprintf( p + kModifyTimeOffset, 12, "%07o", 011131753141 );

		// Initialize Header checksum so check sum can be computed
		// by ComputeCheckSum() which will fill in the value here
		memset( p + kHeaderCheckSumOffset, 32, 8 );

		// We only support ordinary files and directories, which is fine
		// for our use case
		int link_flag = _bIsDirectory ? '5' : '0';
		p[kLinkFlagOffset] = link_flag;

		// Magic offset
		_snprintf( p + kMagicOffset, 8, "ustar  " );

		// User name
		_snprintf( p + kUserNameOffset, 32, "guest" );

		// Group name
		_snprintf( p + kGroupNameOffset, 32, "staff" );


		// This has to be done at the end
		ComputeCheckSum( header );

		if ( m_pClientCallback )
		{
			MemoryReadStream	stream( header, TAR_HEADER_SIZE );
			m_pClientCallback->ProcessBytes( &stream, TAR_HEADER_SIZE );
		}
	}

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	void TarGenerator::ComputeCheckSum( uint8* _pHeader )
	{
		unsigned int checksum = 0;
		for (int i = 0; i < TAR_HEADER_SIZE; ++i)
		{
			checksum += _pHeader[i];
		}
		_snprintf( reinterpret_cast<char*>(_pHeader + kHeaderCheckSumOffset), 8, "%06o\0\0", checksum );
	}

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	int TarGenerator::AddFileBytes( MemoryReadStream* _pStream, size_t n )
	{
		if ( !m_pClientCallback )
			return	0;

		FlushDataBuffer(false);  // flush any old data sitting around

		// we'll directly write as much of the data as we can, writing full blocks
		int		nblocks = n / TAR_BLOCK_SIZE;
		size_t	direct_bytes_to_write = nblocks * TAR_BLOCK_SIZE;
		if ( direct_bytes_to_write > 0 )
			m_pClientCallback->ProcessBytes( _pStream, direct_bytes_to_write );

		// now, buffer the remainder (less than TAR_BLOCK_SIZE)
		size_t remainder = n - direct_bytes_to_write;

		const uint8*	p = _pStream->GetDirectMemoryPointer();
		m_DataBufferStream.Write( p, remainder );
		_pStream->Skip( remainder );

		return 0;
	}

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	void TarGenerator::FlushDataBuffer( bool _bFlushPaddingZeroes )
	{
		size_t	buffered_bytes = m_DataBufferStream.GetStreamPosition();
		if ( buffered_bytes == 0 || m_pClientCallback == NULL )
			return;

		// write out the complete data block (which may be zero padded at the end)
		size_t bytes_to_flush = _bFlushPaddingZeroes ? TAR_BLOCK_SIZE : buffered_bytes;

		MemoryReadStream stream( m_DataBlockBuffer, bytes_to_flush );
		m_pClientCallback->ProcessBytes( &stream, bytes_to_flush );

		// get ready to start buffering next data block
		m_DataBlockBuffer.Clear();
		m_DataBufferStream.Seek(0);
	}

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	void TarGenerator::Finalize()
	{
		FlushDataBuffer( true );
	}

}  // namespace o3d
