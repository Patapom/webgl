using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Drawing.Imaging;
using System.Linq;
using System.Text;
using System.IO;
using System.Windows.Forms;

namespace SpectrumConvolver
{
	public partial class Form1 : Form
	{
		class	Spectrum
		{
			protected float		m_SpectrumStart = 0.0f;
			protected float		m_SpectrumEnd = 0.0f;
			protected int		m_Size;
			protected float[]	m_ValuesR = null;
			protected float[]	m_ValuesG = null;
			protected float[]	m_ValuesB = null;

			public unsafe Spectrum( FileInfo _BitmapFile, float _WavelengthStart, float _WavelengthEnd, bool _AlphaLog2 )
			{
				m_SpectrumStart = _WavelengthStart;
				m_SpectrumEnd = _WavelengthEnd;

				using ( Bitmap B = Bitmap.FromFile( _BitmapFile.FullName ) as Bitmap )
				{
					if ( B.Height != 1 )
						throw new Exception( "Spectrum expects bitmaps of height 1!" );

					BitmapData	LockedBitmap = B.LockBits( new Rectangle( 0, 0, B.Width, B.Height ), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb );

					m_Size = B.Width;
					m_ValuesR = new float[B.Width];
					m_ValuesG = new float[B.Width];
					m_ValuesB = new float[B.Width];

					byte*	pScanline = (byte*) LockedBitmap.Scan0.ToPointer();
					for ( int X=0; X < B.Width; X++ )
					{
						byte	Blue = *pScanline++;
						byte	Green = *pScanline++;
						byte	Red = *pScanline++;
						byte	Alpha = *pScanline++;

						float	fR = Red / 255.0f;
						float	fG = Green / 255.0f;
						float	fB = Blue / 255.0f;
						if ( _AlphaLog2 )
						{
							float	Exponent = Alpha / 255.0f;
									Exponent *= 1.1f + 9.96f;
									Exponent -= 9.96f;

							float	fMultiplier = (float) Math.Pow( 2.0, Exponent );
							fR *= fMultiplier;
							fG *= fMultiplier;
							fB *= fMultiplier;
						}

						m_ValuesR[X] = fR;
						m_ValuesG[X] = fG;
						m_ValuesB[X] = fB;
					}

					B.UnlockBits( LockedBitmap );
				}
			}

			/// <summary>
			/// Bilinear sampling of the spectrum values
			/// </summary>
			/// <param name="_Wavelength"></param>
			/// <param name="R"></param>
			/// <param name="G"></param>
			/// <param name="B"></param>
			public void	Sample( float _Wavelength, out float R, out float G, out float B )
			{
				float	t = (_Wavelength - m_SpectrumStart) / (m_SpectrumEnd - m_SpectrumStart);
						t = Math.Max( 0.0f, Math.Min( 1.0f, t ) );

				float	fX0 = t * m_Size;
				int		X0 = (int) Math.Floor( fX0 );
				float	x = fX0 - X0;
						X0 = Math.Max( 0, Math.Min( m_Size-1, X0 ) );
				int		X1 = Math.Min( m_Size-1, X0+1 );

				float	R0 = m_ValuesR[X0];
				float	R1 = m_ValuesR[X1];
				float	G0 = m_ValuesG[X0];
				float	G1 = m_ValuesG[X1];
				float	B0 = m_ValuesB[X0];
				float	B1 = m_ValuesB[X1];

				R = (1.0f - x) * R0 + x * R1;
				G = (1.0f - x) * G0 + x * G1;
				B = (1.0f - x) * B0 + x * B1;
			}
		}

		[System.Diagnostics.DebuggerDisplay( "({x}, {y}, {z})" )]
		class	Vector3
		{
			public float	x = 0.0f, y = 0.0f, z = 0.0f;
			public Vector3()	{}
			public Vector3( float _x, float _y, float _z )	{ x=_x; y=_y; z=_z; }
		}

		public Form1()
		{
			InitializeComponent();
		}

		Spectrum	m_SpecXYZ = null;
		Spectrum	m_SpecCyan = null;
		Spectrum	m_SpecMagenta = null; 
		Spectrum	m_SpecYellow = null;
		Spectrum	m_SpecRed = null;
		Spectrum	m_SpecGreen = null;

		protected override unsafe void OnLoad( EventArgs e )
		{
			base.OnLoad( e );

			try
			{
				// Build our test spectra
				m_SpecXYZ = new Spectrum( new FileInfo( "../../../SpectrumXYZ.png" ), 390.0f, 830.0f, true );
				m_SpecCyan = new Spectrum( new FileInfo( "../../../CyanInk.png" ), 390.0f, 750.0f, false );
				m_SpecMagenta = new Spectrum( new FileInfo( "../../../MagentaInk.png" ), 390.0f, 750.0f, false );
				m_SpecYellow = new Spectrum( new FileInfo( "../../../YellowInk.png" ), 390.0f, 750.0f, false );
				m_SpecRed = new Spectrum( new FileInfo( "../../../RedInk.png" ), 390.0f, 750.0f, false );
				m_SpecGreen = new Spectrum( new FileInfo( "../../../GreenInk.png" ), 390.0f, 750.0f, false );

				// Convolve
				Vector3[]	CMY = new Vector3[]
				{
					new Vector3( 1, 0, 0 ),
					new Vector3( 0, 1, 0 ),
					new Vector3( 0, 0, 1 ),
					new Vector3( 1, 1, 0 ),
					new Vector3( 1, 0, 1 ),
					new Vector3( 0, 1, 1 ),
					new Vector3( 1, 1, 1 ),
					new Vector3( 0, 0, 0 ),
					new Vector3( 0.5f, 0, 0 ),
				};

				Vector3[]	XYZ0 = new Vector3[CMY.Length];
				Vector3[]	RGB0 = new Vector3[CMY.Length];
				Vector3[]	XYZ1 = new Vector3[CMY.Length];
				Vector3[]	RGB1 = new Vector3[CMY.Length];

				for ( int i=0; i < CMY.Length; i++ )
					Convolve( CMY[i], out XYZ0[i], out RGB0[i] );

				COUNT = 32;
				for ( int i=0; i < CMY.Length; i++ )
					Convolve( CMY[i], out XYZ1[i], out RGB1[i] );

				//////////////////////////////////////////////////////////////////////////
				// Compile the spectrum textures
				using ( Bitmap Bmap = new Bitmap( 32, 1, PixelFormat.Format32bppArgb ) )
				{
					BitmapData	LockedBitmap = Bmap.LockBits( new Rectangle( 0, 0, 32, 1 ), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb );

					Spectrum[]	Spectra = new Spectrum[]
					{
						m_SpecCyan,
						m_SpecMagenta,
						m_SpecYellow,
						m_SpecGreen,//m_SpecRed,
					};
//					for ( int Y=0; Y < 4; Y++ )
					{
						byte*		pScanline = (byte*) LockedBitmap.Scan0.ToPointer();
						for ( int X=0; X < 32; X++ )
						{
							float	Lambda = 390.0f + (750.0f - 390.0f) * (X+1) / (32+1);

							float	R;
							Spectra[0].Sample( Lambda, out R, out R, out R );
							float	G;
							Spectra[1].Sample( Lambda, out G, out G, out G );
							float	B;
							Spectra[2].Sample( Lambda, out B, out B, out B );
							float	A;
							Spectra[3].Sample( Lambda, out A, out A, out A );

							*pScanline++ = (byte) (255.0f * B);
							*pScanline++ = (byte) (255.0f * G);
							*pScanline++ = (byte) (255.0f * R);
							*pScanline++ = (byte) (255.0f * A);
						}
					}

					Bmap.UnlockBits( LockedBitmap );
					Bmap.Save( "../../../CMYG32.png" );
				}


				using ( Bitmap BmapTarget = new Bitmap( 32, 1, PixelFormat.Format32bppArgb ) )
				{
					BitmapData	LockedBitmapTarget = BmapTarget.LockBits( new Rectangle( 0, 0, 32, 1 ), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb );
					byte*		pScanlineTarget = (byte*) LockedBitmapTarget.Scan0.ToPointer();

					using ( Bitmap BmapSource = Bitmap.FromFile( "../../../SpectrumXYZ.png" ) as Bitmap )
					{
						BitmapData	LockedBitmapSource = BmapSource.LockBits( new Rectangle( 0, 0, BmapSource.Width, 1 ), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb );
						byte*		pScanlineSource = (byte*) LockedBitmapSource.Scan0.ToPointer();

						for ( int X=0; X < 32; X++ )
						{
							float	Lambda = 390.0f + (750.0f - 390.0f) * (X+1) / (32+1);
							int		SourceX = (int) Math.Floor( (Lambda-390.0f) * BmapSource.Width / (830.0f - 390.0f) );

							*pScanlineTarget++ = pScanlineSource[4*SourceX+0];
							*pScanlineTarget++ = pScanlineSource[4*SourceX+1];
							*pScanlineTarget++ = pScanlineSource[4*SourceX+2];
							*pScanlineTarget++ = pScanlineSource[4*SourceX+3];
						}

						BmapSource.UnlockBits( LockedBitmapSource );
					}

					BmapTarget.UnlockBits( LockedBitmapTarget );
					BmapTarget.Save( "../../../XYZ32.png" );
				}

				MessageBox.Show( "Success!", "Spectrum Convolver", MessageBoxButtons.OK );
			}
			catch ( Exception _e )
			{
				MessageBox.Show( "An error occurred:\n\n" + _e.Message, "Spectrum Convolver", MessageBoxButtons.OK );
			}
		}

		int	COUNT = 200;
		private void	Convolve( Vector3 CMY, out Vector3 _XYZ, out Vector3 _RGB )
		{
			_XYZ = new Vector3();
			for ( int i=0; i < COUNT; i++ )
			{
				float	Lambda = 390.0f + (750.0f - 390.0f) * i / (COUNT-1);
				float	x, y, z;
				m_SpecXYZ.Sample( Lambda, out x, out y, out z );

				float	Cyan;
				m_SpecCyan.Sample( Lambda, out Cyan, out Cyan, out Cyan );
				Cyan = CMY.x * Cyan + Math.Max( 0.0f, 1.0f - CMY.x ) * 1.0f;		// Transmittance tends to 1 when cyan factor is low

				float	Magenta;
				m_SpecMagenta.Sample( Lambda, out Magenta, out Magenta, out Magenta );
				Magenta = CMY.y * Magenta + Math.Max( 0.0f, 1.0f - CMY.y ) * 1.0f;	// Transmittance tends to 1 when magenta factor is low

				float	Yellow;
				m_SpecYellow.Sample( Lambda, out Yellow, out Yellow, out Yellow );
				Yellow = CMY.z * Yellow + Math.Max( 0.0f, 1.0f - CMY.z ) * 1.0f;	// Transmittance tends to 1 when yellow factor is low

				float	Transmittance = Yellow * Magenta * Cyan;

				_XYZ.x += x * Transmittance;
				_XYZ.y += y * Transmittance;
				_XYZ.z += z * Transmittance;
			}
//			float	XYZ = X + Y + Z;
//			float	XYZ = 0.316871077f * COUNT;	// 0.316871077 is the white value normalizer
			float	XYZ = COUNT;	// 0.316871077 is the white value normalizer
			_XYZ.x /= XYZ;
			_XYZ.y /= XYZ;
			_XYZ.z /= XYZ;

			// Convert into RGB
			_RGB = new Vector3(
			_XYZ.x *  3.240479f - _XYZ.y * 1.537150f - _XYZ.z * 0.498535f,
			_XYZ.x * -0.969256f + _XYZ.y * 1.875992f + _XYZ.z * 0.041556f,
			_XYZ.x *  0.055648f - _XYZ.y * 0.204043f + _XYZ.z * 1.057311f );
		}
	}
}
