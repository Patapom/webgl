using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;

namespace Image2Array
{
	class Program
	{
		static unsafe void Main( string[] args )
		{
			int		W, H;
			byte[]	Content = null;
			using ( Bitmap B = Bitmap.FromFile( "BlueAcrylicMask.png" ) as Bitmap )
			{
				W = B.Width;
				H = B.Height;

				BitmapData	LockedBitmap = B.LockBits( new Rectangle( 0, 0, W, H ), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb );

				Content = new byte[4*W*H];
				for ( int Y=0; Y < H; Y++ )
				{
					byte*	pScanline = (byte*) LockedBitmap.Scan0 + Y * LockedBitmap.Stride;
					for ( int X=0; X < W; X++ )
					{
						Content[4*(W*Y+X)+2] = *pScanline++;	// B
						Content[4*(W*Y+X)+1] = *pScanline++;	// G
						Content[4*(W*Y+X)+0] = *pScanline++;	// R
						Content[4*(W*Y+X)+3] = *pScanline++;	// A
					}
				}
				B.UnlockBits( LockedBitmap );
			}

			// Write result as a .byte array
			using ( FileStream S = new FileInfo( "BlueAcrylicMask" + W + "x" + H + ".byte" ).Create() )
				using ( BinaryWriter Writer = new BinaryWriter( S ) )
					Writer.Write( Content );
		}
	}
}
