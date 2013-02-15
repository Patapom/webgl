#pragma once

#include <map>
#include <string>

#include "BasicTypes.h"
#include "Types.h"
#include "MemoryBuffer.h"
#include "MemoryStream.h"

namespace o3d
{
	class TarGenerator
	{
	protected:	// NESTED TYPES

		enum {TAR_HEADER_SIZE = 512};
		enum {TAR_BLOCK_SIZE = 512};


		// We use DirectoryMap to keep track of which directories we've already
		// written out headers for.  The client doesn't need to explicitly
		// add the directory entries.  Instead, the files will be stripped to their
		// base path and entries added for the directories as needed...
		struct StrCmp
		{
			bool	operator()(const std::string &s1, const std::string &s2) const
			{
				return strcmp(s1.c_str(), s2.c_str()) < 0;
			}
		};

		typedef std::map<const std::string, bool, StrCmp>	DirectoryMap;

	protected:	// FIELDS

		StreamProcessor*	m_pClientCallback;

		// Buffers file data here - file data is in multiples of TAR_BLOCK_SIZE
		MemoryBuffer<uint8>	m_DataBlockBuffer;
		MemoryWriteStream	m_DataBufferStream;

		DirectoryMap		m_DirectoryMap;


	public:		// METHODS

		TarGenerator( StreamProcessor* _pClientCallback ) :	m_pClientCallback( _pClientCallback ),
															m_DataBlockBuffer(TAR_BLOCK_SIZE),  // initialized to zeroes
															m_DataBufferStream( m_DataBlockBuffer, TAR_BLOCK_SIZE )
		{
		}

		virtual ~TarGenerator()
		{
			Finalize();
		}

		// Call AddFile() for each file entry, followed by calls to AddFileBytes() for the file's data
		virtual void	AddFile( const std::string& _FileName, size_t _FileSize );

		// Call to "push" bytes to be processed - our client will get called back with the byte stream, with files rounded up to the nearest block size (with zero padding)
		virtual int		AddFileBytes( MemoryReadStream* _Stream, size_t n );

		// Must call this after all files and file data have been written
		virtual void	Finalize();


	protected:

		void			AddEntry( const std::string& _FileName, size_t _FileSize, bool _bIsDirectory );
		void			AddDirectory( const std::string& _FileName );
		void			AddDirectoryEntryIfNeeded( const std::string& _FileName );
		void			ComputeCheckSum( uint8* _pHeader );	// Checksum for each header

		// flushes buffered file data to the client callback if |flush_padding_zeroes| is |true| then flush a complete block with zero padding even if less was buffered
		void			FlushDataBuffer( bool _bFlushPaddingZeroes );
	};
}