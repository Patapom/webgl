using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;

namespace BuildSimpleCubeBinaryStreams
{
	/// <summary>
	/// Writes Typed Arrays as binaries
	/// Header is :
	///  4bytes = Array Type
	///  4bytes = Array Length
	///  Content
	///  
	/// Array Types are :
	///		0	Int8Array
	///		1	Uint8Array
	///		2	Int16Array
	///		3	Uint16Array
	///		4	Int32Array
	///		5	UInt32Array
	///		6	Float32Array
	/// </summary>
	class Program
	{
		// Transforms the color cube into the final padded texture of 64x256
		static unsafe void Main__( string[] args )
		{
			using ( Bitmap SourceBitmap = Bitmap.FromFile( "ColorCube.png" ) as Bitmap )
			{
				BitmapData SourceLockedBitmap = SourceBitmap.LockBits( new Rectangle( 0, 0, SourceBitmap.Width, SourceBitmap.Height ), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb );

				using ( Bitmap TargetBitmap = new Bitmap( 64, 128, PixelFormat.Format32bppArgb ) )
				{
					BitmapData TargetLockedBitmap = TargetBitmap.LockBits( new Rectangle( 0, 0, TargetBitmap.Width, TargetBitmap.Height ), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb );

					for ( int Y = 0; Y <= SourceBitmap.Height; Y++ )
					{
						int		ClampedY = Math.Min( 15, Y );
						byte* pSourceScanline = (byte*) SourceLockedBitmap.Scan0.ToPointer() + SourceLockedBitmap.Stride * ClampedY;
						for ( int SliceIndex=0; SliceIndex < 16; SliceIndex++ )
						{
							int	TargetX = SliceIndex % 3;
							int	TargetY = SliceIndex / 3;

							byte* pTargetScanline = (byte*) TargetLockedBitmap.Scan0.ToPointer() + TargetLockedBitmap.Stride * (17*TargetY+Y) + 4*17*TargetX;

							for ( int X = 0; X <= 16; X++ )
							{
								// Read current slice
								int	SourceX = 16*SliceIndex + Math.Min( 15, X );

								byte R = pSourceScanline[4*SourceX+2];
								byte G = pSourceScanline[4*SourceX+1];
								byte B = pSourceScanline[4*SourceX+0];
								byte A = 0xFF;

								pTargetScanline[4*X+0] = B;
								pTargetScanline[4*X+1] = G;
								pTargetScanline[4*X+2] = R;
								pTargetScanline[4*X+3] = A;
							}
						}
					}

					TargetBitmap.UnlockBits( TargetLockedBitmap );

					// Save
					TargetBitmap.Save( "FinalColorCube.png", ImageFormat.Png );
				}

				SourceBitmap.UnlockBits( SourceLockedBitmap );
			}
		}

		// Transforms the color cube into the final padded texture of 512x16
		static unsafe void Main____________________( string[] args )
		{
			using ( Bitmap SourceBitmap = Bitmap.FromFile( "ColorCube.png" ) as Bitmap )
			{
				BitmapData SourceLockedBitmap = SourceBitmap.LockBits( new Rectangle( 0, 0, SourceBitmap.Width, SourceBitmap.Height ), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb );

				using ( Bitmap TargetBitmap = new Bitmap( 512, 16, PixelFormat.Format32bppArgb ) )
				{
					BitmapData TargetLockedBitmap = TargetBitmap.LockBits( new Rectangle( 0, 0, TargetBitmap.Width, TargetBitmap.Height ), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb );

					for ( int Y = 0; Y < SourceBitmap.Height; Y++ )
					{
						byte* pSourceScanline = (byte*) SourceLockedBitmap.Scan0.ToPointer() + SourceLockedBitmap.Stride * Y;
						byte* pTargetScanline = (byte*) TargetLockedBitmap.Scan0.ToPointer() + TargetLockedBitmap.Stride * Y;

						for ( int SliceIndex=0; SliceIndex <= 16; SliceIndex++ )
						{
							int	ClampedSliceIndex = Math.Min( 15, SliceIndex );

							for ( int X = 0; X < 17; X++ )
							{
								int	SourceX = 16*ClampedSliceIndex + Math.Min( 15, X );

								byte R = pSourceScanline[4*SourceX+2];
								byte G = pSourceScanline[4*SourceX+1];
								byte B = pSourceScanline[4*SourceX+0];
								byte A = 0xFF;

								pTargetScanline[4*(17*SliceIndex+X)+0] = B;
								pTargetScanline[4*(17*SliceIndex+X)+1] = G;
								pTargetScanline[4*(17*SliceIndex+X)+2] = R;
								pTargetScanline[4*(17*SliceIndex+X)+3] = A;
							}
						}
					}

					TargetBitmap.UnlockBits( TargetLockedBitmap );

					// Save
					TargetBitmap.Save( "FinalColorCube.png", ImageFormat.Png );
				}

				SourceBitmap.UnlockBits( SourceLockedBitmap );
			}
		}

		// Generates the color cube
		static unsafe void Main_( string[] args )
		{
			using ( Bitmap TargetBitmap = new Bitmap( 256, 16, PixelFormat.Format32bppArgb ) )
			{
				BitmapData	LockedBitmap = TargetBitmap.LockBits( new Rectangle( 0, 0, TargetBitmap.Width , TargetBitmap.Height ), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb );

				for ( int Y=0; Y < TargetBitmap.Height; Y++ )
				{
					byte*	pScanline = (byte*) LockedBitmap.Scan0.ToPointer() + LockedBitmap.Stride * Y;
					for ( int X=0; X < TargetBitmap.Width; X++ )
					{
						int		SliceIndex = X >> 4;

						byte	R = (byte) ((X & 0xF) << 4);
						byte	G = (byte) (Y << 4);
						byte	B = (byte) (SliceIndex << 4);
						byte	A = 0xFF;

						*pScanline++ = B;
						*pScanline++ = G;
						*pScanline++ = R;
						*pScanline++ = A;
					}
				}

				TargetBitmap.UnlockBits( LockedBitmap );

				// Save
				TargetBitmap.Save( "ColorCube.png", ImageFormat.Png );
			}
		}

		// Convert walkzone into simple binary buffer
		static unsafe void Main( string[] args )
		{
			using ( Bitmap SourceBitmap = Bitmap.FromFile( "WalkZone.png" ) as Bitmap )
			{
				BitmapData	LockedBitmap = SourceBitmap.LockBits( new Rectangle( 0, 0, SourceBitmap.Width , SourceBitmap.Height ), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb );

				FileInfo	TargetFile = new FileInfo( "Walkzone.bin" );
				using ( FileStream S = TargetFile.Create() )
					using ( BinaryWriter W = new BinaryWriter( S ) )
					{
						for ( int Y=0; Y < SourceBitmap.Height; Y++ )
						{
							byte*	pScanline = (byte*) LockedBitmap.Scan0.ToPointer() + LockedBitmap.Stride * Y;
							for ( int X=0; X < SourceBitmap.Width; X++ )
							{
								byte	B = *pScanline++;
								byte	G = *pScanline++;
								byte	R = *pScanline++;
								byte	A = *pScanline++;

								W.Write( R );
								W.Write( G );
								W.Write( B );
							}
						}
					}

				SourceBitmap.UnlockBits( LockedBitmap );
			}
		}

		// Build cube binary files
		static void Main_____()
		{
			FileInfo	FileIndex = new FileInfo( "CubeIndex.bin" );
			FileInfo	FileVertexPos = new FileInfo( "CubeVertex_Pos.bin" );
			FileInfo	FileVertexUV = new FileInfo( "CubeVertex_UV.bin" );

			//////////////////////////////////////////////////////////////////////////
			// Write indices as UInt16
			int[]	Indices = new int[]
			{
				// Front
				0, 1, 2, 2, 1, 3,
				// Front
				4, 5, 6, 6, 5, 7,
				// Left
				8, 9, 10, 10, 9, 11,
				// Right
				12, 13, 14, 14, 13, 15,
				// Top
				16, 17, 18, 18, 17, 19,
				// Bottom
				20, 21, 22, 22, 21, 23
			};

			using ( FileStream S = FileIndex.Create() )
				using ( BinaryWriter W = new BinaryWriter( S ) )
				{
					W.Write( (int) 3 );
					W.Write( (int) Indices.Length );
					for ( int i=0; i < Indices.Length; i++ )
						W.Write( (ushort) Indices[i] );
				}

			//////////////////////////////////////////////////////////////////////////
			// Write vertices as Float32
			double[]	vPositions = new double[]
			{
				// Front
				-1.0, +1.0, +1.0,
				-1.0, -1.0, +1.0,
				+1.0, +1.0, +1.0,
				+1.0, -1.0, +1.0,
				// Back
				+1.0, +1.0, -1.0,
				+1.0, -1.0, -1.0,
				-1.0, +1.0, -1.0,
				-1.0, -1.0, -1.0,
				// Left
				-1.0, +1.0, -1.0,
				-1.0, -1.0, -1.0,
				-1.0, +1.0, +1.0,
				-1.0, -1.0, +1.0,
				// Right
				+1.0, +1.0, +1.0,
				+1.0, -1.0, +1.0,
				+1.0, +1.0, -1.0,
				+1.0, -1.0, -1.0,
				// Top
				-1.0, +1.0, -1.0,
				-1.0, +1.0, +1.0,
				+1.0, +1.0, -1.0,
				+1.0, +1.0, +1.0,
				// Bottom
				-1.0, -1.0, +1.0,
				-1.0, -1.0, -1.0,
				+1.0, -1.0, +1.0,
				+1.0, -1.0, -1.0,
			};

			using ( FileStream S = FileVertexPos.Create() )
				using ( BinaryWriter W = new BinaryWriter( S ) )
				{
					W.Write( (int) 6 );
					W.Write( (int) vPositions.Length );
					for ( int i=0; i < vPositions.Length; i++ )
						W.Write( (float) vPositions[i] );
				}

			double[]	vUVs = new double[]
			{
				// Front
				0.0, 0.0,
				0.0, 1.0,
				1.0, 0.0,
				1.0, 1.0,
				// Back
				0.0, 0.0,
				0.0, 1.0,
				1.0, 0.0,
				1.0, 1.0,
				// Left
				0.0, 0.0,
				0.0, 1.0,
				1.0, 0.0,
				1.0, 1.0,
				// Right
				0.0, 0.0,
				0.0, 1.0,
				1.0, 0.0,
				1.0, 1.0,
				// Top
				0.0, 0.0,
				0.0, 1.0,
				1.0, 0.0,
				1.0, 1.0,
				// Bottom
				0.0, 0.0,
				0.0, 1.0,
				1.0, 0.0,
				1.0, 1.0,
			};

			using ( FileStream S = FileVertexUV.Create() )
				using ( BinaryWriter W = new BinaryWriter( S ) )
				{
					W.Write( (int) 6 );
					W.Write( (int) vUVs.Length );
					for ( int i=0; i < vUVs.Length; i++ )
						W.Write( (float) vUVs[i] );
				}
		}
	}
}
