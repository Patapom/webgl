
/* DDS loader written by Jon Watte 2002 */
/* Permission granted to use freely, as long as Jon Watte */
/* is held harmless for all possible damages resulting from */
/* your use or failure to use this code. */
/* No warranty is expressed or implied. Use at your own risk, */
/* or not at all. */

#include "Stdafx.h"

#if 0

#include <stdio.h>
#include <string.h>
#include <assert.h>

struct DDSLoadInfo
{
	bool			compressed;
	bool			swap;
	bool			palette;
	unsigned int	divSize;
	unsigned int	blockBytes;
	GLenum			internalFormat;
	GLenum			externalFormat;
	GLenum			type;
};

DDSLoadInfo loadInfoDXT1 = { true, false, false, 4, 8, GL_COMPRESSED_RGBA_S3TC_DXT1 };
DDSLoadInfo loadInfoDXT3 = { true, false, false, 4, 16, GL_COMPRESSED_RGBA_S3TC_DXT3 };
DDSLoadInfo loadInfoDXT5 = { true, false, false, 4, 16, GL_COMPRESSED_RGBA_S3TC_DXT5 };
DDSLoadInfo loadInfoBGRA8 = { false, false, false, 1, 4, GL_RGBA8, GL_BGRA, GL_UNSIGNED_BYTE };
DDSLoadInfo loadInfoBGR8 = { false, false, false, 1, 3, GL_RGB8, GL_BGR, GL_UNSIGNED_BYTE };
DDSLoadInfo loadInfoBGR5A1 = { false, true, false, 1, 2, GL_RGB5_A1, GL_BGRA, GL_UNSIGNED_SHORT_1_5_5_5_REV };
DDSLoadInfo loadInfoBGR565 = { false, true, false, 1, 2, GL_RGB5, GL_RGB, GL_UNSIGNED_SHORT_5_6_5 };
DDSLoadInfo loadInfoIndex8 = { false, false, true, 1, 1, GL_RGB8, GL_BGRA, GL_UNSIGNED_BYTE };

bool	MyTexture::loadDds( FILE * f )
{
	DDS_header hdr;
	size_t s = 0;

	// DDS is so simple to read, too
	fread( &hdr, sizeof( hdr ), 1, f );
	assert( hdr.dwMagic == DDS_MAGIC );
	assert( hdr.dwSize == 124 );

	if ( hdr.dwMagic != DDS_MAGIC || hdr.dwSize != 124 || !(hdr.dwFlags & DDSD_PIXELFORMAT) || !(hdr.dwFlags & DDSD_CAPS) )
		return	false;

	xSize = hdr.dwWidth;
	ySize = hdr.dwHeight;
	assert( !(xSize & (xSize-1)) );
	assert( !(ySize & (ySize-1)) );

	DDSLoadInfo*	pLoadInfo;

	if( PF_IS_DXT1( hdr.sPixelFormat ) )
		pLoadInfo = &loadInfoDXT1;
	else if( PF_IS_DXT3( hdr.sPixelFormat ) )
		pLoadInfo = &loadInfoDXT3;
	else if( PF_IS_DXT5( hdr.sPixelFormat ) )
		pLoadInfo = &loadInfoDXT5;
	else if( PF_IS_BGRA8( hdr.sPixelFormat ) )
		pLoadInfo = &loadInfoBGRA8;
	else if( PF_IS_BGR8( hdr.sPixelFormat ) )
		pLoadInfo = &loadInfoBGR8;
	else if( PF_IS_BGR5A1( hdr.sPixelFormat ) )
		pLoadInfo = &loadInfoBGR5A1;
	else if( PF_IS_BGR565( hdr.sPixelFormat ) )
		pLoadInfo = &loadInfoBGR565;
	else if( PF_IS_INDEX8( hdr.sPixelFormat ) )
		pLoadInfo = &loadInfoIndex8;
	else
		return	false;	// Unsupported


	//fixme: do cube maps later
	//fixme: do 3d later
	int	x = xSize;
	int	y = ySize;
	glTexParameteri( GL_TEXTURE_2D, GL_GENERATE_MIPMAP, GL_FALSE );

	unsigned int mipMapCount = (hdr.dwFlags & DDSD_MIPMAPCOUNT) ? hdr.dwMipMapCount : 1;
	if ( mipMapCount > 1 )
		hasMipmaps_ = true;

	if ( pLoadInfo->compressed )
	{
		size_t	size = max( pLoadInfo->divSize, x ) / pLoadInfo->divSize * max( pLoadInfo->divSize, y ) / pLoadInfo->divSize * pLoadInfo->blockBytes;
		assert( size == hdr.dwPitchOrLinearSize );
		assert( hdr.dwFlags & DDSD_LINEARSIZE );

		unsigned char* pData = (unsigned char*) malloc( size );
		if( pData == NULL )
			return	false;
	}

	format = cFormat = pLoadInfo->internalFormat;
	for( unsigned int ix = 0; ix < mipMapCount; ++ix ) {
	  fread( data, 1, size, f );
	  glCompressedTexImage2D( GL_TEXTURE_2D, ix, pLoadInfo->internalFormat, x, y, 0, size, data );
	  gl->updateError();
	  x = (x+1)>>1;
	  y = (y+1)>>1;
	  size = max( pLoadInfo->divSize, x )/pLoadInfo->divSize * max( pLoadInfo->divSize, y )/pLoadInfo->divSize * pLoadInfo->blockBytes;
	}
	free( data );
	}
	else if( pLoadInfo->palette ) {
	//  currently, we unpack palette into BGRA
	//  I'm not sure we always get pitch...
	assert( hdr.dwFlags & DDSD_PITCH );
	assert( hdr.sPixelFormat.dwRGBBitCount == 8 );
	size_t size = hdr.dwPitchOrLinearSize * ySize;
	//  And I'm even less sure we don't get padding on the smaller MIP levels...
	assert( size == x * y * pLoadInfo->blockBytes );
	format = pLoadInfo->externalFormat;
	cFormat = pLoadInfo->internalFormat;
	unsigned char * data = (unsigned char *)malloc( size );
	unsigned int palette[ 256 ];
	unsigned int * unpacked = (unsigned int *)malloc( size*sizeof( unsigned int ) );
	fread( palette, 4, 256, f );
	for( unsigned int ix = 0; ix < mipMapCount; ++ix ) {
	  fread( data, 1, size, f );
	  for( unsigned int zz = 0; zz < size; ++zz ) {
		unpacked[ zz ] = palette[ data[ zz ] ];
	  }
	  glPixelStorei( GL_UNPACK_ROW_LENGTH, y );
	  glTexImage2D( GL_TEXTURE_2D, ix, pLoadInfo->internalFormat, x, y, 0, pLoadInfo->externalFormat, pLoadInfo->type, unpacked );
	  gl->updateError();
	  x = (x+1)>>1;
	  y = (y+1)>>1;
	  size = x * y * pLoadInfo->blockBytes;
	}
	free( data );
	free( unpacked );
	}
	else {
	if( pLoadInfo->swap ) {
	  glPixelStorei( GL_UNPACK_SWAP_BYTES, GL_TRUE );
	}
	size = x * y * pLoadInfo->blockBytes;
	format = pLoadInfo->externalFormat;
	cFormat = pLoadInfo->internalFormat;
	unsigned char * data = (unsigned char *)malloc( size );
	//fixme: how are MIP maps stored for 24-bit if pitch != ySize*3 ?
	for( unsigned int ix = 0; ix < mipMapCount; ++ix ) {
	  fread( data, 1, size, f );
	  glPixelStorei( GL_UNPACK_ROW_LENGTH, y );
	  glTexImage2D( GL_TEXTURE_2D, ix, pLoadInfo->internalFormat, x, y, 0, pLoadInfo->externalFormat, pLoadInfo->type, data );
	  gl->updateError();
	  x = (x+1)>>1;
	  y = (y+1)>>1;
	  size = x * y * pLoadInfo->blockBytes;
	}
	free( data );
	glPixelStorei( GL_UNPACK_SWAP_BYTES, GL_FALSE );
	gl->updateError();
	}
	glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_MAX_LEVEL, mipMapCount-1 );
	gl->updateError();

  return true;
}

#endif