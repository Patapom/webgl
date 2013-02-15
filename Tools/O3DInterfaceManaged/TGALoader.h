// O3DInterfaceManaged.h

#pragma once

#pragma unmanaged
#include "..\O3DInterfaceLib\Interface.h"
#pragma managed

using namespace System;

namespace O3DInterface
{
	public ref class TGALoader
	{
	protected:	// NESTED TYPES

		delegate int	StreamProcessorDelegate( o3d::MemoryWriteStream* _pStream, size_t _BytesToProcess );


	protected:	// FIELDS
		::TGALoader*			m_pTGALoader;

	public:		// METHODS

		TGALoader()
		{
			m_pTGALoader = new ::TGALoader();
		}

		~TGALoader()
		{
			delete m_pTGALoader;
		}

		System::Drawing::Bitmap^		LoadTGA( System::IO::Stream^ _InputStream )
		{
			// Read the stream to the end
			cli::array<System::Byte>^	StreamContent = gcnew cli::array<System::Byte>( int( _InputStream->Length ) );
			_InputStream->Read( StreamContent, 0, int(_InputStream->Length) );

			// Convert into unmanaged buffer
			unsigned char*	pBuffer = new unsigned char[StreamContent->Length];
			System::Runtime::InteropServices::Marshal::Copy( StreamContent, 0, IntPtr( (void*) pBuffer ), StreamContent->Length );

			// Load the TGA
			o3d::MemoryReadStream*	pReadStream = new o3d::MemoryReadStream( pBuffer, StreamContent->Length );
			MemoryBuffer<ColorARGB>	TargetBuffer;
			U32						Width, Height;
			bool					bHasAlpha;

			m_pTGALoader->Load( *pReadStream, TargetBuffer, Width, Height, bHasAlpha );

			delete pReadStream;
			delete pBuffer;

			// Convert the target buffer into a Bitmap
			System::Drawing::Bitmap^	Result = gcnew System::Drawing::Bitmap( Width, Height, bHasAlpha ? System::Drawing::Imaging::PixelFormat::Format32bppArgb : System::Drawing::Imaging::PixelFormat::Format24bppRgb );

			System::Drawing::Imaging::BitmapData^	LockedBitmap = Result->LockBits( System::Drawing::Rectangle( 0, 0, Width, Height ), System::Drawing::Imaging::ImageLockMode::WriteOnly, System::Drawing::Imaging::PixelFormat::Format32bppArgb );

			for ( U32 Y=0; Y < Height; Y++ )
			{
				unsigned char*	pScanlineSource = (unsigned char*) ((ColorARGB*) TargetBuffer + Width * Y);
				unsigned char*	pScanlineTarget = (unsigned char*) (void*) LockedBitmap->Scan0 + LockedBitmap->Stride * Y;
				memcpy( pScanlineTarget, pScanlineSource, Width * sizeof(ColorARGB) );
			}

			Result->UnlockBits( LockedBitmap );

			return	Result;
		}
	};
}
