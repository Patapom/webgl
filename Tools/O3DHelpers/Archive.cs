using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace O3DHelpers
{
	/// <summary>
	/// Adds a bunch of files to a O3DTGZ archive
	/// </summary>
	public class Archive
	{
		public static void		CreateArchiveFromFiles( FileInfo _ArchiveFileName, FileInfo[] _Files, bool _bBestCompression )
		{
			MemoryStream	TGZStream = new MemoryStream();

			try
			{
				O3DInterface.TarGenerator	TarGenerator = new O3DInterface.TarGenerator( TGZStream );
				foreach ( FileInfo File in _Files )
				{
					FileStream	Stream = File.OpenRead();

					byte[]		FileContent = new byte[Stream.Length];
					Stream.Read( FileContent, 0, (int) Stream.Length );
					Stream.Close();

					TarGenerator.AddFile( File.FullName, FileContent.Length );
					TarGenerator.AddFileBytes( FileContent );
				}

				TarGenerator.FinalizeTAR();
				TGZStream.Close();
			}
			catch ( Exception _e )
			{
				throw new Exception( "An exception occurred while creating the TAR file!", _e );
			}

			try
			{
				FileStream	TargetFile = _ArchiveFileName.Create();

				O3DInterface.GzCompressor	GzCompressor = new O3DInterface.GzCompressor( TargetFile, _bBestCompression );
											GzCompressor.ProcessBytes( TGZStream.ToArray() );
											GzCompressor.FinalizeGZ();

				TargetFile.Close();
			}
			catch ( Exception _e )
			{
				throw new Exception( "An exception occurred while creating the GZIP file!", _e );
			}

// 			try
// 			{	// Create the TAR file
// 				System.Diagnostics.Process	P = new System.Diagnostics.Process();
// 				P.StartInfo.FileName = @"External\tar.exe";
// 
// 				// Builds the arguments
// 				StringBuilder	SB = new StringBuilder( "-cv --file=temp.tar" );
// 				foreach ( FileInfo File in _Files )
// 					SB.Append( " \"" + File.FullName + "\"" );
// 
// 				SB.Replace( '\\', '/' );
// 
// 				P.StartInfo.Arguments = SB.ToString();
// 				P.StartInfo.CreateNoWindow = true;
// 				P.StartInfo.WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden;
// 				P.StartInfo.UseShellExecute = true;
// 
// 				P.Start();
// 				P.WaitForExit();
// 			}
// 			catch ( Exception _e )
// 			{
// 				File.Delete( "temp.tar" );
// 				throw new Exception( "An exception occurred while creating the TAR file!", _e );
// 			}
// 
// 			System.Diagnostics.Process	P = new System.Diagnostics.Process();
// 			try
// 			{	// Create the GZIP file
// 				P.StartInfo.FileName = @"External\gzip.exe";
// 				P.StartInfo.Arguments = "./temp.tar";
// 				P.StartInfo.CreateNoWindow = true;
// 				P.StartInfo.WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden;
// 				P.StartInfo.UseShellExecute = true;
// 				P.Start();
// 			}
// 			catch ( Exception _e )
// 			{
// 				File.Delete( "temp.tar" );
// 				throw new Exception( "An exception occurred while creating the GZIP file!", _e );
// 			}
// 			finally
// 			{
// // 				P.Kill();
// // 				P.Dispose();
// 			}
// 
// 			// Wait until the file exists...
// 			System.Threading.Thread.Sleep( 500 );
// 
// 			FileInfo	TempFileName = new FileInfo( "TEMP.TAZ" );
// 			int			MaxCount = 5 * 10;	// Wait until 5 seconds
// 			while ( !TempFileName.Exists && --MaxCount > 0 )
// 				System.Threading.Thread.Sleep( 100 );
// 
// 			if ( !P.HasExited )
// 			{
// 				P.Kill();
// 				P.Dispose();
// 			}
// 
// 			if ( MaxCount == 0 && !TempFileName.Exists )
// 				throw new Exception( "Failed to archive file (waited for 5 seconds for GZIP process to output the file but none appeared)!" );
// 
// 			// Finally, rename the zip file
// 			File.Delete( _ArchiveFileName.FullName );
// 			File.Move( "temp.taz", _ArchiveFileName.FullName );
		}
	}
}
