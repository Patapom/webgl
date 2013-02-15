using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

using WMath;

namespace JSONSerializer
{
	/// <summary>
	/// The interface implemented by objects providing a list of files
	/// </summary>
	public interface	IFilesProvider
	{
		/// <summary>
		/// Gets the amount of provided files
		/// </summary>
		int				FilesCount	{ get; }

		/// <summary>
		/// Gets the list of filenames
		/// </summary>
		string[]		FileNames	{ get; }

		/// <summary>
		/// Gets the list of provided files (as binary buffers)
		/// </summary>
		byte[][]		Files		{ get; }

// 		/// <summary>
// 		/// Gets the list of embedding status (true meaning the file should be embedded in the scene archive)
// 		/// </summary>
// 		bool[]			Embed		{ get; }

		/// <summary>
		/// Gets the target directory to copy the files to
		/// If this directory is null then the files should be embedded in the JSON file
		/// </summary>
		DirectoryInfo	TargetDirectory	{ get; }
	}
}
