using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Drawing;

namespace O3DHelpers
{
	public class	TGALoader
	{
		public static Bitmap	LoadTGA( Stream _ImageStream )
		{
			O3DInterface.TGALoader	Loader = new O3DInterface.TGALoader();

			return	Loader.LoadTGA( _ImageStream );
		}
	}
}
