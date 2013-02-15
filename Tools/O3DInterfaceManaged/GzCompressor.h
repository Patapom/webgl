// O3DInterfaceManaged.h

#pragma once

#pragma unmanaged
#include "..\O3DInterfaceLib\Interface.h"
#pragma managed

#include "StreamProcessorInterface.h"

using namespace System;

namespace O3DInterface
{
	public ref class GzCompressor
	{
	protected:	// NESTED TYPES

		delegate int	StreamProcessorDelegate( o3d::MemoryReadStream* _pStream, size_t _BytesToProcess );


	protected:	// FIELDS

		System::IO::Stream^		m_OutputStream;

		MyStreamProcessor*		m_pStreamProcessor;
		o3d::GzCompressor*		m_pGzCompressor;

		System::Runtime::InteropServices::GCHandle	m_hDelegate;


	public:		// METHODS

		GzCompressor( System::IO::Stream^ _OutputStream, bool _bBestCompression )
		{
			m_OutputStream = _OutputStream;

			// Build the delegate that will be called by the Tar generator to write to the stream
			StreamProcessorDelegate^	D = gcnew StreamProcessorDelegate( this, &GzCompressor::StreamProcessorEventHandler );
			m_hDelegate = System::Runtime::InteropServices::GCHandle::Alloc( D );

			IntPtr	ip = System::Runtime::InteropServices::Marshal::GetFunctionPointerForDelegate( D );

			ProcessBytesCallback	pCallback = static_cast<ProcessBytesCallback>( ip.ToPointer() );

			// Setup the generator
			m_pStreamProcessor = new MyStreamProcessor( pCallback );
			m_pGzCompressor = new o3d::GzCompressor( m_pStreamProcessor, _bBestCompression );
		}

		~GzCompressor()
		{
			m_hDelegate.Free();

			delete m_pStreamProcessor;
			delete m_pGzCompressor;
		}

		int			ProcessBytes( cli::array<System::Byte>^ _Data )
		{
			// Convert the array of bytes into an unmanaged memory buffer
			unsigned char*	pBuffer = new unsigned char[_Data->Length];
			System::Runtime::InteropServices::Marshal::Copy( _Data, 0, IntPtr( (void*) pBuffer ), _Data->Length );

			// Process it
			o3d::MemoryReadStream*	pFileStream = new o3d::MemoryReadStream( pBuffer, _Data->Length );
			int	Result = m_pGzCompressor->ProcessBytes( pFileStream, _Data->Length );

			delete pFileStream;
			delete[] pBuffer;

			return	Result;
		}

		// Must call this after all files and file data have been written
		void		FinalizeGZ()
		{
			m_pGzCompressor->Finalize();
		}

	protected:

		int	StreamProcessorEventHandler( o3d::MemoryReadStream* _pStream, size_t _BytesToProcess )
		{
			// Read the stream into an unmanaged buffer
			unsigned char*	pBuffer = new unsigned char[_BytesToProcess];
			_pStream->Read( pBuffer, _BytesToProcess );

			// Copy it into a managed one
			cli::array<System::Byte>^	ManagedBuffer = gcnew cli::array<System::Byte>( _BytesToProcess );
			System::Runtime::InteropServices::Marshal::Copy( IntPtr( (void*) pBuffer ), ManagedBuffer, 0, _BytesToProcess );

			// Write the content to the actual stream
			m_OutputStream->Write( ManagedBuffer, 0, _BytesToProcess );

			delete[] pBuffer;

			return	0;	// No error
		}

		// Helpers

		// Converts a unicode managed string into an ASCII unmanaged one
		const char*	FromString( String^ _String )
		{
			IntPtr	StringPointer = System::Runtime::InteropServices::Marshal::StringToHGlobalAnsi( _String );
			return	(char*) StringPointer.ToPointer();
		}
	};
}
