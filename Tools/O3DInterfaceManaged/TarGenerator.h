// O3DInterfaceManaged.h

#pragma once

#pragma unmanaged
#include "..\O3DInterfaceLib\Interface.h"
#pragma managed

#include "StreamProcessorInterface.h"

using namespace System;

namespace O3DInterface
{
	public ref class TarGenerator
	{
	protected:	// NESTED TYPES

		delegate int	StreamProcessorDelegate( o3d::MemoryReadStream* _pStream, size_t _BytesToProcess );


	protected:	// FIELDS

		System::IO::Stream^		m_OutputStream;

		MyStreamProcessor*		m_pStreamProcessor;
		o3d::TarGenerator*		m_pTarGenerator;

		System::Runtime::InteropServices::GCHandle	m_hDelegate;

	public:		// METHODS

		TarGenerator( System::IO::Stream^ _OutputStream )
		{
			m_OutputStream = _OutputStream;

			// Build the delegate that will be called by the Tar generator to write to the stream
			StreamProcessorDelegate^	D = gcnew StreamProcessorDelegate( this, &TarGenerator::StreamProcessorEventHandler );
			m_hDelegate = System::Runtime::InteropServices::GCHandle::Alloc( D );

			IntPtr	ip = System::Runtime::InteropServices::Marshal::GetFunctionPointerForDelegate( D );

			ProcessBytesCallback	pCallback = static_cast<ProcessBytesCallback>( ip.ToPointer() );

			// Setup the generator
			m_pStreamProcessor = new MyStreamProcessor( pCallback );
			m_pTarGenerator = new o3d::TarGenerator( m_pStreamProcessor );
		}

		~TarGenerator()
		{
			m_hDelegate.Free();

			delete m_pStreamProcessor;
			delete m_pTarGenerator;
		}

		// Call AddFile() for each file entry, followed by calls to AddFileBytes() for the file's data
		void		AddFile( String^ _FileName, int _FileSize )
		{
			_FileName = _FileName->Replace( "\\", "/" );	// For compliance (IF you want to export with directory, which is not the case here)

			// Strip directory
			_FileName = System::IO::Path::GetFileName( _FileName );

			m_pTarGenerator->AddFile( std::string( FromString( _FileName ) ), size_t(_FileSize) );
		}

		// Call to "push" bytes to be processed - our client will get called back with the byte stream, with files rounded up to the nearest block size (with zero padding)
		int			AddFileBytes( cli::array<System::Byte>^ _File )
		{
			// Convert the array of bytes into an unmanaged memory buffer
			unsigned char*	pBuffer = new unsigned char[_File->Length];
			System::Runtime::InteropServices::Marshal::Copy( _File, 0, IntPtr( (void*) pBuffer ), _File->Length );

			// Process it
			o3d::MemoryReadStream*	pFileStream = new o3d::MemoryReadStream( pBuffer, _File->Length );
			int	Result = m_pTarGenerator->AddFileBytes( pFileStream, _File->Length );

			delete pFileStream;
			delete[] pBuffer;

			return	Result;
		}

		// Must call this after all files and file data have been written
		void		FinalizeTAR()
		{
			m_pTarGenerator->Finalize();
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
