using System;
using System.Collections.Generic;
using System.Windows.Forms;

namespace FBXConverter
{
	static class Program
	{
		/// <summary>
		/// The main entry point for the application.
		/// </summary>
		[STAThread]
		static void Main()
		{
			Application.EnableVisualStyles();
			Application.SetCompatibleTextRenderingDefault( false );

			//////////////////////////////////////////////////////////////////////////
			// Change the culture to "en-US"
			// 
			System.Threading.Thread.CurrentThread.CurrentCulture = new System.Globalization.CultureInfo( "en-US" );

			Application.Run( new FBXConverterForm() );
		}
	}
}