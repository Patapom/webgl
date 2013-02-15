using System;
using System.ComponentModel;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace FluidCollisionComputer
{
	public partial class OutputPanel : Panel
	{
		#region FIELDS

		protected Bitmap				m_Bitmap = null;

		protected int					m_Width = 0;
		protected int					m_Height = 0;
		protected int[,]				m_Walls = null;
		protected float[,]				m_Distances = null;
		protected WMath.Vector2D[,]		m_Gradients = null;

		#endregion

		#region PROPERTIES

		public int		ImageWidth	{ get { return m_Width; } }
		public int		ImageHeight	{ get { return m_Height; } }

		#endregion

		#region METHODS

		public OutputPanel()
		{
			SetStyle( ControlStyles.Selectable, true );
			SetStyle( ControlStyles.DoubleBuffer, true );
			SetStyle( ControlStyles.AllPaintingInWmPaint, true );
			SetStyle( ControlStyles.UserPaint, true );
			SetStyle( ControlStyles.ResizeRedraw, true );

			InitializeComponent();
		}

		public void			SetData( int[,] _Walls, float[,] _Distances, WMath.Vector2D[,] _Gradients )
		{
			m_Walls = _Walls;
			m_Distances = _Distances;
			m_Gradients = _Gradients;

			m_Width = m_Walls.GetLength( 1 );
			m_Height = m_Walls.GetLength( 0 );

			m_Bitmap = new Bitmap( m_Width, m_Height, PixelFormat.Format24bppRgb );

			UpdateView();
		}

		/// <summary> 
		/// Clean up any resources being used.
		/// </summary>
		/// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
		protected override void Dispose( bool disposing )
		{
			if ( disposing )
			{
				if ( components != null )
					components.Dispose();

				m_Bitmap.Dispose();
				m_Bitmap = null;
			}

			base.Dispose( disposing );
		}


		protected unsafe void	UpdateView()
		{
			if ( DesignMode )
				return;
			if ( m_Bitmap == null )
				return;

			int		X, Y;
			byte* pScanline = null;
			byte* pPixel = null;

			BitmapData LockedBitmap = m_Bitmap.LockBits( new Rectangle( 0, 0, m_Width, m_Height ), ImageLockMode.WriteOnly, PixelFormat.Format24bppRgb );
			for ( Y = 0; Y < m_Height; Y++ )
			{
				pScanline = (byte*) LockedBitmap.Scan0.ToPointer() + Y * LockedBitmap.Stride;
				for ( X = 0; X < m_Width; X++ )
				{
					pPixel = pScanline + 3 * X;

					pPixel[0] = (byte) m_Walls[Y,X];			// Blue is walls

// 					int		Distance = (int) m_Distances[Y,X];	// Green is distance
// 					pPixel[1] = (byte) Math.Max( 0, Math.Min( 255, Distance ) );
//					pPixel[2] = 0;

					// Gradients in red/green
					pPixel[2] = (byte) (255 * 0.5 * (1 + m_Gradients[Y,X].x));
					pPixel[1] = (byte) (255 * 0.5 * (1 + m_Gradients[Y,X].y));
				}
			}
			m_Bitmap.UnlockBits( LockedBitmap );

			Invalidate();
		}

		public void	ComputeDistanceMap()
		{
			float[,]	Distances = new float[m_Height,m_Width];

			int		WallThreshold = 128;
			float	D00, D01, D02, D10, D11, D12, D20, D21, D22;
			int		Wall00, Wall01, Wall02, Wall10, Wall11, Wall12, Wall20, Wall21, Wall22;
			float	fDistance;

			bool	bNeedsMoreSteps = true;
			while ( bNeedsMoreSteps )
			{
				bNeedsMoreSteps = false;
				for ( int Y=1; Y < m_Height-1; Y++ )
					for ( int X=1; X < m_Width-1; X++ )
					{
						// Propagate distance
						D00 = m_Distances[Y-1,X-1];
						D01 = m_Distances[Y-1,X+0];
						D02 = m_Distances[Y-1,X+1];
						D10 = m_Distances[Y+0,X-1];
						D11 = m_Distances[Y+0,X+0];
						D12 = m_Distances[Y+0,X+1];
						D20 = m_Distances[Y+1,X-1];
						D21 = m_Distances[Y+1,X+0];
						D22 = m_Distances[Y+1,X+1];

						fDistance = +float.MaxValue;
						if ( D00 >= 0 )
							fDistance = Math.Min( fDistance, D00 );
						if ( D01 >= 0 )
							fDistance = Math.Min( fDistance, D01 );
						if ( D02 >= 0 )
							fDistance = Math.Min( fDistance, D02 );
						if ( D10 >= 0 )
							fDistance = Math.Min( fDistance, D10 );
// 						if ( D11 >= 0 )
// 							fDistance = Math.Min( fDistance, D11 );
						if ( D12 >= 0 )
							fDistance = Math.Min( fDistance, D12 );
						if ( D20 >= 0 )
							fDistance = Math.Min( fDistance, D20 );
						if ( D21 >= 0 )
							fDistance = Math.Min( fDistance, D21 );
						if ( D22 >= 0 )
							fDistance = Math.Min( fDistance, D22 );
						fDistance += 1.0f;	// Increase by one...
						if ( fDistance > 1e20 )
							fDistance = -1;	// Keep distance to un-initialized...


						// Get a closer value if we're near a wall
						Wall00 = m_Walls[Y-1,X-1];
						Wall01 = m_Walls[Y-1,X+0];
						Wall02 = m_Walls[Y-1,X+1];
						Wall10 = m_Walls[Y+0,X-1];
						Wall11 = m_Walls[Y+0,X+0];
						Wall12 = m_Walls[Y+0,X+1];
						Wall20 = m_Walls[Y+1,X-1];
						Wall21 = m_Walls[Y+1,X+0];
						Wall22 = m_Walls[Y+1,X+1];

						if ( Wall00 > WallThreshold )
							fDistance = 1.0f;
						if ( Wall01 > WallThreshold )
							fDistance = 1.0f;
						if ( Wall02 > WallThreshold )
							fDistance = 1.0f;
						if ( Wall10 > WallThreshold )
							fDistance = 1.0f;
						if ( Wall12 > WallThreshold )
							fDistance = 1.0f;
						if ( Wall20 > WallThreshold )
							fDistance = 1.0f;
						if ( Wall21 > WallThreshold )
							fDistance = 1.0f;
						if ( Wall22 > WallThreshold )
							fDistance = 1.0f;
						if ( Wall11 > WallThreshold )
							fDistance = 0.0f;	// On a wall !

						// We got our new distance !
						Distances[Y,X] = fDistance;

						if ( fDistance < 0 )
							bNeedsMoreSteps = true;	// Needs more computing !
					}

				// Copy back new distances
				for ( int Y=0; Y < m_Height; Y++ )
					for ( int X=0; X < m_Width; X++ )
						m_Distances[Y,X] = Distances[Y,X];
			}

			// Apply a little blur
			float	fDeviationMapSize = 6.0f;
			float	fKernelFactor = 1.0f / (float) Math.Sqrt( 2 * Math.PI * fDeviationMapSize );
			int		KernelSize = (int) Math.Floor( Math.Sqrt( -2 * Math.Log( 0.01f / fKernelFactor ) ) * fDeviationMapSize );
			float[]	KernelWeights = new float[1+KernelSize];
			for ( int i=0; i <= KernelSize; i++ )
				KernelWeights[i] = fKernelFactor * (float) Math.Exp( -0.5 * i * i / (fDeviationMapSize * fDeviationMapSize) );

				// Horizontal first
			float	fBlurredValue;
			for ( int Y=0; Y < m_Height; Y++ )
				for ( int X=0; X < m_Width; X++ )
				{
					fBlurredValue = 0.0f;
					if ( m_Walls[Y,X] < WallThreshold )
						fBlurredValue += KernelWeights[0] * m_Distances[Y,X];

					for ( int i=1; i < KernelSize; i++ )
					{
						if ( X-i > 0 && m_Walls[Y,X-i] < WallThreshold )
							fBlurredValue += KernelWeights[i] * m_Distances[Y,X-i];
						if ( X+i < m_Width && m_Walls[Y,X+i] < WallThreshold )
							fBlurredValue += KernelWeights[i] * m_Distances[Y,X+i];
					}

					Distances[Y,X] = fBlurredValue;
				}

				// Then vertical
			for ( int Y=0; Y < m_Height; Y++ )
				for ( int X=0; X < m_Width; X++ )
				{
					fBlurredValue = 0.0f;
					if ( m_Walls[Y,X] < WallThreshold )
						fBlurredValue += KernelWeights[0] * Distances[Y,X];

					for ( int i=1; i < KernelSize; i++ )
					{
						if ( Y-i > 0 && m_Walls[Y-i,X] < WallThreshold )
							fBlurredValue += KernelWeights[i] * Distances[Y-i,X];
						if ( Y+i < m_Height && m_Walls[Y+i,X] < WallThreshold )
							fBlurredValue += KernelWeights[i] * Distances[Y+i,X];
					}

					m_Distances[Y,X] = fBlurredValue;
				}

			// Compute gradients
			for ( int Y=1; Y < m_Height-1; Y++ )
				for ( int X=1; X < m_Width-1; X++ )
				{
// 					float	Dx =
// 						(m_Distances[Y-1,X+1] - m_Distances[Y-1,X-1]) +
// 						(m_Distances[Y+0,X+1] - m_Distances[Y+0,X-1]) +
// 						(m_Distances[Y+1,X+1] - m_Distances[Y+1,X-1]);
// 					float	Dy =
// 						(m_Distances[Y+1,X-1] - m_Distances[Y-1,X-1]) +
// 						(m_Distances[Y+1,X+0] - m_Distances[Y-1,X+0]) +
// 						(m_Distances[Y+1,X+1] - m_Distances[Y-1,X+1]);

					float	Dx = 0.0f;
					if ( m_Walls[Y-1,X+1] < WallThreshold )
						Dx += m_Distances[Y-1,X+1];
					if ( m_Walls[Y+0,X+1] < WallThreshold )
						Dx += m_Distances[Y+0,X+1];
					if ( m_Walls[Y+1,X+1] < WallThreshold )
						Dx += m_Distances[Y+1,X+1];
					if ( m_Walls[Y-1,X-1] < WallThreshold )
						Dx -= m_Distances[Y-1,X-1];
					if ( m_Walls[Y+0,X-1] < WallThreshold )
						Dx -= m_Distances[Y+0,X-1];
					if ( m_Walls[Y+1,X-1] < WallThreshold )
						Dx -= m_Distances[Y+1,X-1];

					float	Dy = 0.0f;
					if ( m_Walls[Y+1,X-1] < WallThreshold )
						Dy += m_Distances[Y+1,X-1];
					if ( m_Walls[Y+1,X+0] < WallThreshold )
						Dy += m_Distances[Y+1,X+0];
					if ( m_Walls[Y+1,X+1] < WallThreshold )
						Dy += m_Distances[Y+1,X+1];
					if ( m_Walls[Y-1,X-1] < WallThreshold )
						Dy -= m_Distances[Y-1,X-1];
					if ( m_Walls[Y-1,X+0] < WallThreshold )
						Dy -= m_Distances[Y-1,X+0];
					if ( m_Walls[Y-1,X+1] < WallThreshold )
						Dy -= m_Distances[Y-1,X+1];

					m_Gradients[Y,X].Set( Dx, Dy );
					m_Gradients[Y,X].Normalize();
				}

			UpdateView();
		}

		#region Control Members

		protected override void OnResize( EventArgs eventargs )
		{
			base.OnResize( eventargs );

			Invalidate();
		}

		protected override void OnPaintBackground( PaintEventArgs e )
		{
//			base.OnPaintBackground( e );
		}

		protected override void OnPaint( PaintEventArgs e )
		{
			base.OnPaint( e );

			if ( m_Bitmap != null )
				e.Graphics.DrawImage( m_Bitmap, new Rectangle( 0, 0, Width, Height ), 0, 0, m_Width, m_Height, GraphicsUnit.Pixel );
		}

		#endregion

		#endregion
	}
}
