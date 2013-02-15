using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace O3DHelpers
{
	/// <summary>
	/// Describes the buffer interface
	/// </summary>
	public interface	IBuffer
	{
		/// <summary>
		/// Gets the buffer length (in bytes)
		/// </summary>
		int			Length		{ get; }

		/// <summary>
		/// Saves the buffer as a binary object directly readable by O3D
		/// </summary>
		/// <param name="_OutputStream">The stream where to write the binary object</param>
		void		Save( Stream _OutputStream );
	}
}
