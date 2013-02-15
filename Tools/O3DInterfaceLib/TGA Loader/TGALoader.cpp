//============================================================================
// PROJECT : PlatformDk
// MODULE  : DkMedia
// SOURCE  : TGALoader.h
// PURPOSE : Implementation of the TGALoader class
// PLATEFO : ANY
// AUTHORS : Patapom
// CREATED : 29/08/04 (DD/MM/YY)
// REMARKS : 
//          * This source code file is copyright (c) Benoît Mayaux 2004.
//============================================================================


//============================================================================
// INCLUDES
//============================================================================
#include "StdAfx.h"
#include "TGALoader.h"

#include <assert.h>


//============================================================================
// CLASS TGALoader
//============================================================================

using namespace o3d;

ColorARGB&		ColorARGB::Set( const ColorRGB& _Source )								{ m_B = _Source.m_B; m_G = _Source.m_G; m_R = _Source.m_R; m_A = 0xFF; return *this; }

bool	TGALoader::CanLoad( MemoryReadStream& _Stream ) const
{
	U32	dwStreamPosition = _Stream.GetStreamPosition();

	// Check the buffer's length (must be at least 14 bytes)
	U32	dwStreamLength = U32( _Stream.GetTotalStreamLength() );
	if ( dwStreamLength < sizeof(TGAHEADER) )
	{
		_Stream.Seek( dwStreamPosition );
		return	false;
	}

	// Read the header
	TGAHEADER	TGAHeader;
	_Stream.Read( &TGAHeader, sizeof(TGAHEADER) );

	// Go back to original position
	_Stream.Seek( dwStreamPosition );

	// Check for the supported TGA format
	switch ( TGAHeader.bImageType )
	{
	case	1:
		{
			if ( TGAHeader.bColorMapType != 1 )
				return	false;																// The TGA picture has no Color Map!
			if ( TGAHeader.bColorMapDepth != 16 && TGAHeader.bColorMapDepth != 24 && TGAHeader.bColorMapDepth != 32 )
				return	false;
			if ( TGAHeader.bImageDescriptor & 0x10 )
				return	false;																// Can't unpack TGA pictures from the right!
			if ( (TGAHeader.bImageDescriptor & 0xC0) == 0xC0 )
				return	false;
			
			// Compute the size of the file for the final check
			if ( sizeof(TGAHEADER) + TGAHeader.bIDLength + (TGAHeader.wColorMapLength * (TGAHeader.bColorMapDepth >> 3)) + (TGAHeader.wWidth * TGAHeader.wHeight * (TGAHeader.bPixelDepth >> 3)) > dwStreamLength )	// We don't make an exact comparison, because some f?cking softs adds some data to the end of the file (I'm not talking about Photoshop !!!)
				return	false;
			break;
		}

	case	2:
		{
			if ( TGAHeader.bPixelDepth != 16 && TGAHeader.bPixelDepth != 24 && TGAHeader.bPixelDepth != 32 )
				return	false;
			if ( TGAHeader.bImageDescriptor & 0x10 )
				return	false;																// Can't unpack TGA pictures from the right!
			if ( (TGAHeader.bImageDescriptor & 0xC0) == 0xC0 )
				return	false;
			if ( TGAHeader.bPixelDepth == 24 && (TGAHeader.bImageDescriptor & 0xF) )
				return	false;
			if ( TGAHeader.bPixelDepth == 32 && ((TGAHeader.bImageDescriptor & 0xF) != 8) )
				return	false;

			// Compute the size of the file for the final check
			if ( sizeof(TGAHEADER) + TGAHeader.bIDLength + (TGAHeader.wColorMapLength * (TGAHeader.bColorMapDepth >> 3)) + (TGAHeader.wWidth * TGAHeader.wHeight * (TGAHeader.bPixelDepth >> 3)) > dwStreamLength )
				return	false;
			break;
		}

	case	9:
		{
			if ( TGAHeader.bColorMapType != 1 )
				return	false;																// The TGA picture has no Color Map!
			if ( TGAHeader.bColorMapDepth != 16 && TGAHeader.bColorMapDepth != 24 && TGAHeader.bColorMapDepth != 32 )
				return	false;
			if ( TGAHeader.bImageDescriptor & 0x10 )
				return	false;																// Can't unpack TGA pictures from the right!
			if ( TGAHeader.bImageDescriptor & 0xC0 )
				return	false;																// None of these two bits can be set

			break;
		}

	case	10:
		{
			if ( TGAHeader.bPixelDepth != 16 && TGAHeader.bPixelDepth != 24 && TGAHeader.bPixelDepth != 32 )
				return	false;
			if ( TGAHeader.bImageDescriptor & 0x10 )
				return	false;																// Can't unpack TGA pictures from the right!
			if ( TGAHeader.bImageDescriptor & 0xC0 )
				return	false;																// None of these two bits can be set

			break;
		}

	default:
		return	false;			// Unrecognized...
	}

	return	true;
}

void	TGALoader::Load( MemoryReadStream& _Stream, MemoryBuffer<ColorARGB>& _Bitmap32, U32& _Width, U32& _Height, bool& _bHasAlpha ) const
{
	U32	dwStreamPosition = _Stream.GetStreamPosition();

	// Read header
	TGAHEADER	TGAHeader;
	_Stream.Read( &TGAHeader, sizeof(TGAHEADER) );

	// Skip the ID (we should be at the beginning of the CLUT)
	_Stream.Seek( _Stream.GetStreamPosition() + TGAHeader.bIDLength );


	_Width = TGAHeader.wWidth;
	_Height = TGAHeader.wHeight;
	_bHasAlpha = false;	// No alpha by default
	_Bitmap32.Allocate( _Width * _Height );

	ColorARGB*	pBuffer = _Bitmap32;

	// Support loading of type 1, 2, 9 & 10 (uncompressed & RLE, color-map & true-color)
	switch ( TGAHeader.bImageType )
	{
	case	1 :	// Image Type 1 : uncompressed + color-map image
		{
			// Read the CLUT
			CLUT16	CLUT16;
			CLUT24	CLUT24;
			CLUT32	CLUT32;
			CLUT*	pSourceCLUT = NULL;
			switch ( TGAHeader.bColorMapDepth )
			{
			case	16: pSourceCLUT = &CLUT16; 	break;
			case	24: pSourceCLUT = &CLUT24;	break;
			case	32: pSourceCLUT = &CLUT32; _bHasAlpha = true;	break;

			default:
				assert( false );
			}
			pSourceCLUT->InitCLUT( TGAHeader.wColorMapLength );
			_Stream.Read( pSourceCLUT->GetCLUT(), TGAHeader.wColorMapLength * TGAHeader.bColorMapDepth / 8 );

// 			ColorARGB*	pDestCLUT = pBitmap->GetCLUT();
// 
// 				// ...and copy it to the bitmap's
// 			for ( U32 dwColorIndex=TGAHeader.wColorMapStart; dwColorIndex < TGAHeader.wColorMapLength; pDestCLUT[dwColorIndex++] = (*pSourceCLUT)[dwColorIndex] );



			// Read the Pixels
			if ( TGAHeader.bImageDescriptor & 0x20 )
				for ( U32 y=0; y < _Height; y++ )
					for ( U32 x=0; x < _Width; x++ )
						pBuffer[_Width*y+x] = (*pSourceCLUT)[_Stream.ReadByte()];
			else
				for ( S32 y=_Height-1; y >= 0; y-- )
					for ( U32 x=0; x < _Width; x++ )
						pBuffer[_Width*y+x] = (*pSourceCLUT)[_Stream.ReadByte()];

			break;
		 }

	case	2:	// Image Type 2 : uncompressed + true-color image
		{
			switch ( TGAHeader.bPixelDepth )
			{
// 			case	16:
// 				{
// 				// Allocate a Bitmap16
// 				pResult = pCreationService->Create( "Bitmap16" );
// 				DK_ASSERT( pResult != NULL, "TGALoader::Load() => Couldn't create the Bitmap16 picture container!" );
// 				DkBitmap16*	pBitmap = (DkBitmap16*) pResult->GetPicture();
// 
// 				// Initialize it
// 				pBitmap->SetA();
// 				pBitmap->SetR( 0x7C00, 5, 10 );
// 				pBitmap->SetG( 0x03E0, 5, 5 );
// 				pBitmap->SetB( 0x001F, 5, 0 );
// 
// 				pBitmap->Init( TGAHeader.wWidth, TGAHeader.wHeight );
// 
// 				if ( TGAHeader.bImageDescriptor & 0x20 )
// 					for ( U32 y=0; y < _Height; y++ )
// 						_Stream.Read( pBitmap->GetBuffer( 0, y ), _Width * sizeof(U16) );
// 				else
// 					for ( S32 y=_Height-1; y >= 0; y-- )
// 						_Stream.Read( pBitmap->GetBuffer( 0, y ), _Width * sizeof(U16) );
// 				}
// 				break;

			case	24:
			{
				ColorRGB	Temp;
				if ( TGAHeader.bImageDescriptor & 0x20 )
					for ( U32 y=0; y < _Height; y++ )
						for ( U32 x=0; x < _Width; x++ )
						{
							_Stream.Read( &Temp, sizeof(ColorRGB) );
							pBuffer[_Width*y+x].Set( Temp );
						}
				else
					for ( S32 y=_Height-1; y >= 0; y-- )
						for ( U32 x=0; x < _Width; x++ )
						{
							_Stream.Read( &Temp, sizeof(ColorRGB) );
							pBuffer[_Width*y+x].Set( Temp );
						}
				break;
			}

			case	32:
			{
				if ( TGAHeader.bImageDescriptor & 0x20 )
					for ( U32 y=0; y < _Height; y++ )
						_Stream.Read( &pBuffer[_Width*y], _Width * sizeof(ColorARGB) );
				else
					for ( S32 y=_Height-1; y >= 0; y-- )
						_Stream.Read( &pBuffer[_Width*y], _Width * sizeof(ColorARGB) );
				break;
			}

			default:
				assert( false );
			}
			break;
		}

// 	case	9:	// Image Type 9 : RLE + color-map image
// 		{
// 			// Allocate a Bitmap8
// 			pResult = pCreationService->Create( "Bitmap8" );
// 			DK_ASSERT( pResult != NULL, "TGALoader::Load() => Couldn't create the Bitmap8 picture container!" );
// 			DkBitmap8*	pBitmap = (DkBitmap8*) pResult->GetPicture();
// 
// 			// Initialize it
// 			pBitmap->Init( TGAHeader.wWidth, TGAHeader.wHeight );
// 
// 			// Read the CLUT
// 			CLUT16	CLUT16;
// 			CLUT24	CLUT24;
// 			CLUT32	CLUT32;
// 			CLUT*	pSourceCLUT = NULL;
// 			switch ( TGAHeader.bColorMapDepth )
// 			{
// 			case	16: pSourceCLUT = &CLUT16; 	break;
// 			case	24: pSourceCLUT = &CLUT24;	break;
// 			case	32: pSourceCLUT = &CLUT32; _bHasAlpha = true;	break;
// 
// 			default:
// 				_Stream.Seek( dwStreamPosition );
// 				return	NULL;
// 			}
// 			pSourceCLUT->InitCLUT( TGAHeader.wColorMapLength );
// 			_Stream.Read( pSourceCLUT->GetCLUT(), TGAHeader.wColorMapLength * TGAHeader.bColorMapDepth / 8 );
// 
// 			ColorARGB*	pDestCLUT = pBitmap->GetCLUT();
// 
// 				// ...and copy it to the bitmap's
// 			for ( U32 dwColorIndex=TGAHeader.wColorMapStart; dwColorIndex < TGAHeader.wColorMapLength; pDestCLUT[dwColorIndex++] = (*pSourceCLUT)[dwColorIndex] );
// 
// 			// Read the Pixels
// 			U8*		pDest = (U8*) pBitmap->GetBuffer();
// 
// 			S8		bRunLength, bData;
// 			U32		j, dwPixIndex = 0, dwPixAmount = _Width * _Height;
// 
// 			while ( dwPixIndex < dwPixAmount )
// 			{
// 				// Decode the picture
// 				_Stream.Read( &bRunLength, 1 );
// 				if ( bRunLength & 0x80 )
// 				{
// 					bRunLength &= 0x7F;
// 					_Stream.Read( &bData, 1 );
// 					for ( j=0; j <= (U32) bRunLength; j++, pDest++ )
// 						*pDest = bData;
// 				}
// 				else
// 				{
// 					_Stream.Read( pDest, (U32) bRunLength );
// 					pDest += bRunLength;
// 				}
// 
// 				dwPixIndex += 1 + bRunLength;
// 			}
// 
// 			// Invert the "bottom to top" pictures
// 			if ( !(TGAHeader.bImageDescriptor & 0x20) )
// 				pBitmap->MirrorVertical();
// 
// 			break;
// 		}

	case	10:	// Image Type 10 : RLE + true-color image
		{
			switch ( TGAHeader.bPixelDepth )
			{
// 			case	16:
// 				{
// 				// Allocate a Bitmap16
// 				pResult = pCreationService->Create( "Bitmap16" );
// 				DK_ASSERT( pResult != NULL, "TGALoader::Load() => Couldn't create the Bitmap16 picture container!" );
// 				DkBitmap16*	pBitmap = (DkBitmap16*) pResult->GetPicture();
// 
// 				// Initialize it
// 				pBitmap->SetA();
// 				pBitmap->SetR( 0x7C00, 5, 7 );
// 				pBitmap->SetG( 0x03E0, 5, 2 );
// 				pBitmap->SetB( 0x001F, 5, -3 );
// 
// 				pBitmap->Init( TGAHeader.wWidth, TGAHeader.wHeight );
// 
// 				// Decode the picture
// 				U16*	pDest = (U16*) pBitmap->GetBuffer();
// 
// 				U16		wColor;
// 				S8		bRunLength;
// 				U32		j, dwPixIndex = 0;
// 
// 				for( U32 y=0; y < _Height; y++ )
// 				{
// 					while ( dwPixIndex < _Width )
// 					{
// 						_Stream.Read( &bRunLength, 1 );
// 						if ( bRunLength & 0x80 )
// 						{
// 							bRunLength &= 0x7F;
// 							_Stream.Read( &wColor, sizeof(U16) );
// 							for ( j=0; j <= (U32) bRunLength; j++, pDest++ )
// 								*pDest = wColor;
// 						}
// 						else
// 						{
// 							_Stream.Read( pDest, bRunLength * sizeof(U16) );
// 							pDest += bRunLength;
// 						}
// 
// 						dwPixIndex += bRunLength + 1;
// 					}
// 					dwPixIndex -= _Width;
// 				}
// 				}
// 				break;

			case	24:
			{
				// Decode the picture
				ColorRGB	Color;
				S8			bRunLength;
				U32			j, dwPixIndex = 0;

				ColorARGB*	pDest = pBuffer;

				for( U32 y=0; y < _Height; y++ )
				{
					while ( dwPixIndex < _Width )
					{
						_Stream.Read( &bRunLength, 1 );
						if ( bRunLength & 0x80 )
						{
							bRunLength &= 0x7F;
							_Stream.Read( &Color, sizeof(ColorRGB) );
							for ( j=0; j <= (U32) bRunLength; j++, pDest++ )
								pDest->Set( Color );
						}
						else
						{
							for ( j=0; j <= U8( bRunLength ); j++, pDest++ )
							{
								_Stream.Read( &Color, sizeof(ColorRGB) );
								pDest->Set( Color );
							}
						}

						dwPixIndex += bRunLength + 1;
					}
					dwPixIndex -= _Width;
				}
				break;
			}

			case	32:
			{
				// Decode the picture
				ColorARGB	Color;
				S8			bRunLength;
				U32			j, dwPixIndex = 0;

				ColorARGB*	pDest = pBuffer;

				for( U32 y=0; y < _Height; y++ )
				{
					while ( dwPixIndex < _Width )
					{
						_Stream.Read( &bRunLength, 1 );
						if ( bRunLength & 0x80 )
						{
							bRunLength &= 0x7F;
							_Stream.Read( &Color, sizeof(ColorARGB) );
							for ( j=0; j <= (U32) bRunLength; j++, pDest++ )
								*pDest = Color;
						}
						else
						{
							_Stream.Read( pDest, (bRunLength+1) * sizeof(ColorARGB) );
							pDest += bRunLength;
						}

						dwPixIndex += bRunLength + 1;
					}
					dwPixIndex -= _Width;
				}
				}
				break;

			default:
				assert( false );
			}

 			// Invert the picture if it was packed bottom to top
 			if ( !(TGAHeader.bImageDescriptor & 0x20) )
			{
				ColorARGB*	pSource = pBuffer;
				ColorARGB*	pDest = pBuffer + _Width * (_Height-1);
				U32			TempHeight = _Height >> 1;
				ColorARGB	Temp;

				for ( U32 Y=0; Y < TempHeight; Y++ )
				{
					for ( U32 X=0; X < _Width; X++ )
					{
						Temp = *pSource;
						*pSource++ = *pDest;
						*pDest++ = Temp;
					}
					pDest -= 2 * _Height;
				}
			}
// 				((DkBitmap*) pResult->GetPicture())->MirrorVertical();

			break;
		}

	default:
		assert( false );
	}
}

// bool	TGALoader::CanSave( const IDkPicture& _Picture, const DkString& _FileExtension, const SaveArguments* _pArguments ) const
// {
// 	DkString	FileExtension = _FileExtension;
// 				FileExtension.Replace( ".", "" );
// 				FileExtension.ToUpper();
// 
// 	if (	FileExtension != "TGA"
// 		||	FileExtension != "TARGA" )
// 		return	false;
// 
// 	// Check there is no compression
// 	if ( _pArguments != NULL )
// 	{
// 		TargaSaveArguments*	pArguments = (TargaSaveArguments*) _pArguments;
// 		if ( pArguments->CompressionType != TargaSaveArguments::NONE )
// 			return	false;		// We don't support compression yet
// 	}
// 
// 	// Check the picture for a supported bitmap
// 	if ( !_Picture.Is( gs_guidBitmap ) )
// 		return	false;
// 
// 	// Check it's a supported bitmap
// 	bool	bSupported = false;
// 			bSupported |= _Picture.Is( gs_guidBitmap16 );
// 			bSupported |= _Picture.Is( gs_guidBitmap24 );
// 			bSupported |= _Picture.Is( gs_guidBitmap32 );
// 
// 	return	bSupported;
// }
// 
// bool	TGALoader::Save( const IDkPicture& _Picture, MemoryReadStream& _Stream, const SaveArguments* _pArguments ) const
// {
// 	DkBitmap*	pBitmapSource = (DkBitmap*) &_Picture;
// 
// 	// Fill up the header
// 	TGAHEADER	TGAHeader;
// 				TGAHeader.bIDLength			= 0;
// 				TGAHeader.bColorMapType		= 0;				// No color map
// 				TGAHeader.bImageType		= 2;				// TRUE COLOR / No compression
// 				TGAHeader.wColorMapStart	= 0;				// Start at 0 (but anyway we don't care!)
// 				TGAHeader.wColorMapLength	= 0;				// No color map!!
// 				TGAHeader.bColorMapDepth	= 0;				// I bet you're deaf: I said NO COLOR MAP!
// 				TGAHeader.wXOffset			= 0;
// 				TGAHeader.wYOffset			= 0;
// 				TGAHeader.wWidth			= (U16) pBitmapSource->GetWidth();
// 				TGAHeader.wHeight			= (U16) pBitmapSource->GetHeight();
// 				TGAHeader.bPixelDepth		= (U8) pBitmapSource->GetColorDepth();
// 				TGAHeader.bImageDescriptor	= 0x20;				// Image is stored in the good way: top to bottom!
// 
// 	switch ( pBitmapSource->GetColorDepth() )
// 	{
// 	case	32:
// 		{
// 			DkBitmap32*	pBitmap = (DkBitmap32*) pBitmapSource;
// 
// 			// Write header
// 			TGAHeader.bImageDescriptor |= 0x08;	// 32-Bits identifier??
// 			_Stream.Write( &TGAHeader, sizeof(TGAHEADER) );
// 
// 			// Write the image...
// 			for ( U32 y=0; y < _Height; y++ )
// 				_Stream.Write( pBitmap->GetBuffer( 0, y ), _Width * sizeof(ColorARGB) );
// 
// 			return	true;
// 		}
// 
// 	case	24:
// 		{
// 			DkBitmap24*	pBitmap = (DkBitmap24*) pBitmapSource;
// 
// 			// Write header
// 			_Stream.Write( &TGAHeader, sizeof(TGAHEADER) );
// 
// 			// Write the image...
// 			for ( U32 y=0; y < _Height; y++ )
// 				_Stream.Write( pBitmap->GetBuffer( 0, y ), _Width * sizeof(ColorRGB) );
// 
// 			return	true;
// 		}
// 
// 	case	16:
// 		{
// 			DkBitmap16*	pBitmap = (DkBitmap16*) pBitmapSource;
// 
// 			// Write header
// 			_Stream.Write( &TGAHeader, sizeof(TGAHEADER) );
// 
// 			// Write the image...
// 			for ( U32 y=0; y < _Height; y++ )
// 				_Stream.Write( pBitmap->GetBuffer( 0, y ), _Width * sizeof(U16) );
// 
// 			return	true;
// 		}
// 		break;
// 	}
// 
// 	return	false;
// }
