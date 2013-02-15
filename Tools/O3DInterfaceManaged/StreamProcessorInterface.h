// O3DInterfaceManaged.h

#pragma once

#pragma unmanaged
#include "..\O3DInterfaceLib\Interface.h"
#pragma managed

using namespace System;

namespace O3DInterface
{
#pragma unmanaged

	typedef int	(__stdcall *ProcessBytesCallback)( o3d::MemoryReadStream* _pStream, size_t _BytesToProcess );

	class	MyStreamProcessor : public o3d::StreamProcessor
	{
	public:

		ProcessBytesCallback	m_pCallback;

		MyStreamProcessor( ProcessBytesCallback _pCallback )
		{
			m_pCallback = _pCallback;
		}

		virtual int	ProcessBytes( o3d::MemoryReadStream* _pStream, size_t _BytesToProcess )
		{
			return	(*m_pCallback)( _pStream, _BytesToProcess );
		}
	};

#pragma managed

}
