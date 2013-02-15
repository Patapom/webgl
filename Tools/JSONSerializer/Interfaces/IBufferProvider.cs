using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

using WMath;

namespace JSONSerializer
{
	/// <summary>
	/// The interface implemented by objects providing a binary buffer
	/// </summary>
	public interface	IBufferProvider
	{
		/// <summary>
		/// Gets the provided buffer
		/// </summary>
		O3DHelpers.IBuffer	Buffer	{ get; }

		/// <summary>
		/// Gets or sets the start of the binary range in which the buffer will be stored
		/// </summary>
		int					BinaryRangeStart	{ get; set; }

		/// <summary>
		/// Gets or sets the end of the binary range in which the buffer will be stored
		/// </summary>
		int					BinaryRangeEnd		{ get; set; }
	}
}
