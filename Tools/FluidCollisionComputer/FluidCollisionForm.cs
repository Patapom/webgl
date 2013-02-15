using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Drawing.Imaging;
using System.Text;
using System.Windows.Forms;

namespace FluidCollisionComputer
{
	public partial class FluidCollisionForm : Form
	{
		#region FIELDS

		protected int[,]				m_Walls = null;
		protected float[,]				m_Distances = null;
		protected WMath.Vector2D[,]		m_Gradients = null;

		#endregion

		#region METHODS

		public FluidCollisionForm()
		{
			InitializeComponent();
		}

		#region Helpers

		private DialogResult	Alert( string _Message, MessageBoxButtons _Buttons, MessageBoxIcon _Icon )
		{
			return	Alert( _Message, _Buttons, _Icon, MessageBoxDefaultButton.Button1 );
		}

		private DialogResult	Alert( string _Message, MessageBoxButtons _Buttons, MessageBoxIcon _Icon, MessageBoxDefaultButton _DefaultButton )
		{
			return	MessageBox.Show( this, _Message, "Fluid Collision", _Buttons, _Icon, _DefaultButton );
		}

		private void			AlertError( string _Message, Exception _e )
		{
			Alert( _Message + "\r\n\r\n" + FormatException( _e ), MessageBoxButtons.OK, MessageBoxIcon.Error );
		}

		protected string		FormatException( Exception _e )
		{
			string	Result = "";
			string	Prefix = "";
			while ( _e != null )
			{
				Result += Prefix + ". " + _e.Message + "\r\n";
				Prefix += "    ";
				_e = _e.InnerException;
			}

			return	Result;
		}

		#endregion

		#endregion

		#region EVENT HANDLERS

		private unsafe void buttonOpen_Click( object sender, EventArgs e )
		{
			if ( openFileDialog.ShowDialog( this ) != DialogResult.OK )
				return;

			try
			{
				Bitmap	B = new Bitmap( openFileDialog.FileName );
				BitmapData	LockedBitmap = B.LockBits( new Rectangle( 0, 0, B.Width, B.Height ), ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb );

				m_Walls = new int[B.Height,B.Width];
				m_Distances = new float[B.Height,B.Width];
				m_Gradients = new WMath.Vector2D[B.Height,B.Width];

				for ( int Y=0; Y < B.Height; Y++ )
				{
					byte*	pScanline = (byte*) LockedBitmap.Scan0.ToPointer() + LockedBitmap.Stride * Y;
					for ( int X=0; X < B.Width; X++ )
					{
						byte	R = pScanline[3*X+2];
						m_Walls[Y,X] = 255 - R;
						m_Gradients[Y,X] = new WMath.Vector2D( 0, 0 );
						m_Distances[Y,X] = -1;	// So we know we should compute that distance
					}
				}

				B.UnlockBits( LockedBitmap );
				B.Dispose();

				outputPanel.SetData( m_Walls, m_Distances, m_Gradients );
			}
			catch ( Exception _e )
			{
				AlertError( "An error occurred while opening collision file \"" + openFileDialog.FileName + "\" !", _e );
				return;
			}
		}

		private void buttonComputeDistanceMap_Click( object sender, EventArgs e )
		{
			outputPanel.ComputeDistanceMap();
			buttonSaveResultImage.Enabled = true;
		}

		private unsafe void buttonSaveResultImage_Click( object sender, EventArgs e )
		{
			if ( saveFileDialog.ShowDialog( this ) != DialogResult.OK )
				return;

			try
			{
				Bitmap	B = new Bitmap( outputPanel.ImageWidth, outputPanel.ImageHeight, PixelFormat.Format24bppRgb );
				BitmapData	LockedBitmap = B.LockBits( new Rectangle( 0, 0, B.Width, B.Height ), ImageLockMode.WriteOnly, PixelFormat.Format24bppRgb );

				for ( int Y=0; Y < B.Height; Y++ )
				{
					byte*	pScanline = (byte*) LockedBitmap.Scan0.ToPointer() + LockedBitmap.Stride * Y;
					for ( int X=0; X < B.Width; X++ )
					{
						pScanline[3*X+2] = (byte) (255 * 0.5 * (1 + m_Gradients[Y,X].x));
						pScanline[3*X+1] = (byte) (255 * 0.5 * (1 + m_Gradients[Y,X].y));
						pScanline[3*X+0] = (byte) Math.Max( 0, Math.Min( 255, (255 * (Math.PI + Math.Atan2( m_Gradients[Y,X].x, m_Gradients[Y,X].y )) / (2.0 * Math.PI )) ) );
					}
				}

				B.UnlockBits( LockedBitmap );
				B.Save( saveFileDialog.FileName );
				B.Dispose();

				Alert( "Success!", MessageBoxButtons.OK, MessageBoxIcon.Information );
			}
			catch ( Exception _e )
			{
				AlertError( "An error occurred while saving result file \"" + saveFileDialog.FileName + "\" !", _e );
				return;
			}
		}

		#endregion
	}
}