//============================================================================
// PROJECT : PlatformDk
// MODULE  : DkMedia
// SOURCE  : TGALoader.h
// PURPOSE : Header file for the TGALoader class
// PLATEFO : ANY
// AUTHORS : Patapom
// CREATED : 29/08/04 (DD/MM/YY)
// REMARKS : 
//          * This source code file is copyright (c) Benoît Mayaux 2004.
//============================================================================


#ifndef	__FORMATHANDLER_TGA_H__
#define	__FORMATHANDLER_TGA_H__

//============================================================================
// INCLUDES
//============================================================================

#include "..\O3D\BasicTypes.h"
#include "..\O3D\MemoryStream.h"
#include "..\O3D\MemoryBuffer.h"

#define MIN( a, b )	((a) < (b) ? (a) : (b))
#define MAX( a, b )	((a) > (b) ? (a) : (b))

//============================================================================
// MACRO(S) AND DEFINES 
//============================================================================

class	ColorRGB;
class	ColorARGB
{
public:		// NESTED TYPES

	enum COMPONENTS				{ ALPHA=0x0L, RED, GREEN, BLUE };


public:		// FIELDS

	U8					m_B, m_G, m_R, m_A;


public:		// METHODS

							ColorARGB()																												{}
							ColorARGB( const ColorARGB& _Source ) : m_B( _Source.m_B ), m_G( _Source.m_G ), m_R( _Source.m_R ), m_A( _Source.m_A )	{}
							ColorARGB( U8 _A, U8 _R, U8 _G, U8 _B ) : m_B( _B ), m_G( _G ), m_R( _R ), m_A( _A )									{}
							ColorARGB( U32 _Source )																								{ Set( _Source ); }

	// Access methods
			U32				Get() const													{ return *((U32*) &m_B); }//return m_B | (m_G | (m_R | (m_A << 8)) << 8) << 8); }
			ColorARGB&		SetReverse( const ColorARGB& _Source )						{ m_B = _Source.m_A; m_G = _Source.m_R; m_R = _Source.m_G; m_A = _Source.m_B; return *this; }
			ColorARGB&		Set( U8 _A, U8 _R, U8 _G, U8 _B )							{ m_B = _B; m_G = _G; m_R = _R; m_A = _A; return *this; }
			ColorARGB&		Set( U32 _C )												{ m_B = (U8) (_C >> 0); m_G = (U8) (_C >> 8); m_R = (U8) (_C >> 16); m_A = (U8) (_C >> 24); return *this; }
			ColorARGB&		Set( const ColorRGB& _Source );


	// Cast operators
							operator U32() const										{ return Get(); }

	// Assignment operators
			ColorARGB&	operator=( const ColorARGB& _Source )							{ m_B = _Source.m_B; m_G = _Source.m_G; m_R = _Source.m_R; m_A = _Source.m_A; return *this; }
			ColorARGB&	operator=( U32 _Source )										{ Set( _Source ); return *this; }

	// Indirection operators
	inline	U8&				operator[]( COMPONENTS _Component )
	{
		switch ( _Component )
		{
		case	ALPHA:
			return	m_A;
		case	RED:
			return	m_R;
		case	GREEN:
			return	m_G;
		case	BLUE:
			return	m_B;
		};

		return	m_A;
	}

	inline	U8				operator[]( COMPONENTS _Component ) const
	{
		switch ( _Component )
		{
		case	ALPHA:
			return	m_A;
		case	RED:
			return	m_R;
		case	GREEN:
			return	m_G;
		case	BLUE:
			return	m_B;
		};

		return	0;
	}

	// Arithmetic operators
			ColorARGB		operator+( const ColorARGB& _C ) const						{ return ColorARGB( MIN( 255, m_A + _C.m_A ), MIN( 255, m_R + _C.m_R ), MIN( 255, m_G + _C.m_G ), MIN( 255, m_B + _C.m_B ) ); }
			ColorARGB		operator-( const ColorARGB& _C ) const						{ return ColorARGB( MAX( 0, m_A - _C.m_A ), MAX( 0, m_R - _C.m_R ), MAX( 0, m_G - _C.m_G ), MAX( 0, m_B - _C.m_B ) ); }

			ColorARGB&		operator+=( const ColorARGB& _C )							{ m_A = MIN( 255, m_A + _C.m_A ); m_R = MIN( 255, m_R + _C.m_R ); m_G = MIN( 255, m_G + _C.m_G ); m_B = MIN( 255, m_B + _C.m_B ); return *this; }
			ColorARGB&		operator-=( const ColorARGB& _C )							{ m_A = MAX( 0, m_A - _C.m_A ); m_R = MAX( 0, m_R - _C.m_R ); m_G = MAX( 0, m_G - _C.m_G ); m_B = MAX( 0, m_B - _C.m_B ); return *this; }

	// Logic operators
			bool			operator==( const ColorARGB& _C ) const						{ return m_A == _C.m_A && m_R == _C.m_R && m_G == _C.m_G && m_B == _C.m_B; }
			bool			operator!=( const ColorARGB& _C ) const						{ return m_A != _C.m_A || m_R != _C.m_R || m_G != _C.m_G || m_B != _C.m_B; }
};


class	ColorRGB
{
public:		// NESTED TYPES

	enum COMPONENTS				{ RED=0x0L, GREEN, BLUE };


public:		// FIELDS

	U8					m_B, m_G, m_R;


public:		// METHODS

							ColorRGB()																							{}
							ColorRGB( const ColorRGB& _Source ) : m_B( _Source.m_B ), m_G( _Source.m_G ), m_R( _Source.m_R )	{}
							ColorRGB( U8 _R, U8 _G, U8 _B ) : m_B( _B ), m_G( _G ), m_R( _R )									{}
							ColorRGB( U32 _Source )																				{ Set( _Source ); }

	// Access methods
			U32				Get() const													{ return *((U32*) &m_B); }//return m_B | (m_G | (m_R | (m_A << 8)) << 8) << 8); }
			ColorRGB&		Set( U8 _R, U8 _G, U8 _B )									{ m_B = _B; m_G = _G; m_R = _R; return *this; }
			ColorRGB&		Set( U32 _C )												{ m_B = (U8) (_C >> 0); m_G = (U8) (_C >> 8); m_R = (U8) (_C >> 16); return *this; }


	// Cast operators
							operator U32() const										{ return Get(); }

	// Assignment operators
			ColorRGB&	operator=( const ColorRGB& _Source )							{ m_B = _Source.m_B; m_G = _Source.m_G; m_R = _Source.m_R; return *this; }
			ColorRGB&	operator=( U32 _Source )										{ Set( _Source ); return *this; }

	// Indirection operators
	inline	U8&				operator[]( COMPONENTS _Component )
	{
		switch ( _Component )
		{
		case	RED:
			return	m_R;
		case	GREEN:
			return	m_G;
		case	BLUE:
			return	m_B;
		};

		return	m_R;
	}

	inline	U8				operator[]( COMPONENTS _Component ) const
	{
		switch ( _Component )
		{
		case	RED:
			return	m_R;
		case	GREEN:
			return	m_G;
		case	BLUE:
			return	m_B;
		};

		return	0;
	}

	// Arithmetic operators
			ColorRGB		operator+( const ColorRGB& _C ) const						{ return ColorRGB( MIN( 255, m_R + _C.m_R ), MIN( 255, m_G + _C.m_G ), MIN( 255, m_B + _C.m_B ) ); }
			ColorRGB		operator-( const ColorRGB& _C ) const						{ return ColorRGB( MAX( 0, m_R - _C.m_R ), MAX( 0, m_G - _C.m_G ), MAX( 0, m_B - _C.m_B ) ); }

			ColorRGB&		operator+=( const ColorRGB& _C )							{ m_R = MIN( 255, m_R + _C.m_R ); m_G = MIN( 255, m_G + _C.m_G ); m_B = MIN( 255, m_B + _C.m_B ); return *this; }
			ColorRGB&		operator-=( const ColorRGB& _C )							{ m_R = MAX( 0, m_R - _C.m_R ); m_G = MAX( 0, m_G - _C.m_G ); m_B = MAX( 0, m_B - _C.m_B ); return *this; }

	// Logic operators
			bool			operator==( const ColorRGB& _C ) const						{ return m_R == _C.m_R && m_G == _C.m_G && m_B == _C.m_B; }
			bool			operator!=( const ColorRGB& _C ) const						{ return m_R != _C.m_R || m_G != _C.m_G || m_B != _C.m_B; }
};


	//============================================================================
	// CLASS TGALoader
	//============================================================================


// NAME		: TGALoader
// PURPOSE	: TGA Format Handler Service Component Definition
// AUTHORS	: Benoît MAYAUX
// DATE		: 29/08/04
// REMARK	: None
//
class	TGALoader
{
protected:	// NESTED TYPES
		
#pragma pack(1)																	// For the following structure we need one byte alignment
	struct	 TGAHEADER
	{
		U8		bIDLength;
		U8		bColorMapType;
		U8		bImageType;
		U16		wColorMapStart;
		U16		wColorMapLength;
		U8		bColorMapDepth;
		U16		wXOffset;
		U16		wYOffset;
		U16		wWidth;
		U16		wHeight;
		U8		bPixelDepth;
		U8		bImageDescriptor;
	};
#pragma pack()

		// Color Look-Up Tables classes
	class	CLUT
	{
	public:
								CLUT()															{ m_pCLUT = NULL; }
		virtual					~CLUT()															{ delete[] m_pCLUT; }

		void*					GetCLUT()														{ return m_pCLUT; }
		ColorARGB&				GetColor()														{ return m_Color; }

		virtual	CLUT&			InitCLUT( U32 _dwAmount ) = 0;
		virtual	ColorARGB&		operator[]( U32 _dwColorIndex ) = 0;

	protected:
		void*				m_pCLUT;
		ColorARGB			m_Color;

	};

	class	CLUT16 : public CLUT
	{
		virtual	CLUT&			InitCLUT( U32 _dwAmount )										{ delete[] m_pCLUT; m_pCLUT = new U16[_dwAmount]; return *this; }
		virtual	ColorARGB&		operator[]( U32 _dwColorIndex )									{ U16 wColor = *((U16*) m_pCLUT + _dwColorIndex); m_Color.Set( 0xFF, (wColor & 0x7C00) >> 7, (wColor & 0x03E0) >> 2, (wColor & 0x001F) << 3 ); return m_Color; }
	};

	class	CLUT24 : public CLUT
	{
		virtual	CLUT&			InitCLUT( U32 _dwAmount )										{ delete[] m_pCLUT; m_pCLUT = new ColorRGB[_dwAmount]; return *this; }
		virtual	ColorARGB&		operator[]( U32 _dwColorIndex )									{ m_Color = *(U32*) ((U8*) m_pCLUT + 3*_dwColorIndex); m_Color.m_A = 0xFF; return m_Color; }
	};

	class	CLUT32 : public CLUT
	{
		virtual	CLUT&			InitCLUT( U32 _dwAmount )										{ delete[] m_pCLUT; m_pCLUT = new ColorARGB[_dwAmount]; return *this; }
		virtual	ColorARGB&		operator[]( U32 _dwColorIndex )									{ return m_Color = ((ColorARGB*) m_pCLUT)[_dwColorIndex]; }
	};


public:		// NESTED TYPES

// 	struct TargaSaveArguments : public SaveArguments
// 	{
// 		enum COMPRESSION_TYPE	{ NONE = 0x0L, RLE_COMPRESSION };
// 
// 		// Argument used to specify the compression (CURRENTLY UNSUPPORTED)
// 		COMPRESSION_TYPE	CompressionType;
// 	};


public:		// METHODS
								TGALoader			()							{}
								~TGALoader			()							{ Exit(); }

	virtual void				Init				()							{}
	virtual void				Exit				()							{}

	// === IFormatHandler Methods ===
	virtual bool				CanLoad				( o3d::MemoryReadStream& _Stream ) const;
	virtual void				Load				( o3d::MemoryReadStream& _Stream, MemoryBuffer<ColorARGB>& _Bitmap32, U32& _Width, U32& _Height, bool& _bHasAlpha ) const;

// 	virtual bool				CanSave				( const IDkPicture& _Picture, const DkString& _FileExtension, const SaveArguments* _pArguments=NULL ) const;
// 	virtual bool				Save				( const IDkPicture& _Picture, MemoryReadStream& _Stream, const SaveArguments* _pArguments=NULL ) const;

	// === TGALoader Methods ===

};

#endif	// #ifndef	__FORMATHANDLER_TGA_H__
