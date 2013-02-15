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

namespace SpectrumFromImage
{
	public partial class Form1 : Form
	{
		public Form1()
		{
			InitializeComponent();
		}

		protected bool	CheckMarkerStart( byte R, byte G, byte B )
		{
			return R > 200 && G < 64 && B < 64;	// Start marker is red
		}
		protected bool	CheckMarkerEnd( byte R, byte G, byte B )
		{
			return G > 200 && R < 64 && B < 64;	// End marker is green
		}

		protected override unsafe void OnLoad( EventArgs e )
		{
			base.OnLoad( e );

			try
			{
				if ( openFileDialog.ShowDialog( this ) != DialogResult.OK )
					return;

				FileInfo	SourcePNGFile = new FileInfo( openFileDialog.FileName );
				if ( !SourcePNGFile.Exists )
					throw new Exception( "Source file does not exist!" );

				int[]	Values = null;
				int	MarkerStartX = -1;
				int	MarkerStartY = -1;
				int	MarkerEndX = -1;
				int	MarkerEndY = -1;

				using ( Bitmap Bmap = Bitmap.FromFile( SourcePNGFile.FullName ) as Bitmap )
				{
					BitmapData	LockedBitmap = Bmap.LockBits( new Rectangle( 0, 0, Bmap.Width, Bmap.Height ), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb );

					Values = new int[Bmap.Width];

					for ( int Y=0; Y < Bmap.Height; Y++ )
					{
						byte*	pScanline = (byte*) LockedBitmap.Scan0.ToPointer() + Y * LockedBitmap.Stride;
						for ( int X=0; X < Bmap.Width; X++ )
						{
							byte	B = *pScanline++;
							byte	G = *pScanline++;
							byte	R = *pScanline++;
							byte	A = *pScanline++;

							if ( MarkerStartX == -1 && CheckMarkerStart( R, G, B ) )
							{
								MarkerStartX = X;
								MarkerStartY = Y;
							}

							if ( MarkerEndX == -1 && CheckMarkerEnd( R, G, B ) )
							{
								MarkerEndX = X;
								MarkerEndY = Y;
							}

							if ( R < 64 && G < 64 && B < 64 )
								Values[X] = Y;	// Black dot !
						}
					}

					Bmap.UnlockBits( LockedBitmap );
				}

				if ( MarkerStartX == -1 )
					throw new Exception( "Failed to retrieve start marker!" );
				if ( MarkerEndX == -1 )
					throw new Exception( "Failed to retrieve end marker!" );

				int		Size = 1+MarkerEndX-MarkerStartX;
				float	Normalizer = 1.0f / (MarkerEndY - MarkerStartY);
				using ( Bitmap B = new Bitmap( Size, 1, PixelFormat.Format32bppArgb ) )
				{
					BitmapData	LockedBitmap = B.LockBits( new Rectangle( 0, 0, Size, 1 ), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb );

					byte*	pScanline = (byte*) LockedBitmap.Scan0.ToPointer();
					int		PreviousValidValue = -1;
					for ( int X=0; X < Size; X++ )
					{
						int		V = Values[MarkerStartX+X];
						if ( V == 0 )
						{
							if ( PreviousValidValue == -1 )
								throw new Exception( "The first value is 0! Start marker is badly placed!" );
							V = PreviousValidValue;
						}
						else
							PreviousValidValue = V;

						float	fValue = Normalizer * (V - MarkerStartY);

						byte	C = (byte) (255.0 * Math.Max( 0.0f, Math.Min( 1.0f, fValue ) ));

						*pScanline++ = C;
						*pScanline++ = C;
						*pScanline++ = C;
						*pScanline++ = 0xFF;
					}

					B.UnlockBits( LockedBitmap );

					if ( saveFileDialog.ShowDialog( this ) != DialogResult.OK )
						return;

					// Save as PNG
					B.Save( saveFileDialog.FileName );
				}

				MessageBox.Show( "Success!", "CSV2Texture", MessageBoxButtons.OK );
			}
			catch ( Exception _e )
			{
				MessageBox.Show( "An error occurred:\n\n" + _e.Message, "CSV2Texture", MessageBoxButtons.OK );
			}
		}
	}
}
