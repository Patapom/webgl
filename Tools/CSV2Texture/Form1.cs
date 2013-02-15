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

namespace CSV2Texture
{
	public partial class Form1 : Form
	{
		public Form1()
		{
			InitializeComponent();
		}

		protected override unsafe void OnLoad( EventArgs e )
		{
			base.OnLoad( e );

			try
			{
				if ( openFileDialog.ShowDialog( this ) != DialogResult.OK )
					return;

				FileInfo	CSVFile = new FileInfo( openFileDialog.FileName );
				if ( !CSVFile.Exists )
					throw new Exception( "Source file does not exist!" );

				string	Content = null;
				using ( StreamReader Reader = CSVFile.OpenText() )
					Content = Reader.ReadToEnd();

				string[]	Lines = Content.Split( '\n' );
				int			TableSize = Lines.Length;
				float[][]	Table = new float[TableSize][];
				float		MinValue = +float.MaxValue, MaxValue = -float.MaxValue;
				for ( int i=0; i < TableSize; i++ )
				{
					string[]	Values = Lines[i].Split( ',' );
					if ( Values.Length != 4 )
						throw new Exception( "Badly formed line \"" + Lines[i] + "\": expected 4 values!" );

					float	R, G, B;
					if ( !float.TryParse( Values[1], out R ) )
						throw new Exception( "Wrong RED value!" );
					if ( !float.TryParse( Values[2], out G ) )
						throw new Exception( "Wrong GREEN value!" );
					if ( !float.TryParse( Values[3], out B ) )
						throw new Exception( "Wrong BLUE value!" );

					MinValue = Math.Min( MinValue, R );
					MinValue = Math.Min( MinValue, G );
					MinValue = Math.Min( MinValue, B );
					MaxValue = Math.Max( MaxValue, R );
					MaxValue = Math.Max( MaxValue, G );
					MaxValue = Math.Max( MaxValue, B );

					Table[i] = new float[3] { R, G, B };
				}

				if ( saveFileDialog.ShowDialog( this ) != DialogResult.OK )
					return;

				FileInfo	PNGFile = new FileInfo( saveFileDialog.FileName );
				using ( Bitmap B = new Bitmap( TableSize, 1, PixelFormat.Format32bppArgb ) )
				{
					BitmapData	LockedBitmap = B.LockBits( new Rectangle( 0, 0, TableSize, 1 ), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb );

					byte*	pScanline = (byte*) LockedBitmap.Scan0.ToPointer();
					for ( int X=0; X < TableSize; X++ )
					{
						float[]	RGB = Table[X];
						float	Max = Math.Max( Math.Max( RGB[0], RGB[1] ), RGB[2] );

						float	Red = RGB[0] / Max;
						float	Green = RGB[1] / Max;
						float	Blue = RGB[2] / Max;

						// We assume the smallest encoded value will be 1e-3 = 2^-9.96
						// Highest will be 2.13 = 2^1.0925958037150713066473116972276
						// Exponent will 

						float	Log2Max = (float) (Math.Log( Max ) / Math.Log( 2 ));	// in ]-9.96,1.1[
								Log2Max += 9.96f;
								Log2Max /= 1.1f + 9.96f;
						if ( Log2Max > 1.0f )
							throw new Exception( "Log2Max exceeds expected value!" );
						if ( Log2Max < 0.0f )
						{
							Red = Green = Blue = Log2Max = 0.0f;	// Too small anyway...
						}

						*pScanline++ = (byte) (255.0 * Blue);
						*pScanline++ = (byte) (255.0 * Green);
						*pScanline++ = (byte) (255.0 * Red);
						*pScanline++ = (byte) (255.0 * Log2Max);
					}

					B.UnlockBits( LockedBitmap );

					// Save as PNG
					B.Save( PNGFile.FullName );
				}

				MessageBox.Show( "Success!", "CSV2Texture", MessageBoxButtons.OK );
			}
			catch ( Exception _e )
			{
				MessageBox.Show( "An error occurred:" + _e.Message, "CSV2Texture", MessageBoxButtons.OK );
			}
		}
	}
}
