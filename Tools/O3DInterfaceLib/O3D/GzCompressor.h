#pragma once

#include <map>
#include <string>

#include "BasicTypes.h"
#include "Types.h"
#include "MemoryBuffer.h"
#include "MemoryStream.h"

#include "../ZLib/zutil.h"


namespace o3d
{
	class GzCompressor : public StreamProcessor
	{
	protected:	// FIELDS

		z_stream			m_ZStream;	// low-level zlib state
		int					m_InitResult;
		bool				m_bStreamIsClosed;
		StreamProcessor*	m_pClientCallback;


	public:		// METHODS

					GzCompressor( StreamProcessor* _pClientCallback, bool _bBestCompression );
		virtual		~GzCompressor();

		virtual int ProcessBytes( MemoryReadStream* _pStream, size_t _BytesToProcess );

		// Must call when all bytes to compress have been sent (with ProcessBytes)
		void		Finalize();

	protected:

		int			CompressBytes( MemoryReadStream* _pStream, size_t _BytesToProcess, bool _bFlush );
	};
}